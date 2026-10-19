package com.navkarsiddhi.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Bridges the web app's Navkar counts (which live only in the WebView's
 * localStorage) into native SharedPreferences, so the home-screen widget can
 * read them without the WebView being open. The web side calls
 * `NavkarWidgetBridge.updateWidgetData({ todayNavkars, todayMalas, streak })`
 * whenever those numbers change (see src/lib/nativeWidgetBridge.ts) and on
 * app pause, so the cache is fresh the next time the widget redraws.
 */
@CapacitorPlugin(name = "NavkarWidgetBridge")
class WidgetBridgePlugin : Plugin() {

    companion object {
        const val PREFS_NAME = "navkar_widget_prefs"
        const val KEY_TODAY_NAVKARS = "today_navkars"
        const val KEY_TODAY_MALAS = "today_malas"
        const val KEY_STREAK = "streak"
        const val KEY_LAST_SYNCED = "last_synced_at"
        const val KEY_DAILY_TARGET = "daily_target"
        const val KEY_MALA_SIZE = "mala_size"
        const val KEY_USER_NAME = "user_name"
        const val KEY_USER_GENDER = "user_gender"

        private val WIDGET_PROVIDERS = listOf(
            NavkarWidgetProvider::class.java,
            StreakWidgetProvider::class.java,
            TargetBarWidgetProvider::class.java,
            MalaRingWidgetProvider::class.java,
            HeatmapWidgetProvider::class.java,
        )
    }

    @PluginMethod
    fun updateWidgetData(call: PluginCall) {
        val todayNavkars = call.getInt("todayNavkars", 0) ?: 0
        val todayMalas = call.getInt("todayMalas", 0) ?: 0
        val streak = call.getInt("streak", 0) ?: 0
        val dailyTarget = call.getInt("dailyTarget", 108) ?: 108
        val malaSize = call.getInt("malaSize", 108) ?: 108

        val userName = call.getString("userName") ?: ""
        val userGender = call.getString("userGender") ?: ""

        val ctx: Context = context
        val editor = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
            .putInt(KEY_TODAY_NAVKARS, todayNavkars)
            .putInt(KEY_TODAY_MALAS, todayMalas)
            .putInt(KEY_STREAK, streak)
            .putInt(KEY_DAILY_TARGET, dailyTarget)
            .putInt(KEY_MALA_SIZE, malaSize)
            .putString(KEY_USER_NAME, userName)
            .putString(KEY_USER_GENDER, userGender)
            .putLong(KEY_LAST_SYNCED, System.currentTimeMillis())

        // Weekly heatmap: JS passes weeklyNavkars as a comma-separated string "d0,d1,...,d6"
        val weekly = call.getString("weeklyNavkars")
        if (!weekly.isNullOrBlank()) {
            val parts = weekly.split(",")
            for (i in 0..6) {
                editor.putInt("week_d$i", parts.getOrNull(i)?.trim()?.toIntOrNull() ?: 0)
            }
        }

        editor.apply()

        requestAllWidgetRedraws(ctx)

        val result = JSObject()
        result.put("success", true)
        call.resolve(result)
    }

    private fun requestAllWidgetRedraws(ctx: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(ctx)
        for (providerClass in WIDGET_PROVIDERS) {
            val component = ComponentName(ctx, providerClass)
            val ids = appWidgetManager.getAppWidgetIds(component)
            if (ids.isEmpty()) continue
            val intent = Intent(ctx, providerClass).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            }
            ctx.sendBroadcast(intent)
        }
    }
}
