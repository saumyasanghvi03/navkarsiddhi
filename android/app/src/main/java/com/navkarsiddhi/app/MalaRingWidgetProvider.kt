package com.navkarsiddhi.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class MalaRingWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateWidget(context, appWidgetManager, id)
    }

    companion object {
        private val LINE_COUNT_IDS = intArrayOf(
            R.id.mala_count_1, R.id.mala_count_2, R.id.mala_count_3,
            R.id.mala_count_4, R.id.mala_count_5
        )

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)
            val views = RemoteViews(context.packageName, R.layout.widget_mala_ring)

            val lastSynced = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
            val navkars = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
            val malas = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_MALAS, 0)
            val streak = prefs.getInt(WidgetBridgePlugin.KEY_STREAK, 0)

            if (lastSynced == 0L) {
                views.setTextViewText(R.id.mala_navkars, "—")
                for (id in LINE_COUNT_IDS) views.setTextViewText(id, "×—")
                views.setTextViewText(R.id.mala_count, "📿  Open app")
                views.setTextViewText(R.id.mala_streak, "")
            } else {
                views.setTextViewText(R.id.mala_navkars, navkars.toString())
                // Each navkar = 1 full recitation of all 5 lines
                for (id in LINE_COUNT_IDS) views.setTextViewText(id, "×$navkars")
                views.setTextViewText(R.id.mala_count, "📿  $malas Mala${if (malas != 1) "s" else ""}")
                views.setTextViewText(R.id.mala_streak, "🔥  $streak day streak")
            }

            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
                ?: Intent(Intent.ACTION_MAIN).apply {
                    setPackage(context.packageName)
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }
            val pi = PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_mala_root, pi)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
