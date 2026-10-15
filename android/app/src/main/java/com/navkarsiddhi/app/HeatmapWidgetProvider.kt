package com.navkarsiddhi.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.util.Calendar

class HeatmapWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) {
            try {
                updateWidget(context, appWidgetManager, id)
            } catch (_: Exception) {
                // Never let a widget crash kill the app — silent fail, keep existing view
            }
        }
    }

    companion object {
        private val BAR_IDS = intArrayOf(
            R.id.heatmap_bar_0, R.id.heatmap_bar_1, R.id.heatmap_bar_2, R.id.heatmap_bar_3,
            R.id.heatmap_bar_4, R.id.heatmap_bar_5, R.id.heatmap_bar_6
        )
        private val DAY_IDS = intArrayOf(
            R.id.heatmap_day_0, R.id.heatmap_day_1, R.id.heatmap_day_2, R.id.heatmap_day_3,
            R.id.heatmap_day_4, R.id.heatmap_day_5, R.id.heatmap_day_6
        )
        private val DAY_ABBREVS = arrayOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")

        // Intensity → drawable resource with rounded corners (light golden theme)
        private fun heatDrawable(navkars: Int, max: Int): Int {
            if (navkars == 0 || max == 0) return R.drawable.heatmap_bar_empty
            val ratio = (navkars.toFloat() / max).coerceIn(0f, 1f)
            return when {
                ratio < 0.4f -> R.drawable.heatmap_bar_low
                ratio < 0.75f -> R.drawable.heatmap_bar_mid
                else -> R.drawable.heatmap_bar_high
            }
        }

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)
            val views = RemoteViews(context.packageName, R.layout.widget_heatmap)

            val weekCounts = IntArray(7) { i -> prefs.getInt("week_d$i", 0) }
            val maxCount = weekCounts.maxOrNull()?.coerceAtLeast(1) ?: 1
            val weekTotal = weekCounts.sum()

            // Build day labels from oldest (6 days ago) → today
            val dayLabels = Array(7) { i ->
                val c = Calendar.getInstance()
                c.add(Calendar.DAY_OF_YEAR, -(6 - i))
                DAY_ABBREVS[(c.get(Calendar.DAY_OF_WEEK) + 5) % 7]
            }

            for (i in 0..6) {
                views.setInt(BAR_IDS[i], "setBackgroundResource", heatDrawable(weekCounts[i], maxCount))
                if (i < 6) views.setTextViewText(DAY_IDS[i], dayLabels[i])
                // DAY_IDS[6] stays "TODAY" as set in XML
            }

            val lastSynced = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
            views.setTextViewText(
                R.id.heatmap_total,
                if (lastSynced == 0L) "Open app to sync" else "$weekTotal this week"
            )

            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
                ?: Intent(Intent.ACTION_MAIN).apply {
                    setPackage(context.packageName)
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }
            val pi = PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_heatmap_root, pi)

            val tapIntent = Intent("com.navkarsiddhi.app.TAP_NAVKAR").apply {
                setPackage(context.packageName)
            }
            val tapPi = PendingIntent.getBroadcast(context, 5, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_tap_btn, tapPi)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
