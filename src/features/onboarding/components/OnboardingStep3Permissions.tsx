import { PermissionRow } from "@/components/modals/PermissionModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import FocusBlocker from "../../../../modules/focus-blocker/src/FocusBlockerModule";
import { Material3Switch } from "@/components/Material3Switch";
import { getAnalyticsEnabled, setAnalyticsEnabled } from "@/utils/analytics";
import { useEffect, useState } from "react";

interface OnboardingStep3PermissionsProps {
    hasUsage: boolean;
    hasOverlay: boolean;
    hasBattery: boolean;
    hasNotification: boolean;
    requestNotification: () => void;
    allPermissionsGranted: boolean;
    onComplete: () => void;
}

export function OnboardingStep3Permissions({
    hasUsage,
    hasOverlay,
    hasBattery,
    hasNotification,
    requestNotification,
    allPermissionsGranted,
    onComplete
}: OnboardingStep3PermissionsProps) {
    const { colors } = useTheme();
    const [analyticsAllowed, setAnalyticsAllowed] = useState(true);

    useEffect(() => {
        getAnalyticsEnabled().then(setAnalyticsAllowed);
    }, []);

    const handleToggleAnalytics = (val: boolean) => {
        setAnalyticsAllowed(val);
        setAnalyticsEnabled(val);
    }

    return (
        <View className="flex-1 px-6 justify-between py-6">
            <View className="flex-1 justify-center">
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
                    <PermissionRow
                        label="4. Notifications"
                        description="To alert you when a session ends"
                        isGranted={hasNotification}
                        onRequest={requestNotification}
                        accessibilityLabel="Notifications permission"
                        accessibilityHint="Prompts to allow notifications"
                    />

                    <View className="p-4 rounded-2xl flex-row justify-between items-center bg-surfaceElevated">
                        <View className="flex-1 mr-3">
                            <Text className="text-text font-bold text-base mb-0.5">
                                Anonymous Usage Data
                            </Text>
                            <Text className="text-textSecondary text-xs leading-4">
                                Share anonymous stats like session completions to help make the app better. Zero personal data is collected.
                            </Text>
                        </View>
                        <Material3Switch
                            value={analyticsAllowed}
                            onValueChange={handleToggleAnalytics}
                        />
                    </View>
                </View>
            </View>

            <Pressable
                onPress={onComplete}
                className="bg-accent py-4 rounded-full items-center justify-center active:opacity-90 mt-4"
                accessibilityRole="button"
                accessibilityLabel="Finish and Start Focusing"
            >
                <Text className="text-accentForeground font-bold text-[15px] tracking-wide">
                    {allPermissionsGranted ? "Start Focusing" : "Complete Setup"}
                </Text>
            </Pressable>
        </View>
    );
}
