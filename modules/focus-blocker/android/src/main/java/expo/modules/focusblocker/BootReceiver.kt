package expo.modules.focusblocker

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.os.Build
import android.util.Log
import java.io.File
import java.util.Calendar

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action != Intent.ACTION_BOOT_COMPLETED && action != "android.intent.action.LOCKED_BOOT_COMPLETED") {
            return
        }

        val expoDb = File(File(context.filesDir, "SQLite"), "focus.db")
        val dbFile = if (expoDb.exists()) expoDb else context.getDatabasePath("focus.db")
        if (!dbFile.exists()) {
            Log.e("BootReceiver", "Database file not found: " + expoDb.absolutePath)
            return
        }

        var db: SQLiteDatabase? = null
        try {
            db = SQLiteDatabase.openDatabase(dbFile.path, null, SQLiteDatabase.OPEN_READONLY)

            val appsList = arrayListOf<String>()
            try {
                val appsCursor = db.rawQuery("SELECT package_name FROM selected_apps", null)
                while (appsCursor.moveToNext()) {
                    appsList.add(appsCursor.getString(0))
                }
                appsCursor.close()
            } catch (e: Exception) {
            }

            val cursor = db.rawQuery(
                "SELECT id, start_time, end_time, days_of_week, is_strict FROM routines WHERE is_enabled = 1",
                null
            )

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            while (cursor.moveToNext()) {
                val routineId = cursor.getInt(0)
                val startTime = cursor.getString(1)
                val endTime = cursor.getString(2)
                val daysOfWeek = cursor.getString(3)
                val isStrict = cursor.getInt(4) == 1

                val triggerMs = calculateNextTrigger(startTime, daysOfWeek)
                if (triggerMs != null) {
                    val durationMs = calculateDurationMs(startTime, endTime)

                    val alarmIntent = Intent(context, RoutineReceiver::class.java).apply {
                        putExtra("routineId", routineId)
                        putExtra("durationMs", durationMs)
                        putExtra("isStrict", isStrict)
                        putStringArrayListExtra("blockedApps", appsList)
                        putExtra("daysOfWeek", daysOfWeek)
                        putExtra("startTime", startTime)
                        putExtra("endTime", endTime)
                    }

                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        routineId,
                        alarmIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerMs,
                            pendingIntent
                        )
                    } else {
                        alarmManager.setExact(
                            AlarmManager.RTC_WAKEUP,
                            triggerMs,
                            pendingIntent
                        )
                    }
                }
            }
            cursor.close()
        } catch (e: Exception) {
            Log.e("BootReceiver", "Error restoring routine alarms", e)
        } finally {
            db?.close()
        }
    }

    private fun calculateDurationMs(startTime: String, endTime: String): Double {
        val sParts = startTime.split(":")
        val eParts = endTime.split(":")
        val sH = sParts.getOrNull(0)?.toIntOrNull() ?: 0
        val sM = sParts.getOrNull(1)?.toIntOrNull() ?: 0
        val eH = eParts.getOrNull(0)?.toIntOrNull() ?: 0
        val eM = eParts.getOrNull(1)?.toIntOrNull() ?: 0

        val startTotal = sH * 60 + sM
        val endTotal = eH * 60 + eM
        val diff = if (endTotal > startTotal) endTotal - startTotal else (24 * 60 - startTotal) + endTotal
        return diff * 60 * 1000.0
    }

    private fun calculateNextTrigger(startTime: String, daysOfWeek: String): Long? {
        val activeDays = daysOfWeek.split(",").mapNotNull { it.trim().toIntOrNull() }.toSet()
        if (activeDays.isEmpty()) return null

        val parts = startTime.split(":")
        if (parts.size != 2) return null
        val startH = parts[0].toIntOrNull() ?: return null
        val startM = parts[1].toIntOrNull() ?: return null

        val now = Calendar.getInstance()

        for (offset in 0..7) {
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
                    return candidate.timeInMillis
                }
            }
        }
        return null
    }
}
