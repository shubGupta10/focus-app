import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TakeBreakModelProps {
    visible: boolean;
    onClose: () => void;
    onStartBreak: (durationMinutes: number) => void;
    availablePresets?: number[];
}

export function TakeBreakModal({ visible, onClose, onStartBreak, availablePresets }: TakeBreakModelProps) {
    const { colors, isDarkMode, activeStyle } = useTheme();
    const presets = availablePresets && availablePresets.length > 0 ? availablePresets : [5];
    const [selectedMinutes, setSelectedMinutes] = useState(presets[0]);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible && presets.length > 0 && !presets.includes(selectedMinutes)) {
            setSelectedMinutes(presets[0]);
        }
    }, [visible, availablePresets]);

    if (!visible) return null;

    const handleConfirm = () => {
        onStartBreak(selectedMinutes);
        onClose();
    }


    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <BlurView
                intensity={isDarkMode ? 25 : 45}
                tint={isDarkMode ? "dark" : "light"}
                style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    backgroundColor: colors.scrim,
                }}
            >
                <View className="bg-surfaceElevated rounded-t-[32px] border-t border-border px-6 pt-3"
                    style={[{ paddingBottom: Math.max(insets.bottom + 16, 24) }, activeStyle]}
                >
                    <View className="w-10 h-1 bg-border rounded-full self-center mb-5" />

                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center flex-1 mr-3">
                            <Text style={{ fontSize: 20, marginRight: 8 }}>
                                ☕
                            </Text>
                            <Text className="text-text text-xl font-black tracking-tight">
                                Take a Break
                            </Text>
                        </View>

                        <AnimatedPressable
                            className="w-9 h-9 rounded-full bg-surface items-center justify-center border border-border"
                            hapticMode="light"
                            scaleTo={0.88}
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Close"
                        >
                            <Ionicons name="close" size={18} color={colors.text} />
                        </AnimatedPressable>
                    </View>

                    <Text className="text-textSecondary text-sm leading-5 mb-5">
                        Guarded apps will be temporarily unlocked. Your break time is added to your target so you still complete your full focus goal.
                    </Text>

                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider mb-3">
                        Break Duration
                    </Text>

                    <View className="flex-row gap-2.5 mb-6">
                        {presets.map((m) => {
                            const isSelected = selectedMinutes === m;
                            return (
                                <AnimatedPressable
                                    key={m}
                                    onPress={() => setSelectedMinutes(m)}
                                    hapticMode="light"
                                    scaleTo={0.92}
                                    className={`flex-1 h-14 rounded-2xl items-center justify-center border ${isSelected
                                        ? "bg-accent border-accent"
                                        : "bg-surface border-border"
                                        }`}
                                >
                                    <Text
                                        className={`font-black text-lg ${isSelected
                                            ? "text-accentForeground"
                                            : "text-textSecondary"
                                            }`}
                                    >
                                        {m}m
                                    </Text>
                                </AnimatedPressable>
                            );
                        })}
                    </View>

                    <AnimatedPressable
                        onPress={handleConfirm}
                        hapticMode="medium"
                        scaleTo={0.97}
                        className="w-full py-4 rounded-2xl bg-accent items-center justify-center shadow-sm"
                        style={{ elevation: 2 }}
                    >
                        <Text className="text-accentForeground font-black text-base">
                            Start {selectedMinutes} Min Break
                        </Text>
                    </AnimatedPressable>
                </View>
            </BlurView>
        </Modal>
    )
}