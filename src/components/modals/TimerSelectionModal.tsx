import { useStrictMode } from "@/hooks/useStrictMode";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, Vibration, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { Material3Switch } from "../Material3Switch";

interface TimerSelectionModalProps {
    visible: boolean
    onClose: () => void;
    onStartSession: (durationMinutes: number, isStrict: boolean) => void;
}


const PRESET_TIMES = [15, 30, 45, 60, 90, 120];

export default function TimerSelectionModal({ visible, onClose, onStartSession }: TimerSelectionModalProps) {
    const { colors, isDarkMode } = useTheme();
    const { skipsRemaining, resetCountdownText, refreshStrictMode } = useStrictMode()
    const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
    const [isStrict, setIsStrict] = useState<boolean>(false)

    useEffect(() => {
        if (visible) {
            refreshStrictMode();
        }
    }, [visible, refreshStrictMode]);

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
                <View className="bg-surface rounded-t-3xl p-6 border-t border-border">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-text text-xl font-black tracking-tight">New Focus Session</Text>

                        <Pressable
                            className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70 border border-border"
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close modal"
                        >
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>


                    <View className="mb-6 pb-6 border-b border-border">
                        <Text className="text-textSecondary font-bold mb-2.5 tracking-wider text-xs uppercase">No Timer</Text>
                        <Pressable
                            onPress={() => {
                                try { Vibration.vibrate(12); } catch { }
                                onStartSession(-1, false);
                            }}
                            className="bg-surfaceElevated rounded-2xl p-4 active:opacity-80 flex-row items-center justify-between border border-border"
                            accessibilityRole="button"
                            accessibilityLabel="Start infinite mode — counts up until you stop"
                        >
                            <View className="flex-1 mr-3">
                                <Text className="text-text font-black text-lg mb-0.5">Infinite Mode</Text>
                                <Text className="text-textSecondary text-sm font-medium">Counts up until you stop</Text>
                            </View>
                            <Ionicons name="infinite" size={30} color={colors.accent} />
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
                                    className={`mr-3 rounded-2xl px-5 py-3.5 border ${isSelected
                                        ? "bg-accent border-accent"
                                        : "bg-surfaceElevated border-border active:opacity-80"
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

                    {/* Strict Mode Card */}
                    <View className="bg-surfaceElevated rounded-2xl p-4 mb-6 border border-border">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 mr-3">
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isStrict ? 'bg-accentMuted' : 'bg-surface border border-border'}`}>
                                    <Ionicons
                                        name={isStrict ? "shield-checkmark" : "shield-outline"}
                                        size={20}
                                        color={isStrict ? colors.accent : colors.textSecondary}
                                    />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="text-text font-bold text-base mr-2">Strict Mode</Text>
                                        <View className="bg-accent/15 px-2 py-0.5 rounded-md">
                                            <Text className="text-accent text-[10px] font-bold tracking-wider uppercase">1.5x Coins</Text>
                                        </View>
                                    </View>
                                    <Text className="text-textSecondary text-xs font-medium mt-0.5">
                                        Timer cannot be ended early
                                    </Text>
                                </View>
                            </View>

                            <Material3Switch
                                value={isStrict}
                                onValueChange={(val) => {
                                    try {
                                        Vibration.vibrate(8);
                                    } catch (error) { }
                                    setIsStrict(val);
                                }}
                            />
                        </View>

                        {isStrict && (
                            <View className="mt-3 pt-3 border-t border-border flex-row items-center">
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

                    <Pressable
                        onPress={() => {
                            try { Vibration.vibrate(12); } catch { }
                            onStartSession(selectedMinutes, isStrict);
                        }}
                        className="w-full bg-accent rounded-2xl p-4 items-center justify-center active:opacity-80 flex-row"
                        accessibilityRole="button"
                        accessibilityLabel={`Start ${selectedMinutes} minute focus session`}
                    >
                        {isStrict && (
                            <Ionicons
                                name="lock-closed"
                                size={17}
                                color={colors.accentForeground}
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Text className="text-accentForeground font-black text-base uppercase">
                            {isStrict
                                ? `Start ${selectedMinutes}m Strict Session`
                                : `Start ${selectedMinutes}m Session`}
                        </Text>
                    </Pressable>
                </View>
            </BlurView>
        </Modal>
    );
}