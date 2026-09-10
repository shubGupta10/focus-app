import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { cssInterop } from "nativewind";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import FocusBlocker from "../../../modules/focus-blocker/src/FocusBlockerModule";
import { useTheme } from "../../contexts/ThemeContext";

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
    hasUsage: boolean;
    hasOverlay: boolean;
    hasBattery: boolean;
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
        <TouchableOpacity
            className={`p-4 rounded-2xl flex-row justify-between items-center border ${isGranted ? 'bg-surfaceElevated border-success/40' : 'bg-surfaceElevated border-border/80'
                }`}
            onPress={isGranted ? undefined : onRequest}
            disabled={isGranted}
            accessibilityRole={isGranted ? "text" : "button"}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={isGranted ? "Already granted" : accessibilityHint}
        >
            <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-0.5">
                    <Text className="text-text font-bold text-base mr-2">{label}</Text>
                    {/* P2: ✓ / → instead of ● ● — not color alone */}
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
        </TouchableOpacity>
    );
}

export function PermissionModal({ visible, onClose, hasUsage, hasOverlay, hasBattery }: PermissionModalProps) {
    const { colors, isDarkMode } = useTheme();
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
                <View className="bg-surface w-full max-w-sm rounded-3xl p-6 border border-border">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-text text-xl font-black tracking-tight">Permissions Required</Text>
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center border border-border"
                            onPress={onClose}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            accessibilityRole="button"
                            accessibilityLabel="Close permissions modal"
                        >
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-textSecondary text-sm leading-5 mb-5 font-medium">
                        Focus needs a few permissions to block distractions and keep the timer running smoothly.
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
                    </View>

                    <TouchableOpacity
                        className="mt-5 bg-accent py-3.5 rounded-xl items-center active:opacity-80"
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="Done and return"
                    >
                        <Text className="text-accentForeground font-black text-sm uppercase">Done</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    )
}