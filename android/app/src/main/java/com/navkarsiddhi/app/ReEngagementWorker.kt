package com.navkarsiddhi.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

/**
 * Fires every 6 hours in the background — even if the user never opens the app.
 * Reads VibeData from SharedPreferences and sends a smart re-engagement nudge
 * when the user has been inactive too long.
 */
class ReEngagementWorker(ctx: Context, params: WorkerParameters) : Worker(ctx, params) {

    override fun doWork(): Result {
        val prefs = applicationContext.getSharedPreferences(
            WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE
        )

        val todayNavkars  = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
        val streak        = prefs.getInt(WidgetBridgePlugin.KEY_STREAK, 0)
        val malas         = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_MALAS, 0)
        val lastSynced    = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
        val installTime   = prefs.getLong(KEY_INSTALL_TIME, 0L)

        // Record install time on very first run
        if (installTime == 0L) {
            prefs.edit().putLong(KEY_INSTALL_TIME, System.currentTimeMillis()).apply()
            // Don't notify on first ever run — give them a chance to open the app
            return Result.success()
        }

        val hoursSinceLast  = if (lastSynced > 0) (System.currentTimeMillis() - lastSynced) / 3_600_000 else Long.MAX_VALUE
        val hoursSinceInstall = (System.currentTimeMillis() - installTime) / 3_600_000

        // Only notify if inactive long enough — avoid spamming active users
        val shouldNotify = when {
            todayNavkars > 0 && hoursSinceLast < 6   -> false  // active today
            hoursSinceLast in 6..11                  -> true   // missed morning
            hoursSinceLast in 12..23                 -> true   // missed full day
            hoursSinceLast >= 24                     -> true   // dormant
            hoursSinceInstall in 2..5 && lastSynced == 0L -> true // installed, never opened
            else                                     -> false
        }

        if (!shouldNotify) return Result.success()

        val (title, body) = pickMessage(todayNavkars, streak, malas, hoursSinceLast, hoursSinceInstall, lastSynced == 0L)

        sendNotification(title, body)
        return Result.success()
    }

    private fun pickMessage(
        navkars: Int,
        streak: Int,
        malas: Int,
        hoursInactive: Long,
        hoursSinceInstall: Long,
        neverOpened: Boolean,
    ): Pair<String, String> {

        // Never opened the app after install
        if (neverOpened) {
            return when {
                hoursSinceInstall < 4  -> "📿 Navkar Siddhi installed!" to "Jai Jinendra 🙏 Open the app, do one mala — takes 5 minutes. Your sadhana starts now."
                hoursSinceInstall < 24 -> "🥺 Still waiting for you" to "You installed Navkar Siddhi ${hoursSinceInstall}h ago and haven't opened it yet. Pehla navkar karo — main wait kar rahi hoon 💛"
                hoursSinceInstall < 48 -> "😒 Kal install kiya, aaj bhi nahi?" to "Ek baar open karo bas. Ek mala. 5 minutes. Atma bhi bata rahi hai — ab karo 📿"
                else                   -> "🪔 Navkar Siddhi yaad hai?" to "You installed this app ${hoursSinceInstall / 24} days ago and never opened it 🥺 Ek baar try karo — Namo Arihantanam 🙏"
            }
        }

        // Installed and used before — re-engagement
        return when {
            hoursInactive in 6..11 && navkars == 0 ->
                "🌅 Subah ho gayi" to "Aaj abhi tak zero navkar 😤 ${if (streak > 0) "Streak $streak din — tod mat" else "Ek mala karo, din set ho jaata hai"} 📿"

            hoursInactive in 12..23 && navkars == 0 ->
                "😬 Poora din gaya" to "${if (streak > 1) "Streak $streak toot gayi toh? 😭 Abhi bhi time hai —" else "Aaj ka din bina navkar?"} Ek mala karo, raat baki hai 🙏"

            hoursInactive in 24..47 ->
                "💛 Kal nahi kiya, aaj?" to "${if (streak > 0) "Streak tha ${streak + 1} din ka — abhi bhi recover ho sakta hai 🥺" else "Kal miss hua, aaj mat miss karo"} Open Navkar Siddhi 📿"

            hoursInactive in 48..71 ->
                "🌸 2 din se nahi aaye" to "Kya hua? ${if (malas > 0) "Pehle $malas mala/din karte the —" else ""} Wapas aao, atma bula rahi hai 🙏 Ek mala kaafi hai aaj ke liye 📿"

            hoursInactive >= 72 && hoursInactive < 168 ->
                "😤 ${hoursInactive / 24} din se gayab?" to "Bhai/behen, ${hoursInactive / 24} din ho gaye. Kashaya itna zyada ho gaya hoga by now 😂 Navkar Siddhi open karo, ek mala, fresh start 🙏"

            hoursInactive >= 168 ->
                "🪔 Wapas aao" to "${hoursInactive / 24} din se Navkar Siddhi bandh hai 🥺 Jab bhi ready ho — ek navkar se shuru karo. Atma waits for no deadline 🙏"

            navkars > 0 && hoursInactive >= 6 ->
                "📿 ${navkars} navkars today" to "${if (malas >= 1) "$malas mala ho gaya 💛 Ek aur?" else "${108 - (navkars % 108)} aur se pehli mala complete"} — Evening jaap? 🌇"

            else ->
                "🙏 Navkar Siddhi" to "Ek mala karo aaj. ${if (streak > 0) "Streak $streak protect karo 🔥" else "Shuru karo — atma ready hai 📿"}"
        }
    }

    private fun sendNotification(title: String, body: String) {
        val channelId = "navkar_reengagement"
        val nm = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(
                NotificationChannel(channelId, "Navkar Reminders", NotificationManager.IMPORTANCE_DEFAULT)
                    .apply { description = "Daily sadhana nudges" }
            )
        }

        val intent = applicationContext.packageManager
            .getLaunchIntentForPackage(applicationContext.packageName)
            ?.apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP }

        val pi = PendingIntent.getActivity(
            applicationContext, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notif = NotificationCompat.Builder(applicationContext, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        try {
            NotificationManagerCompat.from(applicationContext).notify(NOTIF_ID, notif)
        } catch (_: SecurityException) { /* permission not granted */ }
    }

    companion object {
        const val KEY_INSTALL_TIME = "navkar_install_time"
        const val WORK_NAME       = "navkar_reengagement"
        private const val NOTIF_ID = 90230

        @JvmStatic
        fun schedule(context: Context) {
            val req = PeriodicWorkRequestBuilder<ReEngagementWorker>(6, TimeUnit.HOURS)
                .build()
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                    WORK_NAME,
                    androidx.work.ExistingPeriodicWorkPolicy.KEEP,
                    req
                )
        }
    }
}
