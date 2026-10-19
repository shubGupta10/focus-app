import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function SettingsDataManagementCard() {
    return (
        <View className="px-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Data Management
            </Text>

            <View className="bg-surfaceElevated rounded-3xl overflow-hidden py-2">
                <Pressable
                    onPress={() => router.push("/data-management")}
                    className="flex-row items-center justify-between px-5 py-4 active:bg-background dark:active:bg-background"
                >
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-background items-center justify-center mr-4">
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
                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </Pressable>
            </View>
        </View>
    );
}