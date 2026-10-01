import { useUserStats } from "@/hooks/useUserStats";
import { Text, View } from "react-native";
import { secondsToHoursAndMinutes } from "../../../../utils/timeUtils";

export function TodayFocusCard() {
    const { todayStats, stats } = useUserStats();
    const { hours: todayHours, minutes: todayMinutes } = secondsToHoursAndMinutes(
        todayStats.today_focus_seconds
    );

    const hasActivity = todayStats.today_sessions > 0;

    return (
        <View className="pb-6 mb-2">
            <Text className="text-textMuted font-semibold text-base mb-3">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>

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

            {/* Inline stats row — spread full width */}
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

            {/* First-time hint */}
            {stats?.total_coins === 0 && (
                <View className="mt-5 pt-5 border-t border-border/20">
                    <Text className="text-accent text-xs font-medium uppercase tracking-wider mb-1">
                        How coins work
                    </Text>
                    <Text className="text-textSecondary text-base font-medium leading-6">
                        Earn 1 coin per minute of focus. Spend them in the Shop.
                    </Text>
                </View>
            )}
        </View>
    );
}
