import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { CentralFocusOrb } from "./CentralFocusOrb";

interface ActiveSessionUIProps {
    onStopPress: () => void;
    startTime: number | null;
    endTime: number | null;
    blockedAppsCount?: number;
    isStrict?: boolean;
    skipsRemaining?: number;
}

export function ActiveSessionUI({ onStopPress, startTime, endTime, blockedAppsCount, isStrict, skipsRemaining }: ActiveSessionUIProps) {
    const [timeLeft, setTimeLeft] = useState("00:00");
    const [isInfinite, setIsInfinite] = useState(false);
    const [sessionProgress, setSessionProgress] = useState(1);
    const [minuteProgress, setMinuteProgress] = useState(1);
    const [earnedCoins, setEarnedCoins] = useState(0);
    const { colors } = useTheme();

    useEffect(() => {
        if (!startTime) return;

        let isStopped = false;

        const infinite = endTime === -1;
        setIsInfinite(infinite);

        const updateTimer = () => {
            const now = Date.now();

            if (infinite) {
                const diffMs = now - startTime;
                const totalSeconds = Math.floor(diffMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                if (minutes >= 60) {
                    const hours = Math.floor(minutes / 60);
                    const remainingMinutes = minutes % 60;
                    setTimeLeft(`${hours}:${String(remainingMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
                } else {
                    setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
                }
                setSessionProgress(1);
                const msInMinute = diffMs % 60000;
                setMinuteProgress(msInMinute / 60000);
                setEarnedCoins(minutes);
            } else if (endTime && endTime > 0) {
                const totalDuration = endTime - startTime;
                const diffMs = endTime - now;
                if (diffMs <= 0) {
                    setTimeLeft("0m 00s");
                    setSessionProgress(0);
                    setMinuteProgress(0);

                    if (!isStopped) {
                        isStopped = true;
                        onStopPress();
                    }
                    return;
                }
                const totalSeconds = Math.floor(diffMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                if (minutes >= 60) {
                    const hours = Math.floor(minutes / 60);
                    const remainingMinutes = minutes % 60;
                    setTimeLeft(`${hours}:${String(remainingMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
                } else {
                    setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
                }
                setSessionProgress(totalDuration > 0 ? Math.max(0, Math.min(1, diffMs / totalDuration)) : 0);

                const msInMinute = diffMs % 60000;
                const minProg = msInMinute === 0 && diffMs > 0 ? 1 : msInMinute / 60000;
                setMinuteProgress(Math.max(0, Math.min(1, minProg)));
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                setEarnedCoins(Math.floor(elapsedSeconds / 60));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 500);

        return () => clearInterval(interval);
    }, [startTime, endTime, onStopPress]);

    return (
        <View className="flex-1 items-center justify-between px-6 py-10 w-full max-w-md mx-auto">
            <View className="items-center w-full pt-6">
                <View className="flex-row items-center justify-center gap-3 mb-6">
                    {isStrict && (
                        <View className="flex-row items-center bg-accentMuted px-4 py-2 rounded-lg">
                            <Ionicons name="shield-checkmark" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                            <Text className="text-accent text-[13px] font-bold tracking-widest uppercase">
                                Strict Mode
                            </Text>
                        </View>
                    )}

                    <View className="flex-row items-center bg-surfaceElevated px-4 py-2 rounded-lg shadow-sm">
                        <Ionicons name="apps-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                        <Text className="text-textSecondary text-[13px] font-bold">
                            {blockedAppsCount && blockedAppsCount > 0
                                ? `${blockedAppsCount} ${blockedAppsCount === 1 ? "App" : "Apps"} Blocked`
                                : "No Apps Blocked"}
                        </Text>
                    </View>
                </View>

                <Text className="text-text text-4xl font-black tracking-tight text-center mb-1">
                    {isStrict ? "Strict Lockout" : "Deep Focus"}
                </Text>
                <Text className="text-textSecondary text-sm font-bold tracking-widest uppercase text-center">
                    {isInfinite ? "Infinite Mode" : "Session in Progress"}
                </Text>
            </View>

            <View className="items-center justify-center flex-1 w-full pb-8">
                <CentralFocusOrb
                    isActive={true}
                    timeLeft={timeLeft}
                    earnedCoins={earnedCoins}
                    sessionProgress={sessionProgress}
                    minuteProgress={minuteProgress}
                    isInfinite={isInfinite}
                    isStrict={isStrict}
                    skipsRemaining={skipsRemaining ?? 1}
                    onStopPress={onStopPress}
                />

                <View className="items-center justify-center mt-12 w-full gap-4">
                    <View className="flex-row items-center justify-center">
                        <Text className="text-2xl mr-2">🪙</Text>
                        <Text className="text-text font-black text-xl">
                            +{earnedCoins} coins earned
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-center">
                        {isStrict && (skipsRemaining ?? 1) <= 0 ? (
                            <>
                                <Ionicons name="lock-closed" size={16} color={colors.warning} style={{ marginRight: 6 }} />
                                <Text className="text-textSecondary text-sm font-medium">
                                    Session locked · Unlocks at 00:00
                                </Text>
                            </>
                        ) : isStrict && (skipsRemaining ?? 1) > 0 ? (
                            <>
                                <Ionicons name="alert-circle-outline" size={16} color={colors.warning} style={{ marginRight: 6 }} />
                                <Text className="text-textSecondary text-sm font-medium">
                                    {(skipsRemaining ?? 1)} emergency {(skipsRemaining ?? 1) === 1 ? 'skip' : 'skips'} left · Hold orb to skip
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="finger-print-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                                <Text className="text-textSecondary text-sm font-medium">
                                    Press and hold orb to end session
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}
