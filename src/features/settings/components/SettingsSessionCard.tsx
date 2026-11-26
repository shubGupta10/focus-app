import { useSettings } from "@/hooks/useSettings";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { DefaultTimerModal } from "./modals/DefaultTimerModal";
import { useTheme } from "@/contexts/ThemeContext";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import Ionicons from "@expo/vector-icons/Ionicons";

export function SettingsSessionCard() {
    const { colors } = useTheme();
    const { getSetting, setSetting } = useSettings();
    const [defaultTimer, setDefaultTimer] = useState(25);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        getSetting("default_timer").then(val => {
            if (val !== null) setDefaultTimer(parseInt(val, 10));
        });
    }, [getSetting]);

    const handleTimerSelect = (mins: number) => {
        setDefaultTimer(mins);
        setSetting("default_timer", mins.toString());
        useAppStore.getState().setDefaultDurationMinutes(mins);
    };

    return (
        <View className="px-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Session Preferences
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
                <AnimatedPressable
                    onPress={() => setIsModalOpen(true)}
                    hapticMode="light"
                    scaleTo={0.98}
                    className="flex-row items-center justify-between"
                    accessibilityRole="button"
                    accessibilityLabel={`Default Timer: ${defaultTimer} minutes. Tap to change.`}
                >
                    <View className="flex-1 pr-4">
                        <Text className="text-text font-bold text-[16px] mb-1">
                            Default Timer
                        </Text>

                        <Text className="text-textSecondary text-sm leading-5">
                            Pre-selected duration when starting a new session.
                        </Text>
                    </View>

                    <View className="flex-row items-center bg-surface border border-border px-3.5 py-2 rounded-2xl">
                        <Text className="text-text font-bold text-sm mr-1.5 tabular-nums">
                            {defaultTimer} min
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                    </View>
                </AnimatedPressable>
            </View>

            <DefaultTimerModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentMinutes={defaultTimer}
                onSelect={handleTimerSelect}
            />
        </View>
    );
}
