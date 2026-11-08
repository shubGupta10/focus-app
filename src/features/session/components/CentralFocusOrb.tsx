import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/hooks/useSettings";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, Vibration, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { getOrbBackground } from "./orb-themes";
import { useAppStore } from "@/store/useAppStore";

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
    const [orbAnimation, setOrbAnimation] = useState<string | null>(null);
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
                setOrbAnimation(val || "animation_solar");
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
                    useNativeDriver: false,
                }),
                Animated.timing(breathAnim, {
                    toValue: 0.985,
                    duration: 3000,
                    useNativeDriver: false,
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
            if (useAppStore.getState().hapticsEnabled) {
                try {
                    Vibration.vibrate([0, 30, 40, 30]);
                } catch (error) { }
            }
            setShowHoldHint(true);
            setTimeout(() => setShowHoldHint(false), 2500);
            return;
        }

        if (useAppStore.getState().hapticsEnabled) {
            try { Vibration.vibrate(12); } catch { }
        }
        setIsHolding(true);

        Animated.timing(holdProgress, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: false,
        }).start();

        holdIntervalRef.current = setInterval(() => {
            if (useAppStore.getState().hapticsEnabled) {
                try { Vibration.vibrate(8); } catch { }
            }
        }, 800);

        holdTimeRef.current = setTimeout(() => {
            if (holdIntervalRef.current) {
                clearInterval(holdIntervalRef.current);
                holdIntervalRef.current = null;
            }
            if (useAppStore.getState().hapticsEnabled) {
                try { Vibration.vibrate([0, 40, 60, 40]); } catch { }
            }
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
    const { width, height } = useWindowDimensions();
    const isSmallDevice = width < 380 || height < 740;
    const scale = isSmallDevice ? Math.min(0.82, Math.max(0.72, (width - 48) / 340)) : 1;
    const containerSize = Math.round(340 * scale);

    return (
        <View style={{ width: containerSize, height: containerSize }} className="items-center justify-center">
            <View style={{ width: 340, height: 340, transform: [{ scale }] }} className="items-center justify-center">
                {/* Seamless Universal Ambient Radial Bloom (Adapts to all 9 animation styles with zero hard edges) */}
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                    <Svg width="340" height="340" viewBox="0 0 340 340">
                        <Defs>
                            <RadialGradient id="ambientOrbBloom" cx="50%" cy="50%" rx="50%" ry="50%">
                                <Stop offset="0%" stopColor={colorAccent} stopOpacity="0.14" />
                                <Stop offset="45%" stopColor={colorAccent} stopOpacity="0.08" />
                                <Stop offset="75%" stopColor={colorAccent} stopOpacity="0.02" />
                                <Stop offset="100%" stopColor={colorAccent} stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx="170" cy="170" r="170" fill="url(#ambientOrbBloom)" />
                    </Svg>
                </View>

                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                    {orbAnimation && (() => {
                        const OrbBg = getOrbBackground(
                            orbAnimation.replace("animation_", "")
                        );
                        return (
                            <OrbBg
                                isActive={isActive}
                                colorAccent={colorAccent}
                                colorTrack={colorTrack}
                                colorDotCenter={colorDotCenter}
                                outerRadius={outerRadius}
                                innerRadius={innerRadius}
                                sessionProgress={sessionProgress}
                                minuteProgress={minuteProgress}
                            />
                        )
                    })()}
                </View>

                {isActive && (
                    <View className="absolute inset-0 items-center justify-center pointer-events-none">
                        <Svg width="340" height="340" viewBox="0 0 340 340">
                            <AnimatedCircle
                                cx="170"
                                cy="170"
                                r={coreRadius + 3}
                                stroke={isStrict && skipsRemaining <= 0 ? colors.warning : colors.accent}
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

                {isActive ? (
                    <View className="items-center justify-center">
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
                                className={`w-48 h-48 rounded-full items-center justify-center border ${isHolding ? "border-transparent" : "border-border"
                                    }`}
                                style={{
                                    backgroundColor: isHolding ? colors.accent : colors.surfaceElevated,
                                    shadowColor: isHolding ? colors.accent : "#000",
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: isHolding ? 0.35 : 0.15,
                                    shadowRadius: 16,
                                    elevation: 2,
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={`Active focus session. ${timeLeft} remaining. Press and hold to stop.`}
                            >
                                <View className="flex-row items-center justify-center h-4 mb-2">
                                    <Text
                                        style={{
                                            color: isStrict && skipsRemaining <= 0
                                                ? colors.warning
                                                : isHolding
                                                    ? colors.accentForeground
                                                    : colors.accent,
                                        }}
                                        className="font-black text-[12px] tracking-widest uppercase"
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

                                <Text
                                    style={{
                                        color: isHolding ? colors.accentForeground : colors.text,
                                    }}
                                    className="font-black text-5xl tracking-tighter tabular-nums text-center"
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.75}
                                    numberOfLines={1}
                                >
                                    {timeLeft}
                                </Text>

                                <Text
                                    style={{
                                        color: isHolding ? colors.accentForeground : colors.textSecondary,
                                        opacity: isHolding ? 0.8 : 1,
                                    }}
                                    className="text-xs font-bold tracking-widest uppercase mt-2"
                                >
                                    {isInfinite ? "Active" : "Remaining"}
                                </Text>
                            </Pressable>
                        </Animated.View>

                        <View className="absolute inset-0 items-center justify-center pointer-events-none">
                            <Svg width="340" height="340" viewBox="0 0 340 340">
                                {isHolding && (
                                    <Circle
                                        cx="170"
                                        cy="170"
                                        r={104}
                                        stroke={colors.border}
                                        strokeWidth="6"
                                        fill="none"
                                        opacity={0.4}
                                    />
                                )}
                                <AnimatedCircle
                                    cx="170"
                                    cy="170"
                                    r={104}
                                    stroke={isStrict && skipsRemaining <= 0 ? colors.warning : colors.accent}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 104}
                                    strokeDashoffset={holdProgress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [2 * Math.PI * 104, 0],
                                    })}
                                    strokeLinecap="round"
                                    transform="rotate(-90 170 170)"
                                />
                            </Svg>
                        </View>
                    </View>
                ) : (
                    <Pressable
                        onPress={() => {
                            if (useAppStore.getState().hapticsEnabled) {
                                try { Vibration.vibrate(12); } catch { }
                            }
                            onStartPress?.();
                        }}
                        className="w-48 h-48 rounded-full items-center justify-center active:opacity-85"
                        style={{
                            backgroundColor: colorAccent,
                            shadowColor: colorAccent,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.35,
                            shadowRadius: 20,
                            borderWidth: 1.5,
                            borderColor: "rgba(255, 255, 255, 0.22)",
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Start focus session"
                        accessibilityHint="Double tap to configure and begin a focus session"
                    >
                        <View className="w-40 h-40 rounded-full items-center justify-center border border-white/10">
                            <Ionicons
                                name="play"
                                size={28}
                                color={colors.accentForeground}
                                style={{ marginLeft: 3, marginBottom: 4 }}
                            />
                            <Text
                                style={{ color: colors.accentForeground }}
                                className="font-black text-xs tracking-[0.3em] uppercase"
                            >
                                Start
                            </Text>
                        </View>
                    </Pressable>
                )}
            </View>
        </View>
    );
}
