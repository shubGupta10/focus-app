import { useTheme } from "@/contexts/ThemeContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Text, View } from "react-native";

export function RecentInterceptionsCard() {
    const { todayBlockedApps, todayBlockedCount } = useAnalytics();
    const { installedApps } = useFocusEngine();
    const { colors } = useTheme();

    const getAppInfo = (packageName: string) => {
        return installedApps.find((a) => a.packageName === packageName);
    };

    const maxBlockedCount = Math.max(...todayBlockedApps.map((a) => a.count), 1);

    return (
        <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3 px-1">
                <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider">
                    Most Blocked Today
                </Text>

                <Text className="text-textSecondary text-xs font-medium">
                    {todayBlockedCount} {todayBlockedCount === 1 ? "block" : "blocks"}
                </Text>
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
                {todayBlockedApps && todayBlockedApps.length > 0 ? (
                    todayBlockedApps.map((item, index) => {
                        const app = getAppInfo(item.package_name);
                        const appName = app ? app.name : item.package_name.split(".").pop() || item.package_name;
                        const barWidthPercent = (item.count / maxBlockedCount) * 100;
                        const isLast = index === todayBlockedApps.length - 1;

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
                            name="shield-checkmark-outline"
                            size={26}
                            color={colors.textSecondary}
                            style={{ marginBottom: 8 }}
                        />
                        <Text className="text-text font-bold text-sm text-center">
                            No Distractions Blocked
                        </Text>
                        <Text className="text-textMuted text-xs text-center mt-1">
                            Zero interruptions recorded today.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
