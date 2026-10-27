package expo.modules.focusblocker

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import android.app.Notification
import android.content.Context

class LockoutNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "LockoutNotifListener"

        @Volatile
        var isEnabled: Boolean = false

        @Volatile
        var activeBlockedPackages: Set<String> = emptySet()

        fun updateSessionState(enabled: Boolean, blockedPackages: Collection<String>) {
            isEnabled = enabled
            activeBlockedPackages = blockedPackages.toSet()
            Log.d(TAG, "Notification listener state updated: enabled=$enabled, count=${activeBlockedPackages.size}")
        }

        fun clearSessionState() {
            isEnabled = false
            activeBlockedPackages = emptySet()
            Log.d(TAG, "Notification listener state cleared")
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.d(TAG, "NotificationListener connected")

        try {
            val prefs = applicationContext.getSharedPreferences("FocusBlockerState", Context.MODE_PRIVATE)
            val isSessionActive = prefs.contains("activeStartTime")
            val silenceEnabled = prefs.getBoolean("silenceNotifications", false)
            val savedApps = prefs.getString("customBlockedApps", "") ?: ""

            if (isSessionActive && silenceEnabled && savedApps.isNotEmpty()) {
                val apps = savedApps.split(",").filter { it.isNotBlank() }.toSet()
                updateSessionState(true, apps)
                Log.d(TAG, "Restored active session state onListenerConnected with ${apps.size} apps")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to restore state onListenerConnected", e)
        }
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.d(TAG, "NotificationListener disconnected")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)

        if (!isEnabled || activeBlockedPackages.isEmpty() || sbn == null) {
            return
        }

        if (FocusService.isServiceActive && FocusService.breakEndTime > System.currentTimeMillis()) {
            return
        }

        val packageName = sbn.packageName ?: return

        if (packageName == applicationContext.packageName) {
            return
        }

        if (sbn.isOngoing) {
            return
        }

        val notification = sbn.notification
        if (notification != null) {
            val category = notification.category
            if (category == Notification.CATEGORY_CALL || category == Notification.CATEGORY_ALARM) {
                return
            }
        }

        if (activeBlockedPackages.contains(packageName)) {
            Log.d(TAG, "Dismissing notification from blocked app: $packageName")
            try {
                cancelNotification(sbn.key)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to cancel notification for $packageName", e)
            }
        }
    }
}
