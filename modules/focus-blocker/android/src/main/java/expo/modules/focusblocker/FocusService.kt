package expo.modules.focusblocker

import android.app.KeyguardManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.RemoteViews
import android.widget.Space
import android.widget.TextView
import expo.modules.focusblocker.R

class FocusService : Service() {

    companion object {
        var isServiceActive = false
        var activeStartTime: Long = -1L
        var activeEndTime: Long = -1L
        var isStrictActive: Boolean = false
    }

    private val CHANNEL_ID = "FocusBlockerChannel_V2"
    private var isRunning = false

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var isOverlayShowing = false

    private var endTime: Long = -1L
    private var customBlockedApps: List<String> = emptyList()

    private val appLabelCache = mutableMapOf<String, String>()
    private var lastTitleText = ""
    private var lastSubtitleText = ""

    private var ignoreBlockingUntil: Long = 0L

    @Volatile
    private var currentForegroundPackage: String? = null

    private val activeForegroundApps = java.util.Collections.synchronizedSet(mutableSetOf<String>())

    private var cachedLauncherPackages: Set<String> = emptySet()
    private var lastLauncherCheckTime: Long = 0L

    private fun getLauncherPackages(): Set<String> {
        val packages = mutableSetOf<String>()
        try {
            val intent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
            }
            val resolveInfos = packageManager.queryIntentActivities(intent, 0)
            for (info in resolveInfos) {
                info.activityInfo?.packageName?.let { packages.add(it) }
            }
        } catch (e: Exception) {
            Log.e("FocusBlocker", "Error getting launcher packages", e)
        }
        return packages
    }

    private fun isPackageAllowedOrSystem(pkg: String): Boolean {
        if (pkg == packageName) return true
        if (pkg == "com.android.systemui") return true
        if (pkg == "android") return true
        if (pkg.contains("launcher", ignoreCase = true)) return true

        val now = System.currentTimeMillis()
        if (now - lastLauncherCheckTime > 30000 || cachedLauncherPackages.isEmpty()) {
            cachedLauncherPackages = getLauncherPackages()
            lastLauncherCheckTime = now
        }

        return cachedLauncherPackages.contains(pkg)
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val prefs = getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
        val passedApps = intent?.getStringArrayListExtra("customBlockedApps")
        val isStrictParam = intent?.getBooleanExtra("isStrict", false)
        val durationMsParam = intent?.getDoubleExtra("durationMs", -1.0)

        // Always prioritize passed apps, fallback to SharedPreferences for global blocklist
        if (passedApps != null && passedApps.isNotEmpty()) {
            customBlockedApps = passedApps.toList()
        } else {
            val savedApps = prefs.getString("customBlockedApps", "") ?: ""
            customBlockedApps = if (savedApps.isNotEmpty()) savedApps.split(",") else emptyList()
        }

        val now = System.currentTimeMillis()
        
        // If durationMsParam is provided and valid, this is a NEW session/routine starting
        if (durationMsParam != null && durationMsParam > 0) {
            endTime = now + durationMsParam.toLong()
            isStrictActive = isStrictParam ?: false
            activeStartTime = now
            activeEndTime = endTime

            prefs.edit()
                .putString("customBlockedApps", customBlockedApps.joinToString(","))
                .putLong("activeStartTime", activeStartTime)
                .putLong("activeEndTime", activeEndTime)
                .putBoolean("isStrictActive", isStrictActive)
                .apply()
        } else {
            // No duration provided, likely the service being recreated by the system
            activeStartTime = prefs.getLong("activeStartTime", now)
            activeEndTime = prefs.getLong("activeEndTime", -1L)
            isStrictActive = prefs.getBoolean("isStrictActive", false)
            endTime = activeEndTime
        }

        isServiceActive = true

        if (!isRunning) {
            isRunning = true

            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            val pendingIntent = android.app.PendingIntent.getActivity(
                this,
                0,
                launchIntent,


                android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
            )

            val remoteViews = RemoteViews(packageName, R.layout.custom_notification)

            val notification: Notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val builder = Notification.Builder(this, CHANNEL_ID)
                    .setContentTitle("Lockout")
                    .setSmallIcon(android.R.drawable.ic_secure)
                    .setColor(Color.parseColor("#D4C7C3"))
                    .setCustomContentView(remoteViews)
                    .setStyle(Notification.DecoratedCustomViewStyle())
                    .setContentIntent(pendingIntent)
                    .setOngoing(true)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    builder.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE)
                }

                builder.build()
            } else {
                Notification.Builder(this)
                    .setContentTitle("Lockout")
                    .setSmallIcon(android.R.drawable.ic_secure)
                    .setColor(Color.parseColor("#D4C7C3"))
                    .setCustomContentView(remoteViews)
                    .setStyle(Notification.DecoratedCustomViewStyle())
                    .setContentIntent(pendingIntent)
                    .setOngoing(true)
                    .build()
            }

            startForeground(1, notification)
            startMonitoringLoop()
        }
        return START_STICKY
    }

    private fun startMonitoringLoop() {
        Thread {
            val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager

            // Initialize active apps with recent events in last 10 seconds, or default to Lockout
            val initialNow = System.currentTimeMillis()
            try {
                val initialEvents = usageStatsManager.queryEvents(initialNow - 10000, initialNow)
                val event = UsageEvents.Event()
                while (initialEvents.hasNextEvent()) {
                    initialEvents.getNextEvent(event)
                    if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                        activeForegroundApps.add(event.packageName)
                        currentForegroundPackage = event.packageName
                    } else if (event.eventType == UsageEvents.Event.MOVE_TO_BACKGROUND || event.eventType == 23) {
                        activeForegroundApps.remove(event.packageName)
                    }
                }
            } catch (e: Exception) {
                Log.e("FocusBlocker", "Error querying initial usage events", e)
            }

            if (activeForegroundApps.isEmpty()) {
                activeForegroundApps.add(packageName)
                currentForegroundPackage = packageName
            }

            while (isRunning) {
                if (endTime > 0 && System.currentTimeMillis() >= endTime) {
                    Log.d("FocusBlocker", "Time expired! Auto-stopping service")
                    sendSessionEndNotification()

                    val prefs = getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
                    prefs.edit()
                        .putLong("completed_duration", (activeEndTime - activeStartTime) / 1000)
                        .putLong("completed_endTime", activeEndTime)
                        .putBoolean("completed_isStrict", isStrictActive)
                        .apply()

                    stopSelf()
                    break
                }

                // If device is not interactive (screen off) or keyguard is locked, don't show overlay
                if (powerManager?.isInteractive == false || keyguardManager?.isKeyguardLocked == true) {
                    hideBlockOverlay()
                    Thread.sleep(300)
                    continue
                }

                val nowTime = System.currentTimeMillis()

                try {
                    // Query moving 2-second window to never miss events across ticks
                    val usageEvents = usageStatsManager.queryEvents(nowTime - 2000, nowTime)
                    val event = UsageEvents.Event()

                    while (usageEvents.hasNextEvent()) {
                        usageEvents.getNextEvent(event)
                        if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                            activeForegroundApps.add(event.packageName)
                            currentForegroundPackage = event.packageName
                        } else if (event.eventType == UsageEvents.Event.MOVE_TO_BACKGROUND || event.eventType == 23) {
                            activeForegroundApps.remove(event.packageName)
                        }
                    }
                } catch (e: Exception) {
                    Log.e("FocusBlocker", "Error querying usage events in loop", e)
                }

                var isDistracting = false
                var distractingApp = ""

                val isGracePeriod = System.currentTimeMillis() < ignoreBlockingUntil

                if (!isGracePeriod) {
                    // Supports split-screen, full-screen, and recents transitions
                    synchronized(activeForegroundApps) {
                        for (app in activeForegroundApps) {
                            if (!isPackageAllowedOrSystem(app) && customBlockedApps.contains(app)) {
                                isDistracting = true
                                distractingApp = app
                                break
                            }
                        }
                    }
                }

                if (isDistracting) {
                    showBlockOverlay(distractingApp)
                } else {
                    hideBlockOverlay()
                }

                Thread.sleep(200)
            }
        }.start()
    }

    private fun showBlockOverlay(blockedPackage: String) {
        val appLabel = appLabelCache.getOrPut(blockedPackage) {
            try {
                val appInfo = packageManager.getApplicationInfo(blockedPackage, 0)
                packageManager.getApplicationLabel(appInfo).toString()
            } catch (e: Exception) {
                "This app"
            }
        }

        val timeMessage = if (endTime > 0) {
            val diffMs = endTime - System.currentTimeMillis()
            val minutesLeft = (diffMs / 1000 / 60).coerceAtLeast(1)
            if (minutesLeft > 1) "$minutesLeft minutes remaining" else "Less than a minute remaining"
        } else {
            "Session in progress"
        }

        val newTitle = "$appLabel is guarded"
        val newSubtitle = "$timeMessage · Stay in the zone"

        if (isOverlayShowing && lastTitleText == newTitle && lastSubtitleText == newSubtitle) {
            return
        }

        Handler(Looper.getMainLooper()).post {
            if (isOverlayShowing) {
                if (lastTitleText != newTitle) {
                    titleView?.text = newTitle
                    lastTitleText = newTitle
                }
                if (lastSubtitleText != newSubtitle) {
                    subtitleView?.text = newSubtitle
                    lastSubtitleText = newSubtitle
                }
                return@post
            }

            lastTitleText = newTitle
            lastSubtitleText = newSubtitle

            windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

            val windowLayoutParams = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                else
                    WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT
            )

            val container = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#161517"))
                gravity = Gravity.CENTER
            }

            val topSpacer = Space(this).apply {
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f)
            }
            container.addView(topSpacer)

            val icon = TextView(this).apply {
                text = "🔒"
                textSize = 72f
                gravity = Gravity.CENTER
                setPadding(0, 0, 0, 32)
            }
            container.addView(icon)

            val title = TextView(this).apply {
                text = "$appLabel is guarded"
                setTextColor(Color.parseColor("#F0EDEC"))
                textSize = 26f
                setTypeface(null, Typeface.BOLD)
                gravity = Gravity.CENTER
            }
            titleView = title
            container.addView(title)

            val subtitle = TextView(this).apply {
                text = "$timeMessage · Stay in the zone"
                setTextColor(Color.parseColor("#A09896"))
                textSize = 15f
                setTypeface(null, Typeface.NORMAL)
                gravity = Gravity.CENTER
                setPadding(80, 20, 80, 0)
            }
            subtitleView = subtitle
            container.addView(subtitle)

            val bottomSpacer = Space(this).apply {
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f)
            }
            container.addView(bottomSpacer)

            val homeButton = Button(this).apply {
                text = "RETURN TO HOME"
                setTextColor(Color.parseColor("#FFFFFF"))
                textSize = 15f
                setTypeface(null, Typeface.BOLD)
                isAllCaps = true
                stateListAnimator = null

                val shape = android.graphics.drawable.GradientDrawable().apply {
                    shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                    cornerRadius = 48f
                    setColor(Color.parseColor("#C07480"))
                }
                background = shape

                val btnParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 150).apply {
                    setMargins(80, 0, 80, 16)
                }
                layoutParams = btnParams

                setOnClickListener {
                    ignoreBlockingUntil = System.currentTimeMillis() + 2500L
                    currentForegroundPackage = null
                    activeForegroundApps.removeAll(customBlockedApps.toSet())
                    hideBlockOverlay()

                    val intent = Intent(Intent.ACTION_MAIN).apply {
                        addCategory(Intent.CATEGORY_HOME)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }

                    val pendingIntent = android.app.PendingIntent.getActivity(
                        this@FocusService,
                        100,
                        intent,
                        android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                    )

                    try {
                        pendingIntent.send()
                    } catch (e: android.app.PendingIntent.CanceledException) {
                        startActivity(intent)
                    }
                }
            }
            container.addView(homeButton)

            val openAppButton = Button(this).apply {
                text = "OPEN LOCKOUT"
                setTextColor(Color.parseColor("#A09896"))
                textSize = 13f
                setTypeface(null, Typeface.BOLD)
                isAllCaps = true
                stateListAnimator = null

                val shape = android.graphics.drawable.GradientDrawable().apply {
                    shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                    cornerRadius = 48f
                    setColor(Color.parseColor("#201E20"))
                    setStroke(2, Color.parseColor("#3D3840"))
                }
                background = shape

                val btnParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 130).apply {
                    setMargins(80, 0, 80, 80)
                }
                layoutParams = btnParams

                setOnClickListener {
                    ignoreBlockingUntil = System.currentTimeMillis() + 2500L
                    currentForegroundPackage = packageName
                    activeForegroundApps.removeAll(customBlockedApps.toSet())
                    activeForegroundApps.add(packageName)
                    hideBlockOverlay()

                    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
                    }
                    if (launchIntent != null) {
                        val pendingIntent = android.app.PendingIntent.getActivity(
                            this@FocusService,
                            101,
                            launchIntent,
                            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                        )

                        try {
                            pendingIntent.send()
                        } catch (e: android.app.PendingIntent.CanceledException) {
                            startActivity(launchIntent)
                        }
                    }
                }
            }
            container.addView(openAppButton)

            try {
                windowManager?.addView(container, windowLayoutParams)
                overlayView = container
                isOverlayShowing = true
                logBlockedAttempt(blockedPackage)
            } catch (e: Exception) {
                Log.e("FocusBlocker", "Failed to add overlay", e)
            }
        }
    }

    private var titleView: TextView? = null
    private var subtitleView: TextView? = null

    private fun logBlockedAttempt(packageName: String) {
        Thread {
            try {
                val dbFile = java.io.File(java.io.File(filesDir, "SQLite"), "focus.db")
                if (dbFile.exists()) {
                    val db = android.database.sqlite.SQLiteDatabase.openDatabase(
                        dbFile.path,
                        null,
                        android.database.sqlite.SQLiteDatabase.OPEN_READWRITE
                    )
                    val timestamp = System.currentTimeMillis()
                    val values = android.content.ContentValues().apply {
                        put("package_name", packageName)
                        put("timestamp", timestamp)
                    }
                    db.insert("blocked_attempts", null, values)
                    db.close()
                }
            } catch (e: Exception) {
                Log.e("FocusBlocker", "Failed to log blocked attempt", e)
            }
        }.start()
    }

    private fun hideBlockOverlay() {
        if (!isOverlayShowing) return
        Handler(Looper.getMainLooper()).post {
            if (!isOverlayShowing) return@post
            try {
                windowManager?.removeView(overlayView)
                overlayView = null
                titleView = null
                subtitleView = null
                lastTitleText = ""
                lastSubtitleText = ""
                isOverlayShowing = false
            } catch (e: Exception) {
                Log.e("FocusBlocker", "Failed to remove overlay", e)
            }
        }
    }

    override fun onDestroy() {
        isRunning = false
        isServiceActive = false
        activeStartTime = -1L
        activeEndTime = -1L
        isStrictActive = false
        activeForegroundApps.clear()
        currentForegroundPackage = null
        hideBlockOverlay()

        // Wipe active state, but DO NOT wipe the completed bookmark or global blocklist!
        val prefs = getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
        prefs.edit()
            .remove("activeStartTime")
            .remove("activeEndTime")
            .remove("isStrictActive")
            .apply()

        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Lockout Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(serviceChannel)
        }
    }

    private fun sendSessionEndNotification() {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = android.app.PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )

        val manager = getSystemService(NotificationManager::class.java)
        val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("Focus Session Complete")
                .setContentText("Great job! Your focus session has ended.")
                .setSmallIcon(android.R.drawable.ic_secure)
                .setColor(Color.parseColor("#D4C7C3"))
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()
        } else {
            Notification.Builder(this)
                .setContentTitle("Focus Session Complete")
                .setContentText("Great job! Your focus session has ended.")
                .setSmallIcon(android.R.drawable.ic_secure)
                .setColor(Color.parseColor("#D4C7C3"))
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()
        }
        manager?.notify(2, notification)
    }
}
