import { BarChartItem } from "@/components/BarChartItem";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useUserStats } from "@/hooks/useUserStats";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProgressTab() {
    const { activeStyle, colors } = useTheme();
    const { stats, todayStats, totalSessionsCount, refreshStats } = useUserStats();
    const { weeklyData, totalBlockedThisWeek, recentBlockedAttempts, refreshAnalytics } = useAnalytics();
    const { installedApps } = useFocusEngine();

    useFocusEffect(
        useCallback(() => {
            refreshStats();
            refreshAnalytics();
        }, [refreshStats, refreshAnalytics])
    );

    const todayHours = Math.floor(todayStats.today_focus_seconds / 3600);
    const todayMinutes = Math.floor((todayStats.today_focus_seconds % 3600) / 60);

    const totalFocusThisWeek = weeklyData.reduce((acc, d) => acc + d.focusSeconds, 0);
    const weeklyHours = Math.floor(totalFocusThisWeek / 3600);
    const weeklyMinutes = Math.floor((totalFocusThisWeek % 3600) / 60);

    const allTimeHours = Math.floor(stats.total_focus_seconds / 3600);
    const allTimeMinutes = Math.floor((stats.total_focus_seconds % 3600) / 60);

    const maxFocusSeconds = Math.max(...weeklyData.map((d) => d.focusSeconds), 1);

    const getAppName = (packageName: string) => {
        const app = installedApps.find(a => a.packageName === packageName);
        return app ? app.name : packageName.split('.').pop() || packageName;
    };

    const getRelativeTime = (timestamp: number) => {
        const diffInSeconds = Math.floor((Date.now() - timestamp) / 1000);
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <View className="px-6 pt-5 pb-2">
                <Text className="text-text font-black text-3xl tracking-tight">Progress</Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 py-8">
                    <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-4">
                        Today's Focus
                    </Text>

                    <View className="flex-row items-baseline mb-2">
                        {todayHours > 0 ? (
                            <>
                                <Text className="text-text font-black text-6xl tabular-nums tracking-tighter leading-none mr-1">
                                    {todayHours}
                                </Text>
                                <Text className="text-xl text-textSecondary font-bold mr-3">h</Text>
                                <Text className="text-text font-black text-6xl tabular-nums tracking-tighter leading-none mr-1">
                                    {todayMinutes}
                                </Text>
                                <Text className="text-xl text-textSecondary font-bold">m</Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-text font-black text-6xl tabular-nums tracking-tighter leading-none mr-1">
                                    {todayMinutes}
                                </Text>
                                <Text className="text-xl text-textSecondary font-bold">m</Text>
                            </>
                        )}
                    </View>

                    {todayStats.today_sessions > 0 ? (
                        <View className="flex-row items-center">
                            <Text className="text-text font-semibold text-base mr-2">
                                {todayStats.today_sessions} {todayStats.today_sessions === 1 ? "session" : "sessions"} today
                            </Text>
                            <Text className="text-textSecondary text-base mr-2">•</Text>
                            <Text className="text-warning font-bold text-base tabular-nums">
                                +{todayStats.today_coins} coins
                            </Text>
                        </View>
                    ) : (
                        <Text className="text-textSecondary text-base font-medium">
                            No focus sessions completed yet today
                        </Text>
                    )}
                </View>

                <View className="h-[1px] w-full bg-border/30" />

                <View className="px-6 py-8 flex-row items-stretch">
                    <View className="w-1/2 pr-6 border-r border-border/30">
                        <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-3">
                            Day Streak
                        </Text>
                        <View className="flex-row items-baseline justify-between">
                            <Text className="text-accent font-black text-4xl tabular-nums leading-none">
                                {stats.current_streak}
                            </Text>
                            <Text className="text-textSecondary text-sm font-medium">
                                Best: {stats.longest_streak}
                            </Text>
                        </View>
                    </View>

                    <View className="w-1/2 pl-6">
                        <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-3">
                            Apps Blocked
                        </Text>
                        <View className="flex-row items-baseline justify-between">
                            <Text className="text-text font-black text-4xl tabular-nums leading-none">
                                {totalBlockedThisWeek}
                            </Text>
                            <Text className="text-textSecondary text-sm font-medium">
                                This week
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="h-[1px] w-full bg-border/30" />

                <View className="px-6 py-8">
                    <View className="flex-row justify-between items-baseline mb-6">
                        <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest">
                            Weekly Rhythm
                        </Text>
                        <Text className="text-text font-bold text-sm tabular-nums">
                            {weeklyHours}h {weeklyMinutes}m total
                        </Text>
                    </View>

                    <View className="flex-row items-end justify-between h-32">
                        {weeklyData.map((data, index) => (
                            <BarChartItem
                                key={data.dateStr}
                                day={data.dayOfWeek}
                                focusSeconds={data.focusSeconds}
                                maxSeconds={maxFocusSeconds}
                                isToday={index === weeklyData.length - 1}
                                primaryColor={colors.accent}
                            />
                        ))}
                    </View>
                </View>

                <View className="h-[1px] w-full bg-border/30" />

                <View className="px-6 py-8">
                    <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-6">
                        Recent Interceptions
                    </Text>

                    {recentBlockedAttempts && recentBlockedAttempts.length > 0 ? (
                        <View>
                            {recentBlockedAttempts.map((attempt, index) => {
                                const isLast = index === recentBlockedAttempts.length - 1;
                                const appName = getAppName(attempt.package_name);

                                return (
                                    <View
                                        key={attempt.id}
                                        className={`py-4 flex-row items-center justify-between ${isLast ? "" : "border-b border-border/30"}`}
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-4">
                                                <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-text font-bold text-base tracking-tight" numberOfLines={1}>
                                                    {appName}
                                                </Text>
                                                <Text className="text-textSecondary text-xs font-medium mt-0.5">
                                                    Blocked
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-textSecondary text-xs font-medium">
                                            {getRelativeTime(attempt.timestamp)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <View className="py-6 items-center">
                            <Ionicons name="shield-outline" size={32} color={colors.textMuted} style={{ marginBottom: 12 }} />
                            <Text className="text-textSecondary text-sm font-medium text-center">
                                No distractions blocked recently
                            </Text>
                        </View>
                    )}
                </View>

                <View className="h-[1px] w-full bg-border/30" />

                <View className="px-6 py-8">
                    <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-6">
                        All-Time Stats
                    </Text>

                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 items-center">
                            <Text className="text-text font-black text-2xl tracking-tight tabular-nums mb-1">
                                {allTimeHours}h {allTimeMinutes}m
                            </Text>
                            <Text className="text-textSecondary text-xs font-semibold">
                                Total Focus
                            </Text>
                        </View>

                        <View className="flex-1 items-center border-l border-border/30">
                            <Text className="text-text font-black text-2xl tracking-tight tabular-nums mb-1">
                                {totalSessionsCount}
                            </Text>
                            <Text className="text-textSecondary text-xs font-semibold">
                                Sessions
                            </Text>
                        </View>

                        <View className="flex-1 items-center border-l border-border/30">
                            <Text className="text-text font-black text-2xl tracking-tight tabular-nums mb-1">
                                {stats.total_coins.toLocaleString()}
                            </Text>
                            <Text className="text-textSecondary text-xs font-semibold">
                                Coins
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}