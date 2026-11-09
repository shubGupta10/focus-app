import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

interface SettingsDangerZoneCardProps {
    resetAllData: () => void;
}

export function SettingsDangerZoneCard({ resetAllData }: SettingsDangerZoneCardProps) {

    return (
        <View className="px-6 mb-6 mt-2">
            <Text className="text-destructive font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Danger Zone
            </Text>

            <View
                className="bg-surfaceElevated border border-border rounded-3xl p-5"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 10,
                }}
            >
                <View className="mb-5">
                    <Text className="text-text font-bold text-[16px] mb-1">Reset All Data</Text>
                    <Text className="text-textSecondary text-sm leading-5">
                        Delete all sessions, stats, coins, and cached data. This action cannot be undone.
                    </Text>
                </View>
                {/* M3 Destructive Filled Button */}
                <AnimatedPressable
                    onPress={resetAllData}
                    scaleTo={0.94}
                    hapticMode="heavy"
                    className="bg-destructive py-3 px-6 rounded-full items-center justify-center self-end"
                    accessibilityRole="button"
                    accessibilityLabel="Delete all data"
                >
                    <Text className="text-white font-bold text-[14px] tracking-wide">
                        Delete Data
                    </Text>
                </AnimatedPressable>
            </View>
        </View>
    );
}
