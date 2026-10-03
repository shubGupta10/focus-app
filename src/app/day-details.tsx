import { useTheme } from "@/contexts/ThemeContext";
import { useDayDetails } from "@/features/stats/hooks/useDayDetails";
import { formatExactTime, getTodayDateString, secondsToHoursAndMinutes } from "@/utils/timeUtils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { GlobalLoader } from "@/components/GlobalLoader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DayDetailsScreen() {
    const { activeStyle, colors } = useTheme();
    const { dateStr } = useLocalSearchParams<{ dateStr: string }>();

    const safeDateStr = dateStr || getTodayDateString();
    const { dayDetails, isLoading } = useDayDetails(safeDateStr);

    const formatHeaderDate = (dateString: string) => {
        const today = getTodayDateString();
        const [year, month, day] = dateString.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        const formatted = d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });

        if (dateString === today) {
            return `Today (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
        }
        return formatted;
    };

    const totalSeconds = dayDetails?.sessions.reduce((acc: any, s: any) => acc + s.duration_seconds, 0) ?? 0;
    const { hours, minutes } = secondsToHoursAndMinutes(totalSeconds);
    const totalCoins = dayDetails?.sessions.reduce((acc: any, s: any) => acc + s.coins_earned, 0) ?? 0;
    const sessionCount = dayDetails?.sessions.length ?? 0;

    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            {/* Header */}
            <View className="flex-row items-center px-6 pt-5 pb-3">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70 mr-4"
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                </Pressable>

                <View className="flex-1">
                    <Text className="text-text font-black text-2xl tracking-tight" numberOfLines={1}>
                        {formatHeaderDate(safeDateStr)}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 60, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Day Summary Card */}
                <View className="bg-surfaceElevated rounded-3xl p-6 mb-5">
                    <Text className="text-textSecondary font-medium text-[11px] uppercase tracking-widest mb-3">
                        Total Focus Time
                    </Text>

                    <View className="flex-row items-baseline mb-2">
                        {hours > 0 ? (
                            <>
                                <Text className="text-text font-black text-5xl tabular-nums tracking-tighter leading-none mr-1">
                                    {hours}
                                </Text>
                                <Text className="text-lg text-textSecondary font-bold mr-3">h</Text>
                                <Text className="text-text font-black text-5xl tabular-nums tracking-tighter leading-none mr-1">
                                    {minutes}
                                </Text>
                                <Text className="text-lg text-textSecondary font-bold">m</Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-text font-black text-5xl tabular-nums tracking-tighter leading-none mr-1">
                                    {minutes}
                                </Text>
                                <Text className="text-lg text-textSecondary font-bold">m</Text>
                            </>
                        )}
                    </View>

                    <View className="flex-row items-center">
                        <Text className="text-textSecondary font-medium text-sm">
                            {sessionCount} {sessionCount === 1 ? "session" : "sessions"} completed
                        </Text>
                        {totalCoins > 0 ? (
                            <>
                                <Text className="text-textSecondary font-medium text-sm mx-2">•</Text>
                                <Text className="text-warning font-bold text-sm tabular-nums">
                                    +{totalCoins} coins
                                </Text>
                            </>
                        ) : null}
                    </View>
                </View>

                {/* Sessions Section Header */}
                <View className="mb-2 px-1">
                    <Text className="text-textSecondary font-medium text-[11px] uppercase tracking-widest mb-3">
                        Sessions ({sessionCount})
                    </Text>
                </View>

                {isLoading ? (
                    <View className="py-12 items-center justify-center">
                        <GlobalLoader size="small" color={colors.accent} />
                    </View>
                ) : dayDetails && dayDetails.sessions.length > 0 ? (
                    <View>
                        {dayDetails.sessions.map((session: any, index: any) => {
                            const durationMins = Math.round(session.duration_seconds / 60);
                            const durationLabel = durationMins < 1 ? "< 1 min" : `${durationMins} mins`;

                            return (
                                <View
                                    key={session.id}
                                    className="bg-surfaceElevated rounded-2xl p-5 mb-3"
                                >
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center">
                                            <Text className="text-text font-black text-lg tracking-tight mr-2">
                                                {durationLabel}
                                            </Text>
                                            {session.is_strict ? (
                                                <View className="px-2 py-0.5 rounded-md bg-surface">
                                                    <Text className="text-warning font-bold text-[11px]">
                                                        Strict
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>

                                        <Text className="text-warning font-bold text-sm tabular-nums">
                                            +{session.coins_earned} coins
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-textSecondary text-xs font-medium">
                                            Session #{index + 1}
                                        </Text>
                                        <Text className="text-textSecondary text-xs font-medium tabular-nums">
                                            Started at {formatExactTime(session.start_time)}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="bg-surfaceElevated rounded-3xl p-8 items-center justify-center">
                        <Ionicons
                            name="time-outline"
                            size={28}
                            color={colors.textSecondary}
                            style={{ marginBottom: 8 }}
                        />
                        <Text className="text-text font-bold text-base text-center mb-1">
                            No Focus Activity
                        </Text>
                        <Text className="text-textMuted text-xs text-center">
                            No focus sessions were recorded on this day.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
