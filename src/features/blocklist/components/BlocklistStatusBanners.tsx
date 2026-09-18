import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface BlocklistStatusBannersProps {
    isSessionActive: boolean;
    isStrictSession: boolean;
    selectedAppsCount: number;
}

export function BlocklistStatusBanners({
    isSessionActive,
    isStrictSession,
    selectedAppsCount
}: BlocklistStatusBannersProps) {
    const { colors } = useTheme();

    return (
        <>
            {selectedAppsCount === 0 && !isSessionActive && (
                <View className="px-6 mb-3">
                    <View className="bg-surfaceElevated rounded-2xl p-4 flex-row items-center">
                        <Ionicons name="shield-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                        <Text className="text-textSecondary text-xs leading-5 flex-1 font-medium">
                            Choose the apps that distract you most. Lockout will guard them when you start a focus session.
                        </Text>
                    </View>
                </View>
            )}

            {isSessionActive && (
                <View className="px-6 mb-4">
                    <View className="bg-warningMuted border border-warning rounded-2xl p-4 flex-row items-center">
                        <Ionicons name="lock-closed" size={20} color={colors.warning} style={{ marginRight: 12 }} />
                        <Text className="text-warning font-bold text-sm flex-1">
                            {isStrictSession
                                ? "Block list is locked during a strict session."
                                : "End your current session to modify the block list."}
                        </Text>
                    </View>
                </View>
            )}
        </>
    );
}
