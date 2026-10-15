package com.navkarsiddhi.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class HeatmapWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateWidget(context, appWidgetManager, id)
    }

    companion object {
        // 7 bar view IDs and 7 day label IDs in layout order (oldest → newest/today)
        private val BAR_IDS = intArrayOf(
            R.id.heatmap_bar_0, R.id.heatmap_bar_1, R.id.heatmap_bar_2, R.id.heatmap_bar_3,
            R.id.heatmap_bar_4, R.id.heatmap_bar_5, R.id.heatmap_bar_6
        )
        private val DAY_IDS = intArrayOf(
            R.id.heatmap_day_0, R.id.heatmap_day_1, R.id.heatmap_day_2, R.id.heatmap_day_3,
            R.id.heatmap_day_4, R.id.heatmap_day_5, R.id.heatmap_day_6
        )
        private val DAY_ABBREVS = arrayOf("Mon","Tue","Wed","Thu","Fri","Sat","Sun")

        // Heat colour: transparent grey → gold → orange → deep orange
        private fun heatColor(navkars: Int, max: Int): Int {
            if (navkars == 0 || max == 0) return Color.argb(0x33, 0xFF, 0xFF, 0xFF) // dim white
            val ratio = (navkars.toFloat() / max).coerceIn(0f, 1f)
            return when {
                ratio < 0.25f -> Color.argb(0x99, 0xF5, 0xA6, 0x23) // faint gold
                ratio < 0.5f  -> Color.argb(0xBB, 0xF5, 0xA6, 0x23) // mid gold
                ratio < 0.75f -> Color.argb(0xDD, 0xF9, 0x73, 0x16) // orange
                else          -> Color.argb(0xFF, 0xEF, 0x44, 0x44) // full red-orange
            }
        }

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)
            val views = RemoteViews(context.packageName, R.layout.widget_heatmap)

            // Read 7 days of navkar counts stored as "week_d0".."week_d6" (oldest..today)
            val weekCounts = IntArray(7) { i -> prefs.getInt("week_d$i", 0) }
            val maxCount = weekCounts.max().coerceAtLeast(1)
            val weekTotal = weekCounts.sum()

            // Build day labels: go back 6 days from today
            val cal = Calendar.getInstance()
            val dayLabels = Array(7) { i ->
                val c = Calendar.getInstance()
                c.add(Calendar.DAY_OF_YEAR, -(6 - i))
                DAY_ABBREVS[(c.get(Calendar.DAY_OF_WEEK) + 5) % 7]
            }

            for (i in 0..6) {
                views.setInt(BAR_IDS[i], "setBackgroundColor", heatColor(weekCounts[i], maxCount))
                if (i < 6) views.setTextViewText(DAY_IDS[i], dayLabels[i])
                // day 6 label is always "TODAY" (set in XML)
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

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
