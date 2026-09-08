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


class FocusBlockerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("FocusBlocker")

        Function("hasUsagePermission") {
            // Get the current Android Context (the app environment)
            val context = appContext.reactContext ?: return@Function false

            // Get the AppOpsManager (Android's system for checking deep permissions)
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

            // Check if our app is allowed to get usage stats
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                context.packageName
            )

            // Returns true if allowed, false if not allowed
            return@Function mode == AppOpsManager.MODE_ALLOWED
        }

        Function("requestUsagePermission") {
            val context = appContext.reactContext
            if (context != null) {
                // Create an Intent (Android's way of opening a new screen)
                val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

                context.startActivity(intent)
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

        AsyncFunction("startService") { customBlockedApps: List<String>, durationMs: Double, promise: expo.modules.kotlin.Promise ->
            try {
                val context = appContext.reactContext
                if (context != null) {
                    val intent = Intent(context, FocusService::class.java)

                    intent.putStringArrayListExtra("customBlockedApps", ArrayList(customBlockedApps))

                    intent.putExtra("durationMs", durationMs);

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
                            // Scale to 96x96 so we don't blow up the React Native bridge!
                            val scaledBitmap = Bitmap.createScaledBitmap(bitmap, 96, 96, true)
                            val outputStream = ByteArrayOutputStream()
                            scaledBitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                            val byteArray = outputStream.toByteArray()
                            base64Icon = Base64.encodeToString(byteArray, Base64.NO_WRAP)
                        } catch (e: Exception) {
                            // Fallback if icon generation fails
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
    }
}