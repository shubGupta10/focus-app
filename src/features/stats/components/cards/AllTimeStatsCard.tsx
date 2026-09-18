import { useUserStats } from "@/hooks/useUserStats";
import { secondsToHoursAndMinutes } from "../../../../utils/timeUtils";
import { Text, View } from "react-native";

export function AllTimeStatsCard() {
    const { stats, totalSessionsCount } = useUserStats();
    const { hours: allTimeHours, minutes: allTimeMinutes } = secondsToHoursAndMinutes(stats.total_focus_seconds);

    return (
        <View className="bg-surfaceElevated rounded-3xl p-6 mb-4">
            <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-6">
                All-Time Stats
            </Text>

            <View className="flex-row items-start justify-between">
                <View className="flex-1 items-center">
                    <Text className="text-text font-black text-2xl tracking-tight tabular-nums mb-1">
                        {allTimeHours}h {allTimeMinutes}m
                    </Text>
                    <Text className="text-textSecondary text-xs font-semibold text-center">
                        Total Focus
                    </Text>
                </View>

                <View className="w-[2px] h-10 bg-surface self-center mx-2 rounded-full" />

                <View className="flex-1 items-center">
                    <Text className="text-text font-black text-2xl tracking-tight tabular-nums mb-1">
                        {totalSessionsCount}
                    </Text>
                    <Text className="text-textSecondary text-xs font-semibold text-center">
                        Sessions
                    </Text>
                </View>

                <View className="w-[2px] h-10 bg-surface self-center mx-2 rounded-full" />

                <View className="flex-1 items-center">
                    <Text className="text-text font-black text-2xl tracking-tight tabular-nums mb-1">
                        {stats.total_coins.toLocaleString()}
                    </Text>
                    <Text className="text-textSecondary text-xs font-semibold text-center">
                        Coins
                    </Text>
                </View>
            </View>
        </View>
    );
}
