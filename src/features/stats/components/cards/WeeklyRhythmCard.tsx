import { useAnalytics } from "@/hooks/useAnalytics";
import { useTheme } from "@/contexts/ThemeContext";
import { Text, View } from "react-native";
import { BarChartItem } from "../BarChartItem";

export function WeeklyRhythmCard() {
    const { weeklyData } = useAnalytics();
    const { colors } = useTheme();

    const maxFocusSeconds = Math.max(...weeklyData.map((d) => d.focusSeconds), 1);

    return (
        <View className="bg-surfaceElevated rounded-3xl p-6 mb-4">
            <View className="flex-row justify-between items-baseline mb-6">
                <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest">
                    Weekly Rhythm
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
    );
}
