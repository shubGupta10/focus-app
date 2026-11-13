import { useTheme } from "@/contexts/ThemeContext";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RecentInterceptionsCard } from "../../features/stats/components/cards/RecentInterceptionsCard";
import { TodayFocusCard } from "../../features/stats/components/cards/TodayFocusCard";
import { WeeklyRhythmCard } from "../../features/stats/components/cards/WeeklyRhythmCard";

export default function ProgressTab() {
    const { activeStyle } = useTheme();

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle} edges={['top', 'left', 'right']}>
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 24, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <TodayFocusCard />
                <WeeklyRhythmCard />
                <RecentInterceptionsCard />
            </ScrollView>
        </SafeAreaView>
    );
}