import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function SettingsDataManagementCard() {
    const { colors } = useTheme();

    return (
        <View className="px-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Data Management
            </Text>

            <View
                className="bg-surfaceElevated border border-border rounded-3xl overflow-hidden py-2"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 10,
                }}
            >
                <Pressable
                    onPress={() => router.push("/data-management")}
                    className="flex-row items-center justify-between px-5 py-4 active:bg-surface"
                    accessibilityRole="button"
                    accessibilityLabel="Open Backup and Restore"
                >
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-surface items-center justify-center mr-4">
                            <Ionicons
                                name="file-tray-full-outline"
                                size={16}
                                color="#3b82f6"
                            />
                        </View>
                        <Text className="text-text font-bold text-[16px]">
                            Backup and Restore
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </Pressable>
            </View>
        </View>
    );
}
