package expo.modules.focusblocker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.os.Build
import android.util.Log
import androidx.compose.ui.graphics.Color
import androidx.core.graphics.ColorUtils
import androidx.glance.appwidget.updateAll
import androidx.glance.color.ColorProvider as DayNightColorProvider
import androidx.glance.unit.ColorProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.json.JSONObject
import java.text.SimpleDateFormat
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
    val sessionEndLabel: String = "",
    val breakPausedLabel: String = "",
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
                    sessionEndLabel = obj.optString("sessionEndLabel", ""),
                    breakPausedLabel = obj.optString("breakPausedLabel", ""),
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
    private const val PREFS_NAME = "LockoutWidgetPrefs"
    private const val KEY_SNAPSHOT = "snapshot_json"

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val updateMutex = Mutex()

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

    fun loadSnapshot(context: Context): LockoutWidgetSnapshot {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return LockoutWidgetSnapshot.fromJsonString(prefs.getString(KEY_SNAPSHOT, null))
    }

    fun ensureLoaded(context: Context): LockoutWidgetSnapshot {
        val stored = loadSnapshot(context)
        if (_snapshotFlow.value == null) {
            _snapshotFlow.value = stored
        }
        return _snapshotFlow.value ?: stored
    }

    fun updateFromJs(context: Context, snapshotJson: String) {
        if (snapshotJson == lastJsSignature) return
        lastJsSignature = snapshotJson
        lastServiceSignature = null

        val appContext = context.applicationContext
        val parsed = LockoutWidgetSnapshot.fromJsonString(snapshotJson)
        val prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_SNAPSHOT, snapshotJson).apply()
        _snapshotFlow.value = parsed

        Log.d(
            "LockoutWidgets",
            "updateFromJs focusing=${parsed.isFocusing} break=${parsed.isOnBreak} rem=${parsed.remainingMinutes} default=${parsed.defaultMinutes}"
        )
        scheduleWidgetRedraw(appContext)
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

            val sessionEndLabel = if (isFocusing && !isOnBreak) {
                if (isInfinite) {
                    "Flow state"
                } else if (activeEndTime > 0L) {
                    val formatted = SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date(activeEndTime))
                    "Ends $formatted"
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
                    val resumesAt = SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date(breakEndTime))
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
            val json = if (!existingRaw.isNullOrBlank()) JSONObject(existingRaw) else JSONObject()

            if (isFocusing) {
                json.put("isFocusing", true)
                json.put("isOnBreak", isOnBreak)
                json.put("isInfinite", isInfinite)
                json.put("remainingMinutes", remainingMinutes)
                json.put("progress", progress)
                json.put("breakRemainingMinutes", breakRemainingMinutes)
                json.put("breakProgress", breakProgress)
                json.put("sessionEndLabel", sessionEndLabel)
                json.put("breakPausedLabel", breakPausedLabel)
            } else {
                if (completedMinutesToAdd > 0) {
                    val prevToday = json.optInt("todayMinutes", 0)
                    json.put("todayMinutes", prevToday + completedMinutesToAdd)
                }
                json.put("isFocusing", false)
                json.put("isOnBreak", false)
                json.put("isInfinite", false)
                json.put("remainingMinutes", 0)
                json.put("progress", 0.0)
                json.put("breakRemainingMinutes", 0)
                json.put("breakProgress", 0.0)
                json.put("sessionEndLabel", "")
                json.put("breakPausedLabel", "")
            }

            val updatedRaw = json.toString()
            lastJsSignature = updatedRaw
            val parsed = LockoutWidgetSnapshot.fromJsonString(updatedRaw)
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
        _snapshotFlow.value = loadSnapshot(appContext)
        scheduleWidgetRedraw(appContext)
    }

    private fun scheduleWidgetRedraw(appContext: Context) {
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

    internal fun formatMinutes(total: Int): String =
        if (total >= 60) "${total / 60}h ${total % 60}m" else "${total}m"

    internal fun formatStartMinutes(total: Int): String =
        if (total >= 60) {
            if (total % 60 == 0) "${total / 60}h" else "${total / 60}h ${total % 60}m"
        } else {
            "${total}m"
        }
}
