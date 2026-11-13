import { AnimatedPressable } from "@/components/AnimatedPressable";
import { GlobalLoader } from "@/components/GlobalLoader";
import { useTheme } from "@/contexts/ThemeContext";
import { useDayDetails } from "@/features/stats/hooks/useDayDetails";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { getTodayDateString, secondsToHoursAndMinutes } from "@/utils/timeUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatSessionTimeRange(startMs: number, endMs: number): string {
    const startDate = new Date(startMs);
    const endDate = new Date(endMs);

    const startHour12 = startDate.getHours() % 12 || 12;
    const startMin = String(startDate.getMinutes()).padStart(2, "0");
    const startPeriod = startDate.getHours() >= 12 ? "PM" : "AM";

    const endHour12 = endDate.getHours() % 12 || 12;
    const endMin = String(endDate.getMinutes()).padStart(2, "0");
    const endPeriod = endDate.getHours() >= 12 ? "PM" : "AM";

    if (startPeriod === endPeriod) {
        return `${startHour12}:${startMin} to ${endHour12}:${endMin} ${endPeriod}`;
    }
    return `${startHour12}:${startMin} ${startPeriod} to ${endHour12}:${endMin} ${endPeriod}`;
}

export default function DayDetailsScreen() {
    const { activeStyle, colors } = useTheme();
    const { dateStr } = useLocalSearchParams<{ dateStr: string }>();
    const { installedApps } = useFocusEngine();

    const [currentDateStr, setCurrentDateStr] = useState(dateStr || getTodayDateString());
    const { dayDetails, isLoading } = useDayDetails(currentDateStr);

    const handlePrevDay = () => {
        const [y, m, d] = currentDateStr.split("-").map(Number);
        const prev = new Date(y, m - 1, d - 1);
        const yr = prev.getFullYear();
        const mo = String(prev.getMonth() + 1).padStart(2, "0");
        const da = String(prev.getDate()).padStart(2, "0");
        setCurrentDateStr(`${yr}-${mo}-${da}`);
    };

    const handleNextDay = () => {
        const [y, m, d] = currentDateStr.split("-").map(Number);
        const next = new Date(y, m - 1, d + 1);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (next.getTime() > today.getTime()) return;
        const yr = next.getFullYear();
        const mo = String(next.getMonth() + 1).padStart(2, "0");
        const da = String(next.getDate()).padStart(2, "0");
        setCurrentDateStr(`${yr}-${mo}-${da}`);
    };

    const isNextDisabled = currentDateStr >= getTodayDateString();

    const formatHeaderDate = (dateString: string) => {
        const [year, month, day] = dateString.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    };

    const getAppInfo = (packageName: string) => {
        return installedApps.find((a) => a.packageName === packageName);
    };

    const totalSeconds = dayDetails?.sessions.reduce((acc: number, s: any) => acc + s.duration_seconds, 0) ?? 0;
    const { hours, minutes } = secondsToHoursAndMinutes(totalSeconds);
    const totalCoins = dayDetails?.sessions.reduce((acc: number, s: any) => acc + s.coins_earned, 0) ?? 0;

    const sessions = dayDetails?.sessions ?? [];
    const blockedApps = dayDetails?.blockedApps ?? [];
    const maxBlockedCount = Math.max(...blockedApps.map((a: any) => a.count), 1);

    let startHour = 6;
    let endHour = 22;
    sessions.forEach((s) => {
        const sDate = new Date(s.start_time);
        const eDate = new Date(s.start_time + s.duration_seconds * 1000);
        if (sDate.getHours() < startHour) startHour = Math.max(0, sDate.getHours() - 1);
        if (eDate.getHours() >= endHour) endHour = Math.min(24, eDate.getHours() + 1);
    });
    const totalRangeMinutes = Math.max((endHour - startHour) * 60, 60);

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle} edges={["top", "bottom"]}>
            <View className="flex-row items-center justify-between px-6 pt-5 pb-4">
                <View className="flex-row items-center flex-1 mr-3">
                    <AnimatedPressable
                        onPress={() => router.back()}
                        scaleTo={0.88}
                        hapticMode="light"
                        className="w-12 h-12 rounded-full bg-surfaceElevated items-center justify-center mr-4 border border-border shadow-sm"
                        style={{ elevation: 2 }}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons name="chevron-back" size={22} color={colors.text} />
                    </AnimatedPressable>

                    <Text className="text-text font-black text-2xl tracking-tight flex-1" numberOfLines={1}>
                        {formatHeaderDate(currentDateStr)}
                    </Text>
                </View>

                <View className="flex-row items-center gap-2.5">
                    <Pressable
                        onPress={handlePrevDay}
                        hitSlop={8}
                        className="w-11 h-11 rounded-full bg-surfaceElevated border border-border items-center justify-center active:opacity-60"
                        accessibilityLabel="Previous day"
                    >
                        <Ionicons name="chevron-back" size={18} color={colors.text} />
                    </Pressable>

                    <Pressable
                        onPress={handleNextDay}
                        disabled={isNextDisabled}
                        hitSlop={8}
                        className={`w-11 h-11 rounded-full bg-surfaceElevated border border-border items-center justify-center active:opacity-60 ${isNextDisabled ? "opacity-25" : ""}`}
                        accessibilityLabel="Next day"
                    >
                        <Ionicons name="chevron-forward" size={18} color={colors.text} />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="bg-surfaceElevated border border-border rounded-3xl p-6 mb-6 shadow-sm" style={{ elevation: 2 }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider mb-2">
                                Focused
                            </Text>
                            <View className="flex-row items-baseline">
                                {hours > 0 ? (
                                    <>
                                        <Text className="text-text font-black text-5xl tabular-nums tracking-tighter mr-1.5 leading-none">
                                            {hours}
                                        </Text>
                                        <Text className="text-xl text-textSecondary font-bold mr-3">h</Text>
                                        <Text className="text-text font-black text-5xl tabular-nums tracking-tighter mr-1.5 leading-none">
                                            {minutes}
                                        </Text>
                                        <Text className="text-xl text-textSecondary font-bold">m</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-text font-black text-5xl tabular-nums tracking-tighter mr-1.5 leading-none">
                                            {minutes}
                                        </Text>
                                        <Text className="text-xl text-textSecondary font-bold">m</Text>
                                    </>
                                )}
                            </View>
                        </View>

                        <View className="w-px h-16 bg-border" />

                        <View className="flex-1 pl-6">
                            <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider mb-2">
                                Coins Earned
                            </Text>
                            <Text className="text-accent font-black text-5xl tabular-nums tracking-tighter leading-none">
                                +{totalCoins}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="mb-2.5 px-1">
                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">
                        Focus Timeline
                    </Text>
                </View>

                <View className="bg-surfaceElevated border border-border rounded-3xl p-5 mb-5 shadow-sm" style={{ elevation: 1 }}>
                    <View className="h-14 bg-surface rounded-2xl overflow-hidden relative justify-center px-2">
                        {sessions.map((s: any) => {
                            const sDate = new Date(s.start_time);
                            const startMinsFromBase = (sDate.getHours() - startHour) * 60 + sDate.getMinutes();
                            const durationMins = Math.max(s.duration_seconds / 60, 10);

                            const leftPercent = Math.max(0, Math.min(100, (startMinsFromBase / totalRangeMinutes) * 100));
                            const widthPercent = Math.max(4.5, Math.min(100 - leftPercent, (durationMins / totalRangeMinutes) * 100));

                            return (
                                <View
                                    key={s.id}
                                    style={{
                                        position: "absolute",
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`,
                                        height: 38,
                                        backgroundColor: colors.accent,
                                        borderRadius: 8,
                                        opacity: 0.9,
                                    }}
                                />
                            );
                        })}
                    </View>

                    <View className="flex-row justify-between px-2 mt-3">
                        <Text className="text-textMuted text-xs font-semibold">8 AM</Text>
                        <Text className="text-textMuted text-xs font-semibold">12 PM</Text>
                        <Text className="text-textMuted text-xs font-semibold">4 PM</Text>
                        <Text className="text-textMuted text-xs font-semibold">8 PM</Text>
                    </View>
                </View>

                {isLoading ? (
                    <View className="py-12 items-center justify-center">
                        <GlobalLoader size="small" color={colors.accent} />
                    </View>
                ) : sessions.length > 0 ? (
                    <View className="mb-2">
                        {sessions.map((session: any) => {
                            const durationMins = Math.round(session.duration_seconds / 60);
                            const durationLabel = durationMins < 1 ? "< 1 min" : `${durationMins} min session`;
                            const endTimeMs = session.start_time + session.duration_seconds * 1000;

                            return (
                                <View
                                    key={session.id}
                                    className="bg-surfaceElevated border border-border rounded-3xl p-5 mb-3 shadow-sm"
                                    style={{ elevation: 1 }}
                                >
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-text font-black text-lg tracking-tight">
                                            {formatSessionTimeRange(session.start_time, endTimeMs)}
                                        </Text>

                                        <Text className="text-accent font-bold text-base tabular-nums">
                                            +{session.coins_earned} coins
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center">
                                        <Text className="text-textSecondary text-sm font-medium">
                                            {durationLabel}
                                        </Text>

                                        {session.is_strict ? (
                                            <View className="flex-row items-center bg-surface border border-border px-2.5 py-1 rounded-full ml-3">
                                                <Ionicons name="lock-closed" size={11} color={colors.accent} style={{ marginRight: 4 }} />
                                                <Text className="text-accent font-bold text-[10px] uppercase tracking-wider">
                                                    Strict
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="bg-surfaceElevated border border-border rounded-3xl p-8 items-center justify-center mb-4">
                        <Ionicons
                            name="time-outline"
                            size={28}
                            color={colors.textSecondary}
                            style={{ marginBottom: 8 }}
                        />
                        <Text className="text-text font-bold text-base text-center mb-1">
                            No Focus Sessions
                        </Text>
                        <Text className="text-textMuted text-xs text-center">
                            No sessions were recorded on this day.
                        </Text>
                    </View>
                )}

                <View className="mt-4 mb-2.5 px-1">
                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">
                        Distractions Blocked
                    </Text>
                </View>

                <View className="bg-surfaceElevated border border-border rounded-3xl p-6 mb-6 shadow-sm" style={{ elevation: 1 }}>
                    {blockedApps.length > 0 ? (
                        blockedApps.map((item: any, index: number) => {
                            const app = getAppInfo(item.package_name);
                            const appName = app ? app.name : item.package_name.split(".").pop() || item.package_name;
                            const barWidthPercent = (item.count / maxBlockedCount) * 100;
                            const isLast = index === blockedApps.length - 1;

                            return (
                                <View
                                    key={item.package_name}
                                    className={`flex-row items-center ${isLast ? "" : "pb-4 mb-4 border-b border-border"}`}
                                >
                                    <View className="mr-3.5">
                                        {app?.icon ? (
                                            <Image
                                                source={{ uri: `data:image/png;base64,${app.icon}` }}
                                                style={{ width: 40, height: 40, borderRadius: 12 }}
                                            />
                                        ) : (
                                            <View className="w-10 h-10 rounded-xl bg-surface border border-border items-center justify-center">
                                                <Text className="text-text font-bold text-sm">
                                                    {appName.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-1 justify-center">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-text font-bold text-base tracking-tight flex-1 mr-2" numberOfLines={1}>
                                                {appName}
                                            </Text>

                                            <Text className="text-textSecondary text-xs font-medium tabular-nums">
                                                {item.count} {item.count === 1 ? "blocked" : "blocked"}
                                            </Text>
                                        </View>

                                        <View className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                                            <View
                                                className="h-full bg-accent rounded-full"
                                                style={{ width: `${barWidthPercent}%` }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View className="py-6 items-center justify-center">
                            <Ionicons
                                name="shield-outline"
                                size={28}
                                color={colors.textSecondary}
                                style={{ marginBottom: 8 }}
                            />
                            <Text className="text-text font-bold text-base text-center mb-1">
                                No Distractions Blocked
                            </Text>
                            <Text className="text-textMuted text-xs text-center">
                                No apps were intercepted during focus on this day.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}