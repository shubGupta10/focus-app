import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

interface CentralFocusOrbProps {
    isActive?: boolean;
    earnedCoins?: number;
    sessionProgress?: number | null;
    minuteProgress?: number | null;
    isInfinite?: boolean;
}

export function CentralFocusOrb({
    isActive = false,
    earnedCoins = 38,
    sessionProgress = null,
    minuteProgress = null,
    isInfinite = false,
}: CentralFocusOrbProps) {
    const [showHud, setShowHud] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handlePress = () => {
        if (!isActive) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setShowHud(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
        }).start();

        timeoutRef.current = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setShowHud(false);
            });
        }, 2500);
    };

    const outerRadius = 156;
    const outerCircumference = 2 * Math.PI * outerRadius;
    const clampedSession = sessionProgress !== null ? Math.max(0, Math.min(1, sessionProgress)) : 1;
    const outerOffset = outerCircumference * (1 - clampedSession);

    const innerRadius = 126;
    const innerCircumference = 2 * Math.PI * innerRadius;
    const clampedMinute = minuteProgress !== null ? Math.max(0, Math.min(1, minuteProgress)) : 1;
    const innerOffset = innerCircumference * (1 - clampedMinute);

    const percent = Math.min(100, Math.max(0, Math.round((1 - clampedSession) * 100)));

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
        <Pressable onPress={handlePress} className="items-center justify-center my-auto w-[340px] h-[340px]">
            {isActive && (
                <>
                    {showHud && (
                        <Animated.View
                            style={{ opacity: fadeAnim }}
                            className="absolute -top-11 z-50 bg-surface px-4 py-2 rounded-full border border-border shadow-lg flex-row items-center"
                            pointerEvents="none"
                        >
                            <Text className="text-sm mr-1.5">🪙</Text>
                            <Text className="text-text font-bold text-xs">+{earnedCoins} coins earned</Text>
                        </Animated.View>
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
                                    stroke="#3F352F"
                                    strokeWidth={tick.isMajor ? "2" : "1.5"}
                                    strokeLinecap="round"
                                />
                            ))}

                            <Circle
                                cx="170"
                                cy="170"
                                r={outerRadius}
                                stroke="#3F352F"
                                strokeWidth="2"
                                fill="none"
                            />
                            {clampedSession > 0 && (
                                <Circle
                                    cx="170"
                                    cy="170"
                                    r={outerRadius}
                                    stroke="#D97A59"
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
                                stroke="#3F352F"
                                strokeWidth="2"
                                fill="none"
                            />
                            {clampedMinute > 0 && (
                                <>
                                    <Circle
                                        cx="170"
                                        cy="170"
                                        r={innerRadius}
                                        stroke="#D97A59"
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
                                        fill="#D97A59"
                                        opacity="0.25"
                                    />
                                    <Circle
                                        cx={dotX}
                                        cy={dotY}
                                        r="4"
                                        fill="#D97A59"
                                    />
                                    <Circle
                                        cx={dotX}
                                        cy={dotY}
                                        r="1.5"
                                        fill="#FFFFFF"
                                    />
                                </>
                            )}
                        </Svg>
                    </View>
                </>
            )}

            <View className={`w-44 h-44 rounded-full bg-accent items-center justify-center shadow-2xl ${isActive ? "border-4 border-border" : ""}`}>
                {isActive ? (
                    !isInfinite ? (
                        <>
                            <Text className="text-white font-black text-5xl tracking-tight leading-none">
                                {percent}%
                            </Text>
                            <Text className="text-white opacity-80 text-xs font-bold tracking-widest uppercase mt-1.5">
                                COMPLETED
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-white font-black text-4xl tracking-tight leading-none">
                                ACTIVE
                            </Text>
                            <Text className="text-white opacity-80 text-xs font-bold tracking-widest uppercase mt-1.5">
                                FOCUSING
                            </Text>
                        </>
                    )
                ) : (
                    <Text className="text-white font-black text-6xl leading-none">
                        ¢
                    </Text>
                )}
            </View>
        </Pressable>
    );
}
