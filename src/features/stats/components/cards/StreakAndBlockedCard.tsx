import { useAnalytics } from "@/hooks/useAnalytics";
import { useUserStats } from "@/hooks/useUserStats";
import { Text, View } from "react-native";

export function StreakAndBlockedCard() {
    const { stats } = useUserStats();
    const { totalBlockedThisWeek } = useAnalytics();

    return (
        <View className="flex-row items-stretch mb-4" style={{ gap: 16 }}>
            <View className="flex-1 bg-surfaceElevated rounded-3xl p-6">
                <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-3">
                    Day Streak
                </Text>
                <Text className="text-accent font-black text-4xl tabular-nums leading-none mb-1">
                    {stats.current_streak}
                </Text>
                <Text className="text-textSecondary text-xs font-medium mt-1">
                    Best: {stats.longest_streak}
                </Text>
            </View>

            <View className="flex-1 bg-surfaceElevated rounded-3xl p-6">
                <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-3">
                    Apps Blocked
                </Text>
                <Text className="text-text font-black text-4xl tabular-nums leading-none mb-1">
                    {totalBlockedThisWeek}
                </Text>
                <Text className="text-textSecondary text-xs font-medium mt-1">
                    This week
                </Text>
            </View>
        </View>
    );
}
