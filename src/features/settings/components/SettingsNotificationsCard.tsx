import { Material3Switch } from "@/components/Material3Switch";
import { useSettings } from "@/hooks/useSettings";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export function SettingNotificationCard() {
    const { getSetting, setSetting } = useSettings();
    const [hapticsEnabled, setHapticsEnabled] = useState(true);

    useEffect(() => {
        getSetting("haptics_enabled").then(val => {
            if (val !== null) setHapticsEnabled(val === "true");
        })
    }, [getSetting])

    const handleHapticsToggle = (val: boolean) => {
        setHapticsEnabled(val);
        setSetting("haptics_enabled", val.toString());
    };

    return (
        <View className="px-6 py-5">
            <Text className="text-textSecondary font-bold text-xs tracking-wider uppercase mb-3">
                Notification & Sounds
            </Text>

            <View className="bg-surfaceElevated rounded-2xl overflow-hidden border border-border">
                <View className="p-5 flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                        <Text className="text-text font-bold text-lg mb-1">
                            Haptic Feedback
                        </Text>
                        <Text className="text-textSecondary text-sm leading-5">
                            Feel gentle vibrations when starting, stopping, or pausing sessions.
                        </Text>
                    </View>
                    <Material3Switch
                        value={hapticsEnabled}
                        onValueChange={handleHapticsToggle}
                    />
                </View>
            </View>
        </View>
    )
}