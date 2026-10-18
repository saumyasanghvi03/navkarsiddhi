package com.navkarsiddhi.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.util.Calendar
import java.util.concurrent.TimeUnit

class ReEngagementWorker(ctx: Context, params: WorkerParameters) : Worker(ctx, params) {

    override fun doWork(): Result {
        val prefs = applicationContext.getSharedPreferences(
            WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE
        )

        val todayNavkars = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
        val streak       = prefs.getInt(WidgetBridgePlugin.KEY_STREAK, 0)
        val malas        = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_MALAS, 0)
        val lastSynced   = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
        val installTime  = prefs.getLong(KEY_INSTALL_TIME, 0L)
        val notifIndex   = prefs.getInt(KEY_NOTIF_INDEX, 0)

        if (installTime == 0L) {
            prefs.edit().putLong(KEY_INSTALL_TIME, System.currentTimeMillis()).apply()
        }

        val now               = System.currentTimeMillis()
        val hourOfDay         = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val hoursInactive     = if (lastSynced > 0) (now - lastSynced) / 3_600_000 else Long.MAX_VALUE
        val hoursSinceInstall = if (installTime > 0) (now - installTime) / 3_600_000 else 0L
        val neverUsed         = lastSynced == 0L
        val daysInactive      = hoursInactive / 24

        // Don't fire between midnight and 7am
        if (hourOfDay in 0..6) return Result.success()

        // Don't spam active users who already logged today
        if (todayNavkars > 0 && hoursInactive < 5) return Result.success()

        val pool = buildPool(
            neverUsed, hoursSinceInstall, hoursInactive, daysInactive,
            todayNavkars, streak, malas, hourOfDay
        )

        if (pool.isEmpty()) return Result.success()

        // Rotate through pool — never repeat back-to-back
        val idx = notifIndex % pool.size
        val (title, body) = pool[idx]
        prefs.edit().putInt(KEY_NOTIF_INDEX, notifIndex + 1).apply()

        sendNotification(title, body)
        return Result.success()
    }

    private fun buildPool(
        neverUsed: Boolean,
        hoursSinceInstall: Long,
        hoursInactive: Long,
        daysInactive: Long,
        navkars: Int,
        streak: Int,
        malas: Int,
        hour: Int,
    ): List<Pair<String, String>> {

        // ── Never used the app ────────────────────────────────────────────────
        if (neverUsed) return when {
            hoursSinceInstall < 6 -> listOf(
                "📲 Downloaded it. Brave." to "The app is here. Your peace of mind isn't.",
                "🫠 Still buffering?" to "Stress doesn't wait. Neither should your reset.",
                "🔋 4 minutes. That's the whole ask." to "Your cortisol is charging rent. Stop it.",
            )
            hoursSinceInstall < 24 -> listOf(
                "👀 It's just sitting there." to "Your focus tool, unopened. Peak delulu.",
                "🫠 Downloaded. Never opened." to "That's giving gym membership energy. 4 minutes.",
                "⏳ Your stress didn't take a day off either." to "This app takes 4 minutes. ROI: your sanity.",
            )
            hoursSinceInstall < 48 -> listOf(
                "😮‍💨 Day 2. Still buffering?" to "The loading screen is you. Open it.",
                "🧠 Therapy is expensive." to "This isn't. And it actually works.",
                "📉 Cortisol up. Navkars: still 0." to "One of these is in your control.",
            )
            else -> listOf(
                "👀 ${hoursSinceInstall / 24} days. We're not delulu about this." to "The app is still here. So is your stress.",
                "😶 Still carrying this week's chaos?" to "Your healing era called. It's been on hold.",
                "🌱 No judgment." to "But you downloaded a peace-of-mind tool and never used it.",
            )
        }

        // ── Active today — positive reinforcement ─────────────────────────────
        if (navkars > 0 && hoursInactive < 6) return when {
            malas >= 2 -> listOf(
                "💎 ${malas} malas today. You ate." to "And left no crumbs. The nervous system thanks you.",
                "🧬 You're built different rn." to "${malas} malas. Neurologically different from most people today.",
            )
            malas == 1 -> listOf(
                "🔥 1 mala done." to "Your stress baseline just dropped. Science, not spirituality.",
                "✅ Understood the assignment." to "One mala down. Evening top-up? Or we don't talk about it.",
            )
            else -> listOf(
                "📿 $navkars navkars logged." to "${108 - (navkars % 108)} more to close the first mala. You're close.",
            )
        }

        // ── Missed today ──────────────────────────────────────────────────────
        if (hoursInactive in 6..23 || (neverUsed.not() && navkars == 0)) {
            val missed = mutableListOf(
                "🧠 Therapy is expensive." to "This isn't. And it actually works.",
                "☕ Running hot and you know it." to "90 seconds resets your nervous system. No cap.",
                "📉 Cortisol up. Navkars: 0." to "One of these is in your control.",
                "🔕 Your nervous system texted. No reply." to "4 minutes. That's all it needs.",
                "😮‍💨 Everyone's drama is rent-free in your head rn." to "Evict it. 5 minutes.",
            )
            if (hour in 7..11) missed += listOf(
                "📅 New week. Same nervous system." to "Unless you do something about it in the next 4 minutes.",
                "☕ Morning without navkar is just cortisol." to "4 minutes before the chaos begins. Main character move.",
            )
            if (hour in 18..21) missed += listOf(
                "🏁 Day's done. Stress isn't." to "Discharge it now or carry it to bed. Your call.",
                "😮‍💨 You absorbed everyone's chaos today." to "Navkar is how you stop carrying it. 5 minutes.",
            )
            if (hour >= 22) missed += listOf(
                "🌙 Doom-scroll or actual peace." to "One rewires your atma. The other gives you neck pain.",
                "🫁 Your solulu hour." to "Just you, 108 taps, actual peace.",
            )
            if (streak > 0) missed += listOf(
                "⚡ ${streak} days. Tonight though?" to "You've come too far for tonight to be the villain arc.",
                "😤 This close to breaking it for nothing." to "4 minutes. Keep the main character energy alive.",
            )
            return missed
        }

        // ── Multi-day dormant ─────────────────────────────────────────────────
        if (daysInactive in 2..6) return listOf(
            "👻 ${daysInactive} days. No judgment." to "But you were onto something real. It's still here.",
            "😶 Still carrying ${daysInactive}-day-old stress?" to "Your healing era called. It's been on hold.",
            "💀 Your healing era ghosted itself." to "The version of you from ${daysInactive} days ago understood the assignment.",
            "🧠 Therapy is expensive." to "This isn't. And your nervous system misses it.",
            "🌱 No judgment. We're in our understanding era." to "Life happened. The habit is still here whenever you are.",
        )

        if (daysInactive >= 7) return listOf(
            "👀 ${daysInactive} days. We miss you more than you miss us." to "Your stress didn't take that break though.",
            "😮‍💨 ${daysInactive} days of unprocessed chaos." to "One mala won't fix all of it. But it starts the discharge.",
            "🌱 Still here. Zero judgment." to "Whenever you're ready. The atma doesn't do late fees.",
            "💎 You had something real going." to "A habit that was quietly changing your baseline. It's not gone.",
        )

        // ── Streak milestones ─────────────────────────────────────────────────
        if (streak >= 21) return listOf(
            "💎 Day $streak. You're literally different now." to "People around you noticed. They just don't know why.",
            "🧬 $streak days in. Not to be delulu but—" to "Your stress response is neurologically different. That's yours now.",
        )

        if (streak >= 7) return listOf(
            "🔥 Day $streak. Don't stop now." to "Your nervous system has entered its healing era. Keep it.",
            "💎 $streak days of not being a mess." to "Tonight is not the night to start.",
        )

        // ── Fallback ──────────────────────────────────────────────────────────
        return listOf(
            "🧠 4 minutes. Free therapy." to "Your cortisol doesn't deserve more rent than that.",
            "📿 One mala." to "Cheaper than therapy. More immediate than sleep.",
        )
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
        const val KEY_NOTIF_INDEX  = "navkar_notif_index"
        const val WORK_NAME        = "navkar_reengagement"
        private const val NOTIF_ID = 90230

        @JvmStatic
        fun schedule(context: Context) {
            val req = PeriodicWorkRequestBuilder<ReEngagementWorker>(6, TimeUnit.HOURS).build()
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, req)
        }
    }
}
