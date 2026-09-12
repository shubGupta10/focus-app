package expo.modules.focusblocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.graphics.Canvas
import android.util.Base64
import java.io.ByteArrayOutputStream
import android.app.AlarmManager
import android.app.PendingIntent
import android.app.TimePickerDialog
import android.os.Build


class FocusBlockerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("FocusBlocker")

        Function("hasUsagePermission") {
            val context = appContext.reactContext ?: return@Function false
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                context.packageName
            )
            return@Function mode == AppOpsManager.MODE_ALLOWED
        }

        Function("requestUsagePermission") {
            val context = appContext.reactContext
            if (context != null) {
                val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                    data = android.net.Uri.parse("package:" + context.packageName)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                try {
                    context.startActivity(intent)
                } catch (e: Exception) {
                    val fallbackIntent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(fallbackIntent)
                }
            }
        }

        Function("hasOverlayPermission") {
            val context = appContext.reactContext ?: return@Function false
            return@Function Settings.canDrawOverlays(context)
        }

        Function("requestOverlayPermission") {
            val context = appContext.reactContext
            if (context != null && !Settings.canDrawOverlays(context)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    android.net.Uri.parse("package:" + context.packageName)
                )
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
            }
        }

        Function("hasBatteryPermission") {
            val context = appContext.reactContext ?: return@Function false
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
            return@Function powerManager.isIgnoringBatteryOptimizations(context.packageName)
        }

        Function("requestBatteryPermission") {
            val context = appContext.reactContext
            if (context != null) {
                val powerManager = context.getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
                if (!powerManager.isIgnoringBatteryOptimizations(context.packageName)) {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                    intent.data = android.net.Uri.parse("package:" + context.packageName)
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                }
            }
        }

        Function("goHome") {
            val context = appContext.reactContext
            if (context != null) {
                val intent = Intent(Intent.ACTION_MAIN)
                intent.addCategory(Intent.CATEGORY_HOME)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }
        }

        AsyncFunction("startService") { customBlockedApps: List<String>, durationMs: Double, isStrict: Boolean?, promise: expo.modules.kotlin.Promise ->
            try {
                val context = appContext.reactContext
                if (context != null) {
                    val intent = Intent(context, FocusService::class.java)

                    intent.putStringArrayListExtra("customBlockedApps", ArrayList(customBlockedApps))

                    intent.putExtra("durationMs", durationMs)
                    intent.putExtra("isStrict", isStrict ?: false)

                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        context.startForegroundService(intent)
                    } else {
                        context.startService(intent)
                    }
                    promise.resolve("Service Started Successfully")
                } else {
                    promise.reject("ERR_NO_CONTEXT", "Context is null", null)
                }
            } catch (e: Exception) {
                promise.reject("ERR_START_FAILED", e.message ?: "Unknown error", e)
            }
        }

        AsyncFunction("stopService") { promise: expo.modules.kotlin.Promise ->
            try {
                val context = appContext.reactContext
                if (context != null) {
                    val intent = Intent(context, FocusService::class.java)
                    context.stopService(intent)
                    promise.resolve("Service Stopped Successfully")
                } else {
                    promise.reject("ERR_NO_CONTEXT", "Context is null", null)
                }
            } catch (e: Exception) {
                promise.reject("ERR_STOP_FAILED", e.message ?: "Unknown error", e)
            }
        }

        Function("getActiveSession") {
            if (FocusService.isServiceActive) {
                return@Function mapOf(
                    "isActive" to true,
                    "startTime" to FocusService.activeStartTime.toDouble(),
                    "endTime" to FocusService.activeEndTime.toDouble(),
                    "isStrict" to FocusService.isStrictActive
                )
            }
            return@Function null
        }

        AsyncFunction("getInstalledApps") { promise: expo.modules.kotlin.Promise ->
            val context = appContext.reactContext
            if (context != null) {
                val pm = context.packageManager
                val packages = pm.getInstalledApplications(android.content.pm.PackageManager.GET_META_DATA)
                val appsList = mutableListOf<Map<String, String>>()

                for (app in packages) {
                    if (pm.getLaunchIntentForPackage(app.packageName) != null) {
                        val appName = app.loadLabel(pm).toString()
                        var base64Icon = ""

                        try {
                            val drawable = pm.getApplicationIcon(app.packageName)
                            val bitmap = if (drawable is BitmapDrawable) {
                                drawable.bitmap
                            } else {
                                val bmp = Bitmap.createBitmap(
                                    drawable.intrinsicWidth.coerceAtLeast(1),
                                    drawable.intrinsicHeight.coerceAtLeast(1),
                                    Bitmap.Config.ARGB_8888
                                )
                                val canvas = Canvas(bmp)
                                drawable.setBounds(0, 0, canvas.width, canvas.height)
                                drawable.draw(canvas)
                                bmp
                            }
                            val scaledBitmap = Bitmap.createScaledBitmap(bitmap, 96, 96, true)
                            val outputStream = ByteArrayOutputStream()
                            scaledBitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                            val byteArray = outputStream.toByteArray()
                            base64Icon = Base64.encodeToString(byteArray, Base64.NO_WRAP)
                        } catch (e: Exception) {
                        }

                        appsList.add(
                            mapOf(
                                "name" to appName,
                                "packageName" to app.packageName,
                                "icon" to base64Icon
                            )
                        )
                    }
                }
                promise.resolve(appsList)
            }
        }

        Function("scheduleRoutineAlarm") { routineId: Int, triggerAtMillis: Double, durationMs: Double, isStrict: Boolean, blockedApps: List<String>, daysOfWeek: String, startTime: String, endTime: String ->
            val context = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (context != null) {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                val intent = Intent(context, RoutineReceiver::class.java).apply {
                    putExtra("routineId", routineId)
                    putExtra("durationMs", durationMs)
                    putExtra("isStrict", isStrict)
                    putStringArrayListExtra("blockedApps", ArrayList(blockedApps))
                    putExtra("daysOfWeek", daysOfWeek)
                    putExtra("startTime", startTime)
                    putExtra("endTime", endTime)
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    routineId,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                        alarmManager.setAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis.toLong(),
                            pendingIntent
                        )
                    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis.toLong(),
                            pendingIntent
                        )
                    } else {
                        alarmManager.setExact(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis.toLong(),
                            pendingIntent
                        )
                    }
                } catch (e: Exception) {
                    try {
                        alarmManager.setAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis.toLong(),
                            pendingIntent
                        )
                    } catch (inner: Exception) {
                    }
                }
            }
        }

        Function("cancelRoutineAlarm") { routineId: Int ->
            val context = appContext.reactContext
            if (context != null) {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                val intent = Intent(context, RoutineReceiver::class.java)
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    routineId,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                alarmManager.cancel(pendingIntent)
            }
        }

        AsyncFunction("showTimePicker") { initialHour: Int, initialMinute: Int, is24Hour: Boolean, promise: expo.modules.kotlin.Promise ->
            val activity = appContext.currentActivity
            if (activity == null) {
                promise.reject("ERR_NO_ACTIVITY", "Current activity is null", null)
                return@AsyncFunction
            }
            activity.runOnUiThread {
                val dialog = TimePickerDialog(
                    activity,
                    { _, hourOfDay, minute ->
                        promise.resolve(
                            mapOf(
                                "hour" to hourOfDay,
                                "minute" to minute
                            )
                        )
                    },
                    initialHour,
                    initialMinute,
                    is24Hour
                )
                dialog.setOnCancelListener {
                    promise.resolve(null)
                }
                dialog.show()
            }
        }

    }
}