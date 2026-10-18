package com.navkarsiddhi.app

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import java.io.File
import kotlinx.coroutines.*

@CapacitorPlugin(name = "SoulMateAI")
class SoulMateAIPlugin : Plugin() {

    companion object {
        private const val TAG = "SoulMateAI"
        private const val MODEL_FILENAME = "gemma-2b-it-cpu-int4.bin"
        private const val MODEL_URL = "https://storage.googleapis.com/mediapipe-models/llm_inference/gemma_2b_it_cpu/int4/latest/gemma-2b-it-cpu-int4.bin"
    }

    private var inference: LlmInference? = null
    private var modelReady = false
    private var downloadProgress = 0
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun handleOnDestroy() {
        scope.cancel()
        inference?.close()
        inference = null
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        val modelFile = File(context.filesDir, MODEL_FILENAME)
        val ret = JSObject()
        ret.put("modelReady", modelReady)
        ret.put("modelExists", modelFile.exists())
        ret.put("modelSizeMB", if (modelFile.exists()) modelFile.length() / (1024 * 1024) else 0)
        ret.put("downloadProgress", downloadProgress)
        call.resolve(ret)
    }

    @PluginMethod
    fun downloadModel(call: PluginCall) {
        val modelFile = File(context.filesDir, MODEL_FILENAME)
        if (modelFile.exists() && modelFile.length() > 100_000_000) {
            call.resolve(JSObject().put("status", "already_downloaded"))
            return
        }

        scope.launch {
            try {
                downloadProgress = 0
                notifyListeners("downloadProgress", JSObject().put("progress", 0))

                val url = java.net.URL(MODEL_URL)
                val conn = url.openConnection() as java.net.HttpURLConnection
                conn.connectTimeout = 30_000
                conn.readTimeout = 60_000
                conn.connect()

                val totalSize = conn.contentLength.toLong()
                val tempFile = File(context.filesDir, "$MODEL_FILENAME.tmp")

                conn.inputStream.use { input ->
                    tempFile.outputStream().use { output ->
                        val buffer = ByteArray(8192)
                        var downloaded = 0L
                        var lastNotified = 0

                        while (true) {
                            val bytes = input.read(buffer)
                            if (bytes == -1) break
                            output.write(buffer, 0, bytes)
                            downloaded += bytes

                            val pct = if (totalSize > 0) ((downloaded * 100) / totalSize).toInt() else 0
                            if (pct > lastNotified) {
                                downloadProgress = pct
                                lastNotified = pct
                                notifyListeners("downloadProgress", JSObject().put("progress", pct))
                            }
                        }
                    }
                }

                tempFile.renameTo(modelFile)
                downloadProgress = 100
                notifyListeners("downloadProgress", JSObject().put("progress", 100))

                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().put("status", "downloaded"))
                }
            } catch (e: Exception) {
                Log.e(TAG, "Model download failed", e)
                downloadProgress = -1
                withContext(Dispatchers.Main) {
                    call.reject("Download failed: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun loadModel(call: PluginCall) {
        val modelFile = File(context.filesDir, MODEL_FILENAME)
        if (!modelFile.exists()) {
            call.reject("Model not downloaded yet")
            return
        }

        scope.launch {
            try {
                val options = LlmInference.LlmInferenceOptions.builder()
                    .setModelPath(modelFile.absolutePath)
                    .setMaxTokens(512)
                    .setTopK(40)
                    .setTemperature(0.8f)
                    .setRandomSeed(42)
                    .build()

                val llm = LlmInference.createFromOptions(context, options)
                inference = llm
                modelReady = true

                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().put("status", "loaded"))
                }
            } catch (e: Exception) {
                Log.e(TAG, "Model load failed", e)
                modelReady = false
                withContext(Dispatchers.Main) {
                    call.reject("Load failed: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun generate(call: PluginCall) {
        val llm = inference
        if (llm == null || !modelReady) {
            call.reject("Model not loaded")
            return
        }

        val systemPrompt = call.getString("systemPrompt") ?: ""
        val userMessage = call.getString("userMessage") ?: ""

        if (userMessage.isBlank()) {
            call.reject("userMessage is required")
            return
        }

        val fullPrompt = buildPrompt(systemPrompt, userMessage)

        scope.launch {
            try {
                val response = llm.generateResponse(fullPrompt)
                val cleaned = cleanResponse(response)
                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().put("text", cleaned))
                }
            } catch (e: Exception) {
                Log.e(TAG, "Generation failed", e)
                withContext(Dispatchers.Main) {
                    call.reject("Generation failed: ${e.message}")
                }
            }
        }
    }

    private fun buildPrompt(systemPrompt: String, userMessage: String): String {
        val system = systemPrompt.ifBlank {
            """You are Soul Mate, a compassionate spiritual companion in the Navkar Siddhi app.
You are rooted in Jain philosophy — ahimsa (non-violence), aparigraha (non-attachment), anekantavada (multiple perspectives).
You speak with warmth, wisdom, and gentle honesty. You never judge.
Keep responses under 3 sentences. Be supportive, grounding, and practical.
When relevant, gently connect the user's feelings to Jain principles without preaching.
Never give medical, legal, or financial advice. If someone seems in crisis, encourage them to talk to a trusted person."""
        }
        return "<start_of_turn>user\n$system\n\nUser: $userMessage<end_of_turn>\n<start_of_turn>model\n"
    }

    private fun cleanResponse(raw: String): String {
        return raw
            .replace("<end_of_turn>", "")
            .replace("<start_of_turn>", "")
            .replace("model\n", "")
            .trim()
            .take(500)
    }
}
