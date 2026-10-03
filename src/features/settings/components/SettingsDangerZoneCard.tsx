import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface SettingsDangerZoneCardProps {
    resetAllData: () => void;
}

export function SettingsDangerZoneCard({ resetAllData }: SettingsDangerZoneCardProps) {
    const { colors } = useTheme();

    return (
        <View className="px-6 mb-6 mt-2">
            <Text className="text-destructive font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Danger Zone
            </Text>
            
            <View className="bg-surfaceElevated rounded-3xl p-5 border border-destructive/20">
                <View className="mb-5">
                    <Text className="text-text font-bold text-[16px] mb-1">Reset All Data</Text>
                    <Text className="text-textSecondary text-sm leading-5">
                        Delete all sessions, stats, coins, and cached data. This action cannot be undone.
                    </Text>
                </View>
                <Pressable
                    onPress={resetAllData}
                    className="bg-destructive py-3 px-6 rounded-full items-center justify-center active:opacity-80 self-end shadow-sm"
                >
                    <Text className="text-white font-bold text-[14px] tracking-wide">
                        Delete Data
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
