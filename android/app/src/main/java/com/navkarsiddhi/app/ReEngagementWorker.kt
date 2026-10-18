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

/**
 * Background re-engagement worker — fires every 6h, sends a smart contextual
 * notification even when the app is never opened.
 *
 * Strategy mirrors Zomato/Swiggy/Blinkit AI notification playbook:
 *  - Title ≤6 words (lock screen hook), body ≤15 words (punchline)
 *  - Day-of-week + time-slot personality
 *  - User lifecycle segmentation: new / active / lapsing / dormant / suppress
 *  - Streak psychology: loss aversion when streak at risk
 *  - Benefit-first copy, Jain ethical, GenZ tone
 *  - Rotating index so same message never repeats back-to-back
 *  - Deep dormant (30+ days): suppress to protect engagement score
 */
class ReEngagementWorker(ctx: Context, params: WorkerParameters) : Worker(ctx, params) {

    override fun doWork(): Result {
        val prefs = applicationContext.getSharedPreferences(
            WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE
        )

        val navkars      = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_NAVKARS, 0)
        val streak       = prefs.getInt(WidgetBridgePlugin.KEY_STREAK, 0)
        val malas        = prefs.getInt(WidgetBridgePlugin.KEY_TODAY_MALAS, 0)
        val lastSynced   = prefs.getLong(WidgetBridgePlugin.KEY_LAST_SYNCED, 0L)
        var installTime  = prefs.getLong(KEY_INSTALL_TIME, 0L)
        val notifIndex   = prefs.getInt(KEY_NOTIF_INDEX, 0)

        val now = System.currentTimeMillis()
        if (installTime == 0L) {
            installTime = now
            prefs.edit().putLong(KEY_INSTALL_TIME, now).apply()
        }

        val cal               = Calendar.getInstance()
        val hour              = cal.get(Calendar.HOUR_OF_DAY)
        val dow               = cal.get(Calendar.DAY_OF_WEEK) // 1=Sun … 7=Sat
        val hoursInactive     = if (lastSynced > 0) (now - lastSynced) / 3_600_000 else Long.MAX_VALUE
        val daysInactive      = hoursInactive / 24
        val hoursSinceInstall = (now - installTime) / 3_600_000
        val neverUsed         = lastSynced == 0L

        // Quiet hours: 3am–7am
        if (hour in 3..6) return Result.success()

        // Deep dormant suppression (30+ days) — over-notifying kills engagement score
        if (!neverUsed && daysInactive >= 30) {
            // One last shot per 7 days, then silence
            val lastAttempt = prefs.getLong(KEY_LAST_NOTIF_TIME, 0L)
            if ((now - lastAttempt) < 7 * 24 * 3_600_000L) return Result.success()
        }

        // Active today and recent — only positive reinforcement, no spam
        if (!neverUsed && navkars > 0 && hoursInactive < 5) return Result.success()

        val timeSlot = when (hour) {
            in 7..10  -> TimeSlot.MORNING
            in 11..14 -> TimeSlot.AFTERNOON
            in 17..20 -> TimeSlot.EVENING
            else      -> TimeSlot.NIGHT
        }

        val lifecycle = when {
            neverUsed && hoursSinceInstall < 72   -> Lifecycle.NEW
            neverUsed && hoursSinceInstall < 168  -> Lifecycle.NEW_COLD
            neverUsed                              -> Lifecycle.NEW_GHOST
            daysInactive < 1                       -> Lifecycle.ACTIVE
            daysInactive in 1..3                   -> Lifecycle.LAPSING
            daysInactive in 4..6                   -> Lifecycle.DORMANT
            daysInactive in 7..29                  -> Lifecycle.DORMANT_DEEP
            else                                   -> Lifecycle.SUPPRESS
        }

        val pool = buildPool(lifecycle, timeSlot, dow, navkars, streak, malas, daysInactive, hoursSinceInstall)
        if (pool.isEmpty()) return Result.success()

        val idx = notifIndex % pool.size
        val (title, body) = pool[idx]

        prefs.edit()
            .putInt(KEY_NOTIF_INDEX, notifIndex + 1)
            .putLong(KEY_LAST_NOTIF_TIME, now)
            .apply()

        sendNotification(title, body)
        return Result.success()
    }

    private enum class TimeSlot { MORNING, AFTERNOON, EVENING, NIGHT }
    private enum class Lifecycle { NEW, NEW_COLD, NEW_GHOST, ACTIVE, LAPSING, DORMANT, DORMANT_DEEP, SUPPRESS }

    private fun buildPool(
        lc: Lifecycle, slot: TimeSlot, dow: Int,
        navkars: Int, streak: Int, malas: Int,
        daysInactive: Long, hoursSinceInstall: Long,
    ): List<Pair<String, String>> {

        val isMonday  = dow == Calendar.MONDAY
        val isFriday  = dow == Calendar.FRIDAY
        val isSunday  = dow == Calendar.SUNDAY

        return when (lc) {

            // ── Never opened, fresh ───────────────────────────────────────────
            Lifecycle.NEW -> listOf(
                "📲 Downloaded it. Brave." to "The app is here. Your peace of mind isn't.",
                "🫠 Still buffering?" to "Stress doesn't wait. Neither should your reset.",
                "🔋 4 minutes. That's the whole ask." to "Your cortisol is charging rent. Stop it.",
                "🧠 Therapy is expensive." to "This isn't. And it actually works.",
                "👀 It's just sitting there." to "Your focus tool, unopened. Peak delulu.",
            )

            // ── Never opened, gone cold (3–7 days) ───────────────────────────
            Lifecycle.NEW_COLD -> listOf(
                "📦 Delivered. Unopened." to "That's giving gym membership energy. 4 minutes.",
                "⏳ Your stress didn't take ${hoursSinceInstall / 24} days off." to "The app did though. Open it.",
                "😮‍💨 Day ${hoursSinceInstall / 24}. Still buffering?" to "The loading screen is you.",
                "📉 Cortisol up. Navkars: still 0." to "One of these is in your control.",
            )

            // ── Never opened, ghosted (7+ days) ──────────────────────────────
            Lifecycle.NEW_GHOST -> listOf(
                "👻 ${hoursSinceInstall / 24} days. We don't ghost." to "You do though. No judgment. App's still here.",
                "😶 Your healing era ghosted itself." to "Whenever you're ready. No late fees.",
                "🌱 No judgment. Zero." to "But you downloaded a peace tool and never used it.",
            )

            // ── Active today ──────────────────────────────────────────────────
            Lifecycle.ACTIVE -> when {
                malas >= 2 -> listOf(
                    "💎 $malas malas today. You ate." to "And left no crumbs. Nervous system thanks you.",
                    "🧬 Built different rn." to "$malas malas. Neurologically different from most today.",
                )
                malas == 1 -> listOf(
                    "🔥 1 mala done." to "Stress baseline just dropped. Science, not spirituality.",
                    "✅ Understood the assignment." to "Evening top-up? Or we don't talk about it.",
                )
                else -> listOf(
                    "📿 $navkars navkars in." to "${108 - (navkars % 108)} more closes the first mala.",
                )
            }

            // ── Lapsing (1–3 days inactive) ───────────────────────────────────
            Lifecycle.LAPSING -> buildList {
                // Time-slot copy
                when (slot) {
                    TimeSlot.MORNING -> addAll(listOf(
                        "☕ Running hot and you know it." to "90 seconds resets your nervous system. No cap.",
                        if (isMonday) "📅 New week. Same nervous system." to "Unless you fix it in the next 4 minutes."
                        else          "🌅 Morning without navkar is just cortisol." to "4 minutes before the chaos begins.",
                    ))
                    TimeSlot.AFTERNOON -> addAll(listOf(
                        "😴 Post-lunch dip?" to "3 minutes of navkar outperforms a nap. Try it.",
                        "🧠 4 minutes. Free therapy." to "Your cortisol doesn't deserve more rent.",
                    ))
                    TimeSlot.EVENING -> addAll(listOf(
                        if (isFriday) "🎉 Weekend hai." to "Prove us wrong. One mala. Right now."
                        else          "🏁 Day's done. Stress isn't." to "Discharge it now or carry it to bed.",
                        "😮‍💨 Everyone's chaos is rent-free in your head." to "Evict it. 5 minutes.",
                    ))
                    TimeSlot.NIGHT -> addAll(listOf(
                        if (isSunday) "🛋️ Nowhere to be." to "Rain + chai + navkar. The holy trinity."
                        else          "🌙 Doom-scroll or actual peace." to "One rewires your atma. The other: neck pain.",
                        "🫁 Your solulu hour." to "Just you, 108 taps, actual peace.",
                    ))
                }
                // Streak at risk
                if (streak > 0) addAll(listOf(
                    "⚡ ${streak} days. Don't." to "You've come too far for tonight to be the villain arc.",
                    "😤 This close to breaking it for nothing." to "4 minutes. Keep the main character energy.",
                ))
            }

            // ── Dormant (4–6 days) ────────────────────────────────────────────
            Lifecycle.DORMANT -> listOf(
                "👻 $daysInactive days. No judgment." to "But you were onto something real. Still here.",
                "😶 Still carrying ${daysInactive}-day-old stress?" to "Your healing era called. It's been on hold.",
                "💀 Your healing era ghosted itself." to "The version of you $daysInactive days ago understood the assignment.",
                "🧠 Therapy is expensive." to "This isn't. And your nervous system misses it.",
                if (streak > 0) "🔥 Streak was at $streak." to "Not gone. Just paused. One tap restarts everything."
                else            "🌱 Life happened. We get it." to "The habit is still here whenever you are.",
            )

            // ── Deep dormant (7–29 days) ──────────────────────────────────────
            Lifecycle.DORMANT_DEEP -> listOf(
                "👀 $daysInactive days. We miss you more than you miss us." to "Your stress didn't take that break though.",
                "😮‍💨 $daysInactive days of unprocessed chaos." to "One mala won't fix all of it. But it starts.",
                "💎 You had something real going." to "A habit quietly changing your baseline. Not gone.",
                "🌱 Still here. Zero judgment." to "Atma doesn't do late fees.",
            )

            // ── Suppress ──────────────────────────────────────────────────────
            Lifecycle.SUPPRESS -> listOf(
                "🌱 Whenever you're ready." to "No pressure. No late fees. Navkar Siddhi is here.",
            )
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
        const val KEY_INSTALL_TIME    = "navkar_install_time"
        const val KEY_NOTIF_INDEX     = "navkar_notif_index"
        const val KEY_LAST_NOTIF_TIME = "navkar_last_notif_time"
        const val WORK_NAME           = "navkar_reengagement"
        private const val NOTIF_ID    = 90230

        @JvmStatic
        fun schedule(context: Context) {
            val req = PeriodicWorkRequestBuilder<ReEngagementWorker>(6, TimeUnit.HOURS).build()
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(WORK_NAME, ExistingPeriodicWorkPolicy.KEEP, req)
        }
    }
}
