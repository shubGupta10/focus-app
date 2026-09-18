import { useUserStats } from "@/hooks/useUserStats";
import { secondsToHoursAndMinutes } from "../../../../utils/timeUtils";
import { Text, View } from "react-native";

export function TodayFocusCard() {
    const { todayStats } = useUserStats();
    const { hours: todayHours, minutes: todayMinutes } = secondsToHoursAndMinutes(todayStats.today_focus_seconds);

    return (
        <View className="bg-surfaceElevated rounded-3xl p-6 mb-4">
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
    );
}
