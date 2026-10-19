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
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.RemoteViews
import android.widget.ScrollView
import android.widget.Space
import android.widget.TextView
import expo.modules.focusblocker.R

class FocusService : Service() {

    companion object {
        var isServiceActive = false
        var activeStartTime: Long = -1L
        var activeEndTime: Long = -1L
        var isStrictActive: Boolean = false
        var breakEndTime: Long = 0L
        var breaksRemaining: Int = 1
        var ignoreBlockingUntil: Long = 0L
        var totalBreakMs: Long = 0L
        private val dbExecutor = java.util.concurrent.Executors.newSingleThreadExecutor()
        var instance: FocusService? = null
    }

    private val CHANNEL_ID = "FocusBlockerChannel_V2"
    private var isRunning = false

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var isOverlayShowing = false

    private var endTime: Long = -1L

    @Volatile
    private var customBlockedApps: List<String> = emptyList()

    private val appLabelCache = mutableMapOf<String, String>()
    private var lastTitleText = ""
    private var lastSubtitleText = ""

    @Volatile
    private var currentForegroundPackage: String? = null

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
        instance = this
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val prefs = getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
        val passedApps = intent?.getStringArrayListExtra("customBlockedApps")
        val isStrictParam = intent?.getBooleanExtra("isStrict", false)
        val durationMsParam = intent?.getDoubleExtra("durationMs", -1.0)

        val now = System.currentTimeMillis()
        val isSystemRestart = intent == null

        if (isSystemRestart) {
            // If active session prefs were cleared (session completed), don't restart
            if (!prefs.contains("activeStartTime")) {
                val stopNotification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    Notification.Builder(this, CHANNEL_ID)
                        .setSmallIcon(android.R.drawable.ic_secure)
                        .build()
                } else {
                    Notification.Builder(this)
                        .setSmallIcon(android.R.drawable.ic_secure)
                        .build()
                }
                startForeground(1, stopNotification)
                stopSelf()
                return START_NOT_STICKY
            }
            activeStartTime = prefs.getLong("activeStartTime", now)
            activeEndTime = prefs.getLong("activeEndTime", -1L)
            isStrictActive = prefs.getBoolean("isStrictActive", false)
            breakEndTime = prefs.getLong("breakEndTime", 0L)
            breaksRemaining = prefs.getInt("breaksRemaining", 1)
            totalBreakMs = prefs.getLong("totalBreakMs", 0L)
            if (breakEndTime > now) {
                ignoreBlockingUntil = breakEndTime
            }
            endTime = activeEndTime

            val savedApps = prefs.getString("customBlockedApps", "") ?: ""
            customBlockedApps = if (savedApps.isNotEmpty()) savedApps.split(",") else emptyList()
        } else if (isServiceActive) {

            val incomingEndTime = if (durationMsParam != null && durationMsParam > 0) {
                now + durationMsParam.toLong()
            } else {
                -1L
            }

            if (endTime != -1L) {
                if (incomingEndTime == -1L || incomingEndTime > endTime) {
                    endTime = incomingEndTime
                    activeEndTime = incomingEndTime
                }
            }

            if (passedApps != null && passedApps.isNotEmpty()) {
                customBlockedApps = (customBlockedApps + passedApps).distinct()
            }

            if (isStrictParam == true) {
                isStrictActive = true
            }

            prefs.edit()
                .putString("customBlockedApps", customBlockedApps.joinToString(","))
                .putLong("activeEndTime", activeEndTime)
                .putBoolean("isStrictActive", isStrictActive)
                .apply()
        } else {
            if (passedApps != null && passedApps.isNotEmpty()) {
                customBlockedApps = passedApps.toList()
            } else {
                val savedApps = prefs.getString("customBlockedApps", "") ?: ""
                customBlockedApps = if (savedApps.isNotEmpty()) savedApps.split(",") else emptyList()
            }

            if (durationMsParam != null && durationMsParam > 0) {
                endTime = now + durationMsParam.toLong()
            } else {
                endTime = -1L
            }
            activeStartTime = now
            activeEndTime = endTime
            isStrictActive = isStrictParam ?: false
            breakEndTime = 0L
            breaksRemaining = 1
            totalBreakMs = 0L
            ignoreBlockingUntil = 0L

            prefs.edit()
                .putString("customBlockedApps", customBlockedApps.joinToString(","))
                .putLong("activeStartTime", activeStartTime)
                .putLong("activeEndTime", activeEndTime)
                .putBoolean("isStrictActive", isStrictActive)
                .putLong("breakEndTime", 0L)
                .putInt("breaksRemaining", 1)
                .putLong("totalBreakMs", 0L)
                .apply()
        }

        Log.d(
            "FocusBlocker",
            "[Native] onStartCommand active session apps: ${customBlockedApps.size}, endTime: $endTime, isStrict: $isStrictActive"
        )

        isServiceActive = true

        if (!isRunning) {
            isRunning = true

            val isInitialBreak = breakEndTime > now
            val initialBreakMinutes = if (isInitialBreak) ((breakEndTime - now) / 60000).toInt() else 0
            val notification = buildForegroundNotification(isInitialBreak, initialBreakMinutes)

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

            // Initialize with the most recent app in the last 24 hours, or default to Lockout
            val initialNow = System.currentTimeMillis()
            try {
                var topPackage: String? = null
                val initialEvents = usageStatsManager.queryEvents(initialNow - 24 * 60 * 60 * 1000L, initialNow)
                val event = UsageEvents.Event()
                while (initialEvents.hasNextEvent()) {
                    initialEvents.getNextEvent(event)
                    if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                        topPackage = event.packageName
                    }
                }

                if (topPackage != null) {
                    currentForegroundPackage = topPackage
                } else {
                    currentForegroundPackage = packageName
                }
            } catch (e: Exception) {
                Log.e("FocusBlocker", "Error querying initial usage events", e)
                currentForegroundPackage = packageName
            }

            var wasBreakActive = breakEndTime > System.currentTimeMillis()

            while (isRunning) {
                val currentLoopTime = System.currentTimeMillis()

                val isBreakCurrentlyActive = breakEndTime > 0L && currentLoopTime < breakEndTime
                if (wasBreakActive && !isBreakCurrentlyActive) {
                    wasBreakActive = false
                    breakEndTime = 0L
                    ignoreBlockingUntil = 0L
                    val prefs = getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
                    prefs.edit().remove("breakEndTime").apply()
                    updateForegroundNotification(isBreak = false)
                    sendBreakEndedNotification()
                } else if (!wasBreakActive && isBreakCurrentlyActive) {
                    wasBreakActive = true
                }

                if (endTime == -1L && currentLoopTime - activeStartTime >= 24 * 60 * 60 * 1000L) {
                    Log.d("FocusBlocker", "Time expired! Auto-stopping service")
                    sendSessionEndNotification()

                    val netSeconds = ((currentLoopTime - activeStartTime - totalBreakMs) / 1000L).coerceAtLeast(0L)
                    val prefs = getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
                    prefs.edit()
                        .putLong("completed_duration", netSeconds)
                        .putLong("completed_endTime", currentLoopTime)
                        .putBoolean("completed_isStrict", isStrictActive)
                        .remove("activeStartTime")
                        .remove("activeEndTime")
                        .remove("isStrictActive")
                        .remove("breakEndTime")
                        .remove("breaksRemaining")
                        .remove("totalBreakMs")
                        .apply()

                    stopSelf()
                    break
                } else if (endTime > 0 && currentLoopTime >= endTime) {
                    Log.d("FocusBlocker", "Timer expired! Auto-stopping service")
                    sendSessionEndNotification()

                    val durationSeconds = ((endTime - activeStartTime - totalBreakMs) / 1000L).coerceAtLeast(0L)

                    val prefs = getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
                    prefs.edit()
                        .putLong("completed_duration", durationSeconds)
                        .putLong("completed_endTime", endTime)
                        .putBoolean("completed_isStrict", isStrictActive)
                        .remove("activeStartTime")
                        .remove("activeEndTime")
                        .remove("isStrictActive")
                        .remove("breakEndTime")
                        .remove("breaksRemaining")
                        .remove("totalBreakMs")
                        .apply()

                    stopSelf()
                    break
                }

                if (powerManager?.isInteractive == false || keyguardManager?.isKeyguardLocked == true) {
                    hideBlockOverlay()
                    Thread.sleep(300)
                    continue
                }

                val nowTime = System.currentTimeMillis()

                try {
                    var topPackage: String? = null
                    val usageEvents = usageStatsManager.queryEvents(nowTime - 2000, nowTime)
                    val event = UsageEvents.Event()

                    while (usageEvents.hasNextEvent()) {
                        usageEvents.getNextEvent(event)
                        if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                            topPackage = event.packageName
                        }
                    }
                    if (topPackage != null) {
                        if (currentForegroundPackage != topPackage) {
                            Log.d("FocusBlocker", "[Native] App moved to foreground: $topPackage")
                        }
                        currentForegroundPackage = topPackage
                    }
                } catch (e: Exception) {
                    Log.e("FocusBlocker", "Error querying usage events in loop", e)
                }

                var isDistracting = false
                var distractingApp = ""

                val isGracePeriod = System.currentTimeMillis() < ignoreBlockingUntil

                if (!isGracePeriod && currentForegroundPackage != null) {
                    val isAllowed = isPackageAllowedOrSystem(currentForegroundPackage!!)
                    val isMarkedToBlock = customBlockedApps.contains(currentForegroundPackage)

                    if (!isAllowed && isMarkedToBlock) {
                        if (!isDistracting) {
                            Log.d("FocusBlocker", "[Native] BLOCKING $currentForegroundPackage!")
                        }
                        isDistracting = true
                        distractingApp = currentForegroundPackage!!
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
            ).apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
                windowAnimations = android.R.style.Animation_Toast
            }

            val density = resources.displayMetrics.density
            fun dp(v: Int): Int = (v * density).toInt()
            fun dpF(v: Float): Float = v * density

            val container = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#161517"))
                gravity = Gravity.CENTER
                layoutParams = FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT
                )
            }

            val topSpacer = Space(this).apply {
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f)
            }
            container.addView(topSpacer)

            val icon = TextView(this).apply {
                text = "🔒"
                textSize = 72f
                gravity = Gravity.CENTER
                setPadding(0, 0, 0, dp(16))
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
                setPadding(dp(32), dp(8), dp(32), 0)
            }
            subtitleView = subtitle
            container.addView(subtitle)

            if (!isStrictActive) {
                val breakSection = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    gravity = Gravity.CENTER
                    val params = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply {
                        setMargins(dp(24), dp(18), dp(24), dp(4))
                    }
                    layoutParams = params
                }

                if (breaksRemaining > 0) {
                    val remainingMs = if (endTime > 0) endTime - System.currentTimeMillis() else -1L
                    val remainingMinutes = if (remainingMs > 0) (remainingMs + 30000) / 60000 else 999L

                    if (endTime == -1L || remainingMinutes >= 5) {
                        var isOptionsExpanded = false

                        val toggleButton = TextView(this).apply {
                            text = "Need a break? ($breaksRemaining left)"
                            setTextColor(Color.parseColor("#D4C7C3"))
                            textSize = 14f
                            setTypeface(null, Typeface.BOLD)
                            gravity = Gravity.CENTER
                            val bg = android.graphics.drawable.GradientDrawable().apply {
                                shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                                cornerRadius = dpF(20f)
                                setColor(Color.parseColor("#1F1E20"))
                                setStroke(dp(1), Color.parseColor("#333033"))
                            }
                            background = bg
                            setPadding(dp(20), dp(10), dp(20), dp(10))
                        }

                        val pillsLayout = LinearLayout(this).apply {
                            orientation = LinearLayout.HORIZONTAL
                            gravity = Gravity.CENTER
                            visibility = View.GONE
                            val pParams = LinearLayout.LayoutParams(
                                LinearLayout.LayoutParams.WRAP_CONTENT,
                                LinearLayout.LayoutParams.WRAP_CONTENT
                            ).apply {
                                topMargin = dp(12)
                            }
                            layoutParams = pParams
                        }

                        val durations = listOf(5, 10, 20, 30)
                        for (mins in durations) {
                            val isPillEnabled = endTime == -1L || remainingMinutes >= mins

                            val pill = TextView(this).apply {
                                text = "${mins}m"
                                textSize = 13f
                                setTypeface(null, Typeface.BOLD)
                                gravity = Gravity.CENTER
                                val pBg = android.graphics.drawable.GradientDrawable().apply {
                                    shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                                    cornerRadius = dpF(16f)
                                    if (isPillEnabled) {
                                        setColor(Color.parseColor("#2E2A30"))
                                        setStroke(dp(1), Color.parseColor("#4A4248"))
                                    } else {
                                        setColor(Color.parseColor("#171618"))
                                        setStroke(dp(1), Color.parseColor("#262428"))
                                    }
                                }
                                background = pBg
                                setTextColor(
                                    if (isPillEnabled) Color.parseColor("#F0EDEC")
                                    else Color.parseColor("#5A5255")
                                )
                                setPadding(dp(14), dp(8), dp(14), dp(8))

                                val pillMargin = LinearLayout.LayoutParams(
                                    LinearLayout.LayoutParams.WRAP_CONTENT,
                                    LinearLayout.LayoutParams.WRAP_CONTENT
                                ).apply {
                                    setMargins(dp(4), 0, dp(4), 0)
                                }
                                layoutParams = pillMargin

                                if (isPillEnabled) {
                                    setOnClickListener {
                                        triggerBreak(mins)
                                    }
                                }
                            }
                            pillsLayout.addView(pill)
                        }

                        toggleButton.setOnClickListener {
                            isOptionsExpanded = !isOptionsExpanded
                            pillsLayout.visibility = if (isOptionsExpanded) View.VISIBLE else View.GONE
                        }

                        breakSection.addView(toggleButton)
                        breakSection.addView(pillsLayout)
                    } else {
                        val endingSoonText = TextView(this).apply {
                            text = "Session ending soon · Breaks unavailable"
                            setTextColor(Color.parseColor("#6E6568"))
                            textSize = 12f
                            gravity = Gravity.CENTER
                        }
                        breakSection.addView(endingSoonText)
                    }
                } else {
                    val noBreaksText = TextView(this).apply {
                        text = "No breaks left for this session"
                        setTextColor(Color.parseColor("#6E6568"))
                        textSize = 12f
                        gravity = Gravity.CENTER
                    }
                    breakSection.addView(noBreaksText)
                }

                container.addView(breakSection)
            }

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
                    cornerRadius = dpF(24f)
                    setColor(Color.parseColor("#C07480"))
                }
                background = shape

                val btnParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(52)).apply {
                    setMargins(dp(32), 0, dp(32), dp(12))
                }
                layoutParams = btnParams

                setOnClickListener {
                    ignoreBlockingUntil = System.currentTimeMillis() + 2500L
                    currentForegroundPackage = null
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
                    cornerRadius = dpF(24f)
                    setColor(Color.parseColor("#201E20"))
                    setStroke((1.5f * density).toInt().coerceAtLeast(1), Color.parseColor("#3D3840"))
                }
                background = shape

                val btnParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(48)).apply {
                    setMargins(dp(32), 0, dp(32), dp(32))
                }
                layoutParams = btnParams

                setOnClickListener {
                    ignoreBlockingUntil = System.currentTimeMillis() + 2500L
                    currentForegroundPackage = packageName
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

            val scrollView = ScrollView(this).apply {
                isFillViewport = true
                overScrollMode = View.OVER_SCROLL_NEVER
                setBackgroundColor(Color.parseColor("#161517"))
            }
            scrollView.addView(container)

            try {
                windowManager?.addView(scrollView, windowLayoutParams)
                overlayView = scrollView
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
        dbExecutor.execute {
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
        }
    }

    private fun triggerBreak(minutes: Int) {
        if (isStrictActive || breaksRemaining <= 0) return
        val breakMs = minutes * 60 * 1000L
        // Guard: don't grant a break that would extend past the session end
        if (endTime != -1L && (endTime - System.currentTimeMillis()) < breakMs) return
        breaksRemaining = (breaksRemaining - 1).coerceAtLeast(0)
        breakEndTime = System.currentTimeMillis() + breakMs
        ignoreBlockingUntil = breakEndTime
        totalBreakMs += breakMs
        if (endTime > 0) {
            endTime += breakMs
            activeEndTime += breakMs
        }

        val prefs = getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
        prefs.edit()
            .putLong("breakEndTime", breakEndTime)
            .putInt("breaksRemaining", breaksRemaining)
            .putLong("totalBreakMs", totalBreakMs)
            .putLong("activeEndTime", activeEndTime)
            .apply()

        updateForegroundNotification(isBreak = true, breakMinutes = minutes)
        sendBreakStartedNotification(minutes)

        hideBlockOverlay()
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
        breakEndTime = 0L
        breaksRemaining = 1
        totalBreakMs = 0L
        ignoreBlockingUntil = 0L
        currentForegroundPackage = null
        hideBlockOverlay()
        instance = null

        val manager = getSystemService(NotificationManager::class.java)
        manager?.cancel(3)

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

    fun buildForegroundNotification(isBreak: Boolean, breakMinutes: Int = 0): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = android.app.PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )

        val remoteViews = RemoteViews(packageName, R.layout.custom_notification)
        val title = if (isBreak) "Session Paused" else "Session Active"
        val desc = if (isBreak) {
            if (breakMinutes > 0) "Taking a ${breakMinutes}m break · Guarded apps unlocked"
            else "Taking a break · Guarded apps unlocked"
        } else {
            "Monitoring apps..."
        }

        remoteViews.setTextViewText(R.id.notification_title, title)
        remoteViews.setTextViewText(R.id.notification_description, desc)

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val builder = Notification.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(desc)
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
                .setContentTitle(title)
                .setContentText(desc)
                .setSmallIcon(android.R.drawable.ic_secure)
                .setColor(Color.parseColor("#D4C7C3"))
                .setCustomContentView(remoteViews)
                .setStyle(Notification.DecoratedCustomViewStyle())
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()
        }
    }

    fun updateForegroundNotification(isBreak: Boolean, breakMinutes: Int = 0) {
        val notification = buildForegroundNotification(isBreak, breakMinutes)
        val manager = getSystemService(NotificationManager::class.java)
        manager?.notify(1, notification)
    }

    fun sendBreakStartedNotification(minutes: Int) {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = android.app.PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        val manager = getSystemService(NotificationManager::class.java)
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            Notification.Builder(this)
        }
        val notification = builder
            .setContentTitle("Session Paused")
            .setContentText("Taking a ${minutes}m break. Guarded apps are temporarily unlocked.")
            .setSmallIcon(android.R.drawable.ic_secure)
            .setColor(Color.parseColor("#D4C7C3"))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()
        manager?.notify(3, notification)
    }

    fun sendBreakEndedNotification() {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = android.app.PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        val manager = getSystemService(NotificationManager::class.java)
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            Notification.Builder(this)
        }
        val notification = builder
            .setContentTitle("Session Active")
            .setContentText("Your break has ended. Focus session is active again.")
            .setSmallIcon(android.R.drawable.ic_secure)
            .setColor(Color.parseColor("#D4C7C3"))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()
        manager?.notify(3, notification)
    }
}
