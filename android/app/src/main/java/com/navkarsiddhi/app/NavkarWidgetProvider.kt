package com.navkarsiddhi.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

/**
 * A real Android home-screen widget (RemoteViews-based, not a WebView) that
 * shows today's Navkar count, mala count, and streak. It never depends on
 * the app's WebView being open — it only reads the SharedPreferences cache
 * that WidgetBridgePlugin last wrote, refreshed either by the OS's periodic
 * updatePeriodMillis (see res/xml/navkar_widget_info.xml, min. ~30 minutes)
 * or immediately when the web app pushes new data.
 */
class NavkarWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)
            val lastSynced = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
            val views = RemoteViews(context.packageName, R.layout.navkar_widget)

            if (lastSynced == 0L) {
                views.setTextViewText(R.id.widget_title, context.getString(R.string.app_name))
                views.setTextViewText(R.id.widget_count, "—")
                views.setTextViewText(R.id.widget_subtitle, context.getString(R.string.widget_open_to_sync))
            } else {
                val navkars = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
                val malas = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_MALAS, 0)
                val streak = prefs.getInt(WidgetBridgePlugin.KEY_STREAK, 0)

                views.setTextViewText(R.id.widget_title, context.getString(R.string.widget_today_label))
                views.setTextViewText(R.id.widget_count, context.getString(R.string.widget_navkars_count, navkars))
                views.setTextViewText(
                    R.id.widget_subtitle,
                    context.getString(R.string.widget_subtitle_format, malas, streak)
                )
            }

            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                ?: Intent(Intent.ACTION_MAIN).apply {
                    setPackage(context.packageName)
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
