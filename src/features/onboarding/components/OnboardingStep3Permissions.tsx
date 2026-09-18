import { PermissionRow } from "@/components/modals/PermissionModal";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import FocusBlocker from "../../../../modules/focus-blocker/src/FocusBlockerModule";

interface OnboardingStep3PermissionsProps {
    hasUsage: boolean;
    hasOverlay: boolean;
    hasBattery: boolean;
    allPermissionsGranted: boolean;
    onComplete: () => void;
}

export function OnboardingStep3Permissions({
    hasUsage,
    hasOverlay,
    hasBattery,
    allPermissionsGranted,
    onComplete
}: OnboardingStep3PermissionsProps) {
    const { colors } = useTheme();

    return (
        <View className="flex-1 px-6 justify-between py-6">
            <View className="flex-1 justify-center">
                <View className="w-14 h-14 rounded-2xl bg-accent/15 items-center justify-center mb-6">
                    <Ionicons name="options-outline" size={28} color={colors.accent} />
                </View>
                <Text className="text-text text-3xl font-black tracking-tight mb-2">
                    Enable Focus Engine
                </Text>
                <Text className="text-textSecondary text-sm leading-relaxed mb-8">
                    Android requires these system capabilities so Lockout can detect distractions and present the blocking guard.
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
            </View>

            <Pressable
                onPress={onComplete}
                className="bg-accent py-4 rounded-2xl items-center justify-center active:opacity-90 mt-4"
                accessibilityRole="button"
                accessibilityLabel="Finish and Start Focusing"
            >
                <Text className="text-accentForeground font-black text-sm tracking-wider uppercase">
                    {allPermissionsGranted ? "Start Focusing" : "Complete Setup"}
                </Text>
            </Pressable>
        </View>
    );
}
