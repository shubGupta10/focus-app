import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { CentralFocusOrb } from "./CentralFocusOrb";

interface ActiveSessionUIProps {
    onStopPress: () => void;
    startTime: number | null;
    endTime: number | null;
    blockedAppsCount?: number;
}

export function ActiveSessionUI({ onStopPress, startTime, endTime, blockedAppsCount }: ActiveSessionUIProps) {
    const [timeLeft, setTimeLeft] = useState("00:00");
    const [isInfinite, setIsInfinite] = useState(false);
    const [sessionProgress, setSessionProgress] = useState(1);
    const [minuteProgress, setMinuteProgress] = useState(1);
    const [earnedCoins, setEarnedCoins] = useState(0);

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
                setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
                setSessionProgress(1);
                const msInMinute = diffMs % 60000;
                setMinuteProgress(msInMinute / 60000);
                setEarnedCoins(minutes);
            } else if (endTime && endTime > 0) {
                const totalDuration = endTime - startTime;
                const diffMs = endTime - now;
                if (diffMs <= 0) {
                    setTimeLeft("00:00");
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
                setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
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
        <View className="flex-1 items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
            {/* A1: Reduced heading size and weight — active state should feel different from idle */}
            <View className="items-center">
                <Text className="text-text text-xl font-bold tracking-tight text-center">
                    Blocker Active
                </Text>
                <Text className="text-textSecondary text-sm font-medium text-center mt-1">
                    {blockedAppsCount && blockedAppsCount > 0
                        ? `${blockedAppsCount} ${blockedAppsCount === 1 ? "app" : "apps"} blocked`
                        : "No apps blocked"}
                </Text>
            </View>

            <View className="items-center justify-center my-auto">
                <CentralFocusOrb
                    isActive={true}
                    earnedCoins={earnedCoins}
                    sessionProgress={sessionProgress}
                    minuteProgress={minuteProgress}
                    isInfinite={isInfinite}
                    onStopPress={onStopPress}
                />
            </View>

            <View className="items-center justify-center pb-2">
                {/* A2: adjustsFontSizeToFit prevents overflow on narrow screens (e.g. 120:45 at 2hr+) */}
                <Text
                    className="text-text font-black tracking-tight tabular-nums text-center"
                    style={{ fontSize: 60 }}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    numberOfLines={1}
                >
                    {timeLeft}
                </Text>
                <Text className="text-textSecondary text-sm font-medium text-center mt-2">
                    {isInfinite ? "Focus time" : "Time remaining"}
                </Text>
            </View>
        </View>
    );
}
