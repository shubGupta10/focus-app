import { InfoSheet } from "@/components/InfoSheet";
import { useUserStats } from "@/hooks/useUserStats";
import { secondsToHoursAndMinutes } from "@/utils/timeUtils";
import { Text, View } from "react-native";

export function TodayFocusCard() {
    const { todayStats, stats } = useUserStats();
    const { hours: todayHours, minutes: todayMinutes } = secondsToHoursAndMinutes(
        todayStats.today_focus_seconds
    );
    const hasFocusToday = todayStats.today_focus_seconds > 0;

    const todayDateFormatted = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    return (
        <View className="mb-9">
            <View className="flex-row justify-between items-start mb-7">
                <View>
                    <Text className="text-text font-black text-3xl tracking-tight">
                        Progress
                    </Text>
                    {/* <Text className="text-textSecondary font-medium text-sm mt-1">
                        {todayDateFormatted}
                    </Text> */}
                </View>

                <InfoSheet
                    title="How Coins Work"
                    description="You earn 1 coin for every minute of deep focus. Spend your coins in the Shop to unlock new animations and features!"
                />
            </View>

            <View className="mb-8">
                <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider mb-2.5">
                    Focused Today
                </Text>

                <View className="flex-row items-baseline mb-2">
                    {todayHours > 0 ? (
                        <>
                            <Text className="text-text font-black text-6xl tracking-tight leading-none">
                                {todayHours}
                            </Text>
                            <Text className="text-textSecondary font-bold text-2xl ml-1 mr-3">
                                h
                            </Text>
                            <Text className="text-text font-black text-6xl tracking-tight leading-none">
                                {todayMinutes}
                            </Text>
                            <Text className="text-textSecondary font-bold text-2xl ml-1">
                                m
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-text font-black text-6xl tracking-tight leading-none">
                                {todayMinutes}
                            </Text>
                            <Text className="text-textSecondary font-bold text-2xl ml-1">
                                m
                            </Text>
                        </>
                    )}
                </View>

                <Text className="text-textSecondary font-normal text-base">
                    {hasFocusToday
                        ? `from ${todayStats.today_sessions} ${todayStats.today_sessions === 1 ? "session" : "sessions"} today`
                        : "No focus logged yet today"}
                </Text>
            </View>

            <View className="flex-row items-center justify-between px-1">
                <View className="items-center flex-1">
                    <Text className="text-accent font-black text-3xl tabular-nums leading-none">
                        {stats.total_coins.toLocaleString()}
                    </Text>
                    <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-wider mt-2">
                        coin balance
                    </Text>
                </View>

                <View className="w-px h-8 bg-border" />

                <View className="items-center flex-1">
                    <View className="flex-row items-baseline justify-center">
                        <Text className="text-text font-black text-3xl tabular-nums leading-none">
                            {stats.current_streak}
                        </Text>
                        <Text className="text-textSecondary font-semibold text-xs ml-1">
                            {stats.current_streak === 1 ? "day" : "days"}
                        </Text>
                    </View>
                    <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-wider mt-2">
                        day streak
                    </Text>
                </View>

                <View className="w-px h-8 bg-border" />

                <View className="items-center flex-1">
                    <View className="flex-row items-baseline justify-center">
                        <Text className="text-text font-black text-3xl tabular-nums leading-none">
                            {stats.longest_streak}
                        </Text>
                        <Text className="text-textSecondary font-semibold text-xs ml-1">
                            {stats.longest_streak === 1 ? "day" : "days"}
                        </Text>
                    </View>
                    <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-wider mt-2">
                        best streak
                    </Text>
                </View>
            </View>
        </View>
    );
}
