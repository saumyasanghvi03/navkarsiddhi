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
        // 27 visible beads across 3 rows of 9 — each bead = 4 actual (for 108-bead mala)
        private const val ROWS = 3
        private const val COLS = 9
        private const val DISPLAY_BEADS = ROWS * COLS

        private fun beadRow(doneBeads: Int, row: Int): String {
            val start = row * COLS
            return buildString {
                for (c in 0 until COLS) {
                    val idx = start + c
                    append(if (idx < doneBeads) "●" else "○")
                    if (c < COLS - 1) append(" ")
                }
            }
        }

        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)
            val views = RemoteViews(context.packageName, R.layout.widget_mala_ring)

            val lastSynced = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
            val navkars = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
            val malas = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_MALAS, 0)
            val streak = prefs.getInt(WidgetBridgePlugin.KEY_STREAK, 0)
            val malaSize = prefs.getInt(WidgetBridgePlugin.KEY_MALA_SIZE, 108)

            if (lastSynced == 0L) {
                views.setTextViewText(R.id.mala_navkars, "—")
                views.setTextViewText(R.id.mala_count, "📿  Open app to sync")
                views.setTextViewText(R.id.mala_streak, "")
                views.setTextViewText(R.id.mala_bead_row1, "○ ○ ○ ○ ○ ○ ○ ○ ○")
                views.setTextViewText(R.id.mala_bead_row2, "○ ○ ○ ○ ○ ○ ○ ○ ○")
                views.setTextViewText(R.id.mala_bead_row3, "○ ○ ○ ○ ○ ○ ○ ○ ○")
                views.setTextViewText(R.id.mala_bead_progress, "—")
                views.setTextViewText(R.id.mala_in_progress, "in progress")
            } else {
                val inMala = navkars % malaSize.coerceAtLeast(1)
                val malaNumber = malas + 1
                // Map inMala (0..malaSize) → displayBeads (0..27)
                val doneBeads = ((inMala.toFloat() / malaSize) * DISPLAY_BEADS).toInt().coerceIn(0, DISPLAY_BEADS)

                views.setTextViewText(R.id.mala_navkars, navkars.toString())
                views.setTextViewText(R.id.mala_count, "📿  $malas Mala${if (malas != 1) "s" else ""}")
                views.setTextViewText(R.id.mala_streak, "🔥  $streak day streak")
                views.setTextViewText(R.id.mala_bead_row1, beadRow(doneBeads, 0))
                views.setTextViewText(R.id.mala_bead_row2, beadRow(doneBeads, 1))
                views.setTextViewText(R.id.mala_bead_row3, beadRow(doneBeads, 2))
                views.setTextViewText(R.id.mala_bead_progress, "Mala $malaNumber")
                views.setTextViewText(R.id.mala_in_progress, "$inMala / $malaSize beads")
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
