import { useTheme } from "@/contexts/ThemeContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { secondsToHoursAndMinutes } from "@/utils/timeUtils";
import { BarChartItem } from "../BarChartItem";
import { GlobalLoader } from "@/components/GlobalLoader";

export function WeeklyRhythmCard() {
    const [weekOffset, setWeekOffset] = useState(0);
    const { weeklyData, totalWeeklyFocusSeconds, isLoading } = useAnalytics(weekOffset);
    const { colors } = useTheme();

    const formatMonthDay = (dateStr: string) => {
        if (!dateStr) return "";
        const [y, m, d] = dateStr.split("-").map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const startDateStr = weeklyData.length > 0 ? formatMonthDay(weeklyData[0].dateStr) : "";
    const endDateStr = weeklyData.length > 0 ? formatMonthDay(weeklyData[weeklyData.length - 1].dateStr) : "";

    const { hours, minutes } = secondsToHoursAndMinutes(totalWeeklyFocusSeconds);
    const totalString = totalWeeklyFocusSeconds > 0
        ? (hours > 0 ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`) : `${minutes}m`)
        : "0m";
    const dailyAvgMinutes = Math.round(totalWeeklyFocusSeconds / 7 / 60);
    const avgText = totalWeeklyFocusSeconds === 0
        ? "0m a day"
        : dailyAvgMinutes < 1
            ? "< 1m a day"
            : `${dailyAvgMinutes}m a day`;

    const maxFocusSeconds = Math.max(...weeklyData.map((d) => d.focusSeconds), 1);

    return (
        <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3 px-1">
                <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">
                    Weekly Rhythm
                </Text>

                <View className="flex-row items-center bg-surface border border-border rounded-full px-4 py-2">
                    <Pressable
                        onPress={() => setWeekOffset(prev => prev - 1)}
                        hitSlop={12}
                        className="p-0.5 active:opacity-60"
                        accessibilityRole="button"
                        accessibilityLabel="Previous week"
                    >
                        <Ionicons name="chevron-back" size={15} color={colors.textSecondary} />
                    </Pressable>

                    <Text className="text-text font-bold text-sm mx-3">
                        {weeklyData.length > 0 ? `${startDateStr} to ${endDateStr}` : "..."}
                    </Text>

                    <Pressable
                        onPress={() => setWeekOffset(prev => Math.min(prev + 1, 0))}
                        disabled={weekOffset === 0}
                        hitSlop={12}
                        className={`p-0.5 active:opacity-60 ${weekOffset === 0 ? "opacity-25" : ""}`}
                        accessibilityRole="button"
                        accessibilityLabel="Next week"
                    >
                        <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
                    </Pressable>
                </View>
            </View>

            <View
                className="bg-surfaceElevated border border-border rounded-3xl p-6 shadow-sm"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 10,
                }}
            >
                <View className="flex-row items-baseline mb-7">
                    <Text className="text-text font-black text-3xl mr-2.5">
                        {totalString}
                    </Text>
                    <Text className="text-textSecondary font-medium text-sm">
                        total, about {avgText}
                    </Text>
                </View>

                <View className="flex-row items-end justify-between">
                    {isLoading ? (
                        <View className="flex-1 h-36 items-center justify-center">
                            <GlobalLoader size="small" color={colors.accent} />
                        </View>
                    ) : (
                        weeklyData.map((data, index) => (
                            <BarChartItem
                                key={data.dateStr}
                                day={data.dayOfWeek}
                                focusSeconds={data.focusSeconds}
                                maxSeconds={maxFocusSeconds}
                                isToday={weekOffset === 0 && index === weeklyData.length - 1}
                                primaryColor={colors.accent}
                                onPress={() => router.push({ pathname: "/day-details", params: { dateStr: data.dateStr } })}
                            />
                        ))
                    )}
                </View>
            </View>
        </View>
    );
}
