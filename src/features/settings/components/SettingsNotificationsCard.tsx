import { Material3Switch } from "@/components/Material3Switch";
import { useSettings } from "@/hooks/useSettings";
import { useAppStore } from "@/store/useAppStore";
import FocusBlocker from "../../../../modules/focus-blocker/src/FocusBlockerModule";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Alert, AppState, Pressable, Text, View } from "react-native";

export function SettingNotificationCard() {
    const { getSetting, setSetting } = useSettings();
    const [hapticsEnabled, setHapticsEnabled] = useState(true);
    const [silenceNotifications, setSilenceNotifications] = useState(false);
    const waitingForPermission = useRef(false);

    const checkSilenceSetting = async () => {
        const val = await getSetting("silence_notifications_enabled");
        const hasPermission = FocusBlocker.hasNotificationListenerPermission();

        if (hasPermission && (val === "true" || waitingForPermission.current)) {
            waitingForPermission.current = false;
            setSilenceNotifications(true);
            await setSetting("silence_notifications_enabled", "true");
            FocusBlocker.setSilenceNotifications(true);
        } else {
            waitingForPermission.current = false;
            setSilenceNotifications(false);
            if (val === "true" && !hasPermission) {
                await setSetting("silence_notifications_enabled", "false");
                FocusBlocker.setSilenceNotifications(false);
            }
        }
    };

    useEffect(() => {
        getSetting("haptics_enabled").then(val => {
            const enabled = val !== "false";
            setHapticsEnabled(enabled);
            useAppStore.getState().setHapticsEnabled(enabled);
        });
        checkSilenceSetting();

        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                checkSilenceSetting();
            }
        });
        return () => sub.remove();
    }, [getSetting]);

    const handleHapticsToggle = (val: boolean) => {
        setHapticsEnabled(val);
        setSetting("haptics_enabled", val.toString());
        useAppStore.getState().setHapticsEnabled(val);
        if (val) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
        }
    };

    const handleSilenceToggle = async (val: boolean) => {
        if (val) {
            const hasPerm = FocusBlocker.hasNotificationListenerPermission();
            if (hasPerm) {
                setSilenceNotifications(true);
                await setSetting("silence_notifications_enabled", "true");
                FocusBlocker.setSilenceNotifications(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
            } else {
                Alert.alert(
                    "Notification Access Required",
                    "To silence incoming notifications from blocked apps during a focus session, Lockout requires Notification Access.\n\nLockout only dismisses notifications from apps in your active session blocklist.",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Open Settings",
                            onPress: () => {
                                waitingForPermission.current = true;
                                FocusBlocker.requestNotificationListenerPermission();
                            }
                        }
                    ]
                );
            }
        } else {
            setSilenceNotifications(false);
            await setSetting("silence_notifications_enabled", "false");
            FocusBlocker.setSilenceNotifications(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
        }
    };

    return (
        <View className="px-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Notification & Sounds
            </Text>

            <View className="bg-surfaceElevated rounded-3xl overflow-hidden">
                <Pressable
                    onPress={() => handleHapticsToggle(!hapticsEnabled)}
                    className="flex-row items-center justify-between p-5 active:opacity-80"
                    accessibilityRole="switch"
                    accessibilityState={{ checked: hapticsEnabled }}
                    accessibilityLabel="Toggle Haptic Feedback"
                >
                    <View className="flex-1 pr-4">
                        <Text className="text-text font-bold text-[16px] mb-1">
                            Haptic Feedback
                        </Text>
                        <Text className="text-textSecondary text-sm leading-5">
                            Feel gentle vibrations when starting, stopping, or pausing sessions.
                        </Text>
                    </View>
                    <View pointerEvents="none">
                        <Material3Switch
                            value={hapticsEnabled}
                            onValueChange={handleHapticsToggle}
                        />
                    </View>
                </Pressable>

                <View className="h-[1px] bg-border/40 mx-5" />

                <Pressable
                    onPress={() => handleSilenceToggle(!silenceNotifications)}
                    className="flex-row items-center justify-between p-5 active:opacity-80"
                    accessibilityRole="switch"
                    accessibilityState={{ checked: silenceNotifications }}
                    accessibilityLabel="Toggle Silence Blocked App Notifications"
                >
                    <View className="flex-1 pr-4">
                        <Text className="text-text font-bold text-[16px] mb-1">
                            Silence Blocked App Notifications
                        </Text>
                        <Text className="text-textSecondary text-sm leading-5">
                            Automatically dismiss notifications from blocked apps while a focus session is active.
                        </Text>
                    </View>
                    <View pointerEvents="none">
                        <Material3Switch
                            value={silenceNotifications}
                            onValueChange={handleSilenceToggle}
                        />
                    </View>
                </Pressable>
            </View>
        </View>
    );
}
