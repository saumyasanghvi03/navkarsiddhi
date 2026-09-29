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
    }

    @PluginMethod
    fun updateWidgetData(call: PluginCall) {
        val todayNavkars = call.getInt("todayNavkars", 0) ?: 0
        val todayMalas = call.getInt("todayMalas", 0) ?: 0
        val streak = call.getInt("streak", 0) ?: 0

        val ctx: Context = context
        ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putInt(KEY_TODAY_NAVKARS, todayNavkars)
            .putInt(KEY_TODAY_MALAS, todayMalas)
            .putInt(KEY_STREAK, streak)
            .putLong(KEY_LAST_SYNCED, System.currentTimeMillis())
            .apply()

        requestWidgetRedraw(ctx)

        val result = JSObject()
        result.put("success", true)
        call.resolve(result)
    }

    private fun requestWidgetRedraw(ctx: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(ctx)
        val component = ComponentName(ctx, NavkarWidgetProvider::class.java)
        val ids = appWidgetManager.getAppWidgetIds(component)
        if (ids.isEmpty()) return

        // Same broadcast the OS itself sends on the widget's periodic refresh —
        // AppWidgetProvider.onReceive() already routes this to onUpdate().
        val updateIntent = Intent(ctx, NavkarWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        }
        ctx.sendBroadcast(updateIntent)
    }
}
