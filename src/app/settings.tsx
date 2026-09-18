import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsController } from "../features/settings/hooks/useSettingsController";
import { SettingsAppearanceCard } from "../features/settings/components/SettingsAppearanceCard";
import { SettingsPermissionsCard } from "../features/settings/components/SettingsPermissionsCard";
import { SettingsNavigationCard } from "../features/settings/components/SettingsNavigationCard";
import { SettingsDangerZoneCard } from "../features/settings/components/SettingsDangerZoneCard";

export default function SettingsTab() {
    const { activeStyle, colors } = useTheme();
    const {
        permissionModalVisible,
        setPermissionModalVisible,
        hasUsage,
        hasOverlay,
        hasBattery,
        allPermissionsGranted,
        resetAllData
    } = useSettingsController();

    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <View className="flex-row items-center px-6 pt-5 pb-5 border-b border-border">
                <Pressable
                    onPress={() => router.back()}
                    className="mr-4 w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Go back to Home"
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </Pressable>
                <Text className="text-text text-3xl font-black tracking-tight">Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <SettingsAppearanceCard />

                <SettingsPermissionsCard
                    allPermissionsGranted={allPermissionsGranted}
                    hasUsage={hasUsage}
                    hasOverlay={hasOverlay}
                    hasBattery={hasBattery}
                    permissionModalVisible={permissionModalVisible}
                    setPermissionModalVisible={setPermissionModalVisible}
                />

                <SettingsNavigationCard />

                <SettingsDangerZoneCard resetAllData={resetAllData} />
            </ScrollView>
        </SafeAreaView>
    );
}
