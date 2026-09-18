import { PermissionModal } from "@/components/modals/PermissionModal";
import { Pressable, Text, View } from "react-native";

interface SettingsPermissionsCardProps {
    allPermissionsGranted: boolean;
    hasUsage: boolean;
    hasOverlay: boolean;
    hasBattery: boolean;
    permissionModalVisible: boolean;
    setPermissionModalVisible: (visible: boolean) => void;
}

export function SettingsPermissionsCard({
    allPermissionsGranted,
    hasUsage,
    hasOverlay,
    hasBattery,
    permissionModalVisible,
    setPermissionModalVisible
}: SettingsPermissionsCardProps) {
    return (
        <View className="px-6 pb-5">
            <Text className="text-textSecondary font-bold text-xs tracking-wider uppercase mb-3">
                Device
            </Text>

            <View className="bg-surfaceElevated rounded-2xl p-5">
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
