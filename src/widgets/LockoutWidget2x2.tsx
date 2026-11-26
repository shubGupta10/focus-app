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

export type Widget2x2ColorPalette = {
    bgColor: string;
    textColor: string;
    subtextColor: string;
    badgeBg: string;
    badgeTextColor: string;
    accentColor: string;
    progressTrackColor: string;
};

export type LockoutWidget2x2Props = {
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
    lightPalette?: Widget2x2ColorPalette;
    darkPalette?: Widget2x2ColorPalette;
    bgColor: string;
    textColor: string;
    subtextColor: string;
    badgeBg: string;
    badgeTextColor: string;
    accentColor: string;
    progressTrackColor: string;
};

const LockoutWidget2x2 = (
    props: LockoutWidget2x2Props,
    environment: WidgetEnvironment
) => {
    'widget';

    const widgetSize = (
        environment as WidgetEnvironment & {
            widgetSize?: { width?: number; height?: number };
        }
    )?.widgetSize;

    const g = globalThis as Record<string, unknown>;
    if (!g.__loggedLockoutWidget2x2Size) {
        g.__loggedLockoutWidget2x2Size = true;
        if (typeof console !== 'undefined' && typeof console.log === 'function') {
            console.log('[LockoutWidget2x2] widgetSize:', JSON.stringify(widgetSize ?? null));
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
                : widgetHeight < 190
                    ? 'regular'
                    : 'tall';

    const outerPad = tier === 'compact' ? 12 : 18;
    const cardRadius = tier === 'compact' ? 22 : 24;
    const iconSize = tier === 'compact' ? 24 : 28;
    const iconRadius = tier === 'compact' ? 7 : 8;
    const iconGap = tier === 'compact' ? 6 : 8;
    const headerLabelSize = tier === 'compact' ? 12 : 14;
    const footerGap = tier === 'compact' ? 8 : 12;
    const streakFontSize = tier === 'compact' ? 11 : 12;
    const streakPadH = 10;
    const streakPadV = tier === 'compact' ? 4 : 5;
    const barHeight = tier === 'compact' ? 5 : 7;

    const formatMinutes = (total: number) =>
        total >= 60 ? `${Math.floor(total / 60)}h ${total % 60}m` : `${total}m`;

    const isNarrow = widgetWidth !== null && widgetWidth < 150;
    const isOnBreak = Boolean(props.isFocusing && props.isOnBreak);
    const activeValueText = formatMinutes(
        isOnBreak
            ? (props.breakRemainingMinutes ?? 0)
            : props.isFocusing
              ? (props.remainingMinutes ?? 0)
              : props.todayMinutes
    );
    const valueChars = activeValueText.length;
    const narrowOffset = isNarrow ? 4 : 0;
    // Stack the unit label underneath so the hero number can claim the full card width.
    const baseNumberSize =
        valueChars >= 7
            ? tier === 'compact' ? 24 : tier === 'regular' ? 30 : 34
            : valueChars >= 5
              ? tier === 'compact' ? 28 : tier === 'regular' ? 36 : 42
              : tier === 'compact' ? 34 : tier === 'regular' ? 44 : 50;
    const numberSize = Math.max(20, baseNumberSize - narrowOffset);
    const unitSize = tier === 'compact' || isNarrow ? 12 : 13.5;
    const showStreak = props.streak > 0;
    const streakText = isNarrow
        ? `${props.streak}d`
        : `${props.streak} day streak`;

    const iconNode = props.iconUri ? (
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
    );

    const headerNode = (
        <Row
            verticalAlignment="center"
            modifiers={[wrapContentWidth(), wrapContentHeight()]}
        >
            {iconNode}
            <Spacer modifiers={[width(iconGap)]} />
            <Text
                color={isOnBreak ? subtextColor : props.isFocusing ? accentColor : textColor}
                maxLines={1}
                style={{ fontSize: headerLabelSize, fontWeight: 'bold' }}
            >
                {isOnBreak ? 'On break' : props.isFocusing ? 'Focusing' : 'Lockout'}
            </Text>
        </Row>
    );

    const metricSubLabel = isOnBreak
        ? 'break left'
        : props.isFocusing
          ? 'left'
          : isNarrow
            ? 'today'
            : 'focused today';

    const metricNode = (
        <Column modifiers={[fillMaxWidth(), wrapContentHeight()]}>
            <Text
                color={textColor}
                maxLines={1}
                style={{ fontSize: numberSize, fontWeight: 'bold' }}
            >
                {activeValueText}
            </Text>
            <Spacer modifiers={[height(2)]} />
            <Text
                color={subtextColor}
                maxLines={1}
                style={{ fontSize: unitSize, fontWeight: 'normal' }}
            >
                {metricSubLabel}
            </Text>
        </Column>
    );

    const footerNode = props.isFocusing ? (
        <LinearProgressIndicator
            progress={isOnBreak ? (props.breakProgress ?? 0) : (props.progress ?? 0)}
            color={isOnBreak ? subtextColor : accentColor}
            trackColor={progressTrackColor}
            modifiers={[fillMaxWidth(), height(barHeight), cornerRadius(999)]}
        />
    ) : showStreak ? (
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
                maxLines={1}
                style={{ fontSize: streakFontSize, fontWeight: '500' }}
            >
                {streakText}
            </Text>
        </Row>
    ) : null;

    const card = (
        <Box
            modifiers={[
                background(bgColor),
                cornerRadius(cardRadius),
                padding(outerPad, outerPad, outerPad, outerPad),
                fillMaxSize(),
            ]}
        >
            {tier === 'compact' ? (
                <Box modifiers={[fillMaxSize()]} contentAlignment="centerStart">
                    <Column modifiers={[fillMaxWidth(), wrapContentHeight()]}>
                        {headerNode}
                        <Spacer modifiers={[height(footerGap)]} />
                        {metricNode}
                        {footerNode ? <Spacer modifiers={[height(footerGap)]} /> : null}
                        {footerNode}
                    </Column>
                </Box>
            ) : (
                <Box modifiers={[fillMaxSize()]}>
                    <Box modifiers={[fillMaxSize()]} contentAlignment="topStart">
                        {headerNode}
                    </Box>
                    <Box modifiers={[fillMaxSize()]} contentAlignment="centerStart">
                        {metricNode}
                    </Box>
                    {footerNode ? (
                        <Box modifiers={[fillMaxSize()]} contentAlignment="bottomStart">
                            {footerNode}
                        </Box>
                    ) : null}
                </Box>
            )}
        </Box>
    );
    return (
        <Box key="open_app" modifiers={[fillMaxSize()]}>
            <Button
                onClick={() => { }}
                colors={{
                    containerColor: bgColor,
                    contentColor: textColor,
                }}
                contentPadding={{ start: 0, top: 0, end: 0, bottom: 0 }}
                modifiers={[cornerRadius(cardRadius), fillMaxSize()]}
            >
                {card}
            </Button>
        </Box>
    );
};

export default createWidget<LockoutWidget2x2Props>('LockoutWidget2x2', LockoutWidget2x2, {
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
        accentColor: Colors.light.accent,
        progressTrackColor: Colors.light.border,
    },
    darkPalette: {
        bgColor: Colors.dark.surface,
        textColor: Colors.dark.text,
        subtextColor: Colors.dark.textSecondary,
        badgeBg: Colors.dark.accentMuted,
        badgeTextColor: Colors.dark.accent,
        accentColor: Colors.dark.accent,
        progressTrackColor: Colors.dark.border,
    },
    bgColor: Colors.dark.surface,
    textColor: Colors.dark.text,
    subtextColor: Colors.dark.textSecondary,
    badgeBg: Colors.dark.accentMuted,
    badgeTextColor: Colors.dark.accent,
    accentColor: Colors.dark.accent,
    progressTrackColor: Colors.dark.border,
});
