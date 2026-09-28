import { useTheme } from "@/contexts/ThemeContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { BarChartItem } from "../BarChartItem";

export function WeeklyRhythmCard() {
    const { weeklyData } = useAnalytics();
    const { colors } = useTheme();

    const maxFocusSeconds = Math.max(...weeklyData.map((d) => d.focusSeconds), 1);

    const handleBarPress = (dateStr: string) => {
        router.push({
            pathname: "/day-details",
            params: { dateStr },
        });
    };

    return (
        <View className="bg-surfaceElevated rounded-3xl p-6 mb-4">
            <View className="flex-row justify-between items-baseline mb-14">
                <Text className="text-textSecondary font-medium text-[11px] uppercase tracking-widest">
                    Weekly Rhythm
                </Text>
                <Text className="text-textMuted font-medium text-[10px] uppercase tracking-wider">
                    Tap a bar for details
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
                        onPress={() => handleBarPress(data.dateStr)}
                    />
                ))}
            </View>
        </View>
    );
}
