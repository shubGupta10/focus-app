package expo.modules.focusblocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
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

    private val CHANNEL_ID = "FocusBlockerChannel_V2"
    private var isRunning = false

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var isOverlayShowing = false

    private var endTime: Long = -1L

    // Holds the custom list of apps sent from React Native
    private var customBlockedApps: List<String> = emptyList()

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val passedApps = intent?.getStringArrayListExtra("customBlockedApps")
        if (passedApps != null) {
            customBlockedApps = passedApps.toList()
        }

        val durationMs = intent?.getDoubleExtra("durationMs", -1.0) ?: -1.0
        endTime = if (durationMs > 0)
            System.currentTimeMillis() + durationMs.toLong() else -1L

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
                    .setSmallIcon(applicationInfo.icon)
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
                    .setSmallIcon(applicationInfo.icon)
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
            val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as android.app.usage.UsageStatsManager
            var currentForegroundApp = ""

            while (isRunning) {
                if (endTime > 0 && System.currentTimeMillis() >= endTime) {
                    Log.d("FocusBlocker", "Time expired! Auto-stopping service")
                    stopSelf()
                    break
                }
                val nowTime = System.currentTimeMillis()
                val startTime = nowTime - 10000

                val usageEvents = usageStatsManager.queryEvents(startTime, nowTime)
                val event = android.app.usage.UsageEvents.Event()

                while (usageEvents.hasNextEvent()) {
                    usageEvents.getNextEvent(event)
                    if (event.eventType == android.app.usage.UsageEvents.Event.MOVE_TO_FOREGROUND) {
                        currentForegroundApp = event.packageName
                    }
                }

                var isDistracting = false
                if (currentForegroundApp.isNotEmpty() && currentForegroundApp != packageName) {
                    if (customBlockedApps.contains(currentForegroundApp)) {
                        isDistracting = true
                    }
                }

                if (isDistracting) {
                    showBlockOverlay(currentForegroundApp)
                } else {
                    hideBlockOverlay()
                }

                Thread.sleep(500)
            }
        }.start()
    }

    private fun showBlockOverlay(blockedPackage: String) {
        Handler(Looper.getMainLooper()).post {
            val appLabel = try {
                val appInfo = packageManager.getApplicationInfo(blockedPackage, 0)
                packageManager.getApplicationLabel(appInfo).toString()
            } catch (e: Exception) {
                "This app"
            }

            val timeMessage = if (endTime > 0) {
                val diffMs = endTime - System.currentTimeMillis()
                val minutesLeft = (diffMs / 1000 / 60).coerceAtLeast(1)
                if (minutesLeft > 1) "$minutesLeft minutes remaining" else "Less than a minute remaining"
            } else {
                "Session in progress"
            }

            if (isOverlayShowing) {
                titleView?.text = "$appLabel is guarded"
                subtitleView?.text = "$timeMessage · Stay in the zone"
                return@post
            }

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
                    val intent = Intent(Intent.ACTION_MAIN).apply {
                        addCategory(Intent.CATEGORY_HOME)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    startActivity(intent)
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
                    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
                    }
                    if (launchIntent != null) {
                        startActivity(launchIntent)
                    }
                }
            }
            container.addView(openAppButton)

            try {
                windowManager?.addView(container, windowLayoutParams)
                overlayView = container
                isOverlayShowing = true
            } catch (e: Exception) {
                Log.e("FocusBlocker", "Failed to add overlay", e)
            }
        }
    }

    private var titleView: TextView? = null
    private var subtitleView: TextView? = null

    private fun hideBlockOverlay() {
        if (!isOverlayShowing) return
        Handler(Looper.getMainLooper()).post {
            try {
                windowManager?.removeView(overlayView)
                overlayView = null
                titleView = null
                subtitleView = null
                isOverlayShowing = false
            } catch (e: Exception) {
                Log.e("FocusBlocker", "Failed to remove overlay", e)
            }
        }
    }

    override fun onDestroy() {
        isRunning = false
        hideBlockOverlay()
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
}
