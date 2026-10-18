package com.navkarsiddhi.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.os.Build
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * Background re-engagement worker — fires every 6h, sends a smart contextual
 * notification even when the app is never opened.
 *
 * Strategy mirrors Zomato/Swiggy/Blinkit AI notification playbook:
 *  - Title ≤6 words (lock screen hook), body ≤15 words (punchline)
 *  - Day-of-week + time-slot personality
 *  - User lifecycle segmentation: new / active / lapsing / dormant / suppress
 *  - Streak psychology: loss aversion when streak at risk
 *  - Benefit-first copy, Jain ethical, GenZ tone
 *  - Rotating index so same message never repeats back-to-back
 *  - Deep dormant (30+ days): suppress to protect engagement score
 */
class ReEngagementWorker(ctx: Context, params: WorkerParameters) : Worker(ctx, params) {

    override fun doWork(): Result {
        val prefs = applicationContext.getSharedPreferences(
            WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE
        )

        val navkars      = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
        val streak       = prefs.getInt(WidgetBridgePlugin.KEY_STREAK, 0)
        val malas        = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_MALAS, 0)
        val lastSynced   = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
        var installTime  = prefs.getLong(KEY_INSTALL_TIME, 0L)
        val notifIndex   = prefs.getInt(KEY_NOTIF_INDEX, 0)

        val now = System.currentTimeMillis()
        if (installTime == 0L) {
            installTime = now
            prefs.edit().putLong(KEY_INSTALL_TIME, now).apply()
        }

        val cal               = Calendar.getInstance()
        val hour              = cal.get(Calendar.HOUR_OF_DAY)
        val dow               = cal.get(Calendar.DAY_OF_WEEK) // 1=Sun … 7=Sat
        val hoursInactive     = if (lastSynced > 0) (now - lastSynced) / 3_600_000 else Long.MAX_VALUE
        val daysInactive      = hoursInactive / 24
        val hoursSinceInstall = (now - installTime) / 3_600_000
        val neverUsed         = lastSynced == 0L

        // Quiet hours: 3am–7am
        if (hour in 3..6) return Result.success()

        // Deep dormant suppression (30+ days) — over-notifying kills engagement score
        if (!neverUsed && daysInactive >= 30) {
            // One last shot per 7 days, then silence
            val lastAttempt = prefs.getLong(KEY_LAST_NOTIF_TIME, 0L)
            if ((now - lastAttempt) < 7 * 24 * 3_600_000L) return Result.success()
        }

        // Active today and recent — only positive reinforcement, no spam
        if (!neverUsed && navkars > 0 && hoursInactive < 5) return Result.success()

        val timeSlot = when (hour) {
            in 7..10  -> TimeSlot.MORNING
            in 11..14 -> TimeSlot.AFTERNOON
            in 17..20 -> TimeSlot.EVENING
            else      -> TimeSlot.NIGHT
        }

        val lifecycle = when {
            neverUsed && hoursSinceInstall < 72   -> Lifecycle.NEW
            neverUsed && hoursSinceInstall < 168  -> Lifecycle.NEW_COLD
            neverUsed                              -> Lifecycle.NEW_GHOST
            daysInactive < 1                       -> Lifecycle.ACTIVE
            daysInactive in 1..3                   -> Lifecycle.LAPSING
            daysInactive in 4..6                   -> Lifecycle.DORMANT
            daysInactive in 7..29                  -> Lifecycle.DORMANT_DEEP
            else                                   -> Lifecycle.SUPPRESS
        }

        val pool = buildPool(lifecycle, timeSlot, dow, navkars, streak, malas, daysInactive, hoursSinceInstall)
        if (pool.isEmpty()) return Result.success()

        val idx = notifIndex % pool.size
        val (title, body) = pool[idx]

        prefs.edit()
            .putInt(KEY_NOTIF_INDEX, notifIndex + 1)
            .putLong(KEY_LAST_NOTIF_TIME, now)
            .apply()

        sendNotification(title, body)
        speakNotification(title, body)
        return Result.success()
    }

    private enum class TimeSlot { MORNING, AFTERNOON, EVENING, NIGHT }
    private enum class Lifecycle { NEW, NEW_COLD, NEW_GHOST, ACTIVE, LAPSING, DORMANT, DORMANT_DEEP, SUPPRESS }

    private fun buildPool(
        lc: Lifecycle, slot: TimeSlot, dow: Int,
        navkars: Int, streak: Int, malas: Int,
        daysInactive: Long, hoursSinceInstall: Long,
    ): List<Pair<String, String>> {

        val isMonday  = dow == Calendar.MONDAY
        val isFriday  = dow == Calendar.FRIDAY
        val isSunday  = dow == Calendar.SUNDAY

        return when (lc) {

            // ── Never opened, fresh ───────────────────────────────────────────
            Lifecycle.NEW -> listOf(
                "🫂 Hey. You okay?" to "You reached for something. That already says a lot.",
                "🧠 Your mind is working overtime." to "4 minutes of navkar and it quiets down. Try it today.",
                "🫁 You deserve a reset." to "Not tomorrow. Right now. 108 taps.",
                "💛 Something in you wanted peace." to "That's why you're here. Let's begin.",
                "🌿 You don't have to be okay first." to "Just open it. The rest happens on its own.",
            )

            // ── Never opened, gone cold (3–7 days) ───────────────────────────
            Lifecycle.NEW_COLD -> listOf(
                "😮‍💨 ${hoursSinceInstall / 24} days of carrying it alone." to "You don't have to. 4 minutes changes the baseline.",
                "💛 Still holding on to that stress?" to "You reached out ${hoursSinceInstall / 24} days ago. I haven't forgotten.",
                "🌱 You wanted a change." to "That version of you was right. Still is.",
                "🫂 No pressure. But I'm here." to "Whenever you're ready to begin.",
            )

            // ── Never opened, ghosted (7+ days) ──────────────────────────────
            Lifecycle.NEW_GHOST -> listOf(
                "💛 ${hoursSinceInstall / 24} days. I'm still here." to "No judgment. You came to this for a reason.",
                "🌿 Whenever you're ready." to "Your nervous system has been waiting. So have I.",
                "🫂 Zero pressure. Genuinely." to "But something in you knew you needed this.",
            )

            // ── Active today ──────────────────────────────────────────────────
            Lifecycle.ACTIVE -> when {
                malas >= 2 -> listOf(
                    "💎 $malas malas today. I see you." to "Your nervous system is genuinely grateful right now.",
                    "🧬 You did the work today." to "$malas malas. That's not small. That's real.",
                )
                malas == 1 -> listOf(
                    "🔥 One mala done." to "Your stress baseline just shifted. I felt that.",
                    "✅ You showed up today." to "That's the whole thing. Evening round if you're feeling it?",
                )
                else -> listOf(
                    "📿 $navkars in already." to "${108 - (navkars % 108)} more and you close your first mala today.",
                )
            }

            // ── Lapsing (1–3 days inactive) ───────────────────────────────────
            Lifecycle.LAPSING -> buildList {
                when (slot) {
                    TimeSlot.MORNING -> addAll(listOf(
                        "☕ You woke up carrying it again." to "90 seconds of navkar resets that. No cap.",
                        if (isMonday) "📅 New week. Same you." to "Let's change that baseline before the week does it for you."
                        else          "🌅 Before the chaos starts —" to "4 minutes for your nervous system. You deserve it.",
                    ))
                    TimeSlot.AFTERNOON -> addAll(listOf(
                        "😴 That afternoon heaviness?" to "3 minutes of navkar works better than a nap. Try it.",
                        "🧠 Your mind needs a break." to "Not scrolling. An actual break. 108 taps.",
                    ))
                    TimeSlot.EVENING -> addAll(listOf(
                        if (isFriday) "🎉 Weekend energy —" to "Use it. One mala before the night starts."
                        else          "🏁 You carried a lot today." to "Set it down now or take it to bed. Your call.",
                        "😮‍💨 Everyone else's stress is living in your head." to "Evict it. 5 minutes.",
                    ))
                    TimeSlot.NIGHT -> addAll(listOf(
                        if (isSunday) "🛋️ Nowhere to be tonight." to "Just you, chai, and 108 taps. The holy trinity."
                        else          "🌙 Before you pick up the phone —" to "One mala. Your atma will thank you.",
                        "🫁 This is your hour." to "Just you and 108 taps. Actual peace.",
                    ))
                }
                if (streak > 0) addAll(listOf(
                    "⚡ $streak days of showing up." to "Don't let tonight be the plot twist. 4 minutes.",
                    "💛 You've built something real." to "$streak days. Don't let today be the villain arc.",
                ))
            }

            // ── Dormant (4–6 days) ────────────────────────────────────────────
            Lifecycle.DORMANT -> listOf(
                "💛 $daysInactive days. I noticed." to "You were building something real. It's not gone.",
                "😮‍💨 You've been carrying this for $daysInactive days." to "Your nervous system is asking for 5 minutes.",
                "🌿 Life got loud. I get it." to "But you — the version who started this — knew something.",
                "🫂 No guilt. Just an open door." to "Your practice is waiting whenever you are.",
                if (streak > 0) "🔥 Streak was $streak days." to "Not lost. Paused. One tap and we're back."
                else            "🌱 It's okay that you stepped away." to "What matters is you're still here.",
            )

            // ── Deep dormant (7–29 days) ──────────────────────────────────────
            Lifecycle.DORMANT_DEEP -> listOf(
                "💛 $daysInactive days. I haven't gone anywhere." to "Your stress hasn't either. Let's work on that.",
                "🌿 $daysInactive days of unprocessed weight." to "One mala won't fix all of it. But it starts the shift.",
                "🫂 You were changing something in yourself." to "Quietly. Steadily. That work isn't erased.",
                "😶 No judgment for the gap." to "Your atma doesn't charge late fees.",
            )

            // ── Suppress ──────────────────────────────────────────────────────
            Lifecycle.SUPPRESS -> listOf(
                "💛 Still here. No pressure." to "Whenever you come back, I'll be waiting.",
            )
        }
    }

    private fun speakNotification(title: String, body: String) {
        val am = applicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        // Skip TTS if device is silenced or in vibrate-only mode
        if (am.ringerMode == AudioManager.RINGER_MODE_SILENT) return

        val latch = CountDownLatch(1)
        var tts: TextToSpeech? = null

        tts = TextToSpeech(applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale("hi", "IN").let { hi ->
                    // Prefer Hindi if available, else English
                    if (tts?.isLanguageAvailable(hi) == TextToSpeech.LANG_AVAILABLE) hi
                    else Locale.ENGLISH
                }
                tts?.setSpeechRate(0.92f)
                tts?.setPitch(1.05f)
                val utterance = "$title. $body"
                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(id: String?) {}
                    override fun onDone(id: String?) { latch.countDown() }
                    @Deprecated("Deprecated in Java")
                    override fun onError(id: String?) { latch.countDown() }
                })
                tts?.speak(utterance, TextToSpeech.QUEUE_FLUSH, null, "navkar_notif")
            } else {
                latch.countDown()
            }
        }

        // Wait up to 8s for speech to finish, then release
        latch.await(8, TimeUnit.SECONDS)
        tts?.stop()
        tts?.shutdown()
    }

    private fun sendNotification(title: String, body: String) {
        val channelId = "navkar_reengagement"
        val nm = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(
                NotificationChannel(channelId, "Navkar Reminders", NotificationManager.IMPORTANCE_DEFAULT)
                    .apply { description = "Daily sadhana nudges" }
            )
        }

        val intent = applicationContext.packageManager
            .getLaunchIntentForPackage(applicationContext.packageName)
            ?.apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP }

        val pi = PendingIntent.getActivity(
            applicationContext, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notif = NotificationCompat.Builder(applicationContext, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        try {
            NotificationManagerCompat.from(applicationContext).notify(NOTIF_ID, notif)
        } catch (_: SecurityException) { /* permission not granted */ }
    }

    companion object {
        const val KEY_INSTALL_TIME    = "navkar_install_time"
        const val KEY_NOTIF_INDEX     = "navkar_notif_index"
        const val KEY_LAST_NOTIF_TIME = "navkar_last_notif_time"
        const val WORK_NAME           = "navkar_reengagement"
        private const val NOTIF_ID    = 90230

        @JvmStatic
        fun schedule(context: Context) {
            val req = PeriodicWorkRequestBuilder<ReEngagementWorker>(6, TimeUnit.HOURS).build()
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, req)
        }
    }
}
