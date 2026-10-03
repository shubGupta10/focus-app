package expo.modules.focusblocker

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import java.util.Calendar

class RoutineReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val routineId = intent.getIntExtra("routineId", -1)
        val durationMs = intent.getDoubleExtra("durationMs", -1.0)
        val isStrict = intent.getBooleanExtra("isStrict", false)
        val passedApps = intent.getStringArrayListExtra("blockedApps") ?: arrayListOf()
        val daysOfWeek = intent.getStringExtra("daysOfWeek") ?: ""
        val startTime = intent.getStringExtra("startTime") ?: ""
        val endTime = intent.getStringExtra("endTime") ?: ""

        val blockedApps = ArrayList(passedApps)
        if (blockedApps.isEmpty()) {
            val prefs = context.getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
            val savedApps = prefs.getString("customBlockedApps", "") ?: ""
            if (savedApps.isNotEmpty()) {
                blockedApps.addAll(savedApps.split(","))
            }
        }

        if (isStrict) {
            val systemApps = listOf(
                "com.android.settings",
                "com.android.vending",
                "com.google.android.packageinstaller"
            )
            systemApps.forEach {
                if (!blockedApps.contains(it)) {
                    blockedApps.add(it)
                }
            }
        }

        try {
            val serviceIntent = Intent(context, FocusService::class.java).apply {
                if (blockedApps.isNotEmpty()) {
                    putStringArrayListExtra("customBlockedApps", blockedApps)
                }
                putExtra("durationMs", durationMs)
                putExtra("isStrict", isStrict)
            }
            try {
                ContextCompat.startForegroundService(context, serviceIntent)
            } catch (e: Exception) {
                val isFgsBlocked = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                    e.javaClass.name == "android.app.ForegroundServiceStartNotAllowedException"

                if (isFgsBlocked) {
                    Log.e("RoutineReceiver", "FGS start not allowed by OS (background start restriction)", e)
                } else {
                    Log.e("RoutineReceiver", "Unexpected error starting FocusService: ${e.javaClass.simpleName}", e)
                }

                val notificationText = if (isFgsBlocked)
                    "Lockout needs Alarms & Reminders permission to start background routines. Tap to fix."
                else
                    "Your routine couldn't start due to an unexpected error. Tap to open Lockout."

                val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)

                val notificationBuilder = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    android.app.Notification.Builder(context, "FocusBlockerChannel_V2")
                        .setContentTitle("Routine Failed to Start")
                        .setContentText(notificationText)
                        .setSmallIcon(android.R.drawable.ic_dialog_alert)
                        .setAutoCancel(true)
                } else {
                    android.app.Notification.Builder(context)
                        .setContentTitle("Routine Failed to Start")
                        .setContentText(notificationText)
                        .setSmallIcon(android.R.drawable.ic_dialog_alert)
                        .setAutoCancel(true)
                }

                if (launchIntent != null) {
                    val pendingIntent = android.app.PendingIntent.getActivity(
                        context,
                        0,
                        launchIntent,
                        android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                    )
                    notificationBuilder.setContentIntent(pendingIntent)
                }

                manager.notify(3, notificationBuilder.build())
            }

            if (routineId != -1 && daysOfWeek.isNotEmpty() && startTime.isNotEmpty()) {
                rescheduleNext(context, routineId, daysOfWeek, startTime, endTime, isStrict, passedApps)
            }
        } catch (e: Exception) {
            Log.e("RoutineReceiver", "Error in RoutineReceiver", e)
        }
    }

    private fun rescheduleNext(
        context: Context,
        routineId: Int,
        daysOfWeek: String,
        startTime: String,
        endTime: String,
        isStrict: Boolean,
        blockedApps: ArrayList<String>
    ) {
        if (daysOfWeek.isEmpty() || startTime.isEmpty()) return

        val activeDays = daysOfWeek.split(",").mapNotNull { it.trim().toIntOrNull() }.toSet()
        if (activeDays.isEmpty()) return

        val parts = startTime.split(":")
        if (parts.size != 2) return
        val startH = parts[0].toIntOrNull() ?: return
        val startM = parts[1].toIntOrNull() ?: return

        val endParts = endTime.split(":")
        val endH = if (endParts.size == 2) endParts[0].toIntOrNull() ?: startH else startH
        val endM = if (endParts.size == 2) endParts[1].toIntOrNull() ?: startM else startM

        val startTotal = startH * 60 + startM
        val endTotal = endH * 60 + endM
        val durationMinutes = if (endTotal > startTotal) endTotal - startTotal else (24 * 60 - startTotal) + endTotal
        val durationMs = durationMinutes * 60 * 1000.0

        val now = Calendar.getInstance()
        var nextTrigger: Long? = null

        for (offset in 1..7) {
            val candidate = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, offset)
                set(Calendar.HOUR_OF_DAY, startH)
                set(Calendar.MINUTE, startM)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            val calDay = candidate.get(Calendar.DAY_OF_WEEK)
            val isoDay = if (calDay == Calendar.SUNDAY) 7 else calDay - 1

            if (activeDays.contains(isoDay)) {
                if (candidate.timeInMillis > now.timeInMillis) {
                    nextTrigger = candidate.timeInMillis
                    break
                }
            }
        }

        if (nextTrigger != null) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val nextIntent = Intent(context, RoutineReceiver::class.java).apply {
                putExtra("routineId", routineId)
                putExtra("durationMs", durationMs)
                putExtra("isStrict", isStrict)
                putStringArrayListExtra("blockedApps", blockedApps)
                putExtra("daysOfWeek", daysOfWeek)
                putExtra("startTime", startTime)
                putExtra("endTime", endTime)
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                routineId,
                nextIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        nextTrigger,
                        pendingIntent
                    )
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        nextTrigger,
                        pendingIntent
                    )
                } else {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        nextTrigger,
                        pendingIntent
                    )
                }
            } catch (e: Exception) {
                try {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        nextTrigger,
                        pendingIntent
                    )
                } catch (inner: Exception) {
                    Log.e("RoutineReceiver", "Complete failure rescheduling routine", inner)
                }
            }
        }
    }
}
