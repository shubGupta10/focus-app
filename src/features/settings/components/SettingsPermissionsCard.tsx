import { PermissionModal } from "@/components/modals/PermissionModal";
import { usePermissions } from "@/hooks/usePermissions";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

interface SettingsPermissionsCardProps {
    allPermissionsGranted?: boolean;
    hasUsage?: boolean;
    hasOverlay?: boolean;
    hasBattery?: boolean;
    hasNotification?: boolean;
    requestNotification?: () => void;
    permissionModalVisible?: boolean;
    setPermissionModalVisible?: (visible: boolean) => void;
}

export function SettingsPermissionsCard({
    allPermissionsGranted: propAllGranted,
    permissionModalVisible: propVisible,
    setPermissionModalVisible: propSetVisible,
}: SettingsPermissionsCardProps = {}) {
    const [internalVisible, setInternalVisible] = useState(false);
    const { allPermissionsGranted: hookAllGranted } = usePermissions();

    const isVisible = propVisible ?? internalVisible;
    const setVisible = propSetVisible ?? setInternalVisible;
    const allPermissionsGranted = propAllGranted ?? hookAllGranted;

    return (
        <View className="px-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Device
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
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-text font-bold text-[16px]">System Permissions</Text>
                    <View className={`px-3 py-1.5 rounded-full ${allPermissionsGranted ? 'bg-success/10' : 'bg-warning/10'}`}>
                        <Text className={`text-[11px] font-bold tracking-widest uppercase ${allPermissionsGranted ? 'text-success' : 'text-warning'}`}>
                            {allPermissionsGranted ? "All Active" : "Setup Needed"}
                        </Text>
                    </View>
                </View>

                <Text className="text-textSecondary text-sm leading-5 mb-5">
                    Required for foreground app detection, blocking overlays, background tracking, and notifications.
                </Text>

                <Pressable
                    onPress={() => setVisible(true)}
                    className="bg-accent py-3 px-6 rounded-full items-center justify-center active:opacity-80 self-end shadow-sm"
                >
                    <Text className="text-accentForeground font-bold text-[14px] tracking-wide">
                        {allPermissionsGranted ? "Review Permissions" : "Grant Permissions"}
                    </Text>
                </Pressable>
            </View>

            <PermissionModal
                visible={isVisible}
                onClose={() => setVisible(false)}
            />
        </View>
    );
}
