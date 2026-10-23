import { useTheme } from "@/contexts/ThemeContext";
import { NotificationItem, useNotification } from "@/hooks/useNotifications";
import { formatTimeAgo } from "@/utils/timeUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationScreen() {
    const { colors, isDarkMode } = useTheme();
    const { notifications, grouped, markAllAsRead, clearAll } = useNotification();

    useEffect(() => {
        markAllAsRead();
    }, []);

    const handleClearAll = () => {
        if (notifications.length === 0) return;

        Alert.alert(
            "Clear Notifications",
            "Are you sure you want to delete all notification?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear All", style: "destructive", onPress: () => clearAll() }
            ]
        );
    };


    const getBadgeConfig = (type: NotificationItem["type"]) => {
        switch (type) {
            case "milestone":
                return {
                    name: "flame-outline" as const,
                    color: colors.warning,
                    bg: colors.warningMuted,
                };
            case "session":
                return {
                    name: "time-outline" as const,
                    color: colors.accent,
                    bg: colors.accentMuted,
                };
            case "defense":
                return {
                    name: "shield-checkmark-outline" as const,
                    color: colors.success,
                    bg: colors.successMuted,
                };
            case "update":
            default:
                return {
                    name: "sparkles-outline" as const,
                    color: colors.accent,
                    bg: colors.accentMuted,
                };
        }
    };

    const renderCard = (item: NotificationItem) => {
        const badge = getBadgeConfig(item.type);
        return (
            <View
                key={item.id}
                className="bg-surfaceElevated rounded-2xl p-4 mb-3 flex-row items-start"
            >
                <View
                    style={{ backgroundColor: badge.bg }}
                    className="w-10 h-10 rounded-full items-center justify-center mr-3.5 mt-0.5"
                >
                    <Ionicons name={badge.name} size={18} color={badge.color} />
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                        <Text
                            className="text-text font-semibold text-[15px] flex-1 mr-2"
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        <Text className="text-textMuted text-xs font-normal">
                            {formatTimeAgo(item.timestamp)}
                        </Text>
                    </View>
                    <Text className="text-textSecondary text-[13px] mt-1 leading-relaxed">
                        {item.description}
                    </Text>
                    {item.action_label && item.action_url && (
                        <Pressable
                            onPress={() => {
                                if (item.type === "update" || item.action_url?.startsWith("/")) {
                                    router.push("/updates");
                                } else if (item.action_url) {
                                    Linking.openURL(item.action_url);
                                }
                            }}
                            className="mt-3 bg-accent px-3.5 py-1.5 rounded-xl self-start active:opacity-75"
                        >
                            <Text className="text-accentForeground font-semibold text-xs">
                                {item.action_label}
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>
        );
    };

    const renderSection = (title: string, items: NotificationItem[]) => {
        if (items.length === 0) return null;
        return (
            <View key={title} className="mb-5">
                <Text
                    style={{ color: colors.warning }}
                    className="font-bold text-xs uppercase tracking-wider mb-2.5 px-0.5"
                >
                    {title}
                </Text>
                {items.map(renderCard)}
            </View>
        );
    };
    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            <View className="flex-row items-center justify-between px-6 pt-3 pb-2">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </Pressable>
                <Pressable
                    onPress={handleClearAll}
                    disabled={notifications.length === 0}
                    className={`w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70 ${notifications.length === 0 ? "opacity-30" : ""
                        }`}
                    accessibilityRole="button"
                    accessibilityLabel="Clear all notifications"
                >
                    <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                </Pressable>
            </View>

            <View className="px-6 pt-2 pb-4">
                <Text className="text-text text-3xl font-black">Notifications</Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 24,
                }}
                showsVerticalScrollIndicator={false}
            >
                {notifications.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 opacity-70">
                        <View className="w-16 h-16 rounded-full bg-surfaceElevated items-center justify-center mb-4">
                            <Ionicons
                                name="notifications-off-outline"
                                size={30}
                                color={colors.textSecondary}
                            />
                        </View>
                        <Text className="text-text font-bold text-lg">All caught up</Text>
                        <Text className="text-textSecondary text-sm mt-1">
                            No notifications right now.
                        </Text>
                    </View>
                ) : (
                    <>
                        {renderSection("Today", grouped.today)}
                        {renderSection("Yesterday", grouped.yesterday)}
                        {renderSection("Earlier", grouped.earlier)}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
