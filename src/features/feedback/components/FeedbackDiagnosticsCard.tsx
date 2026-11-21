import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

interface FeedbackDiagnosticsCardProps {
    appVersion: string;
    deviceModel: string;
    osVersion: string;
}

export function FeedbackDiagnosticsCard({
    appVersion,
    deviceModel,
    osVersion,
}: FeedbackDiagnosticsCardProps) {
    const { colors } = useTheme();

    return (
        <View className="mb-6">
            <Text className="text-textMuted font-bold text-[11px] tracking-widest uppercase mb-2.5 ml-1">
                SYSTEM DIAGNOSTICS
            </Text>
            <View className="bg-surfaceElevated border border-border rounded-2xl p-4 shadow-sm flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-surface items-center justify-center mr-3 border border-border">
                    <Ionicons name="hardware-chip-outline" size={20} color={colors.accent} />
                </View>
                <View className="flex-1">
                    <Text className="text-text font-bold text-xs" numberOfLines={1}>
                        Lockout v{appVersion} • {deviceModel}
                    </Text>
                    <Text className="text-textMuted text-[11px] mt-0.5" numberOfLines={1}>
                        {osVersion} • Attached automatically for debugging
                    </Text>
                </View>
                <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            </View>
        </View>
    );
}
