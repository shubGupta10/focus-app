import { useAnalytics } from "@/hooks/useAnalytics";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useTheme } from "@/contexts/ThemeContext";
import { formatTimeAgo } from "../../../../utils/timeUtils";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function RecentInterceptionsCard() {
    const { recentBlockedAttempts } = useAnalytics();
    const { installedApps } = useFocusEngine();
    const { colors } = useTheme();

    const getAppName = (packageName: string) => {
        const app = installedApps.find(a => a.packageName === packageName);
        return app ? app.name : packageName.split('.').pop() || packageName;
    };

    return (
        <View className="bg-surfaceElevated rounded-3xl p-6 mb-4">
            <Text className="text-textSecondary font-bold text-[11px] uppercase tracking-widest mb-6">
                Recent Interceptions
            </Text>

            {recentBlockedAttempts && recentBlockedAttempts.length > 0 ? (
                <View className="space-y-4">
                    {recentBlockedAttempts.map((attempt) => {
                        const appName = getAppName(attempt.package_name);

                        return (
                            <View
                                key={attempt.id}
                                className="flex-row items-center justify-between mb-4"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-4">
                                        <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-text font-bold text-base tracking-tight" numberOfLines={1}>
                                            {appName}
                                        </Text>
                                        <Text className="text-textSecondary text-xs font-medium mt-0.5">
                                            Blocked
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-textSecondary text-xs font-medium">
                                    {formatTimeAgo(attempt.timestamp)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            ) : (
                <View className="py-2 items-center">
                    <Ionicons name="shield-outline" size={32} color={colors.textMuted} style={{ marginBottom: 12 }} />
                    <Text className="text-textSecondary text-sm font-medium text-center">
                        No distractions blocked recently
                    </Text>
                </View>
            )}
        </View>
    );
}
