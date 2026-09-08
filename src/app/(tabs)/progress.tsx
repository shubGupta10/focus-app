import { useTheme } from "@/contexts/ThemeContext";
import { useUserStats } from "@/hooks/useUserStats";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProgressBar() {
    const { activeStyle, colors } = useTheme()
    const { stats, todayStats } = useUserStats()

    const todayHours = Math.floor(todayStats.today_focus_seconds / 3600);
    const todayMinutes = Math.floor((todayStats.today_focus_seconds % 3600) / 60);

    const todayTimeString = todayStats.today_focus_seconds === 0 ? "0m" : (todayHours > 0 ? `${todayHours}h ${todayMinutes}m` : `${todayMinutes}m`);

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
            <View className="flex-row items-center px-6 pt-5 pb-2 border-border">
                <Text className="text-text text-3xl font-black tracking-light">
                    Progress
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                contentContainerStyle={{
                    paddingBottom: 40
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-8 items-center justify-center py-6">
                    <Text className="text-6xl mb-2">🔥</Text>
                    <Text className="text-text font-black text-5xl tabular-nums tracking-light">{stats.current_streak}</Text>
                    <Text className="text-textSeconday font-bold text-sm tracking-wider uppercase mt-1">Day Streak</Text>
                </View>

                <Text className="text-text font-bold text-lg mb-3">
                    Rewards
                </Text>

                <View className="bg-surface rounded-3xl p-5 mb-8 flex-row items-center justify-between border border-border">
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 rounded-2xl bg-background border border-border items-center justify-center mr-4">
                            <Text className="text-2xl">🪙</Text>
                        </View>

                        <View>
                            <Text className="text-text font-bold text-2xl tabular-nums tracking-light">
                                {stats.total_coins.toLocaleString()}
                            </Text>
                            <Text className="text-textSecondary font-medium text-xs">Total Coins Earned</Text>
                        </View>
                    </View>
                </View>

                <Text className="text-text font-bold text-lg mb-3">Today's Activity</Text>
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-surface rounded-3xl p-5 border border-border">
                        <View className="w-8 h-8 rounded-full bg-background border border-border items-center justify-center mb-3">
                            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        </View>
                        <Text className="text-text font-black text-2xl tabular-nums tracking-tight">
                            {todayTimeString}
                        </Text>
                        <Text className="text-textSecondary font-medium text-xs mt-1">Focused</Text>
                    </View>
                    <View className="flex-1 bg-surface rounded-3xl p-5 border border-border">
                        <View className="w-8 h-8 rounded-full bg-background border border-border items-center justify-center mb-3">
                            <Ionicons name="checkmark-done" size={16} color={colors.textSecondary} />
                        </View>
                        <Text className="text-text font-black text-2xl tabular-nums tracking-tight">
                            {todayStats.today_sessions}
                        </Text>
                        <Text className="text-textSecondary font-medium text-xs mt-1">Sessions</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}