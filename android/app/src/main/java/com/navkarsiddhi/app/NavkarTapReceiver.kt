package com.navkarsiddhi.app

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent

/**
 * Receives "com.navkarsiddhi.app.TAP_NAVKAR" broadcasts sent by the +1 tap
 * button on every home-screen widget. Increments today's Navkar count directly
 * in SharedPreferences (the same cache WidgetBridgePlugin writes) and then
 * forces all five widget providers to redraw so the new number shows instantly.
 *
 * The receiver is not exported — it only accepts internal broadcasts.
 */
class NavkarTapReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_TAP_NAVKAR) return

        val prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE)

        val todayNavkars = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0) + 1
        val malaSize = prefs.getInt(WidgetBridgePlugin.KEY_MALA_SIZE, 108).coerceAtLeast(1)
        val todayMalas = todayNavkars / malaSize

        prefs.edit()
            .putInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, todayNavkars)
            .putInt(WidgetBridgePlugin.KEY_TODAY_MALAS, todayMalas)
            .putLong(WidgetBridgePlugin.KEY_LAST_SYNCED, System.currentTimeMillis())
            .apply()

        updateAllWidgets(context)
    }

    private fun updateAllWidgets(context: Context) {
        val awm = AppWidgetManager.getInstance(context)

        fun redraw(cls: Class<*>, update: (Context, AppWidgetManager, Int) -> Unit) {
            val ids = awm.getAppWidgetIds(ComponentName(context, cls))
            for (id in ids) update(context, awm, id)
        }

        redraw(NavkarWidgetProvider::class.java)   { ctx, mgr, id -> NavkarWidgetProvider.updateWidget(ctx, mgr, id) }
        redraw(StreakWidgetProvider::class.java)    { ctx, mgr, id -> StreakWidgetProvider.updateWidget(ctx, mgr, id) }
        redraw(TargetBarWidgetProvider::class.java) { ctx, mgr, id -> TargetBarWidgetProvider.updateWidget(ctx, mgr, id) }
    }

    companion object {
        const val ACTION_TAP_NAVKAR = "com.navkarsiddhi.app.TAP_NAVKAR"
    }
}
