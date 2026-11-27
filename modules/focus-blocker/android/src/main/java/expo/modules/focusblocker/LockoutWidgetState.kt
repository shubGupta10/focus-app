package expo.modules.focusblocker

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.os.Build
import android.text.format.DateFormat
import android.util.Log
import androidx.compose.ui.graphics.Color
import androidx.core.graphics.ColorUtils
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.updateAll
import androidx.glance.color.ColorProvider as DayNightColorProvider
import androidx.glance.unit.ColorProvider
import kotlin.reflect.KClass
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

internal data class WidgetColorPalette(
    val bgColor: String,
    val textColor: String,
    val subtextColor: String,
    val badgeBg: String,
    val badgeTextColor: String,
    val buttonBg: String,
    val buttonTextColor: String,
    val accentColor: String,
    val progressTrackColor: String
) {
    companion object {
        val DefaultLight = WidgetColorPalette(
            bgColor = "#ECEEF4",
            textColor = "#181C20",
            subtextColor = "#42474E",
            badgeBg = "#CFE5FF",
            badgeTextColor = "#416180",
            buttonBg = "#416180",
            buttonTextColor = "#FFFFFF",
            accentColor = "#416180",
            progressTrackColor = "#C2C7CF"
        )

        val DefaultDark = WidgetColorPalette(
            bgColor = "#1D2024",
            textColor = "#E0E2E8",
            subtextColor = "#C2C7CF",
            badgeBg = "#294967",
            badgeTextColor = "#AACAEE",
            buttonBg = "#AACAEE",
            buttonTextColor = "#0E334F",
            accentColor = "#AACAEE",
            progressTrackColor = "#42474E"
        )

        fun fromJson(obj: JSONObject?, fallback: WidgetColorPalette): WidgetColorPalette {
            if (obj == null) return fallback
            return WidgetColorPalette(
                bgColor = obj.optString("bgColor", "").ifEmpty { fallback.bgColor },
                textColor = obj.optString("textColor", "").ifEmpty { fallback.textColor },
                subtextColor = obj.optString("subtextColor", "").ifEmpty { fallback.subtextColor },
                badgeBg = obj.optString("badgeBg", "").ifEmpty { fallback.badgeBg },
                badgeTextColor = obj.optString("badgeTextColor", "").ifEmpty { fallback.badgeTextColor },
                buttonBg = obj.optString("buttonBg", "").ifEmpty { fallback.buttonBg },
                buttonTextColor = obj.optString("buttonTextColor", "").ifEmpty { fallback.buttonTextColor },
                accentColor = obj.optString("accentColor", "").ifEmpty { fallback.accentColor },
                progressTrackColor = obj.optString("progressTrackColor", "").ifEmpty { fallback.progressTrackColor }
            )
        }
    }
}

internal data class WidgetWeeklyDay(
    val dayInitial: String,
    val dateStr: String,
    val focusSeconds: Int
)

internal data class LockoutWidgetSnapshot(
    val isFocusing: Boolean = false,
    val isOnBreak: Boolean = false,
    val isInfinite: Boolean = false,
    val streak: Int = 0,
    val todayMinutes: Int = 0,
    val remainingMinutes: Int = 0,
    val progress: Float = 0f,
    val breakRemainingMinutes: Int = 0,
    val breakProgress: Float = 0f,
    val defaultMinutes: Int = 25,
    val sessionEndTimeMs: Long = 0L,
    val sessionEndLabel: String = "",
    val breakPausedLabel: String = "",
    val snapshotDate: String = "",
    val weeklyDays: List<WidgetWeeklyDay> = emptyList(),
    val themeMode: String = "system",
    val useDynamicTheme: Boolean = false,
    val hasCustomOrbTheme: Boolean = false,
    val lightPalette: WidgetColorPalette = WidgetColorPalette.DefaultLight,
    val darkPalette: WidgetColorPalette = WidgetColorPalette.DefaultDark
) {
    companion object {
        fun fromJsonString(raw: String?): LockoutWidgetSnapshot {
            if (raw.isNullOrBlank()) return LockoutWidgetSnapshot()
            return try {
                val obj = JSONObject(raw)
                val weeklyArray = obj.optJSONArray("weeklyDays")
                val parsedWeekly = if (weeklyArray != null) {
                    buildList(weeklyArray.length()) {
                        for (i in 0 until weeklyArray.length()) {
                            val item = weeklyArray.optJSONObject(i) ?: continue
                            val dayName = item.optString("day", "")
                            val initial = dayName.trim().take(1).uppercase(Locale.getDefault())
                            val dateStr = item.optString("dateStr", "")
                            val focusSeconds = item.optInt("focusSeconds", 0).coerceAtLeast(0)
                            if (initial.isNotEmpty()) {
                                add(WidgetWeeklyDay(initial, dateStr, focusSeconds))
                            }
                        }
                    }
                } else {
                    emptyList()
                }
                LockoutWidgetSnapshot(
                    isFocusing = obj.optBoolean("isFocusing", false),
                    isOnBreak = obj.optBoolean("isOnBreak", false),
                    isInfinite = obj.optBoolean("isInfinite", false),
                    streak = obj.optInt("streak", 0),
                    todayMinutes = obj.optInt("todayMinutes", 0),
                    remainingMinutes = obj.optInt("remainingMinutes", 0),
                    progress = obj.optDouble("progress", 0.0).toFloat().coerceIn(0f, 1f),
                    breakRemainingMinutes = obj.optInt("breakRemainingMinutes", 0),
                    breakProgress = obj.optDouble("breakProgress", 0.0).toFloat().coerceIn(0f, 1f),
                    defaultMinutes = obj.optInt("defaultMinutes", 25),
                    sessionEndTimeMs = obj.optLong("sessionEndTimeMs", 0L),
                    sessionEndLabel = obj.optString("sessionEndLabel", ""),
                    breakPausedLabel = obj.optString("breakPausedLabel", ""),
                    snapshotDate = obj.optString("snapshotDate", ""),
                    weeklyDays = parsedWeekly,
                    themeMode = obj.optString("themeMode", "system"),
                    useDynamicTheme = obj.optBoolean("useDynamicTheme", false),
                    hasCustomOrbTheme = obj.optBoolean("hasCustomOrbTheme", false),
                    lightPalette = WidgetColorPalette.fromJson(
                        obj.optJSONObject("lightPalette"),
                        WidgetColorPalette.DefaultLight
                    ),
                    darkPalette = WidgetColorPalette.fromJson(
                        obj.optJSONObject("darkPalette"),
                        WidgetColorPalette.DefaultDark
                    )
                )
            } catch (e: Exception) {
                Log.w("LockoutWidgets", "Failed to parse widget snapshot JSON", e)
                LockoutWidgetSnapshot()
            }
        }
    }
}

internal data class ResolvedWidgetColors(
    val bgColor: ColorProvider,
    val textColor: ColorProvider,
    val subtextColor: ColorProvider,
    val badgeBg: ColorProvider,
    val badgeTextColor: ColorProvider,
    val buttonBg: ColorProvider,
    val buttonTextColor: ColorProvider,
    val accentColor: ColorProvider,
    val progressTrackColor: ColorProvider
)

internal object LockoutWidgetUpdater {
    internal const val ACTION_MIDNIGHT_REFRESH = "expo.modules.focusblocker.ACTION_MIDNIGHT_WIDGET_REFRESH"
    private const val PREFS_NAME = "LockoutWidgetPrefs"
    private const val KEY_SNAPSHOT = "snapshot_json"
    private const val KEY_LAST_PREVIEW_TIME = "last_preview_time_v7_ms"
    private const val KEY_LAST_PREVIEW_SIG = "last_preview_sig_v7"
    private const val PREVIEW_MIN_INTERVAL_MS = 35 * 60 * 1000L

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val updateMutex = Mutex()

    @Volatile
    private var previewPublishJob: Job? = null

    private val _snapshotFlow = MutableStateFlow<LockoutWidgetSnapshot?>(null)
    val snapshotFlow: StateFlow<LockoutWidgetSnapshot?> = _snapshotFlow.asStateFlow()

    @Volatile
    private var lastJsSignature: String? = null

    @Volatile
    private var lastServiceSignature: String? = null

    @Volatile
    private var cachedAppIconBitmap: Bitmap? = null

    fun getAppIconBitmap(context: Context): Bitmap? {
        cachedAppIconBitmap?.let { return it }
        return try {
            val drawable = context.packageManager.getApplicationIcon(context.packageName)
            val sizePx = (48 * context.resources.displayMetrics.density).toInt().coerceIn(96, 192)
            val raw = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
            val rawCanvas = Canvas(raw)
            drawable.setBounds(0, 0, sizePx, sizePx)
            drawable.draw(rawCanvas)

            val rounded = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(rounded)
            val paint = Paint(Paint.ANTI_ALIAS_FLAG)
            val radius = sizePx * 0.24f
            canvas.drawRoundRect(RectF(0f, 0f, sizePx.toFloat(), sizePx.toFloat()), radius, radius, paint)
            paint.xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_IN)
            canvas.drawBitmap(raw, 0f, 0f, paint)
            raw.recycle()

            cachedAppIconBitmap = rounded
            rounded
        } catch (e: Exception) {
            Log.w("LockoutWidgets", "Failed to load launcher icon bitmap", e)
            null
        }
    }

    private fun currentLocalDateString(cal: Calendar = Calendar.getInstance()): String {
        val y = cal.get(Calendar.YEAR)
        val m = cal.get(Calendar.MONTH) + 1
        val d = cal.get(Calendar.DAY_OF_MONTH)
        return String.format(Locale.US, "%04d-%02d-%02d", y, m, d)
    }

    private fun buildRolling7DayWindow(reference: Calendar = Calendar.getInstance()): List<Pair<String, String>> {
        val start = (reference.clone() as Calendar).apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            add(Calendar.DAY_OF_YEAR, -6)
        }
        val weekdayFormat = SimpleDateFormat("EEEEE", Locale.getDefault())
        return List(7) { idx ->
            val dayCal = (start.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, idx) }
            val dateStr = currentLocalDateString(dayCal)
            val initial = weekdayFormat.format(dayCal.time).trim().take(1).uppercase(Locale.getDefault())
            dateStr to initial
        }
    }

    private fun queryRolling7DaysFromDb(
        context: Context,
        startDateStr: String,
        endDateStr: String
    ): Map<String, Int>? {
        val expoDb = File(File(context.filesDir, "SQLite"), "focus.db")
        val dbFile = if (expoDb.exists()) expoDb else context.getDatabasePath("focus.db")
        if (!dbFile.exists()) return null

        var db: SQLiteDatabase? = null
        return try {
            db = SQLiteDatabase.openDatabase(dbFile.path, null, SQLiteDatabase.OPEN_READONLY)
            val map = HashMap<String, Int>(7)
            val cursor = db.rawQuery(
                "SELECT session_date, COALESCE(SUM(duration_seconds), 0) FROM sessions WHERE session_date BETWEEN ? AND ? AND is_completed = 1 GROUP BY session_date",
                arrayOf(startDateStr, endDateStr)
            )
            while (cursor.moveToNext()) {
                val date = cursor.getString(0) ?: continue
                val sec = cursor.getInt(1).coerceAtLeast(0)
                map[date] = sec
            }
            cursor.close()
            map
        } catch (e: Exception) {
            Log.w("LockoutWidgets", "Unable to query rolling 7 days from focus.db", e)
            null
        } finally {
            db?.close()
        }
    }

    private fun rolloverAndHydrateForToday(
        context: Context,
        snapshot: LockoutWidgetSnapshot
    ): LockoutWidgetSnapshot {
        val now = Calendar.getInstance()
        val todayStr = currentLocalDateString(now)
        val window = buildRolling7DayWindow(now)
        val startStr = window.first().first
        val dbMap = queryRolling7DaysFromDb(context, startStr, todayStr)

        val storedMap = HashMap<String, Int>(snapshot.weeklyDays.size)
        for (entry in snapshot.weeklyDays) {
            if (entry.dateStr.isNotEmpty()) {
                storedMap[entry.dateStr] = entry.focusSeconds
            }
        }
        if (snapshot.snapshotDate.isNotEmpty() && snapshot.todayMinutes > 0) {
            val prevForDate = storedMap[snapshot.snapshotDate] ?: 0
            storedMap[snapshot.snapshotDate] = maxOf(prevForDate, snapshot.todayMinutes * 60)
        }

        val hydratedWeekly = window.map { (dateStr, initial) ->
            val dbSec = dbMap?.get(dateStr)
            val storedSec = storedMap[dateStr]
            val resolvedSec = when {
                dateStr == todayStr -> {
                    val sameDayStored = if (snapshot.snapshotDate == todayStr) {
                        maxOf(storedSec ?: 0, snapshot.todayMinutes * 60)
                    } else {
                        0
                    }
                    maxOf(dbSec ?: 0, sameDayStored)
                }
                else -> dbSec ?: (storedSec ?: 0)
            }
            WidgetWeeklyDay(dayInitial = initial, dateStr = dateStr, focusSeconds = resolvedSec)
        }

        val todayWeeklyMinutes = (hydratedWeekly.lastOrNull()?.focusSeconds ?: 0) / 60
        val resolvedTodayMinutes = if (snapshot.snapshotDate == todayStr) {
            maxOf(snapshot.todayMinutes, todayWeeklyMinutes)
        } else {
            todayWeeklyMinutes
        }

        return snapshot.copy(
            snapshotDate = todayStr,
            todayMinutes = resolvedTodayMinutes,
            weeklyDays = hydratedWeekly
        )
    }

    fun loadSnapshot(context: Context): LockoutWidgetSnapshot {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val parsed = LockoutWidgetSnapshot.fromJsonString(prefs.getString(KEY_SNAPSHOT, null))
        return rolloverAndHydrateForToday(context, parsed)
    }

    fun ensureLoaded(context: Context): LockoutWidgetSnapshot {
        val hydrated = loadSnapshot(context)
        _snapshotFlow.value = hydrated
        return hydrated
    }

    fun updateFromJs(context: Context, snapshotJson: String) {
        if (snapshotJson == lastJsSignature) return
        lastJsSignature = snapshotJson
        lastServiceSignature = null

        val appContext = context.applicationContext
        val rawParsed = LockoutWidgetSnapshot.fromJsonString(snapshotJson)
        val parsed = rolloverAndHydrateForToday(appContext, rawParsed)
        val prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_SNAPSHOT, snapshotJson).apply()
        _snapshotFlow.value = parsed

        Log.d(
            "LockoutWidgets",
            "updateFromJs focusing=${parsed.isFocusing} break=${parsed.isOnBreak} rem=${parsed.remainingMinutes} default=${parsed.defaultMinutes}"
        )
        scheduleWidgetRedraw(appContext, parsed)
    }

    fun buildPreviewSnapshot(context: Context): LockoutWidgetSnapshot {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val hasStoredSnapshot = !prefs.getString(KEY_SNAPSHOT, null).isNullOrBlank()
        val current = ensureLoaded(context)
        val hasRealIdleStats = current.todayMinutes > 0 || current.streak > 0
        val hasRealWeekly = current.weeklyDays.any { it.focusSeconds > 0 }
        val previewWeekly = if (hasRealWeekly) {
            current.weeklyDays
        } else {
            val sampleMinutes = listOf(25, 10, 30, 0, 45, 35, 25)
            buildRolling7DayWindow().mapIndexed { idx, (dateStr, initial) ->
                WidgetWeeklyDay(initial, dateStr, sampleMinutes[idx] * 60)
            }
        }
        return current.copy(
            isFocusing = false,
            isOnBreak = false,
            isInfinite = false,
            remainingMinutes = 0,
            progress = 0f,
            breakRemainingMinutes = 0,
            breakProgress = 0f,
            sessionEndTimeMs = 0L,
            sessionEndLabel = "",
            breakPausedLabel = "",
            useDynamicTheme = if (hasStoredSnapshot) current.useDynamicTheme else Build.VERSION.SDK_INT >= Build.VERSION_CODES.S,
            todayMinutes = if (hasRealIdleStats) current.todayMinutes else 25,
            streak = if (hasRealIdleStats) current.streak else 4,
            defaultMinutes = if (current.defaultMinutes > 0) current.defaultMinutes else 25,
            weeklyDays = previewWeekly
        )
    }

    fun resetSignatureCache() {
        lastServiceSignature = null
    }

    fun syncFromService(
        context: Context,
        isFocusing: Boolean,
        activeStartTime: Long,
        activeEndTime: Long,
        breakStartTime: Long,
        breakEndTime: Long,
        breakDurationMs: Long,
        totalBreakMs: Long,
        completedMinutesToAdd: Int = 0
    ) {
        try {
            val appContext = context.applicationContext
            val now = System.currentTimeMillis()
            val isInfinite = isFocusing && activeEndTime == -1L
            val isOnBreak = isFocusing && breakEndTime > now
            val breakRemainingMinutes = if (isOnBreak) {
                Math.ceil(((breakEndTime - now).coerceAtLeast(0L)) / 60000.0).toInt().coerceAtLeast(1)
            } else {
                0
            }
            val breakProgress = if (isOnBreak && breakDurationMs > 0L && breakStartTime > 0L) {
                ((now - breakStartTime).toDouble() / breakDurationMs.toDouble()).coerceIn(0.0, 1.0)
            } else {
                0.0
            }

            // Exclude active and past breaks from displayed focus countdown & progress.
            val focusRemainingMs = if (isFocusing && activeEndTime > 0L) {
                if (isOnBreak) {
                    (activeEndTime - breakEndTime).coerceAtLeast(0L)
                } else {
                    (activeEndTime - now).coerceAtLeast(0L)
                }
            } else {
                0L
            }

            val remainingMinutes = if (isInfinite && activeStartTime > 0L) {
                val activeBreakElapsed = if (isOnBreak && breakStartTime > 0L) (now - breakStartTime).coerceAtLeast(0L) else 0L
                val elapsedMs = (now - activeStartTime - totalBreakMs - activeBreakElapsed).coerceAtLeast(0L)
                (elapsedMs / 60000L).toInt()
            } else if (focusRemainingMs > 0L) {
                Math.ceil(focusRemainingMs / 60000.0).toInt()
            } else {
                0
            }

            val totalFocusMs = if (isFocusing && activeEndTime > 0L && activeStartTime > 0L) {
                (activeEndTime - activeStartTime - totalBreakMs).coerceAtLeast(1L)
            } else {
                0L
            }

            val progress = if (isInfinite) {
                1.0
            } else if (isFocusing && totalFocusMs > 0L) {
                val elapsedFocusMs = (totalFocusMs - focusRemainingMs).coerceAtLeast(0L)
                (elapsedFocusMs.toDouble() / totalFocusMs.toDouble()).coerceIn(0.0, 1.0)
            } else {
                0.0
            }

            val sessionEndTimeMs = if (isFocusing && !isOnBreak && !isInfinite && activeEndTime > 0L) {
                activeEndTime
            } else {
                0L
            }

            val sessionEndLabel = if (isFocusing && !isOnBreak) {
                if (isInfinite) {
                    "Flow state"
                } else if (activeEndTime > 0L) {
                    formatEndAtTime(appContext, activeEndTime)
                } else {
                    ""
                }
            } else {
                ""
            }

            val breakPausedLabel = if (isOnBreak) {
                if (isInfinite) {
                    "Flow paused"
                } else if (remainingMinutes > 0) {
                    val pausedDuration = formatMinutes(remainingMinutes)
                    "$pausedDuration paused"
                } else {
                    val resumesAt = DateFormat.getTimeFormat(appContext).format(Date(breakEndTime))
                    "Resumes $resumesAt"
                }
            } else {
                ""
            }

            val signature =
                "$isFocusing|$isOnBreak|$isInfinite|$remainingMinutes|$breakRemainingMinutes|${(progress * 50).toInt()}|${(breakProgress * 50).toInt()}|$sessionEndLabel|$breakPausedLabel"
            if (completedMinutesToAdd == 0 && signature == lastServiceSignature) {
                return
            }
            lastServiceSignature = signature

            val prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val existingRaw = prefs.getString(KEY_SNAPSHOT, null)
            val hydratedPrev = rolloverAndHydrateForToday(
                appContext,
                LockoutWidgetSnapshot.fromJsonString(existingRaw)
            )
            val json = if (!existingRaw.isNullOrBlank()) JSONObject(existingRaw) else JSONObject()
            json.put("snapshotDate", hydratedPrev.snapshotDate)
            json.put("todayMinutes", hydratedPrev.todayMinutes)

            val updatedWeekly = if (completedMinutesToAdd > 0) {
                val updatedToday = hydratedPrev.todayMinutes + completedMinutesToAdd
                json.put("todayMinutes", updatedToday)
                hydratedPrev.weeklyDays.mapIndexed { idx, day ->
                    if (idx == hydratedPrev.weeklyDays.lastIndex) {
                        day.copy(focusSeconds = maxOf(day.focusSeconds + completedMinutesToAdd * 60, updatedToday * 60))
                    } else {
                        day
                    }
                }
            } else {
                hydratedPrev.weeklyDays
            }

            val weeklyJson = JSONArray()
            for (day in updatedWeekly) {
                weeklyJson.put(
                    JSONObject().apply {
                        put("day", day.dayInitial)
                        put("dateStr", day.dateStr)
                        put("focusSeconds", day.focusSeconds)
                    }
                )
            }
            json.put("weeklyDays", weeklyJson)

            if (isFocusing) {
                json.put("isFocusing", true)
                json.put("isOnBreak", isOnBreak)
                json.put("isInfinite", isInfinite)
                json.put("remainingMinutes", remainingMinutes)
                json.put("progress", progress)
                json.put("breakRemainingMinutes", breakRemainingMinutes)
                json.put("breakProgress", breakProgress)
                json.put("sessionEndTimeMs", sessionEndTimeMs)
                json.put("sessionEndLabel", sessionEndLabel)
                json.put("breakPausedLabel", breakPausedLabel)
            } else {
                json.put("isFocusing", false)
                json.put("isOnBreak", false)
                json.put("isInfinite", false)
                json.put("remainingMinutes", 0)
                json.put("progress", 0.0)
                json.put("breakRemainingMinutes", 0)
                json.put("breakProgress", 0.0)
                json.put("sessionEndTimeMs", 0L)
                json.put("sessionEndLabel", "")
                json.put("breakPausedLabel", "")
            }

            val updatedRaw = json.toString()
            lastJsSignature = updatedRaw
            val parsed = rolloverAndHydrateForToday(
                appContext,
                LockoutWidgetSnapshot.fromJsonString(updatedRaw)
            )
            prefs.edit().putString(KEY_SNAPSHOT, updatedRaw).commit()
            _snapshotFlow.value = parsed

            Log.d(
                "LockoutWidgets",
                "syncFromService focusing=$isFocusing break=$isOnBreak rem=$remainingMinutes"
            )
            scheduleWidgetRedraw(appContext)
        } catch (e: Exception) {
            Log.e("LockoutWidgets", "Failed to sync widgets from service", e)
        }
    }

    fun refreshAll(context: Context) {
        val appContext = context.applicationContext
        val snapshot = loadSnapshot(appContext)
        _snapshotFlow.value = snapshot
        scheduleWidgetRedraw(appContext, snapshot)
    }

    fun scheduleMidnightRefresh(context: Context) {
        try {
            val appContext = context.applicationContext
            val receiverCls = resolveManifestReceiverClass(
                appContext,
                "LockoutWidget4x2Provider",
                LockoutWidget4x2GlanceReceiver::class
            ).java
            val intent = Intent(appContext, receiverCls).apply {
                action = ACTION_MIDNIGHT_REFRESH
            }
            val pi = PendingIntent.getBroadcast(
                appContext,
                4109,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val nextMidnight = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, 1)
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 2)
                set(Calendar.MILLISECOND, 0)
            }
            val am = appContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            am.set(AlarmManager.RTC, nextMidnight.timeInMillis, pi)
        } catch (e: Exception) {
            Log.w("LockoutWidgets", "Failed to schedule midnight widget refresh", e)
        }
    }

    private fun scheduleWidgetRedraw(appContext: Context, previewSnapshot: LockoutWidgetSnapshot? = null) {
        scheduleMidnightRefresh(appContext)
        scope.launch {
            updateMutex.withLock {
                try {
                    LockoutWidget4x2Instance.updateAll(appContext)
                    LockoutWidget2x2Instance.updateAll(appContext)
                } catch (e: Exception) {
                    Log.e("LockoutWidgets", "Failed to update Glance widgets", e)
                }
            }
        }
        if (previewSnapshot != null && Build.VERSION.SDK_INT >= 35) {
            previewPublishJob?.cancel()
            previewPublishJob = scope.launch {
                // Debounce so SQLite theme/stats hydration finishes before consuming Android's rate-limited preview slot.
                delay(1500)
                updateMutex.withLock {
                    publishPreviewsIfNeeded(appContext, previewSnapshot)
                }
            }
        }
    }

    private suspend fun publishPreviewsIfNeeded(appContext: Context, snapshot: LockoutWidgetSnapshot) {
        if (Build.VERSION.SDK_INT < 35) return
        try {
            val prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val now = System.currentTimeMillis()
            val lastTime = prefs.getLong(KEY_LAST_PREVIEW_TIME, 0L)
            val previewSig = "${snapshot.themeMode}|${snapshot.useDynamicTheme}|${snapshot.hasCustomOrbTheme}|${snapshot.todayMinutes}|${snapshot.streak}|${snapshot.defaultMinutes}|${snapshot.lightPalette.accentColor}|${snapshot.darkPalette.accentColor}"
            val lastSig = prefs.getString(KEY_LAST_PREVIEW_SIG, null)
            if (lastSig == previewSig) return
            if (lastTime > 0L && now - lastTime < PREVIEW_MIN_INTERVAL_MS) return

            val manager = GlanceAppWidgetManager(appContext)
            val receivers = listOf(
                resolveManifestReceiverClass(appContext, "LockoutWidget4x2Provider", LockoutWidget4x2GlanceReceiver::class),
                resolveManifestReceiverClass(appContext, "LockoutWidget2x2Provider", LockoutWidget2x2GlanceReceiver::class)
            )
            var publishedAny = false
            for (receiver in receivers) {
                val result = manager.setWidgetPreviews(receiver)
                if (result == GlanceAppWidgetManager.SET_WIDGET_PREVIEWS_RESULT_SUCCESS) {
                    publishedAny = true
                }
            }
            if (publishedAny) {
                prefs.edit()
                    .putLong(KEY_LAST_PREVIEW_TIME, now)
                    .putString(KEY_LAST_PREVIEW_SIG, previewSig)
                    .apply()
            }
        } catch (e: Exception) {
            Log.w("LockoutWidgets", "Failed to publish Glance widget previews", e)
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun resolveManifestReceiverClass(
        context: Context,
        simpleName: String,
        fallback: KClass<out GlanceAppWidgetReceiver>
    ): KClass<out GlanceAppWidgetReceiver> {
        return try {
            val clazz = Class.forName("${context.packageName}.$simpleName")
            if (GlanceAppWidgetReceiver::class.java.isAssignableFrom(clazz)) {
                clazz.kotlin as KClass<out GlanceAppWidgetReceiver>
            } else {
                fallback
            }
        } catch (_: Exception) {
            fallback
        }
    }

    fun resolveColors(context: Context, snapshot: LockoutWidgetSnapshot): ResolvedWidgetColors {
        val (light, dark) = if (
            snapshot.useDynamicTheme &&
            !snapshot.hasCustomOrbTheme &&
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
        ) {
            buildDynamicPalettes(context, snapshot.lightPalette, snapshot.darkPalette)
        } else {
            snapshot.lightPalette to snapshot.darkPalette
        }

        fun pair(dayHex: String, nightHex: String): ColorProvider {
            val day = parseComposeColor(dayHex, Color(0xFFECEEF4))
            val night = parseComposeColor(nightHex, Color(0xFF1D2024))
            return when (snapshot.themeMode) {
                "light" -> ColorProvider(day)
                "dark" -> ColorProvider(night)
                else -> if (day == night) ColorProvider(day) else DayNightColorProvider(day = day, night = night)
            }
        }

        return ResolvedWidgetColors(
            bgColor = pair(light.bgColor, dark.bgColor),
            textColor = pair(light.textColor, dark.textColor),
            subtextColor = pair(light.subtextColor, dark.subtextColor),
            badgeBg = pair(light.badgeBg, dark.badgeBg),
            badgeTextColor = pair(light.badgeTextColor, dark.badgeTextColor),
            buttonBg = pair(light.buttonBg, dark.buttonBg),
            buttonTextColor = pair(light.buttonTextColor, dark.buttonTextColor),
            accentColor = pair(light.accentColor, dark.accentColor),
            progressTrackColor = pair(light.progressTrackColor, dark.progressTrackColor)
        )
    }

    private fun buildDynamicPalettes(
        context: Context,
        fallbackLight: WidgetColorPalette,
        fallbackDark: WidgetColorPalette
    ): Pair<WidgetColorPalette, WidgetColorPalette> {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            return fallbackLight to fallbackDark
        }
        return try {
            fun hex(resId: Int): String =
                String.format("#%06X", 0xFFFFFF and context.getColor(resId))

            fun blend(fromRes: Int, toRes: Int, ratio: Float): String {
                val c = ColorUtils.blendARGB(context.getColor(fromRes), context.getColor(toRes), ratio)
                return String.format("#%06X", 0xFFFFFF and c)
            }

            val hasM3Surfaces = Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE
            val lightBg = if (hasM3Surfaces) {
                hex(android.R.color.system_surface_container_high_light)
            } else {
                blend(android.R.color.system_neutral1_50, android.R.color.system_neutral1_100, 0.6f)
            }
            val darkBg = if (hasM3Surfaces) {
                hex(android.R.color.system_surface_container_dark)
            } else {
                blend(android.R.color.system_neutral1_900, android.R.color.system_neutral1_800, 0.2f)
            }

            val lightAccent = hex(android.R.color.system_accent1_700)
            val lightAccentMuted = hex(android.R.color.system_accent1_100)
            val darkAccent = hex(android.R.color.system_accent1_200)
            val darkAccentMuted = hex(android.R.color.system_accent1_700)

            val lightPalette = WidgetColorPalette(
                bgColor = lightBg,
                textColor = hex(android.R.color.system_neutral1_900),
                subtextColor = hex(android.R.color.system_neutral2_700),
                badgeBg = lightAccentMuted,
                badgeTextColor = lightAccent,
                buttonBg = lightAccent,
                buttonTextColor = "#FFFFFF",
                accentColor = lightAccent,
                progressTrackColor = hex(android.R.color.system_neutral2_200)
            )

            val darkPalette = WidgetColorPalette(
                bgColor = darkBg,
                textColor = hex(android.R.color.system_neutral1_100),
                subtextColor = hex(android.R.color.system_neutral2_200),
                badgeBg = darkAccentMuted,
                badgeTextColor = darkAccent,
                buttonBg = darkAccent,
                buttonTextColor = hex(android.R.color.system_accent1_900),
                accentColor = darkAccent,
                progressTrackColor = hex(android.R.color.system_neutral2_700)
            )

            lightPalette to darkPalette
        } catch (_: Exception) {
            fallbackLight to fallbackDark
        }
    }

    private fun parseComposeColor(hex: String, fallback: Color): Color {
        return try {
            val clean = if (hex.startsWith("#") && hex.length == 9) hex.substring(0, 7) else hex
            Color(AndroidColor.parseColor(clean))
        } catch (_: Exception) {
            fallback
        }
    }

    internal fun formatEndAtTime(context: Context, endTimeMs: Long): String {
        if (endTimeMs <= 0L) return ""
        val formatted = DateFormat.getTimeFormat(context).format(Date(endTimeMs))
        return "Ends at $formatted"
    }

    internal fun formatMinutes(total: Int): String =
        if (total >= 60) "${total / 60}h ${total % 60}m" else "${total}m"

    internal fun formatStartMinutes(total: Int): String =
        if (total >= 60) {
            if (total % 60 == 0) "${total / 60}h" else "${total / 60}h ${total % 60}m"
        } else {
            "${total}m"
        }
}
