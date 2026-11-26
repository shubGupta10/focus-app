import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import {
    Box,
    Button,
    Column,
    Image,
    LinearProgressIndicator,
    Row,
    Spacer,
    Text,
    getMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
    background,
    cornerRadius,
    fillMaxSize,
    fillMaxWidth,
    height,
    padding,
    size,
    width,
    wrapContentHeight,
    wrapContentWidth,
} from '@expo/ui/jetpack-compose/modifiers';
import { Colors } from '../constants/Colors';

export type WidgetColorPalette = {
    bgColor: string;
    textColor: string;
    subtextColor: string;
    badgeBg: string;
    badgeTextColor: string;
    buttonBg: string;
    buttonTextColor: string;
    accentColor: string;
    progressTrackColor: string;
};

export type LockoutWidget4x2Props = {
    isFocusing: boolean;
    isOnBreak?: boolean;
    streak: number;
    todayMinutes: number;
    remainingMinutes?: number;
    progress?: number;
    breakRemainingMinutes?: number;
    breakProgress?: number;
    defaultMinutes?: number;
    sessionEndLabel?: string;
    breakPausedLabel?: string;
    iconUri?: string;
    themeMode?: 'system' | 'light' | 'dark';
    useDynamicTheme?: boolean;
    hasCustomOrbTheme?: boolean;
    lightPalette?: WidgetColorPalette;
    darkPalette?: WidgetColorPalette;
    bgColor: string;
    textColor: string;
    subtextColor: string;
    badgeBg: string;
    badgeTextColor: string;
    buttonBg: string;
    buttonTextColor: string;
    accentColor: string;
    progressTrackColor: string;
};

const LockoutWidget4x2 = (
    props: LockoutWidget4x2Props,
    environment: WidgetEnvironment
) => {
    'widget';

    const widgetSize = (
        environment as WidgetEnvironment & {
            widgetSize?: { width?: number; height?: number };
        }
    )?.widgetSize;

    const g = globalThis as Record<string, unknown>;
    if (!g.__loggedLockoutWidget4x2Size) {
        g.__loggedLockoutWidget4x2Size = true;
        if (typeof console !== 'undefined' && typeof console.log === 'function') {
            console.log('[LockoutWidget4x2] widgetSize:', JSON.stringify(widgetSize ?? null));
        }
    }

    const scheme: 'light' | 'dark' =
        props.themeMode === 'light' || props.themeMode === 'dark'
            ? props.themeMode
            : environment?.colorScheme === 'light'
                ? 'light'
                : 'dark';

    const toHex6 = (c: unknown, fallback: string) => {
        if (typeof c !== 'string' || !c) return fallback;
        if (c.startsWith('#') && c.length === 9) return c.slice(0, 7);
        return c;
    };

    let liveMaterial: Record<string, string> | null = null;
    if (props.useDynamicTheme && !props.hasCustomOrbTheme) {
        try {
            liveMaterial = getMaterialColors({ scheme }) as unknown as Record<string, string>;
        } catch {
            liveMaterial = null;
        }
    }

    const savedPalette =
        scheme === 'light' ? props.lightPalette : props.darkPalette;

    const bgColor = liveMaterial
        ? toHex6(liveMaterial.surfaceContainer, savedPalette?.bgColor ?? props.bgColor ?? (scheme === 'light' ? '#ECEEF4' : '#1D2024'))
        : savedPalette?.bgColor ?? props.bgColor ?? (scheme === 'light' ? '#ECEEF4' : '#1D2024');
    const textColor = liveMaterial
        ? toHex6(liveMaterial.onSurface, savedPalette?.textColor ?? props.textColor ?? (scheme === 'light' ? '#181C20' : '#E0E2E8'))
        : savedPalette?.textColor ?? props.textColor ?? (scheme === 'light' ? '#181C20' : '#E0E2E8');
    const subtextColor = liveMaterial
        ? toHex6(liveMaterial.onSurfaceVariant, savedPalette?.subtextColor ?? props.subtextColor ?? (scheme === 'light' ? '#42474E' : '#C2C7CF'))
        : savedPalette?.subtextColor ?? props.subtextColor ?? (scheme === 'light' ? '#42474E' : '#C2C7CF');
    const badgeBg = liveMaterial
        ? toHex6(liveMaterial.primaryContainer, savedPalette?.badgeBg ?? props.badgeBg ?? (scheme === 'light' ? '#CFE5FF' : '#294967'))
        : savedPalette?.badgeBg ?? props.badgeBg ?? (scheme === 'light' ? '#CFE5FF' : '#294967');
    const badgeTextColor = liveMaterial
        ? toHex6(liveMaterial.onPrimaryContainer, savedPalette?.badgeTextColor ?? props.badgeTextColor ?? (scheme === 'light' ? '#416180' : '#AACAEE'))
        : savedPalette?.badgeTextColor ?? props.badgeTextColor ?? (scheme === 'light' ? '#416180' : '#AACAEE');
    const buttonBg = liveMaterial
        ? toHex6(liveMaterial.primary, savedPalette?.buttonBg ?? props.buttonBg ?? (scheme === 'light' ? '#416180' : '#AACAEE'))
        : savedPalette?.buttonBg ?? props.buttonBg ?? (scheme === 'light' ? '#416180' : '#AACAEE');
    const buttonTextColor = liveMaterial
        ? toHex6(liveMaterial.onPrimary, savedPalette?.buttonTextColor ?? props.buttonTextColor ?? (scheme === 'light' ? '#FFFFFF' : '#0E334F'))
        : savedPalette?.buttonTextColor ?? props.buttonTextColor ?? (scheme === 'light' ? '#FFFFFF' : '#0E334F');
    const accentColor = liveMaterial
        ? toHex6(liveMaterial.primary, savedPalette?.accentColor ?? props.accentColor ?? (scheme === 'light' ? '#416180' : '#AACAEE'))
        : savedPalette?.accentColor ?? props.accentColor ?? (scheme === 'light' ? '#416180' : '#AACAEE');
    const progressTrackColor = liveMaterial
        ? toHex6(liveMaterial.outlineVariant, savedPalette?.progressTrackColor ?? props.progressTrackColor ?? (scheme === 'light' ? '#C2C7CF' : '#42474E'))
        : savedPalette?.progressTrackColor ?? props.progressTrackColor ?? (scheme === 'light' ? '#C2C7CF' : '#42474E');

    const widgetHeight =
        typeof widgetSize?.height === 'number' && widgetSize.height > 0
            ? widgetSize.height
            : null;
    const widgetWidth =
        typeof widgetSize?.width === 'number' && widgetSize.width > 0
            ? widgetSize.width
            : null;

    const tier =
        widgetHeight === null
            ? 'regular'
            : widgetHeight < 140
                ? 'compact'
                : widgetHeight < 170
                    ? 'regular'
                    : 'tall';

    const outerPadH = tier === 'compact' ? 14 : tier === 'regular' ? 18 : 20;
    const outerPadV = tier === 'compact' ? 12 : tier === 'regular' ? 18 : 22;
    const cardRadius = tier === 'compact' ? 22 : 24;
    const iconSize = tier === 'compact' ? 24 : tier === 'regular' ? 30 : 32;
    const iconRadius = tier === 'compact' ? 7 : 8;
    const iconGap = tier === 'compact' ? 8 : 10;
    const statusSize = tier === 'compact' ? 14 : tier === 'regular' ? 15 : 15.5;
    const streakFontSize = tier === 'compact' ? 11 : 12.5;
    const streakPadH = tier === 'compact' ? 10 : 12;
    const streakPadV = tier === 'compact' ? 4 : 6;
    const startHeight = tier === 'compact' ? 36 : tier === 'regular' ? 50 : 52;
    const startPadH = tier === 'compact' ? 16 : 22;
    const startFontSize = tier === 'compact' ? 14 : 15.5;
    const barHeight = tier === 'compact' ? 5 : tier === 'regular' ? 6 : 7;
    const barGap = tier === 'compact' ? 8 : 12;

    const formatMinutes = (total: number) =>
        total >= 60 ? `${Math.floor(total / 60)}h ${total % 60}m` : `${total}m`;

    const formatStartMinutes = (total: number) =>
        total >= 60
            ? total % 60 === 0
                ? `${Math.floor(total / 60)}h`
                : `${Math.floor(total / 60)}h ${total % 60}m`
            : `${total}m`;

    const isNarrow = widgetWidth !== null && widgetWidth < 270;
    const isOnBreak = Boolean(props.isFocusing && props.isOnBreak);
    const status = isOnBreak ? 'On break' : props.isFocusing ? 'Focusing' : 'Lockout';
    const statusColor = isOnBreak ? subtextColor : props.isFocusing ? accentColor : textColor;
    const defaultMins = props.defaultMinutes ?? 25;
    const startLabel =
        isNarrow || defaultMins <= 0
            ? 'Start'
            : `Start ${formatStartMinutes(defaultMins)}`;
    const activeValueText = formatMinutes(
        isOnBreak
            ? (props.breakRemainingMinutes ?? 0)
            : props.isFocusing
              ? (props.remainingMinutes ?? 0)
              : props.todayMinutes
    );
    const valueChars = activeValueText.length;
    const numberSize = props.isFocusing
        ? valueChars >= 7
            ? tier === 'compact' || isNarrow ? 22 : tier === 'regular' ? 32 : 36
            : valueChars >= 5
              ? tier === 'compact' || isNarrow ? 26 : tier === 'regular' ? 38 : 42
              : tier === 'compact' || isNarrow ? 30 : tier === 'regular' ? 44 : 48
        : valueChars >= 7
          ? tier === 'compact' || isNarrow ? 20 : tier === 'regular' ? 28 : 32
          : valueChars >= 5
            ? tier === 'compact' || isNarrow ? 24 : tier === 'regular' ? 34 : 38
            : tier === 'compact' || isNarrow ? 30 : tier === 'regular' ? 44 : 48;
    const unitSize = props.isFocusing
        ? valueChars >= 7
            ? tier === 'compact' || isNarrow ? 12.5 : 14
            : valueChars >= 5
              ? tier === 'compact' || isNarrow ? 13 : 15
              : tier === 'compact' || isNarrow ? 14 : 16
        : valueChars >= 7
          ? tier === 'compact' || isNarrow ? 12 : 13.5
          : valueChars >= 5
            ? tier === 'compact' || isNarrow ? 12.5 : 14
            : tier === 'compact' || isNarrow ? 13.5 : 15.5;
    const unitGap = valueChars >= 5 ? 6 : 8;
    const idleUnitText =
        valueChars >= 7 || ((tier === 'compact' || isNarrow) && valueChars >= 5) || isNarrow
            ? 'today'
            : 'focused today';
    const endLabel =
        isOnBreak && props.breakPausedLabel
            ? isNarrow
                ? props.breakPausedLabel.replace(' paused', '').replace('Resumes ', '')
                : props.breakPausedLabel
            : props.isFocusing && props.sessionEndLabel
              ? isNarrow
                  ? props.sessionEndLabel.replace('Ends ', '')
                  : props.sessionEndLabel
              : '';
    const showTopRightChip = Boolean(endLabel) || props.streak > 0;
    const topRightText = endLabel
        ? endLabel
        : isNarrow
            ? `${props.streak}d`
            : `${props.streak} day streak`;
    const activeUnitLabel = isOnBreak ? 'break left' : 'left';
    const activeProgress = isOnBreak ? (props.breakProgress ?? 0) : (props.progress ?? 0);

    return (
        <Box modifiers={[fillMaxSize()]}>
            <Button
                onClick={() => { }}
                colors={{
                    containerColor: bgColor,
                    contentColor: textColor,
                }}
                contentPadding={{
                    start: outerPadH,
                    top: outerPadV,
                    end: outerPadH,
                    bottom: outerPadV,
                }}
                modifiers={[cornerRadius(cardRadius), fillMaxSize()]}
            >
                <Box modifiers={[fillMaxSize()]}>
            <Box modifiers={[fillMaxSize()]} contentAlignment="topStart">
                <Box modifiers={[fillMaxWidth(), wrapContentHeight()]}>
                    <Box modifiers={[fillMaxWidth(), wrapContentHeight()]} contentAlignment="centerStart">
                        <Row
                            verticalAlignment="center"
                            modifiers={[wrapContentWidth(), wrapContentHeight()]}
                        >
                            {props.iconUri ? (
                                <Image
                                    source={{ uri: props.iconUri }}
                                    modifiers={[size(iconSize, iconSize), cornerRadius(iconRadius)]}
                                />
                            ) : (
                                <Box
                                    modifiers={[
                                        size(iconSize, iconSize),
                                        background('#92485A'),
                                        cornerRadius(iconRadius),
                                    ]}
                                />
                            )}
                            <Spacer modifiers={[width(iconGap)]} />
                            <Text
                                color={statusColor}
                                style={{ fontSize: statusSize, fontWeight: 'bold' }}
                            >
                                {status}
                            </Text>
                        </Row>
                    </Box>

                    {showTopRightChip ? (
                        <Box modifiers={[fillMaxWidth(), wrapContentHeight()]} contentAlignment="centerEnd">
                            <Row
                                modifiers={[
                                    background(badgeBg),
                                    cornerRadius(999),
                                    padding(streakPadH, streakPadV, streakPadH, streakPadV),
                                    wrapContentWidth(),
                                ]}
                            >
                                <Text
                                    color={badgeTextColor}
                                    style={{ fontSize: streakFontSize, fontWeight: '500' }}
                                >
                                    {topRightText}
                                </Text>
                            </Row>
                        </Box>
                    ) : null}
                </Box>
            </Box>

            <Box modifiers={[fillMaxSize()]} contentAlignment="bottomStart">
                {props.isFocusing ? (
                    <Column modifiers={[fillMaxWidth(), wrapContentHeight()]}>
                        <Row verticalAlignment="bottom" modifiers={[wrapContentHeight()]}>
                            <Text
                                color={textColor}
                                maxLines={1}
                                style={{ fontSize: numberSize, fontWeight: 'bold' }}
                            >
                                {activeValueText}
                            </Text>
                            <Spacer modifiers={[width(unitGap)]} />
                            <Text
                                color={subtextColor}
                                maxLines={1}
                                style={{ fontSize: unitSize, fontWeight: 'normal' }}
                            >
                                {activeUnitLabel}
                            </Text>
                        </Row>
                        <Spacer modifiers={[height(barGap)]} />
                        <LinearProgressIndicator
                            progress={activeProgress}
                            color={isOnBreak ? subtextColor : accentColor}
                            trackColor={progressTrackColor}
                            modifiers={[fillMaxWidth(), height(barHeight), cornerRadius(999)]}
                        />
                    </Column>
                ) : (
                    <Box modifiers={[wrapContentWidth(), height(startHeight)]} contentAlignment="centerStart">
                        <Row
                            verticalAlignment="bottom"
                            modifiers={[wrapContentWidth(), wrapContentHeight()]}
                        >
                            <Text
                                color={textColor}
                                maxLines={1}
                                style={{ fontSize: numberSize, fontWeight: 'bold' }}
                            >
                                {activeValueText}
                            </Text>
                            <Spacer modifiers={[width(unitGap)]} />
                            <Text
                                color={subtextColor}
                                maxLines={1}
                                style={{ fontSize: unitSize, fontWeight: 'normal' }}
                            >
                                {idleUnitText}
                            </Text>
                        </Row>
                    </Box>
                )}
            </Box>
                </Box>
            </Button>
            {!props.isFocusing ? (
                <Box
                    key="start_timer"
                    modifiers={[
                        fillMaxSize(),
                        padding(outerPadH, outerPadV, outerPadH, outerPadV),
                    ]}
                    contentAlignment="bottomEnd"
                >
                    <Button
                        onClick={() => { }}
                        colors={{
                            containerColor: buttonBg,
                            contentColor: buttonTextColor,
                        }}
                        contentPadding={{
                            start: startPadH,
                            top: 0,
                            end: startPadH,
                            bottom: 0,
                        }}
                        modifiers={[
                            cornerRadius(999),
                            wrapContentWidth(),
                            height(startHeight),
                        ]}
                    >
                        <Row
                            verticalAlignment="center"
                            modifiers={[wrapContentWidth(), wrapContentHeight()]}
                        >
                            <Text
                                color={buttonTextColor}
                                style={{ fontSize: startFontSize, fontWeight: 'bold' }}
                            >
                                {startLabel}
                            </Text>
                        </Row>
                    </Button>
                </Box>
            ) : null}
        </Box>
    );
};

export default createWidget<LockoutWidget4x2Props>('LockoutWidget4x2', LockoutWidget4x2, {
    isFocusing: false,
    isOnBreak: false,
    streak: 0,
    todayMinutes: 0,
    remainingMinutes: 0,
    progress: 0,
    breakRemainingMinutes: 0,
    breakProgress: 0,
    defaultMinutes: 25,
    sessionEndLabel: '',
    breakPausedLabel: '',
    iconUri: '',
    themeMode: 'system',
    useDynamicTheme: false,
    hasCustomOrbTheme: false,
    lightPalette: {
        bgColor: Colors.light.surface,
        textColor: Colors.light.text,
        subtextColor: Colors.light.textSecondary,
        badgeBg: Colors.light.accentMuted,
        badgeTextColor: Colors.light.accent,
        buttonBg: Colors.light.accent,
        buttonTextColor: Colors.light.accentForeground,
        accentColor: Colors.light.accent,
        progressTrackColor: Colors.light.border,
    },
    darkPalette: {
        bgColor: Colors.dark.surface,
        textColor: Colors.dark.text,
        subtextColor: Colors.dark.textSecondary,
        badgeBg: Colors.dark.accentMuted,
        badgeTextColor: Colors.dark.accent,
        buttonBg: Colors.dark.accent,
        buttonTextColor: Colors.dark.accentForeground,
        accentColor: Colors.dark.accent,
        progressTrackColor: Colors.dark.border,
    },
    bgColor: Colors.dark.surface,
    textColor: Colors.dark.text,
    subtextColor: Colors.dark.textSecondary,
    badgeBg: Colors.dark.accentMuted,
    badgeTextColor: Colors.dark.accent,
    buttonBg: Colors.dark.accent,
    buttonTextColor: Colors.dark.accentForeground,
    accentColor: Colors.dark.accent,
    progressTrackColor: Colors.dark.border,
});
