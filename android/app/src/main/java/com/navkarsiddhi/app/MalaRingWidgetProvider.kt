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
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)
            val views = RemoteViews(context.packageName, R.layout.widget_mala_ring)

            val lastSynced = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
            val navkars = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
            val malas = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_MALAS, 0)

            if (lastSynced == 0L) {
                views.setTextViewText(R.id.mala_navkars, "—")
                views.setTextViewText(R.id.mala_count, "—")
            } else {
                views.setTextViewText(R.id.mala_navkars, navkars.toString())
                views.setTextViewText(R.id.mala_count, malas.toString())
            }

            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
                ?: Intent(Intent.ACTION_MAIN).apply {
                    setPackage(context.packageName)
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }
            val pi = PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_mala_root, pi)

            val tapIntent = Intent("com.navkarsiddhi.app.TAP_NAVKAR").apply {
                setPackage(context.packageName)
            }
            val tapPi = PendingIntent.getBroadcast(context, 4, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_tap_btn, tapPi)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
