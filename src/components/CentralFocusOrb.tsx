import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, Vibration, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

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

    const ticks = Array.from({ length: 12 }, (_, i) => {
        const angleRad = (i * 30 - 90) * (Math.PI / 180);
        const isMajor = i % 3 === 0;
        const r1 = isMajor ? 146 : 150;
        const r2 = isMajor ? 166 : 162;
        return {
            key: i,
            x1: 170 + r1 * Math.cos(angleRad),
            y1: 170 + r1 * Math.sin(angleRad),
            x2: 170 + r2 * Math.cos(angleRad),
            y2: 170 + r2 * Math.sin(angleRad),
            isMajor,
        };
    });

    return (
        <View className="items-center justify-center w-[340px] h-[340px]">
            {isActive && (
                <View
                    className="absolute -top-9 z-50 bg-surface px-4 py-2 rounded-full border border-border shadow-md flex-row items-center pointer-events-none"
                >
                    <Text className="text-base mr-1.5">🪙</Text>
                    <Text className="text-text font-bold text-sm">+{earnedCoins} coins earned</Text>
                </View>
            )}

            <View className="absolute inset-0 items-center justify-center pointer-events-none">
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    {ticks.map((tick) => (
                        <Line
                            key={tick.key}
                            x1={tick.x1}
                            y1={tick.y1}
                            x2={tick.x2}
                            y2={tick.y2}
                            stroke={colorTrack}
                            strokeWidth={tick.isMajor ? "2" : "1.5"}
                            strokeLinecap="round"
                        />
                    ))}

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
                </Svg>
            </View>

            <Pressable
                onPress={() => {
                    try {
                        Vibration.vibrate(12);
                    } catch {}
                    if (isActive) {
                        onStopPress?.();
                    } else {
                        onStartPress?.();
                    }
                }}
                className="w-44 h-44 rounded-full bg-accent items-center justify-center shadow-2xl active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel={isActive ? "End focus session" : "Start focus session"}
                accessibilityHint={isActive ? "Double tap to end the current focus session" : "Double tap to configure and begin a focus session"}
            >
                {isActive ? (
                    <View className="items-center justify-center">
                        <Ionicons name="stop" size={44} color={colors.background} />
                        <Text className="text-background font-black text-sm tracking-wider uppercase mt-2">
                            END SESSION
                        </Text>
                    </View>
                ) : (
                    <View className="items-center justify-center ml-1.5">
                        <Ionicons name="play" size={72} color={colors.background} />
                    </View>
                )}
            </Pressable>
        </View>
    );
}
