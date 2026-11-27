package expo.modules.focusblocker

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.action.Action
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.LinearProgressIndicator
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ContentScale
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.layout.wrapContentHeight
import androidx.glance.layout.wrapContentWidth
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

internal val LockoutWidget4x2Instance = LockoutWidget4x2Glance()
internal val LockoutWidget2x2Instance = LockoutWidget2x2Glance()

private fun handleWidgetBroadcast(context: Context, intent: Intent): Boolean {
    val action = intent.action ?: return false
    if (
        action == LockoutWidgetUpdater.ACTION_MIDNIGHT_REFRESH ||
        action == Intent.ACTION_DATE_CHANGED ||
        action == Intent.ACTION_TIME_CHANGED ||
        action == Intent.ACTION_TIMEZONE_CHANGED
    ) {
        LockoutWidgetUpdater.refreshAll(context)
        return true
    }
    return false
}

open class LockoutWidget4x2GlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget get() = LockoutWidget4x2Instance

    override fun onReceive(context: Context, intent: Intent) {
        if (handleWidgetBroadcast(context, intent)) return
        super.onReceive(context, intent)
    }
}

open class LockoutWidget2x2GlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget get() = LockoutWidget2x2Instance

    override fun onReceive(context: Context, intent: Intent) {
        if (handleWidgetBroadcast(context, intent)) return
        super.onReceive(context, intent)
    }
}

private fun openLockoutAction(context: Context, startTimer: Boolean): Action {
    val deepLink = if (startTimer) "lockout://?startTimer=1" else "lockout://"
    val launchIntent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
        setPackage(context.packageName)
        addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
        )
    }
    return actionStartActivity(launchIntent)
}

@Composable
private fun WidgetAppIcon(context: Context, iconSize: Dp, iconRadius: Dp) {
    val bitmap = LockoutWidgetUpdater.getAppIconBitmap(context)
    if (bitmap != null) {
        Image(
            provider = ImageProvider(bitmap),
            contentDescription = "Lockout",
            contentScale = ContentScale.Fit,
            modifier = GlanceModifier.size(iconSize).cornerRadius(iconRadius)
        )
    } else {
        Box(
            modifier = GlanceModifier
                .size(iconSize)
                .background(ColorProvider(Color(0xFF92485A)))
                .cornerRadius(iconRadius)
        ) {}
    }
}

internal class LockoutWidget4x2Glance : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val initial = LockoutWidgetUpdater.ensureLoaded(context)

        provideContent {
            val observed by LockoutWidgetUpdater.snapshotFlow.collectAsState()
            val snapshot = observed ?: initial
            val palette = LockoutWidgetUpdater.resolveColors(context, snapshot)
            LockoutWidget4x2Content(context, snapshot, palette)
        }
    }

    override suspend fun providePreview(context: Context, widgetCategory: Int) {
        val snapshot = LockoutWidgetUpdater.buildPreviewSnapshot(context)
        val palette = LockoutWidgetUpdater.resolveColors(context, snapshot)
        provideContent {
            LockoutWidget4x2Content(context, snapshot, palette, isPreview = true)
        }
    }
}

@Composable
private fun LockoutWidget4x2Content(
    context: Context,
    snapshot: LockoutWidgetSnapshot,
    palette: ResolvedWidgetColors,
    isPreview: Boolean = false
) {

    val size = LocalSize.current
    val rawHeight = size.height.value.takeIf { it.isFinite() && it > 0f }
    val widgetHeight = if (isPreview && (rawHeight == null || rawHeight >= 140f)) null else rawHeight
    val widgetWidth = if (isPreview) null else size.width.value.takeIf { it.isFinite() && it > 0f }

    val isTall = !isPreview && widgetHeight != null && widgetHeight >= 200f
    val isSingleRowBar = !isTall && widgetHeight != null && widgetHeight < 104f
    val isCompactShort = !isTall && !isSingleRowBar && widgetHeight != null && widgetHeight < 145f

    val outerPadH = 16.dp
    val outerPadV = when {
        widgetHeight != null && widgetHeight < 80f -> 8.dp
        isSingleRowBar -> 10.dp
        isCompactShort -> 12.dp
        else -> 16.dp
    }
    val cardRadius = if (isSingleRowBar) 22.dp else 24.dp
    val iconSize = if (isTall) 24.dp else 22.dp
    val iconRadius = 6.dp
    val iconGap = 8.dp
    val statusSize = if (isTall) 14f else 13.5f
    val streakFontSize = 12f
    val streakPadH = 10.dp
    val streakPadV = if (isTall) 5.dp else 4.dp
    val startHeight = when {
        widgetHeight != null && widgetHeight < 80f -> 36.dp
        isCompactShort -> 40.dp
        else -> 44.dp
    }
    val startPadH = if (isCompactShort) 16.dp else 18.dp
    val startFontSize = 14f
    val barHeight = if (isTall) 7.dp else 6.dp

    val isNarrow = !isPreview && widgetWidth != null && widgetWidth < 240f
    val isOnBreak = snapshot.isFocusing && snapshot.isOnBreak
    val isInfinite = snapshot.isFocusing && snapshot.isInfinite
    val status = when {
        isOnBreak -> "On break"
        snapshot.isFocusing -> if (isTall) "Focus session" else "Focusing"
        else -> if (isTall) "Ready to focus" else "Lockout"
    }
    val statusColor = when {
        isTall -> palette.textColor
        isOnBreak -> palette.subtextColor
        snapshot.isFocusing -> palette.accentColor
        else -> palette.textColor
    }

    val defaultMins = snapshot.defaultMinutes
    val startLabel = if (isNarrow || defaultMins <= 0) {
        "Start"
    } else {
        "Start ${LockoutWidgetUpdater.formatStartMinutes(defaultMins)}"
    }

    val activeValueText = LockoutWidgetUpdater.formatMinutes(
        when {
            isOnBreak -> snapshot.breakRemainingMinutes
            snapshot.isFocusing -> snapshot.remainingMinutes
            else -> snapshot.todayMinutes
        }
    )
    val valueChars = activeValueText.length
    val narrowOffset = if (isNarrow) 4f else 0f

    val baseNumberSize = when {
        valueChars >= 7 -> if (isCompactShort) 24f else 28f
        valueChars >= 5 -> if (isCompactShort) 28f else 30f
        else -> if (isCompactShort) 30f else 34f
    }
    val numberSize = (baseNumberSize - narrowOffset).coerceAtLeast(22f)

    val unitSize = if (isNarrow) 12f else 12.5f
    val unitGap = 6.dp
    val idleUnitText = if (isNarrow) "today" else "focused today"

    val formattedSessionEnd = if (snapshot.isFocusing && !isOnBreak) {
        when {
            isInfinite -> "Flow state"
            snapshot.sessionEndTimeMs > 0L -> LockoutWidgetUpdater.formatEndAtTime(context, snapshot.sessionEndTimeMs)
            else -> snapshot.sessionEndLabel
        }
    } else {
        ""
    }

    val endLabel = when {
        isOnBreak && snapshot.breakPausedLabel.isNotEmpty() -> {
            if (isNarrow) {
                snapshot.breakPausedLabel.replace(" paused", "").replace("Resumes ", "")
            } else {
                snapshot.breakPausedLabel
            }
        }

        formattedSessionEnd.isNotEmpty() -> {
            if (isNarrow) formattedSessionEnd.replace("Ends at ", "").replace("Ends ", "") else formattedSessionEnd
        }

        else -> ""
    }
    val showTopRightChip = if (isTall) snapshot.streak > 0 else (endLabel.isNotEmpty() || snapshot.streak > 0)
    val topRightText = if (!isTall && endLabel.isNotEmpty()) {
        endLabel
    } else if (isNarrow) {
        "${snapshot.streak}d"
    } else {
        "${snapshot.streak} day streak"
    }
    val activeUnitLabel = when {
        isOnBreak -> "break left"
        isInfinite -> "focused"
        else -> "left"
    }
    val activeProgress = if (isOnBreak) snapshot.breakProgress else snapshot.progress

    if (isTall) {
        val tallCardBg = if (snapshot.isFocusing && !isOnBreak) palette.badgeBg else palette.bgColor
        val tallChipBg = if (snapshot.isFocusing && !isOnBreak) palette.bgColor else palette.badgeBg
        val tallChipText = if (snapshot.isFocusing && !isOnBreak) palette.textColor else palette.badgeTextColor
        val tallTrackBg = if (snapshot.isFocusing && !isOnBreak) palette.bgColor else palette.progressTrackColor
        val tallStartPadH = if (isNarrow) 14.dp else startPadH

        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(cardRadius)
                .background(tallCardBg)
                .clickable(openLockoutAction(context, startTimer = false))
                .padding(horizontal = outerPadH, vertical = outerPadV)
        ) {
            Box(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
                Box(
                    modifier = GlanceModifier.fillMaxWidth().wrapContentHeight(),
                    contentAlignment = Alignment.CenterStart
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = GlanceModifier.wrapContentWidth().wrapContentHeight()
                    ) {
                        WidgetAppIcon(context, iconSize, iconRadius)
                        Spacer(modifier = GlanceModifier.width(iconGap))
                        Text(
                            text = status,
                            maxLines = 1,
                            style = TextStyle(
                                color = statusColor,
                                fontSize = statusSize.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                    }
                }

                if (showTopRightChip) {
                    Box(
                        modifier = GlanceModifier.fillMaxWidth().wrapContentHeight(),
                        contentAlignment = Alignment.CenterEnd
                    ) {
                        Row(
                            modifier = GlanceModifier
                                .background(tallChipBg)
                                .cornerRadius(999.dp)
                                .padding(horizontal = streakPadH, vertical = streakPadV)
                                .wrapContentWidth()
                        ) {
                            Text(
                                text = topRightText,
                                maxLines = 1,
                                style = TextStyle(
                                    color = tallChipText,
                                    fontSize = streakFontSize.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = GlanceModifier.defaultWeight())

            if (snapshot.isFocusing) {
                val tallRunningNumberSize = when {
                    valueChars >= 7 -> 40f
                    valueChars >= 5 -> 48f
                    else -> 56f
                }.let { if (isNarrow) (it - 8f).coerceAtLeast(32f) else it }

                Column(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
                    Row(
                        verticalAlignment = Alignment.Bottom,
                        modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()
                    ) {
                        Text(
                            text = activeValueText,
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.textColor,
                                fontSize = tallRunningNumberSize.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                        Spacer(modifier = GlanceModifier.width(8.dp))
                        Text(
                            text = activeUnitLabel,
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.subtextColor,
                                fontSize = 17f.sp,
                                fontWeight = FontWeight.Normal
                            )
                        )
                    }
                    if (endLabel.isNotEmpty()) {
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        Text(
                            text = endLabel,
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.subtextColor,
                                fontSize = 13.5f.sp,
                                fontWeight = FontWeight.Normal
                            )
                        )
                    }
                }

                Spacer(modifier = GlanceModifier.defaultWeight())

                LinearProgressIndicator(
                    progress = activeProgress.coerceIn(0f, 1f),
                    color = if (isOnBreak) palette.subtextColor else palette.accentColor,
                    backgroundColor = tallTrackBg,
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .height(barHeight)
                        .cornerRadius(999.dp)
                )
            } else {
                val days = snapshot.weeklyDays
                if (days.isNotEmpty()) {
                    val maxFocus = days.maxOf { it.focusSeconds }.coerceAtLeast(1)
                    val isTightTall = widgetHeight != null && widgetHeight < 230f
                    val chartHeaderGap = if (isTightTall) 8.dp else 14.dp
                    val dayInitialGap = if (isTightTall) 4.dp else 6.dp
                    val maxBarRangeDp = if (isTightTall) 24f else 38f
                    val trackBoxHeight = if (isTightTall) 46.dp else 62.dp
                    Column(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
                        Text(
                            text = "Last 7 days",
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.subtextColor,
                                fontSize = 12f.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                        Spacer(modifier = GlanceModifier.height(chartHeaderGap))
                        Row(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
                            days.forEachIndexed { idx, day ->
                                val isTodayBar = idx == days.lastIndex
                                val hasFocus = day.focusSeconds > 0
                                val dayMinutes = when {
                                    day.focusSeconds <= 0 -> 0
                                    day.focusSeconds < 60 -> 1
                                    else -> day.focusSeconds / 60
                                }
                                val barValueLabel = if (dayMinutes >= 60) "${dayMinutes / 60}h" else "${dayMinutes}m"
                                val barHeightDp = if (!hasFocus) {
                                    3.dp
                                } else {
                                    val ratio = (day.focusSeconds.toFloat() / maxFocus.toFloat()).coerceIn(0f, 1f)
                                    (7f + maxBarRangeDp * ratio).dp
                                }
                                val barColor = when {
                                    isTodayBar -> palette.accentColor
                                    hasFocus -> palette.badgeBg
                                    else -> palette.progressTrackColor
                                }
                                val barRadius = if (hasFocus) 6.dp else 2.dp
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = GlanceModifier.defaultWeight().wrapContentHeight()
                                ) {
                                    Box(
                                        contentAlignment = Alignment.BottomCenter,
                                        modifier = GlanceModifier
                                            .fillMaxWidth()
                                            .height(trackBoxHeight)
                                            .padding(horizontal = 4.dp)
                                    ) {
                                        Column(
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()
                                        ) {
                                            if (dayMinutes > 0) {
                                                Text(
                                                    text = barValueLabel,
                                                    maxLines = 1,
                                                    style = TextStyle(
                                                        color = if (isTodayBar) palette.textColor else palette.subtextColor,
                                                        fontSize = 10.5f.sp,
                                                        fontWeight = if (isTodayBar) FontWeight.Medium else FontWeight.Normal
                                                    )
                                                )
                                                Spacer(modifier = GlanceModifier.height(3.dp))
                                            }
                                            Box(
                                                modifier = GlanceModifier
                                                    .fillMaxWidth()
                                                    .height(barHeightDp)
                                                    .cornerRadius(barRadius)
                                                    .background(barColor)
                                            ) {}
                                        }
                                    }
                                    Spacer(modifier = GlanceModifier.height(dayInitialGap))
                                    Text(
                                        text = day.dayInitial,
                                        maxLines = 1,
                                        style = TextStyle(
                                            color = if (isTodayBar) palette.textColor else palette.subtextColor,
                                            fontSize = 11.5f.sp,
                                            fontWeight = if (isTodayBar) FontWeight.Medium else FontWeight.Normal
                                        )
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = GlanceModifier.defaultWeight())
                }

                val stackBottomLabel = widgetWidth != null && widgetWidth < 330f
                val tallIdleNumberSize = when {
                    valueChars >= 7 && stackBottomLabel -> 26f
                    valueChars >= 7 || isNarrow -> 28f
                    stackBottomLabel -> 32f
                    else -> 34f
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()
                ) {
                    if (stackBottomLabel) {
                        Column(modifier = GlanceModifier.defaultWeight().wrapContentHeight()) {
                            Text(
                                text = activeValueText,
                                maxLines = 1,
                                style = TextStyle(
                                    color = palette.textColor,
                                    fontSize = tallIdleNumberSize.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                            Spacer(modifier = GlanceModifier.height(2.dp))
                            Text(
                                text = idleUnitText,
                                maxLines = 1,
                                style = TextStyle(
                                    color = palette.subtextColor,
                                    fontSize = unitSize.sp,
                                    fontWeight = FontWeight.Normal
                                )
                            )
                        }
                    } else {
                        Row(
                            verticalAlignment = Alignment.Bottom,
                            modifier = GlanceModifier.defaultWeight().wrapContentHeight()
                        ) {
                            Text(
                                text = activeValueText,
                                maxLines = 1,
                                style = TextStyle(
                                    color = palette.textColor,
                                    fontSize = tallIdleNumberSize.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                            Spacer(modifier = GlanceModifier.width(6.dp))
                            Text(
                                text = idleUnitText,
                                maxLines = 1,
                                style = TextStyle(
                                    color = palette.subtextColor,
                                    fontSize = unitSize.sp,
                                    fontWeight = FontWeight.Normal
                                )
                            )
                        }
                    }

                    Spacer(modifier = GlanceModifier.width(10.dp))

                    Box(
                        modifier = GlanceModifier
                            .wrapContentWidth()
                            .height(startHeight)
                            .cornerRadius(999.dp)
                            .background(palette.buttonBg)
                            .clickable(openLockoutAction(context, startTimer = true))
                            .padding(horizontal = tallStartPadH),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = startLabel,
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.buttonTextColor,
                                fontSize = startFontSize.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                    }
                }
            }
        }
        return
    }

    if (isSingleRowBar) {
        val barIconSize = 22.dp
        val barValueSize = when {
            valueChars >= 7 -> 20f
            valueChars >= 5 -> 22f
            else -> 26f
        }
        val barSubLabel = if (snapshot.isFocusing) {
            if (endLabel.isNotEmpty()) "$activeUnitLabel • $endLabel" else "$status • $activeUnitLabel"
        } else if (snapshot.streak > 0) {
            if (isNarrow) "${snapshot.streak}d streak" else "$idleUnitText • ${snapshot.streak}d streak"
        } else {
            idleUnitText
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(cardRadius)
                .background(palette.bgColor)
                .clickable(openLockoutAction(context, startTimer = false))
                .padding(horizontal = outerPadH, vertical = outerPadV)
        ) {
            WidgetAppIcon(context, barIconSize, 6.dp)
            Spacer(modifier = GlanceModifier.width(12.dp))
            Column(
                modifier = GlanceModifier.defaultWeight().wrapContentHeight()
            ) {
                Text(
                    text = activeValueText,
                    maxLines = 1,
                    style = TextStyle(
                        color = palette.textColor,
                        fontSize = barValueSize.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
                Spacer(modifier = GlanceModifier.height(2.dp))
                Text(
                    text = barSubLabel,
                    maxLines = 1,
                    style = TextStyle(
                        color = if (snapshot.isFocusing && !isOnBreak) palette.accentColor else palette.subtextColor,
                        fontSize = 12f.sp,
                        fontWeight = FontWeight.Normal
                    )
                )
                if (snapshot.isFocusing) {
                    Spacer(modifier = GlanceModifier.height(6.dp))
                    LinearProgressIndicator(
                        progress = activeProgress.coerceIn(0f, 1f),
                        color = if (isOnBreak) palette.subtextColor else palette.accentColor,
                        backgroundColor = palette.progressTrackColor,
                        modifier = GlanceModifier
                            .fillMaxWidth()
                            .height(5.dp)
                            .cornerRadius(999.dp)
                    )
                }
            }
            if (!snapshot.isFocusing) {
                Spacer(modifier = GlanceModifier.width(12.dp))
                Box(
                    modifier = GlanceModifier
                        .wrapContentWidth()
                        .height(startHeight)
                        .cornerRadius(999.dp)
                        .background(palette.buttonBg)
                        .clickable(openLockoutAction(context, startTimer = true))
                        .padding(horizontal = startPadH),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = startLabel,
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.buttonTextColor,
                            fontSize = startFontSize.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }
            }
        }
        return
    }

    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .cornerRadius(cardRadius)
            .background(palette.bgColor)
            .clickable(openLockoutAction(context, startTimer = false))
            .padding(horizontal = outerPadH, vertical = outerPadV)
    ) {
        Box(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
            Box(
                modifier = GlanceModifier.fillMaxWidth().wrapContentHeight(),
                contentAlignment = Alignment.CenterStart
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = GlanceModifier.wrapContentWidth().wrapContentHeight()
                ) {
                    WidgetAppIcon(context, iconSize, iconRadius)
                    Spacer(modifier = GlanceModifier.width(iconGap))
                    Text(
                        text = status,
                        maxLines = 1,
                        style = TextStyle(
                            color = statusColor,
                            fontSize = statusSize.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }
            }

            if (showTopRightChip) {
                Box(
                    modifier = GlanceModifier.fillMaxWidth().wrapContentHeight(),
                    contentAlignment = Alignment.CenterEnd
                ) {
                    Row(
                        modifier = GlanceModifier
                            .background(palette.badgeBg)
                            .cornerRadius(999.dp)
                            .padding(horizontal = streakPadH, vertical = streakPadV)
                            .wrapContentWidth()
                    ) {
                        Text(
                            text = topRightText,
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.badgeTextColor,
                                fontSize = streakFontSize.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                    }
                }
            }
        }

        Spacer(modifier = GlanceModifier.defaultWeight())

        if (snapshot.isFocusing) {
            Row(
                verticalAlignment = Alignment.Bottom,
                modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()
            ) {
                Text(
                    text = activeValueText,
                    maxLines = 1,
                    style = TextStyle(
                        color = palette.textColor,
                        fontSize = numberSize.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
                Spacer(modifier = GlanceModifier.width(unitGap))
                Text(
                    text = activeUnitLabel,
                    maxLines = 1,
                    style = TextStyle(
                        color = palette.subtextColor,
                        fontSize = unitSize.sp,
                        fontWeight = FontWeight.Normal
                    )
                )
            }

            Spacer(modifier = GlanceModifier.height(12.dp))

            LinearProgressIndicator(
                progress = activeProgress.coerceIn(0f, 1f),
                color = if (isOnBreak) palette.subtextColor else palette.accentColor,
                backgroundColor = palette.progressTrackColor,
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .height(barHeight)
                    .cornerRadius(999.dp)
            )
        } else {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()
            ) {
                Column(modifier = GlanceModifier.defaultWeight().wrapContentHeight()) {
                    Text(
                        text = activeValueText,
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.textColor,
                            fontSize = numberSize.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                    Spacer(modifier = GlanceModifier.height(2.dp))
                    Text(
                        text = idleUnitText,
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.subtextColor,
                            fontSize = unitSize.sp,
                            fontWeight = FontWeight.Normal
                        )
                    )
                }

                Spacer(modifier = GlanceModifier.width(12.dp))

                Box(
                    modifier = GlanceModifier
                        .wrapContentWidth()
                        .height(startHeight)
                        .cornerRadius(999.dp)
                        .background(palette.buttonBg)
                        .clickable(openLockoutAction(context, startTimer = true))
                        .padding(horizontal = startPadH),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = startLabel,
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.buttonTextColor,
                            fontSize = startFontSize.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }
            }
        }
    }
}

internal class LockoutWidget2x2Glance : GlanceAppWidget() {
    override val sizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val initial = LockoutWidgetUpdater.ensureLoaded(context)

        provideContent {
            val observed by LockoutWidgetUpdater.snapshotFlow.collectAsState()
            val snapshot = observed ?: initial
            val palette = LockoutWidgetUpdater.resolveColors(context, snapshot)
            LockoutWidget2x2Content(context, snapshot, palette)
        }
    }

    override suspend fun providePreview(context: Context, widgetCategory: Int) {
        val snapshot = LockoutWidgetUpdater.buildPreviewSnapshot(context)
        val palette = LockoutWidgetUpdater.resolveColors(context, snapshot)
        provideContent {
            LockoutWidget2x2Content(context, snapshot, palette, isPreview = true)
        }
    }
}

@Composable
private fun LockoutWidget2x2Content(
    context: Context,
    snapshot: LockoutWidgetSnapshot,
    palette: ResolvedWidgetColors,
    isPreview: Boolean = false
) {

    val size = LocalSize.current
    val rawHeight = size.height.value.takeIf { it.isFinite() && it > 0f }
    val widgetHeight = if (isPreview && (rawHeight == null || rawHeight >= 140f)) null else rawHeight
    val widgetWidth = if (isPreview) null else size.width.value.takeIf { it.isFinite() && it > 0f }

    val isTall = !isPreview && widgetHeight != null && widgetHeight >= 200f
    val isCompact = !isTall && widgetHeight != null && widgetHeight < 156f
    val isVeryCompact = isCompact && widgetHeight != null && widgetHeight < 126f

    val outerPad = when {
        isVeryCompact -> 10.dp
        isCompact -> 12.dp
        isTall -> 14.dp
        else -> 16.dp
    }
    val cardRadius = if (isCompact) 22.dp else 24.dp
    val iconSize = when {
        isCompact -> 20.dp
        isTall -> 22.dp
        else -> 22.dp
    }
    val iconRadius = 6.dp
    val iconGap = if (isCompact) 6.dp else 8.dp
    val headerLabelSize = if (isCompact) 12.5f else 13.5f
    val footerGap = when {
        isVeryCompact -> 4.dp
        isCompact -> 8.dp
        else -> 12.dp
    }
    val streakFontSize = if (isCompact) 11f else 11.5f
    val streakPadH = 10.dp
    val streakPadV = if (isCompact) 4.dp else 5.dp
    val barHeight = if (isCompact) 5.dp else 6.dp

    val isNarrow = !isPreview && widgetWidth != null && widgetWidth < 138f
    val isOnBreak = snapshot.isFocusing && snapshot.isOnBreak
    val isInfinite = snapshot.isFocusing && snapshot.isInfinite
    val activeValueText = LockoutWidgetUpdater.formatMinutes(
        when {
            isOnBreak -> snapshot.breakRemainingMinutes
            snapshot.isFocusing -> snapshot.remainingMinutes
            else -> snapshot.todayMinutes
        }
    )
    val valueChars = activeValueText.length
    val narrowOffset = if (isNarrow) 2f else 0f
    val baseNumberSize = when {
        valueChars >= 7 -> if (isCompact) 22f else 24f
        valueChars >= 5 -> if (isCompact) 24f else 28f
        else -> if (isCompact) 28f else 32f
    }
    val numberSize = (baseNumberSize - narrowOffset).coerceAtLeast(20f)
    val unitSize = if (isCompact || isNarrow) 11.5f else 12.5f
    val showStreak = snapshot.streak > 0
    val streakText = if (isNarrow) "${snapshot.streak}d" else "${snapshot.streak} day streak"

    val metricSubLabel = when {
        isOnBreak -> "break left"
        isInfinite -> "focused"
        snapshot.isFocusing -> "left"
        isNarrow -> "today"
        else -> "focused today"
    }

    if (isTall) {
        val defaultMins = snapshot.defaultMinutes
        val startLabel = if (isNarrow || defaultMins <= 0) {
            "Start"
        } else {
            "Start ${LockoutWidgetUpdater.formatStartMinutes(defaultMins)}"
        }
        val tallCardBg = if (snapshot.isFocusing && !isOnBreak) palette.badgeBg else palette.bgColor
        val tallTrackBg = if (snapshot.isFocusing && !isOnBreak) palette.bgColor else palette.progressTrackColor
        val tallButtonHeight = if (widgetHeight != null && widgetHeight < 220f) 40.dp else 44.dp
        val formattedSessionEnd = if (snapshot.isFocusing && !isOnBreak) {
            when {
                isInfinite -> "Flow state"
                snapshot.sessionEndTimeMs > 0L -> LockoutWidgetUpdater.formatEndAtTime(context, snapshot.sessionEndTimeMs)
                else -> snapshot.sessionEndLabel
            }
        } else {
            ""
        }
        val tallEndLine = when {
            isOnBreak && snapshot.breakPausedLabel.isNotEmpty() -> snapshot.breakPausedLabel
            formattedSessionEnd.isNotEmpty() -> formattedSessionEnd
            else -> ""
        }

        val tallIdleNumberSize = when {
            valueChars >= 7 -> 36f
            valueChars >= 5 -> 44f
            else -> 48f
        }.let { if (isNarrow) (it - 8f).coerceAtLeast(24f) else it }

        val tallRunningValSize = when {
            valueChars >= 7 -> 32f
            valueChars >= 5 -> 38f
            else -> 46f
        }.let { if (isNarrow) (it - 6f).coerceAtLeast(24f) else it }

        val tallBadgeFontSize = if (isNarrow) 10.5f else 11.5f
        val tallBadgePadH = if (isNarrow) 8.dp else streakPadH

        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(cardRadius)
                .background(tallCardBg)
                .clickable(openLockoutAction(context, startTimer = false))
                .padding(all = outerPad)
        ) {
            Box(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
                Box(
                    modifier = GlanceModifier.fillMaxWidth().wrapContentHeight(),
                    contentAlignment = Alignment.CenterStart
                ) {
                    WidgetAppIcon(context, iconSize, iconRadius)
                }

                if (!snapshot.isFocusing && showStreak) {
                    Box(
                        modifier = GlanceModifier.fillMaxWidth().wrapContentHeight(),
                        contentAlignment = Alignment.CenterEnd
                    ) {
                        Row(
                            modifier = GlanceModifier
                                .background(palette.badgeBg)
                                .cornerRadius(999.dp)
                                .padding(horizontal = tallBadgePadH, vertical = 4.dp)
                                .wrapContentWidth()
                        ) {
                            Text(
                                text = streakText,
                                maxLines = 1,
                                style = TextStyle(
                                    color = palette.badgeTextColor,
                                    fontSize = tallBadgeFontSize.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = GlanceModifier.defaultWeight())

            if (snapshot.isFocusing) {
                Column(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
                    Text(
                        text = if (isOnBreak) "BREAK" else "SESSION",
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.subtextColor,
                            fontSize = 12.5f.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                    Spacer(modifier = GlanceModifier.height(4.dp))
                    Row(
                        verticalAlignment = Alignment.Bottom,
                        modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()
                    ) {
                        Text(
                            text = activeValueText,
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.textColor,
                                fontSize = tallRunningValSize.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                        Spacer(modifier = GlanceModifier.width(5.dp))
                        Text(
                            text = if (isOnBreak) "break" else if (isInfinite) "focused" else "left",
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.subtextColor,
                                fontSize = 14.5f.sp,
                                fontWeight = FontWeight.Normal
                            )
                        )
                    }
                    if (tallEndLine.isNotEmpty()) {
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        Text(
                            text = tallEndLine,
                            maxLines = 1,
                            style = TextStyle(
                                color = palette.subtextColor,
                                fontSize = 13f.sp,
                                fontWeight = FontWeight.Normal
                            )
                        )
                    }
                }

                Spacer(modifier = GlanceModifier.defaultWeight())

                LinearProgressIndicator(
                    progress = (if (isOnBreak) snapshot.breakProgress else snapshot.progress).coerceIn(0f, 1f),
                    color = if (isOnBreak) palette.subtextColor else palette.accentColor,
                    backgroundColor = tallTrackBg,
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .height(barHeight)
                        .cornerRadius(999.dp)
                )
            } else {
                Column(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
                    Text(
                        text = "TODAY",
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.subtextColor,
                            fontSize = 12.5f.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                    Spacer(modifier = GlanceModifier.height(4.dp))
                    Text(
                        text = activeValueText,
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.textColor,
                            fontSize = tallIdleNumberSize.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                    Spacer(modifier = GlanceModifier.height(3.dp))
                    Text(
                        text = metricSubLabel,
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.subtextColor,
                            fontSize = 14f.sp,
                            fontWeight = FontWeight.Normal
                        )
                    )
                }

                Spacer(modifier = GlanceModifier.defaultWeight())

                Box(
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .height(tallButtonHeight)
                        .cornerRadius(999.dp)
                        .background(palette.buttonBg)
                        .clickable(openLockoutAction(context, startTimer = true)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = startLabel,
                        maxLines = 1,
                        style = TextStyle(
                            color = palette.buttonTextColor,
                            fontSize = 14f.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }
            }
        }
        return
    }

    @Composable
    fun Header() {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = GlanceModifier.wrapContentWidth().wrapContentHeight()
        ) {
            WidgetAppIcon(context, iconSize, iconRadius)
            Spacer(modifier = GlanceModifier.width(iconGap))
            Text(
                text = if (isOnBreak) "On break" else if (snapshot.isFocusing) "Focusing" else "Lockout",
                maxLines = 1,
                style = TextStyle(
                    color = when {
                        isOnBreak -> palette.subtextColor
                        snapshot.isFocusing -> palette.accentColor
                        else -> palette.textColor
                    },
                    fontSize = headerLabelSize.sp,
                    fontWeight = FontWeight.Medium
                )
            )
        }
    }

    @Composable
    fun Metric() {
        Column(modifier = GlanceModifier.fillMaxWidth().wrapContentHeight()) {
            Text(
                text = activeValueText,
                maxLines = 1,
                style = TextStyle(
                    color = palette.textColor,
                    fontSize = numberSize.sp,
                    fontWeight = FontWeight.Medium
                )
            )
            Spacer(modifier = GlanceModifier.height(2.dp))
            Text(
                text = metricSubLabel,
                maxLines = 1,
                style = TextStyle(
                    color = palette.subtextColor,
                    fontSize = unitSize.sp,
                    fontWeight = FontWeight.Normal
                )
            )
        }
    }

    @Composable
    fun Footer() {
        if (snapshot.isFocusing) {
            LinearProgressIndicator(
                progress = (if (isOnBreak) snapshot.breakProgress else snapshot.progress).coerceIn(0f, 1f),
                color = if (isOnBreak) palette.subtextColor else palette.accentColor,
                backgroundColor = palette.progressTrackColor,
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .height(barHeight)
                    .cornerRadius(999.dp)
            )
        } else if (showStreak) {
            Row(
                modifier = GlanceModifier
                    .background(palette.badgeBg)
                    .cornerRadius(999.dp)
                    .padding(horizontal = streakPadH, vertical = streakPadV)
                    .wrapContentWidth()
            ) {
                Text(
                    text = streakText,
                    maxLines = 1,
                    style = TextStyle(
                        color = palette.badgeTextColor,
                        fontSize = streakFontSize.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
            }
        }
    }

    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .cornerRadius(cardRadius)
            .background(palette.bgColor)
            .clickable(openLockoutAction(context, startTimer = false))
            .padding(all = outerPad)
    ) {
        if (isCompact) {
            Header()
            Spacer(modifier = GlanceModifier.height(footerGap))
            Metric()
            if (snapshot.isFocusing || showStreak) {
                Spacer(modifier = GlanceModifier.height(footerGap))
                Footer()
            }
        } else {
            Header()
            Spacer(modifier = GlanceModifier.defaultWeight())
            Metric()
            if (snapshot.isFocusing || showStreak) {
                Spacer(modifier = GlanceModifier.defaultWeight())
                Footer()
            }
        }
    }
}
