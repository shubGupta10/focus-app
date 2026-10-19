import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { CentralFocusOrb } from "./CentralFocusOrb";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDynamicReducedMotion } from "@/hooks/useDynamicReducedMotion";
import { formatTimerDisplay } from "@/utils/timeUtils";
import { useAppStore } from "@/store/useAppStore";

interface ActiveSessionUIProps {
    onStopPress: () => void;
    startTime: number | null;
    endTime: number | null;
    blockedAppsCount?: number;
    isStrict?: boolean;
    skipsRemaining?: number;
}

export function ActiveSessionUI({ onStopPress, startTime, endTime, blockedAppsCount, isStrict, skipsRemaining }: ActiveSessionUIProps) {
    const { width, height } = useWindowDimensions();
    const isSmallDevice = width < 380 || height < 740;
    const isBreakActive = useAppStore(state => state.isBreakActive);
    const breakEndTime = useAppStore(state => state.breakEndTime);
    const [breakTimeLeft, setBreakTimeLeft] = useState("00:00");
    const [timeLeft, setTimeLeft] = useState("00:00");
    const [isInfinite, setIsInfinite] = useState(false);
    const [sessionProgress, setSessionProgress] = useState(1);
    const [minuteProgress, setMinuteProgress] = useState(1);
    const [earnedCoins, setEarnedCoins] = useState(0);
    const { colors } = useTheme();
    const reducedMotion = useDynamicReducedMotion();

    useEffect(() => {
        if (!startTime) return;

        let isStopped = false;

        const infinite = endTime === -1;
        setIsInfinite(infinite);

        const updateTimer = () => {
            const now = Date.now();

            if (isBreakActive && breakEndTime) {
                if (breakEndTime > now) {
                    const breakDiff = Math.max(0, Math.floor((breakEndTime - now) / 1000));
                    setBreakTimeLeft(formatTimerDisplay(breakDiff));
                } else {
                    useAppStore.getState().setBreakState(false, null, useAppStore.getState().breaksRemaining);
                }
            }

            const store = useAppStore.getState();
            let focusElapsedMs: number;
            if (isBreakActive) {
                const breakStart = store.breakStartTime ?? (breakEndTime && store.breakDurationMs ? breakEndTime - store.breakDurationMs : now);
                focusElapsedMs = Math.max(0, breakStart - startTime - store.totalBreakMs);
            } else {
                focusElapsedMs = Math.max(0, now - startTime - store.totalBreakMs);
            }

            const elapsedFocusSeconds = Math.floor(focusElapsedMs / 1000);
            const baseCoins = Math.floor(elapsedFocusSeconds / 60);
            setEarnedCoins(isStrict ? Math.floor(baseCoins * 1.5) : baseCoins);

            if (infinite) {
                setTimeLeft(formatTimerDisplay(elapsedFocusSeconds));

                setSessionProgress(1);
                const msInMinute = focusElapsedMs % 60000;
                setMinuteProgress(msInMinute / 60000);
            } else if (endTime && endTime > 0) {
                const totalDuration = endTime - startTime;
                const remainingFocusMs = Math.max(0, totalDuration - focusElapsedMs);
                if (remainingFocusMs <= 0) {
                    setTimeLeft("0m 00s");
                    setSessionProgress(0);
                    setMinuteProgress(0);

                    if (!isStopped) {
                        isStopped = true;
                        onStopPress();
                    }
                    return;
                }
                const totalSeconds = Math.floor(remainingFocusMs / 1000);

                setTimeLeft(formatTimerDisplay(totalSeconds));

                setSessionProgress(totalDuration > 0 ? Math.max(0, Math.min(1, remainingFocusMs / totalDuration)) : 0);

                const msInMinute = remainingFocusMs % 60000;
                const minProg = msInMinute === 0 && remainingFocusMs > 0 ? 1 : msInMinute / 60000;
                setMinuteProgress(Math.max(0, Math.min(1, minProg)));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 500);

        return () => clearInterval(interval);
    }, [startTime, endTime, onStopPress, isBreakActive, breakEndTime]);

    return (
        <View className={`flex-1 items-center justify-between px-6 ${isSmallDevice ? "py-4" : "py-10"} w-full max-w-md mx-auto`}>
            <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400).delay(150)} className={`items-center w-full ${isSmallDevice ? "pt-2" : "pt-6"}`}>
                <View className={`flex-row items-center justify-center gap-3 ${isSmallDevice ? "mb-3" : "mb-6"}`}>
                    {isStrict && (
                        <View className={`flex-row items-center bg-accentMuted ${isSmallDevice ? "px-3 py-1.5" : "px-4 py-2"} rounded-full`}>
                            <Ionicons name="shield-checkmark" size={isSmallDevice ? 14 : 16} color={colors.accent} style={{ marginRight: 6 }} />
                            <Text className={`text-accent ${isSmallDevice ? "text-[11px]" : "text-[13px]"} font-bold tracking-widest uppercase`}>
                                Strict Mode
                            </Text>
                        </View>
                    )}

                    <View className={`flex-row items-center bg-surfaceElevated ${isSmallDevice ? "px-3 py-1.5" : "px-4 py-2"} rounded-full`}>
                        <Ionicons name="apps-outline" size={isSmallDevice ? 14 : 16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                        <Text className={`text-textSecondary ${isSmallDevice ? "text-[11px]" : "text-[13px]"} font-bold`}>
                            {blockedAppsCount && blockedAppsCount > 0
                                ? `${blockedAppsCount} ${blockedAppsCount === 1 ? "App" : "Apps"} Blocked`
                                : "No Apps Blocked"}
                        </Text>
                    </View>
                </View>

                <Text className={`text-text ${isSmallDevice ? "text-2xl" : "text-4xl"} font-black tracking-tight text-center mb-1`}>
                    {isBreakActive ? "Taking a Break" : isStrict ? "Locked In" : isInfinite ? "Flow State" : "Focus Session"}
                </Text>
                <Text className={`text-textSecondary ${isSmallDevice ? "text-xs" : "text-sm"} font-bold tracking-widest uppercase text-center`}>
                    {isBreakActive ? "Guarded apps temporarily unlocked" : isInfinite ? "Stay in the zone" : "Stay on track"}
                </Text>
            </Animated.View>

            <View className={`items-center justify-center flex-1 w-full ${isSmallDevice ? "pb-2" : "pb-8"}`}>
                <CentralFocusOrb
                    isActive={true}
                    timeLeft={isBreakActive ? breakTimeLeft : timeLeft}
                    earnedCoins={earnedCoins}
                    sessionProgress={sessionProgress}
                    minuteProgress={minuteProgress}
                    isInfinite={isBreakActive ? false : isInfinite}
                    isStrict={isStrict}
                    skipsRemaining={skipsRemaining ?? 1}
                    onStopPress={onStopPress}
                />

                <Animated.View entering={reducedMotion ? undefined : FadeInDown.duration(400).delay(250)} className={`items-center justify-center ${isSmallDevice ? "mt-4 gap-2" : "mt-12 gap-4"} w-full`}>
                    {!isBreakActive && (
                        <View className="flex-row items-center justify-center">
                            <Text className={`${isSmallDevice ? "text-xl" : "text-2xl"} mr-2`}>🪙</Text>
                            <Text className={`text-text font-black ${isSmallDevice ? "text-base" : "text-xl"}`}>
                                +{earnedCoins} coins earned
                            </Text>
                        </View>
                    )}

                    <View className="flex-row items-center justify-center">
                        {isStrict && (skipsRemaining ?? 1) <= 0 ? (
                            <>
                                <Ionicons name="lock-closed" size={isSmallDevice ? 14 : 16} color={colors.warning} style={{ marginRight: 6 }} />
                                <Text className={`text-textSecondary ${isSmallDevice ? "text-xs" : "text-sm"} font-medium text-center`}>
                                    Session locked · Unlocks at 00:00
                                </Text>
                            </>
                        ) : isStrict && (skipsRemaining ?? 1) > 0 ? (
                            <>
                                <Ionicons name="alert-circle-outline" size={isSmallDevice ? 14 : 16} color={colors.warning} style={{ marginRight: 6 }} />
                                <Text className={`text-textSecondary ${isSmallDevice ? "text-xs" : "text-sm"} font-medium text-center`}>
                                    {(skipsRemaining ?? 1)} emergency {(skipsRemaining ?? 1) === 1 ? 'skip' : 'skips'} left · Hold orb to skip
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="finger-print-outline" size={isSmallDevice ? 14 : 16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                                <Text className={`text-textSecondary ${isSmallDevice ? "text-xs" : "text-sm"} font-medium text-center`}>
                                    Press and hold orb to end session
                                </Text>
                            </>
                        )}
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}
