import { useTheme } from "@/contexts/ThemeContext";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AllTimeStatsCard } from "../../features/stats/components/cards/AllTimeStatsCard";
import { RecentInterceptionsCard } from "../../features/stats/components/cards/RecentInterceptionsCard";
import { StreakAndBlockedCard } from "../../features/stats/components/cards/StreakAndBlockedCard";
import { TodayFocusCard } from "../../features/stats/components/cards/TodayFocusCard";
import { WeeklyRhythmCard } from "../../features/stats/components/cards/WeeklyRhythmCard";
export default function ProgressTab() {
    const { activeStyle } = useTheme();

    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <View className="px-6 pt-5 pb-2">
                <Text className="text-text font-black text-3xl tracking-tight">Progress</Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 130, paddingTop: 12 }}
                showsVerticalScrollIndicator={false}
            >
                <TodayFocusCard />
                <StreakAndBlockedCard />
                <WeeklyRhythmCard />
                <RecentInterceptionsCard />
                <AllTimeStatsCard />
            </ScrollView>
        </SafeAreaView>
    );
}