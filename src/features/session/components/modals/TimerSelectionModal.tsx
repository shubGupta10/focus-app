import { useSettings } from "@/hooks/useSettings";
import { useStrictMode } from "@/hooks/useStrictMode";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Material3Switch } from "../../../../components/Material3Switch";
import { useTheme } from "../../../../contexts/ThemeContext";
import { InfoSheet } from "@/components/InfoSheet";
import { AnimatedPressable } from "@/components/AnimatedPressable";

interface TimerSelectionModalProps {
    visible: boolean
    onClose: () => void;
    onStartSession: (durationMinutes: number, isStrict: boolean) => void;
}


const PRESET_TIMES = [5, 15, 25, 30, 45, 60, 90, 120];

export default function TimerSelectionModal({ visible, onClose, onStartSession }: TimerSelectionModalProps) {
    const { colors, isDarkMode } = useTheme();
    const { skipsRemaining, resetCountdownText, refreshStrictMode } = useStrictMode();
    const { getSetting } = useSettings();
    const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
    const [isStrict, setIsStrict] = useState<boolean>(false);
    const insets = useSafeAreaInsets();


    useEffect(() => {
        if (visible) {
            refreshStrictMode();

            getSetting("default_timer").then(val => {
                if (val !== null) {
                    setSelectedMinutes(parseInt(val, 10));
                }
            })
        }
    }, [visible, refreshStrictMode, getSetting]);

    if (!visible) return null;

    const hasSkipAvailable = skipsRemaining > 0;

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <BlurView
                intensity={isDarkMode ? 25 : 45}
                tint={isDarkMode ? "dark" : "light"}
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: colors.scrim,
                }}
            >
                <View className="bg-surfaceElevated rounded-t-3xl p-6" style={{ paddingBottom: Math.max(insets.bottom + 12, 24) }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center gap-3">
                            <Text className="text-text text-xl font-black tracking-tight">Start a Session</Text>
                            <InfoSheet
                                title="Focus Modes"
                                description={"- Stopwatch\nA free-flowing timer that counts up. This is great when you want to focus, but aren't sure how long it will take. You can stop it whenever you're done.\n\n- Timed Focus\nYou pick a specific amount of time (like 25 minutes) and the timer counts down. Perfect if you want to commit to a solid block of work.\n\n- Strict Mode (Timed Only)\nIf you turn this on, your phone will be completely locked down until the time is up. You get exactly 1 Emergency Skip just in case, but if you don't use it and successfully finish, you earn 1.5x bonus coins!"}
                            />
                        </View>

                        <Pressable
                            className="w-10 h-10 rounded-full bg-surface items-center justify-center active:opacity-70"
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close modal"
                        >
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>


                    <View className="mb-6">
                        <Text className="text-textSecondary font-bold mb-2.5 tracking-wider text-xs uppercase">No Timer</Text>
                        <Pressable
                            onPress={() => {
                                try { Vibration.vibrate(8); } catch { }
                                setSelectedMinutes(-1);
                            }}
                            className={`rounded-2xl p-4 active:opacity-80 flex-row items-center justify-between ${selectedMinutes === -1
                                ? "bg-accent"
                                : "bg-surface"
                                }`}
                            accessibilityRole="button"
                            accessibilityLabel="Select stopwatch mode — counts up until you stop"
                            accessibilityState={{ selected: selectedMinutes === -1 }}
                        >
                            <View className="flex-1 mr-3">
                                <Text className={`font-black text-lg mb-0.5 ${selectedMinutes === -1 ? "text-accentForeground" : "text-text"
                                    }`}>
                                    Stopwatch Mode
                                </Text>
                                <Text className={`text-sm font-medium ${selectedMinutes === -1 ? "text-accentForeground" : "text-textSecondary"
                                    }`}>
                                    Counts up until you stop
                                </Text>
                            </View>
                            <Ionicons
                                name="stopwatch-outline"
                                size={30}
                                color={selectedMinutes === -1 ? colors.accentForeground : colors.accent}
                            />
                        </Pressable>
                    </View>

                    <Text className="text-textSecondary font-bold mb-2.5 tracking-wider text-xs uppercase">Timed Focus</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-6"
                        contentContainerStyle={{ paddingRight: 20 }}
                    >
                        {PRESET_TIMES.map((mins) => {
                            const isSelected = selectedMinutes === mins;
                            return (
                                <Pressable
                                    key={mins}
                                    onPress={() => {
                                        try { Vibration.vibrate(8); } catch { }
                                        setSelectedMinutes(mins);
                                    }}
                                    className={`mr-3 rounded-2xl px-5 py-3.5 ${isSelected
                                        ? "bg-accent"
                                        : "bg-surface active:opacity-80"
                                        }`}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${mins} minutes`}
                                    accessibilityState={{ selected: isSelected }}
                                >
                                    <Text className={`font-black text-lg ${isSelected ? "text-accentForeground" : "text-textSecondary"}`}>
                                        {mins}m
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    <View className={`bg-surface rounded-2xl p-4 mb-6 ${selectedMinutes === -1 ? "opacity-40" : ""
                        }`}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 mr-3">
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isStrict && selectedMinutes !== -1 ? 'bg-accentMuted' : 'bg-surfaceElevated'
                                    }`}>
                                    <Ionicons
                                        name={isStrict && selectedMinutes !== -1 ? "shield-checkmark" : "shield-outline"}
                                        size={20}
                                        color={isStrict && selectedMinutes !== -1 ? colors.accent : colors.textSecondary}
                                    />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="text-text font-bold text-base mr-2">Strict Mode</Text>
                                        <View className="bg-accentMuted px-2 py-0.5 rounded-md">
                                            <Text className="text-accent text-[10px] font-bold tracking-wider uppercase">1.5x Coins</Text>
                                        </View>
                                    </View>
                                    <Text className="text-textSecondary text-xs font-medium mt-0.5">
                                        {selectedMinutes === -1
                                            ? "Requires a timed session"
                                            : "Timer cannot be ended early"}
                                    </Text>
                                </View>
                            </View>

                            <Material3Switch
                                value={selectedMinutes === -1 ? false : isStrict}
                                onValueChange={(val) => {
                                    if (selectedMinutes === -1) return;
                                    try {
                                        Vibration.vibrate(8);
                                    } catch (error) { }
                                    setIsStrict(val);
                                }}
                                disabled={selectedMinutes === -1}
                            />
                        </View>

                        {isStrict && selectedMinutes !== -1 && (
                            <View className="mt-3 pt-3 flex-row items-center">
                                <Ionicons
                                    name={hasSkipAvailable ? "checkmark-circle" : "alert-circle"}
                                    size={14}
                                    color={hasSkipAvailable ? colors.success : colors.warning}
                                    style={{ marginRight: 6 }}
                                />
                                <Text className="text-textSecondary text-xs font-medium flex-1">
                                    {hasSkipAvailable
                                        ? `1 Emergency Skip Available (${resetCountdownText})`
                                        : `0 Skips left (${resetCountdownText}) · Full lockout`}
                                </Text>
                            </View>
                        )}
                    </View>

                    <AnimatedPressable
                        onPress={() => {
                            try { Vibration.vibrate(12); } catch { }
                            onStartSession(selectedMinutes, selectedMinutes === -1 ? false : isStrict);
                        }}
                        hapticMode="light"
                        className="w-full bg-accent rounded-2xl p-4 items-center justify-center flex-row"
                        accessibilityRole="button"
                        accessibilityLabel={
                            selectedMinutes === -1
                                ? "Start stopwatch focus session"
                                : `Start ${selectedMinutes} minute focus session`
                        }
                    >
                        {selectedMinutes !== -1 && isStrict && (
                            <Ionicons
                                name="lock-closed"
                                size={17}
                                color={colors.accentForeground}
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Text className="text-accentForeground font-black text-base uppercase">
                            {selectedMinutes === -1
                                ? "Start stopwatch Session"
                                : isStrict
                                    ? `Start ${selectedMinutes}m Strict Session`
                                    : `Start ${selectedMinutes}m Session`}
                        </Text>
                    </AnimatedPressable>
                </View>
            </BlurView>
        </Modal>
    );
}