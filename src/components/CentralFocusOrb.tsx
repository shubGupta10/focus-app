import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, Vibration, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CentralFocusOrbProps {
    isActive?: boolean;
    timeLeft?: string;
    earnedCoins?: number;
    sessionProgress?: number | null;
    minuteProgress?: number | null;
    isInfinite?: boolean;
    isStrict?: boolean;
    skipsRemaining?: number;
    onStartPress?: () => void;
    onStopPress?: () => void;
}

export function CentralFocusOrb({
    isActive = false,
    timeLeft = "00:00",
    earnedCoins = 0,
    sessionProgress = null,
    minuteProgress = null,
    isInfinite = false,
    isStrict = false,
    skipsRemaining = 1,
    onStartPress,
    onStopPress,
}: CentralFocusOrbProps) {
    const { colors } = useTheme();
    const holdProgress = useRef(new Animated.Value(0)).current;
    const holdTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showHoldHint, setShowHoldHint] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const breathAnim = useRef(new Animated.Value(1)).current;
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const colorAccent = colors.accent;
    const colorTrack = colors.border;
    const colorDotCenter = colors.text;

    const outerRadius = 156;
    const outerCircumference = 2 * Math.PI * outerRadius;
    const clampedSession = sessionProgress !== null ? Math.max(0, Math.min(1, sessionProgress)) : 1;
    const outerOffset = outerCircumference * (1 - clampedSession);

    const innerRadius = 126;
    const innerCircumference = 2 * Math.PI * innerRadius;
    const clampedMinute = minuteProgress !== null ? Math.max(0, Math.min(1, minuteProgress)) : 1;
    const innerOffset = innerCircumference * (1 - clampedMinute);

    const minuteAngle = -Math.PI / 2 + clampedMinute * 2 * Math.PI;
    const dotX = 170 + innerRadius * Math.cos(minuteAngle);
    const dotY = 170 + innerRadius * Math.sin(minuteAngle);

    // Subtle, serene breathing animation when active
    useEffect(() => {
        if (!isActive) {
            breathAnim.setValue(1);
            return;
        }

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(breathAnim, {
                    toValue: 1.035,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(breathAnim, {
                    toValue: 0.985,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [isActive]);

    useEffect(() => {
        return () => {
            if (holdTimeRef.current) {
                clearTimeout(holdTimeRef.current);
            }
        };
    }, []);

    const handlePressIn = () => {
        if (!isActive) return;

        if (isStrict && skipsRemaining <= 0) {
            try {
                Vibration.vibrate([0, 30, 40, 30]);
            } catch (error) {}
            setShowHoldHint(true);
            setTimeout(() => setShowHoldHint(false), 2500);
            return;
        }

        try { Vibration.vibrate(10); } catch {}
        setIsHolding(true);

        Animated.timing(holdProgress, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: false,
        }).start();

        holdTimeRef.current = setTimeout(() => {
            try { Vibration.vibrate([0, 40, 60, 40]); } catch {}
            setIsHolding(false);
            onStopPress?.();
        }, 10000);
    };

    const handlePressOut = () => {
        if (!isActive) return;

        setIsHolding(false);
        if (holdTimeRef.current) {
            clearTimeout(holdTimeRef.current);
            holdTimeRef.current = null;
        }

        Animated.timing(holdProgress, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    // Core active radius for hold feedback ring
    const coreRadius = 96;

    return (
        <View className="items-center justify-center w-[340px] h-[340px]">
            {/* Concentric Progress Rings */}
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    {/* Outer Track & Session Progress */}
                    <Circle
                        cx="170"
                        cy="170"
                        r={outerRadius}
                        stroke={colorTrack}
                        strokeWidth="2.5"
                        fill="none"
                        opacity={0.35}
                    />
                    {isActive && clampedSession > 0 && (
                        <Circle
                            cx="170"
                            cy="170"
                            r={outerRadius}
                            stroke={colorAccent}
                            strokeWidth="3.5"
                            fill="none"
                            strokeDasharray={outerCircumference}
                            strokeDashoffset={outerOffset}
                            strokeLinecap="round"
                            transform="rotate(-90 170 170)"
                        />
                    )}

                    {/* Inner Track & Minute Orbit */}
                    <Circle
                        cx="170"
                        cy="170"
                        r={innerRadius}
                        stroke={colorTrack}
                        strokeWidth="1.5"
                        fill="none"
                        opacity={0.35}
                    />
                    {isActive && clampedMinute > 0 && (
                        <>
                            <Circle
                                cx="170"
                                cy="170"
                                r={innerRadius}
                                stroke={colorAccent}
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray={innerCircumference}
                                strokeDashoffset={innerOffset}
                                strokeLinecap="round"
                                transform="rotate(-90 170 170)"
                                opacity={0.65}
                            />
                            {/* Glowing Orbiting Second Dot */}
                            <Circle
                                cx={dotX}
                                cy={dotY}
                                r="8"
                                fill={colorAccent}
                                opacity={0.25}
                            />
                            <Circle
                                cx={dotX}
                                cy={dotY}
                                r="4.5"
                                fill={colorAccent}
                            />
                            <Circle
                                cx={dotX}
                                cy={dotY}
                                r="2"
                                fill={colorDotCenter}
                            />
                        </>
                    )}

                    {/* Active Hold Progress Ring (sweeps around the center disc) */}
                    {isActive && (
                        <AnimatedCircle
                            cx="170"
                            cy="170"
                            r={coreRadius + 3}
                            stroke={isStrict && skipsRemaining <= 0 ? colors.warning : colors.destructive}
                            strokeWidth="5"
                            fill="none"
                            strokeDasharray={2 * Math.PI * (coreRadius + 3)}
                            strokeDashoffset={holdProgress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [2 * Math.PI * (coreRadius + 3), 0],
                            })}
                            strokeLinecap="round"
                            transform="rotate(-90 170 170)"
                        />
                    )}
                </Svg>
            </View>

            {/* Center Interactive Orb */}
            {isActive ? (
                <Animated.View
                    style={{
                        transform: [{ scale: breathAnim }],
                    }}
                >
                    <Pressable
                        onPress={() => {
                            setShowHoldHint(true);
                            setTimeout(() => setShowHoldHint(false), 2200);
                        }}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        className={`w-48 h-48 rounded-full items-center justify-center border shadow-2xl ${
                            isHolding
                                ? "bg-destructiveMuted/30 border-destructive"
                                : "bg-surfaceElevated border-border"
                        }`}
                        accessibilityRole="button"
                        accessibilityLabel={`Active focus session. ${timeLeft} remaining. Press and hold to stop.`}
                    >
                        {/* Top Indicator (Fixed height to prevent shift) */}
                        <View className="flex-row items-center justify-center h-4 mb-2">
                            <Text
                                className={`font-black text-[12px] tracking-widest uppercase ${
                                    isStrict && skipsRemaining <= 0 ? "text-warning" : "text-destructive"
                                }`}
                            >
                                {isHolding
                                    ? "HOLDING TO END..."
                                    : showHoldHint
                                    ? isStrict
                                        ? skipsRemaining <= 0
                                            ? "NO SKIPS LEFT"
                                            : "HOLD TO SKIP"
                                        : "HOLD TO END"
                                    : ""}
                            </Text>
                        </View>

                        {/* Hero Digital Timer */}
                        <Text
                            className="text-text font-black text-5xl tracking-tight tabular-nums text-center"
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                            numberOfLines={1}
                        >
                            {timeLeft}
                        </Text>

                        {/* Bottom Label */}
                        <Text className="text-textSecondary text-xs font-bold tracking-widest uppercase mt-2">
                            {isInfinite ? "Elapsed" : "Remaining"}
                        </Text>
                    </Pressable>
                </Animated.View>
            ) : (
                /* Idle Home Orb: Play button */
                <Pressable
                    onPress={() => {
                        try { Vibration.vibrate(12); } catch {}
                        onStartPress?.();
                    }}
                    className="w-44 h-44 rounded-full bg-accent items-center justify-center shadow-2xl active:opacity-85"
                    accessibilityRole="button"
                    accessibilityLabel="Start focus session"
                    accessibilityHint="Double tap to configure and begin a focus session"
                >
                    <View className="items-center justify-center ml-1.5">
                        <Ionicons name="play" size={72} color={colors.accentForeground} />
                    </View>
                </Pressable>
            )}
        </View>
    );
}
