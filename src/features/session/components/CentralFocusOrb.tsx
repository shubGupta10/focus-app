import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/hooks/useSettings";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, Vibration, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ClassicProgressBackground } from "./orb-themes/ClassicProgressBackground";
import { SolarSystemBackground } from "./orb-themes/SolarSystemBackground";

interface CentralFocusOrbProps {
    isActive?: boolean;
    timeLeft?: string;
    earnedCoins?: number;
    sessionProgress?: number | null;
    minuteProgress?: number | null;
    isInfinite?: boolean;
    isStrict?: boolean;
    skipsRemaining?: number;
    theme?: 'classic' | 'solar';
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
    theme = 'solar',
    onStartPress,
    onStopPress,
}: CentralFocusOrbProps) {
    const { colors } = useTheme();
    const { getSetting } = useSettings();
    const [orbTheme, setOrbTheme] = useState("theme_default");
    const [orbAnimation, setOrbAnimation] = useState("animation_solar");
    const holdProgress = useRef(new Animated.Value(0)).current;
    const holdTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestOnStopPress = useRef(onStopPress);
    const [showHoldHint, setShowHoldHint] = useState(false);
    const [isHolding, setIsHolding] = useState(false);

    useEffect(() => {
        latestOnStopPress.current = onStopPress;
    }, [onStopPress]);


    useFocusEffect(
        useCallback(() => {
            getSetting("equipped_orb_theme").then(val => {
                if (val) setOrbTheme(val);
            })
            getSetting("equipped_orb_animation").then(val => {
                if (val) setOrbAnimation(val);
            })
        }, [getSetting])
    )

    const breathAnim = useRef(new Animated.Value(1)).current;
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const colorAccent = colors.accent;
    const colorTrack = colors.border;
    const colorDotCenter = colors.text;

    const outerRadius = 156;
    const innerRadius = 126;

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

    const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (holdTimeRef.current) {
                clearTimeout(holdTimeRef.current);
            }
            if (holdIntervalRef.current) {
                clearInterval(holdIntervalRef.current);
            }
        };
    }, []);

    const handlePressIn = () => {
        if (!isActive) return;

        if (isStrict && skipsRemaining <= 0) {
            try {
                Vibration.vibrate([0, 30, 40, 30]);
            } catch (error) { }
            setShowHoldHint(true);
            setTimeout(() => setShowHoldHint(false), 2500);
            return;
        }

        try { Vibration.vibrate(12); } catch { }
        setIsHolding(true);

        Animated.timing(holdProgress, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: false,
        }).start();

        holdIntervalRef.current = setInterval(() => {
            try { Vibration.vibrate(8); } catch { }
        }, 800);

        holdTimeRef.current = setTimeout(() => {
            if (holdIntervalRef.current) {
                clearInterval(holdIntervalRef.current);
                holdIntervalRef.current = null;
            }
            try { Vibration.vibrate([0, 40, 60, 40]); } catch { }
            setIsHolding(false);
            latestOnStopPress.current?.();
        }, 3500);
    };

    const handlePressOut = () => {
        if (!isActive) return;

        setIsHolding(false);
        if (holdTimeRef.current) {
            clearTimeout(holdTimeRef.current);
            holdTimeRef.current = null;
        }
        if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }

        Animated.timing(holdProgress, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const coreRadius = 96;

    return (
        <View className="items-center justify-center w-[340px] h-[340px]">
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
                {orbAnimation === 'animation_solar' ? (
                    <SolarSystemBackground
                        isActive={isActive}
                        colorAccent={colorAccent}
                        colorTrack={colorTrack}
                        colorDotCenter={colorDotCenter}
                        outerRadius={outerRadius}
                        innerRadius={innerRadius}
                        sessionProgress={sessionProgress}
                        minuteProgress={minuteProgress}
                    />
                ) : (
                    <ClassicProgressBackground
                        isActive={isActive}
                        colorAccent={colorAccent}
                        colorTrack={colorTrack}
                        colorDotCenter={colorDotCenter}
                        outerRadius={outerRadius}
                        innerRadius={innerRadius}
                        sessionProgress={sessionProgress}
                        minuteProgress={minuteProgress}
                    />
                )}
            </View>

            {/* Active Hold Progress Ring (sweeps around the center disc) */}
            {isActive && (
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                    <Svg width="340" height="340" viewBox="0 0 340 340">
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
                    </Svg>
                </View>
            )}

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
                        className={`w-48 h-48 rounded-full items-center justify-center shadow-2xl ${isHolding
                            ? "bg-destructiveMuted"
                            : "bg-surfaceElevated"
                            }`}
                        accessibilityRole="button"
                        accessibilityLabel={`Active focus session. ${timeLeft} remaining. Press and hold to stop.`}
                    >
                        {/* Top Indicator (Fixed height to prevent shift) */}
                        <View className="flex-row items-center justify-center h-4 mb-2">
                            <Text
                                className={`font-black text-[12px] tracking-widest uppercase ${isStrict && skipsRemaining <= 0 ? "text-warning" : "text-destructive"
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
                            className="text-text font-black text-5xl tracking-tighter tabular-nums text-center"
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
                /* Idle Home Orb */
                <Pressable
                    onPress={() => {
                        try { Vibration.vibrate(12); } catch { }
                        onStartPress?.();
                    }}
                    className="w-44 h-44 rounded-full items-center justify-center active:opacity-85"
                    style={{
                        backgroundColor: colorAccent,
                        shadowColor: colorAccent,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 16,
                        elevation: 12,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Start focus session"
                    accessibilityHint="Double tap to configure and begin a focus session"
                >
                    <Text className="text-accentForeground font-black text-xl tracking-[0.25em] ml-1 uppercase">
                        Start
                    </Text>
                </Pressable>
            )}
        </View>
    );
}
