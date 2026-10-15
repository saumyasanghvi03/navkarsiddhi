package com.navkarsiddhi.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class StreakWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateWidget(context, appWidgetManager, id)
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)
            val views = RemoteViews(context.packageName, R.layout.widget_streak)

            val streak = prefs.getInt(WidgetBridgePlugin.KEY_STREAK, 0)
            val lastSynced = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)

            views.setTextViewText(R.id.streak_number, if (lastSynced == 0L) "—" else streak.toString())
            views.setTextViewText(R.id.streak_label, if (streak == 1) "day streak" else "day streak")

            // Colour shifts: grey → amber → orange → red based on streak length
            val color = when {
                streak >= 108 -> 0xFFEF4444.toInt() // red
                streak >= 30  -> 0xFFF97316.toInt() // orange
                streak >= 7   -> 0xFFF59E0B.toInt() // amber
                streak > 0    -> 0xFFF5A623.toInt() // default gold
                else          -> 0xFFAAAAAA.toInt() // grey
            }
            views.setTextColor(R.id.streak_number, color)

            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
                ?: Intent(Intent.ACTION_MAIN).apply {
                    setPackage(context.packageName)
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }
            val pi = PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_streak_root, pi)

            val tapIntent = Intent("com.navkarsiddhi.app.TAP_NAVKAR").apply {
                setPackage(context.packageName)
            }
            val tapPi = PendingIntent.getBroadcast(context, 2, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_tap_btn, tapPi)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
