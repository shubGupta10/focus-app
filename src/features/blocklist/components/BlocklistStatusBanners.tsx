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


            {isSessionActive && (
                <View className="px-6 mb-4 mt-2">
                    <View className="bg-warningMuted border border-warning/50 rounded-[24px] p-5 flex-row items-center">
                        <Ionicons name="lock-closed" size={20} color={colors.warning} style={{ marginRight: 16 }} />
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
