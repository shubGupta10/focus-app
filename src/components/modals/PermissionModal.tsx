import { AnimatedPressable } from "@/components/AnimatedPressable";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { cssInterop } from "nativewind";
import { Modal, Text, View } from "react-native";
import FocusBlocker from "../../../modules/focus-blocker/src/FocusBlockerModule";
import { useTheme } from "../../contexts/ThemeContext";
import { usePermissions } from "@/hooks/usePermissions";

cssInterop(Ionicons, {
    className: {
        target: "style",
        nativeStyleToProp: {
            color: true,
        },
    },
});

interface PermissionModalProps {
    visible: boolean;
    onClose: () => void;
    hasUsage?: boolean;
    hasOverlay?: boolean;
    hasBattery?: boolean;
    hasNotification?: boolean;
    requestNotification?: () => void;
}

export function PermissionRow({
    label,
    description,
    isGranted,
    onRequest,
    accessibilityLabel,
    accessibilityHint,
}: {
    label: string;
    description: string;
    isGranted: boolean;
    onRequest: () => void;
    accessibilityLabel: string;
    accessibilityHint: string;
}) {
    const { colors } = useTheme();

    return (
        <AnimatedPressable
            className={`p-4 rounded-2xl flex-row justify-between items-center ${isGranted ? 'bg-successMuted border border-transparent' : 'bg-surface border border-border'
                }`}
            onPress={isGranted ? undefined : onRequest}
            disabled={isGranted}
            scaleTo={0.98}
            hapticMode="light"
            accessibilityRole={isGranted ? "text" : "button"}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={isGranted ? "Already granted" : accessibilityHint}
        >
            <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-0.5">
                    <Text className="text-text font-bold text-base mr-2">{label}</Text>
                    <Text className={`text-[11px] font-bold ${isGranted ? 'text-success' : 'text-warning'}`}>
                        {isGranted ? "✓ Granted" : "→ Setup"}
                    </Text>
                </View>
                <Text className="text-textSecondary text-xs">{description}</Text>
            </View>

            {isGranted ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            )}
        </AnimatedPressable>
    );
}

export function PermissionModal({
    visible,
    onClose,
    hasUsage: propHasUsage,
    hasOverlay: propHasOverlay,
    hasBattery: propHasBattery,
    hasNotification: propHasNotification,
    requestNotification: propRequestNotification,
}: PermissionModalProps) {
    const { colors, isDarkMode } = useTheme();
    const permissions = usePermissions();

    const hasUsage = propHasUsage ?? permissions.hasUsage;
    const hasOverlay = propHasOverlay ?? permissions.hasOverlay;
    const hasBattery = propHasBattery ?? permissions.hasBattery;
    const hasNotification = propHasNotification ?? permissions.hasNotification;
    const requestNotification = propRequestNotification ?? permissions.requestNotification;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView
                intensity={isDarkMode ? 25 : 45}
                tint={isDarkMode ? "dark" : "light"}
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                    backgroundColor: colors.scrim,
                }}
            >
                <View
                    className="bg-surfaceElevated border border-border w-full max-w-sm rounded-[28px] p-6"
                    style={{
                        elevation: 6,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                    }}
                >
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-text text-xl font-black tracking-tight">Permissions Required</Text>
                        <AnimatedPressable
                            className="w-10 h-10 rounded-full bg-surface items-center justify-center"
                            onPress={onClose}
                            scaleTo={0.88}
                            hapticMode="light"
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close permissions modal"
                        >
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </AnimatedPressable>
                    </View>
                    <Text className="text-textSecondary text-sm leading-5 mb-5 font-medium">
                        Lockout needs a few permissions to block distractions and keep the timer running smoothly.
                    </Text>

                    <View className="gap-3">
                        <PermissionRow
                            label="1. Usage Access"
                            description="To know when you open a distracting app"
                            isGranted={hasUsage}
                            onRequest={() => FocusBlocker.requestUsagePermission()}
                            accessibilityLabel="Usage Access permission"
                            accessibilityHint="Opens system settings to grant usage access"
                        />
                        <PermissionRow
                            label="2. Display Over Apps"
                            description="To show the block screen over apps"
                            isGranted={hasOverlay}
                            onRequest={() => FocusBlocker.requestOverlayPermission()}
                            accessibilityLabel="Display Over Apps permission"
                            accessibilityHint="Opens system settings to grant overlay permission"
                        />
                        <PermissionRow
                            label="3. Ignore Battery"
                            description="To keep background blocking alive"
                            isGranted={hasBattery}
                            onRequest={() => FocusBlocker.requestBatteryPermission()}
                            accessibilityLabel="Ignore Battery Optimization permission"
                            accessibilityHint="Opens system settings to disable battery optimization"
                        />
                        <PermissionRow
                            label="4. Notifications"
                            description="To alert you when a session ends"
                            isGranted={hasNotification}
                            onRequest={requestNotification}
                            accessibilityLabel="Notifications permission"
                            accessibilityHint="Prompts to allow notifications"
                        />
                    </View>

                    {/* M3 Filled Button (Primary Emphasis) */}
                    <AnimatedPressable
                        className="mt-6 w-full bg-accent py-4 rounded-full items-center justify-center"
                        onPress={onClose}
                        scaleTo={0.97}
                        hapticMode="light"
                        accessibilityRole="button"
                        accessibilityLabel="Done and return"
                    >
                        <Text className="text-accentForeground font-bold text-sm tracking-wider uppercase">Done</Text>
                    </AnimatedPressable>
                </View>
            </BlurView>
        </Modal>
    );
}
