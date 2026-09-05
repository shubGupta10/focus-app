import { PermissionModal } from "@/components/modals/PermissionModal";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { Material3Switch } from "@/components/Material3Switch";
import FocusBlocker from "../../modules/focus-blocker/src/FocusBlockerModule";

export default function Settings() {
    const router = useRouter();
    const { isMaterialYou, setIsMaterialYou, switchColors, activeStyle } = useTheme();
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

    return (
        <View className="flex-1 bg-background" style={activeStyle}>
            <View className="flex-row items-center px-6 pt-16 pb-6 border-b border-border">
                <Pressable onPress={() => router.back()} className="mr-4 p-2 -ml-2 active:opacity-70">
                    <Ionicons name="arrow-back" size={28} className="text-icon" />
                </Pressable>
                <Text className="text-text text-2xl font-black tracking-wider">SETTINGS</Text>
            </View>

            <View className="px-6 py-8">
                <Text className="text-textSecondary font-bold text-xs tracking-widest uppercase mb-4">
                    Appearance
                </Text>

                <View className="bg-surface rounded-2xl p-5 mb-8 flex-row items-center justify-between border border-border">
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

                <Text className="text-textSecondary font-bold text-xs tracking-widest uppercase mb-4">
                    Device
                </Text>

                <View className="bg-surface rounded-2xl p-5 flex-row items-center justify-between border border-border">
                    <View className="flex-1 pr-4">
                        <Text className="text-text font-bold text-lg mb-1">System Permissions</Text>
                        <Text className="text-textSecondary text-sm leading-5">
                            Manage access to usage stats, overlays, and background services.
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => setPermissionModalVisible(true)}
                        className="bg-accent px-4 py-2 rounded-xl active:opacity-80"
                    >
                        <Text className="text-background font-bold text-sm tracking-widest">MANAGE</Text>
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
        </View>
    );
}
