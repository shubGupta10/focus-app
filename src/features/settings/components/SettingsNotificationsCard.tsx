import { Material3Switch } from "@/components/Material3Switch";
import { useSettings } from "@/hooks/useSettings";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export function SettingNotificationCard() {
    const { getSetting, setSetting } = useSettings();
    const [hapticsEnabled, setHapticsEnabled] = useState(true);

    useEffect(() => {
        getSetting("haptics_enabled").then(val => {
            if (val !== null) setHapticsEnabled(val === "true");
        });
    }, [getSetting]);

    const handleHapticsToggle = (val: boolean) => {
        setHapticsEnabled(val);
        setSetting("haptics_enabled", val.toString());
        if (val) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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
            </View>
        </View>
    );
}