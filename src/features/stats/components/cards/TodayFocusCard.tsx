import { useUserStats } from "@/hooks/useUserStats";
import { Text, View } from "react-native";
import { secondsToHoursAndMinutes } from "../../../../utils/timeUtils";
import { InfoSheet } from "@/components/InfoSheet";

export function TodayFocusCard() {
    const { todayStats, stats } = useUserStats();
    const { hours: todayHours, minutes: todayMinutes } = secondsToHoursAndMinutes(
        todayStats.today_focus_seconds
    );

    return (
        <View className="pb-6 mb-2">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-textMuted font-semibold text-base mb-3">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </Text>

                <InfoSheet
                    title="How Coins Work"
                    description="You earn 1 coin for every minute of deep focus. Spend your coins in the Shop to unlock new animations and features!"
                />
            </View>

            <View className="flex-row items-baseline mb-6 flex-wrap">
                {todayHours > 0 ? (
                    <>
                        <Text className="text-text font-black text-7xl tabular-nums tracking-tighter leading-none mr-1">
                            {todayHours}
                        </Text>
                        <Text className="text-2xl text-textSecondary font-medium mr-4">h</Text>
                        <Text className="text-text font-black text-7xl tabular-nums tracking-tighter leading-none mr-1">
                            {todayMinutes}
                        </Text>
                        <Text className="text-2xl text-textSecondary font-medium mr-3">m</Text>
                    </>
                ) : (
                    <>
                        <Text className="text-text font-black text-7xl tabular-nums tracking-tighter leading-none mr-1">
                            {todayMinutes}
                        </Text>
                        <Text className="text-2xl text-textSecondary font-medium mr-3">m</Text>
                    </>
                )}
                <Text className="text-textSecondary font-semibold text-lg">
                    focused today
                </Text>
            </View>

            <View className="flex-row items-center justify-between">
                <View className="items-center">
                    <Text className="text-warning font-black text-3xl tabular-nums leading-none">
                        {`+${stats.total_coins}`}
                    </Text>
                    <Text className="text-textMuted font-medium text-sm mt-1"> coin balance</Text>
                </View>

                <View className="w-px h-10 bg-border opacity-40" />

                <View className="items-center">
                    <Text className="text-accent font-black text-3xl tabular-nums leading-none">
                        {stats.current_streak}
                    </Text>
                    <Text className="text-textMuted font-medium text-sm mt-1">day streak</Text>
                </View>

                <View className="w-px h-10 bg-border opacity-40" />

                <View className="items-center">
                    <Text className="text-text font-black text-3xl tabular-nums leading-none">
                        {todayStats.today_sessions}
                    </Text>
                    <Text className="text-textMuted font-medium text-sm mt-1">
                        {todayStats.today_sessions === 1 ? "session" : "sessions"}
                    </Text>
                </View>
            </View>

        </View>
    );
}
