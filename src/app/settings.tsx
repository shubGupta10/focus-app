import { Material3Switch } from "@/components/Material3Switch";
import { PermissionModal } from "@/components/modals/PermissionModal";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FocusBlocker from "../../modules/focus-blocker/src/FocusBlockerModule";

export default function SettingsTab() {
    const { isMaterialYou, setIsMaterialYou, isDarkMode, toggleDarkMode, activeStyle, colors } = useTheme();
    const [permissionModalVisible, setPermissionModalVisible] = useState(false);

    const [hasUsage, setHasUsage] = useState(false);
    const [hasOverlay, setHasOverlay] = useState(false);
    const [hasBattery, setHasBattery] = useState(false);

    const checkPermissions = () => {
        setHasUsage(FocusBlocker.hasUsagePermission());
        setHasOverlay(FocusBlocker.hasOverlayPermission());
        setHasBattery(FocusBlocker.hasBatteryPermission());
    };

    useEffect(() => {
        checkPermissions();
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") checkPermissions();
        });
        return () => sub.remove();
    }, []);

    const allPermissionsGranted = hasUsage && hasOverlay && hasBattery;

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
            <View className="flex-row items-center px-6 pt-5 pb-5 border-b border-border">
                <Pressable
                    onPress={() => router.back()}
                    className="mr-4 w-10 h-10 rounded-full bg-surface items-center justify-center active:opacity-70 border border-border"
                    accessibilityRole="button"
                    accessibilityLabel="Go back to Home"
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </Pressable>
                <Text className="text-text text-3xl font-black tracking-tight">Settings</Text>
            </View>

            <View className="px-6 py-5">
                <Text className="text-textSecondary font-bold text-xs tracking-wider uppercase mb-3">
                    Appearance
                </Text>

                <View className="bg-surface rounded-2xl p-5 mb-3.5 flex-row items-center justify-between border border-border">
                    <View className="flex-1 pr-4">
                        <Text className="text-text font-bold text-lg mb-1">Dark Mode</Text>
                        <Text className="text-textSecondary text-sm leading-5">
                            Switch between dark and light appearance.
                        </Text>
                    </View>
                    <Material3Switch
                        value={isDarkMode}
                        onValueChange={toggleDarkMode}
                    />
                </View>

                <View className="bg-surface rounded-2xl p-5 mb-6 flex-row items-center justify-between border border-border">
                    <View className="flex-1 pr-4">
                        <Text className="text-text font-bold text-lg mb-1">Dynamic Colors</Text>
                        <Text className="text-textSecondary text-sm leading-5">
                            Use Material You to match the app's theme to your Android wallpaper.
                        </Text>
                    </View>
                    <Material3Switch
                        value={isMaterialYou}
                        onValueChange={setIsMaterialYou}
                    />
                </View>

                <Text className="text-textSecondary font-bold text-xs tracking-wider uppercase mb-3">
                    Device
                </Text>

                <View className="bg-surface rounded-2xl p-5 border border-border">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-text font-bold text-lg">System Permissions</Text>
                        <View className={`px-2.5 py-1 rounded-full border ${allPermissionsGranted ? 'bg-successMuted border-transparent' : 'bg-warningMuted border-warning/40'}`}>
                            <Text className={`text-xs font-bold ${allPermissionsGranted ? 'text-success' : 'text-warning'}`}>
                                {allPermissionsGranted ? "All Active" : "Setup Needed"}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-textSecondary text-sm leading-5 mb-4">
                        Required for foreground app detection, blocking overlays, and background tracking.
                    </Text>

                    <Pressable
                        onPress={() => setPermissionModalVisible(true)}
                        className="bg-accent py-3 px-4 rounded-xl items-center justify-center active:opacity-80"
                    >
                        <Text className="text-accentForeground font-black text-xs tracking-wider uppercase">
                            {allPermissionsGranted ? "Review Permissions" : "Grant Permissions"}
                        </Text>
                    </Pressable>
                </View>
            </View>

            <PermissionModal
                visible={permissionModalVisible}
                onClose={() => setPermissionModalVisible(false)}
                hasUsage={hasUsage}
                hasOverlay={hasOverlay}
                hasBattery={hasBattery}
            />

            <View className="mx-6 mt-4 bg-surface rounded-2xl p-5 border border-border flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                    <Text className="text-text font-bold text-lg mb-1">Onboarding Guide</Text>
                    <Text className="text-textSecondary text-sm leading-5">
                        Review how Lockout works and learn about intentional focus.
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.push("/onboarding")}
                    className="bg-surface border border-border px-3.5 py-2 rounded-xl active:opacity-75"
                >
                    <Text className="text-text font-bold text-xs uppercase tracking-wider">
                        Revisit
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
