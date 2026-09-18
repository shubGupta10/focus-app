import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface SettingsDangerZoneCardProps {
    resetAllData: () => void;
}

export function SettingsDangerZoneCard({ resetAllData }: SettingsDangerZoneCardProps) {
    const { colors } = useTheme();

    return (
        <View className="mx-6 mt-6">
            <Text className="text-destructive font-bold text-xs tracking-wider uppercase mb-3">
                Danger Zone
            </Text>
            <Pressable
                onPress={resetAllData}
                className="bg-surfaceElevated rounded-2xl p-5 flex-row items-center justify-between active:opacity-70"
            >
                <View className="flex-1 pr-4">
                    <Text className="text-text font-bold text-lg mb-1">Reset All Data</Text>
                    <Text className="text-textSecondary text-sm leading-5">
                        Delete all sessions, stats, coins, and cached data.
                    </Text>
                </View>
                <View className="bg-destructive/10 p-2.5 rounded-xl">
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                </View>
            </Pressable>
        </View>
    );
}
