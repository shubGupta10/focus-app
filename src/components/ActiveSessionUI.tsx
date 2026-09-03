import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface ActiveSessionUIProps {
    onStopPress: () => void;
    startTime: number | null;
    endTime: number | null;
}

export function ActiveSessionUI({ onStopPress, startTime, endTime }: ActiveSessionUIProps) {
    const [timeLeft, setTimeLeft] = useState<string>("00:00");
    const [isInfinite, setIsInfinite] = useState(false);

    useEffect(() => {
        if (!startTime) return;

        const infinite = endTime === -1;
        setIsInfinite(infinite);

        const interval = setInterval(() => {
            const now = Date.now();

            if (infinite) {
                const diffMs = now - startTime;
                const totalSeconds = Math.floor(diffMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else if (endTime && endTime > 0) {
                const diffMs = endTime - now;
                if (diffMs <= 0) {
                    setTimeLeft("00:00");
                    onStopPress(); // Auto-stop the UI when time expires!
                    return;
                }
                const totalSeconds = Math.floor(diffMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, endTime]);

    return (
        <View className="absolute bottom-12 w-full px-8 items-center">

            {/* The Gorgeous Timer Display */}
            <View className="mb-12 items-center">
                <Text className="text-gray-400 font-bold tracking-[5px] text-sm uppercase mb-2">
                    {isInfinite ? "Focus Time" : "Time Remaining"}
                </Text>
                <Text className="text-white text-7xl font-black tabular-nums tracking-tighter">
                    {timeLeft}
                </Text>
            </View>

            <Pressable
                onPress={onStopPress}
                className="w-full h-16 bg-red-500/10 rounded-2xl items-center justify-center border-2 border-red-500/30 active:bg-red-500/20"
            >
                <Text className="text-red-400 font-bold text-lg tracking-wider">END SESSION EARLY</Text>
            </Pressable>
        </View>
    );
}
