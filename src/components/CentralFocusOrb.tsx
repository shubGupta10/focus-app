import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, Vibration, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CentralFocusOrbProps {
    isActive?: boolean;
    earnedCoins?: number;
    sessionProgress?: number | null;
    minuteProgress?: number | null;
    isInfinite?: boolean;
    onStartPress?: () => void;
    onStopPress?: () => void;
}

export function CentralFocusOrb({
    isActive = false,
    earnedCoins = 38,
    sessionProgress = null,
    minuteProgress = null,
    isInfinite = false,
    onStartPress,
    onStopPress,
}: CentralFocusOrbProps) {
    const { colors } = useTheme();
    const holdProgress = useRef(new Animated.Value(0)).current;
    const holdTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showHoldHint, setShowHoldHint] = useState(false);
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



    useEffect(() => {
        return () => {
            if (holdTimeRef.current)
                clearTimeout(holdTimeRef.current)
        }
    }, [])

    const handlePressIn = () => {
        if (!isActive) return;

        try { Vibration.vibrate(10); } catch { }

        Animated.timing(holdProgress, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: false,
        }).start();

        holdTimeRef.current = setTimeout(() => {
            try { Vibration.vibrate([0, 40, 60, 40]); } catch { }
            onStopPress?.();
        }, 10000);
    };

    const handlePressOut = () => {
        if (!isActive) return;

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


    return (
        <View className="items-center justify-center w-[340px] h-[340px]">
            {isActive && (
                <View
                    className="absolute -top-9 z-50 bg-surfaceElevated px-4 py-2 rounded-full border border-border shadow-md flex-row items-center pointer-events-none"
                >
                    <Text className="text-base mr-1.5">🪙</Text>
                    <Text className="text-text font-bold text-sm">+{earnedCoins} coins earned</Text>
                </View>
            )}

            <View className="absolute inset-0 items-center justify-center pointer-events-none">
                <Svg width="340" height="340" viewBox="0 0 340 340">

                    <Circle
                        cx="170"
                        cy="170"
                        r={outerRadius}
                        stroke={colorTrack}
                        strokeWidth="2"
                        fill="none"
                    />
                    {isActive && clampedSession > 0 && (
                        <Circle
                            cx="170"
                            cy="170"
                            r={outerRadius}
                            stroke={colorAccent}
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={outerCircumference}
                            strokeDashoffset={outerOffset}
                            strokeLinecap="round"
                            transform="rotate(-90 170 170)"
                        />
                    )}

                    <Circle
                        cx="170"
                        cy="170"
                        r={innerRadius}
                        stroke={colorTrack}
                        strokeWidth="2"
                        fill="none"
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
                            />
                            <Circle
                                cx={dotX}
                                cy={dotY}
                                r="7"
                                fill={colorAccent}
                                opacity="0.25"
                            />
                            <Circle
                                cx={dotX}
                                cy={dotY}
                                r="4"
                                fill={colorAccent}
                            />
                            <Circle
                                cx={dotX}
                                cy={dotY}
                                r="1.5"
                                fill={colorDotCenter}
                            />
                        </>
                    )}

                    {isActive && (
                        <AnimatedCircle
                            cx="170"
                            cy="170"
                            r="96"
                            stroke={colors.accent}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 96}
                            strokeDashoffset={holdProgress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [2 * Math.PI * 96, 0],
                            })}
                            strokeLinecap="round"
                            transform="rotate(-90 170 170)"
                            opacity="0.8"
                        />
                    )}
                </Svg>
            </View>

            <Pressable
                onPress={() => {
                    if (!isActive) {
                        try { Vibration.vibrate(12); } catch { }
                        onStartPress?.();
                    } else {
                        setShowHoldHint(true);
                        setTimeout(() => setShowHoldHint(false), 2000);
                    }
                }}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="w-44 h-44 rounded-full bg-accent items-center justify-center shadow-2xl active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel={isActive ? "Hold for 3 seconds to end session" : "Start focus session"}
                accessibilityHint={isActive ? "Press and hold to unlock and end the focus session" : "Double tap to configure and begin a focus session"}
            >
                {isActive ? (
                    <View className="items-center justify-center">
                        <Ionicons name="stop" size={44} color={colors.accentForeground} />
                        <Text className="text-accentForeground font-black text-sm tracking-wider uppercase mt-2">
                            {showHoldHint ? "HOLD TO END" : "END SESSION"}
                        </Text>
                    </View>
                ) : (
                    <View className="items-center justify-center ml-1.5">
                        <Ionicons name="play" size={72} color={colors.accentForeground} />
                    </View>
                )}
            </Pressable>
        </View>
    );
}
