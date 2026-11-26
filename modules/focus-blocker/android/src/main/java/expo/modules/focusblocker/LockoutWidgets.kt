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

open class LockoutWidget4x2GlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget get() = LockoutWidget4x2Instance
}

open class LockoutWidget2x2GlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget get() = LockoutWidget2x2Instance
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

            val size = LocalSize.current
            val widgetHeight = size.height.value.takeIf { it.isFinite() && it > 0f }
            val widgetWidth = size.width.value.takeIf { it.isFinite() && it > 0f }

            val tier = when {
                widgetHeight == null -> "regular"
                widgetHeight < 140f -> "compact"
                widgetHeight < 170f -> "regular"
                else -> "tall"
            }

            val outerPadH = when (tier) { "compact" -> 14.dp; "regular" -> 18.dp; else -> 20.dp }
            val outerPadV = when (tier) { "compact" -> 10.dp; "regular" -> 16.dp; else -> 20.dp }
            val cardRadius = if (tier == "compact") 22.dp else 24.dp
            val iconSize = when (tier) { "compact" -> 22.dp; "regular" -> 28.dp; else -> 30.dp }
            val iconRadius = if (tier == "compact") 7.dp else 8.dp
            val iconGap = if (tier == "compact") 8.dp else 10.dp
            val statusSize = when (tier) { "compact" -> 13.5f; "regular" -> 15f; else -> 15.5f }
            val streakFontSize = if (tier == "compact") 11f else 12.5f
            val streakPadH = if (tier == "compact") 10.dp else 12.dp
            val streakPadV = if (tier == "compact") 4.dp else 6.dp
            val startHeight = when (tier) { "compact" -> 34.dp; "regular" -> 46.dp; else -> 48.dp }
            val startPadH = if (tier == "compact") 16.dp else 22.dp
            val startFontSize = if (tier == "compact") 13.5f else 15.5f
            val barHeight = when (tier) { "compact" -> 5.dp; "regular" -> 6.dp; else -> 7.dp }
            val heroTopOffset = if (snapshot.isFocusing) {
                when (tier) { "compact" -> 4.dp; "regular" -> 12.dp; else -> 14.dp }
            } else {
                when (tier) { "compact" -> 10.dp; "regular" -> 24.dp; else -> 30.dp }
            }

            val isNarrow = widgetWidth != null && widgetWidth < 270f
            val isOnBreak = snapshot.isFocusing && snapshot.isOnBreak
            val isInfinite = snapshot.isFocusing && snapshot.isInfinite
            val status = when {
                isOnBreak -> "On break"
                snapshot.isFocusing -> "Focusing"
                else -> "Lockout"
            }
            val statusColor = when {
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
                valueChars >= 7 -> when (tier) { "compact" -> 24f; "regular" -> 34f; else -> 38f }
                valueChars >= 5 -> when (tier) { "compact" -> 28f; "regular" -> 40f; else -> 46f }
                else -> when (tier) { "compact" -> 32f; "regular" -> 46f; else -> 52f }
            }
            val numberSize = (baseNumberSize - narrowOffset).coerceAtLeast(22f)

            val unitSize = if (tier == "compact" || isNarrow) 12.5f else 14.5f
            val unitGap = if (valueChars >= 5) 6.dp else 8.dp
            val idleUnitText = if (isNarrow) "today" else "focused today"

            val endLabel = when {
                isOnBreak && snapshot.breakPausedLabel.isNotEmpty() -> {
                    if (isNarrow) {
                        snapshot.breakPausedLabel.replace(" paused", "").replace("Resumes ", "")
                    } else {
                        snapshot.breakPausedLabel
                    }
                }
                snapshot.isFocusing && snapshot.sessionEndLabel.isNotEmpty() -> {
                    if (isNarrow) snapshot.sessionEndLabel.replace("Ends ", "") else snapshot.sessionEndLabel
                }
                else -> ""
            }
            val showTopRightChip = endLabel.isNotEmpty() || snapshot.streak > 0
            val topRightText = if (endLabel.isNotEmpty()) {
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

            Box(modifier = GlanceModifier.fillMaxSize()) {
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
                                        fontWeight = FontWeight.Bold
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
                    Spacer(modifier = GlanceModifier.height(heroTopOffset))

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
                                    fontWeight = FontWeight.Bold
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

                        Spacer(modifier = GlanceModifier.defaultWeight())

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
                            Text(
                                text = activeValueText,
                                maxLines = 1,
                                style = TextStyle(
                                    color = palette.textColor,
                                    fontSize = numberSize.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        Spacer(modifier = GlanceModifier.defaultWeight())

                        Box(
                            modifier = GlanceModifier.wrapContentWidth().height(startHeight),
                            contentAlignment = Alignment.CenterStart
                        ) {
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
                }

                if (!snapshot.isFocusing) {
                    Box(
                        modifier = GlanceModifier
                            .fillMaxSize()
                            .padding(horizontal = outerPadH, vertical = outerPadV),
                        contentAlignment = Alignment.BottomEnd
                    ) {
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
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
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

            val size = LocalSize.current
            val widgetHeight = size.height.value.takeIf { it.isFinite() && it > 0f }
            val widgetWidth = size.width.value.takeIf { it.isFinite() && it > 0f }

            val tier = when {
                widgetHeight == null -> "regular"
                widgetHeight < 140f -> "compact"
                widgetHeight < 190f -> "regular"
                else -> "tall"
            }

            val outerPad = when (tier) { "compact" -> 12.dp; "regular" -> 16.dp; else -> 18.dp }
            val cardRadius = if (tier == "compact") 22.dp else 24.dp
            val iconSize = if (tier == "compact") 24.dp else 28.dp
            val iconRadius = if (tier == "compact") 7.dp else 8.dp
            val iconGap = if (tier == "compact") 6.dp else 8.dp
            val headerLabelSize = if (tier == "compact") 12f else 14f
            val footerGap = if (tier == "compact") 8.dp else 12.dp
            val streakFontSize = if (tier == "compact") 11f else 12f
            val streakPadH = 10.dp
            val streakPadV = if (tier == "compact") 4.dp else 5.dp
            val barHeight = if (tier == "compact") 5.dp else 7.dp

            val isNarrow = widgetWidth != null && widgetWidth < 150f
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
            val narrowOffset = if (isNarrow) 4f else 0f
            val baseNumberSize = when {
                valueChars >= 7 -> when (tier) { "compact" -> 24f; "regular" -> 30f; else -> 34f }
                valueChars >= 5 -> when (tier) { "compact" -> 28f; "regular" -> 36f; else -> 42f }
                else -> when (tier) { "compact" -> 34f; "regular" -> 44f; else -> 50f }
            }
            val numberSize = (baseNumberSize - narrowOffset).coerceAtLeast(20f)
            val unitSize = if (tier == "compact" || isNarrow) 12f else 13.5f
            val showStreak = snapshot.streak > 0
            val streakText = if (isNarrow) "${snapshot.streak}d" else "${snapshot.streak} day streak"

            val metricSubLabel = when {
                isOnBreak -> "break left"
                isInfinite -> "focused"
                snapshot.isFocusing -> "left"
                isNarrow -> "today"
                else -> "focused today"
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
                            fontWeight = FontWeight.Bold
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
                            fontWeight = FontWeight.Bold
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
                if (tier == "compact") {
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
    }
}
