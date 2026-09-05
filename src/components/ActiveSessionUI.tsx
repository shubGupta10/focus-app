import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { CentralFocusOrb } from "./CentralFocusOrb";

interface ActiveSessionUIProps {
    onStopPress: () => void;
    startTime: number | null;
    endTime: number | null;
}

export function ActiveSessionUI({ onStopPress, startTime, endTime }: ActiveSessionUIProps) {
    const [timeLeft, setTimeLeft] = useState("00:00");
    const [isInfinite, setIsInfinite] = useState(false);
    const [sessionProgress, setSessionProgress] = useState(1);
    const [minuteProgress, setMinuteProgress] = useState(1);
    const [earnedCoins, setEarnedCoins] = useState(0);

    useEffect(() => {
        if (!startTime) return;

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
                    onStopPress();
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
        <View className="flex-1 items-center justify-between pb-32 pt-6">
            <View className="items-center h-20 justify-center">
                <Text className="text-text text-3xl font-black tracking-tight text-center">
                    {isInfinite ? "Open Focus" : "Deep Work"}
                </Text>
            </View>

            <CentralFocusOrb
                isActive={true}
                earnedCoins={earnedCoins}
                sessionProgress={sessionProgress}
                minuteProgress={minuteProgress}
                isInfinite={isInfinite}
            />

            <View className="items-center h-28 justify-center">
                <Text className="text-text text-6xl font-black tracking-tight tabular-nums text-center">
                    {timeLeft}
                </Text>
                <Text className="text-textSecondary text-xs font-bold tracking-[4px] uppercase text-center mt-2">
                    {isInfinite ? "FOCUS TIME" : "TIME REMAINING"}
                </Text>
            </View>
        </View>
    );
}


