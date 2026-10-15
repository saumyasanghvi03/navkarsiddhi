package com.navkarsiddhi.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class TargetBarWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateWidget(context, appWidgetManager, id)
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)
            val views = RemoteViews(context.packageName, R.layout.widget_target_bar)

            val lastSynced = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
            val navkars = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
            val dailyTarget = prefs.getInt(WidgetBridgePlugin.KEY_DAILY_TARGET, 108)

            if (lastSynced == 0L) {
                views.setTextViewText(R.id.target_count_label, "Open app to sync")
                views.setTextViewText(R.id.target_percent, "—")
                views.setTextViewText(R.id.target_subtitle, "Navkar Siddhi")
                views.setProgressBar(R.id.target_fill, 100, 0, false)
            } else {
                val pct = if (dailyTarget > 0) (navkars * 100 / dailyTarget).coerceAtMost(100) else 0
                views.setTextViewText(R.id.target_count_label, "$navkars / $dailyTarget Navkars")
                views.setTextViewText(R.id.target_percent, "$pct%")
                views.setTextViewText(R.id.target_subtitle,
                    if (pct >= 100) "🎉 Target reached! Jai Jinendra 🙏"
                    else "${dailyTarget - navkars} more to go — you've got this")
                views.setProgressBar(R.id.target_fill, 100, pct, false)
            }

            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
                ?: Intent(Intent.ACTION_MAIN).apply {
                    setPackage(context.packageName)
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }
            val pi = PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_target_root, pi)

            val tapIntent = Intent("com.navkarsiddhi.app.TAP_NAVKAR").apply {
                setPackage(context.packageName)
            }
            val tapPi = PendingIntent.getBroadcast(context, 3, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_tap_btn, tapPi)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
