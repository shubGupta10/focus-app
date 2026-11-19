import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DefaultTimerModalProps {
    visible: boolean;
    onClose: () => void;
    currentMinutes: number;
    onSelect: (minutes: number) => void;
}

const PRESET_OPTIONS = [5, 15, 25, 30, 45, 60, 90, 120];

export function DefaultTimerModal({
    visible,
    onClose,
    currentMinutes,
    onSelect,
}: DefaultTimerModalProps) {
    const { colors, isDarkMode, activeStyle } = useTheme();
    const [tempMinutes, setTempMinutes] = useState(currentMinutes);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            setTempMinutes(currentMinutes);
        }
    }, [visible, currentMinutes]);

    if (!visible) return null;

    const handleSave = () => {
        onSelect(tempMinutes);
        onClose();
    };

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
                <View
                    className="bg-surfaceElevated rounded-t-[32px] border-t border-border px-6 pt-3"
                    style={[{ paddingBottom: Math.max(insets.bottom + 16, 24) }, activeStyle]}
                >
                    <View className="w-10 h-1 bg-border rounded-full self-center mb-5" />

                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-text text-xl font-black tracking-tight">
                            Default Duration
                        </Text>
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

                    <Text className="text-textSecondary font-bold text-xs uppercase tracking-wider mb-3">
                        Select Default
                    </Text>

                    <View className="flex-row flex-wrap gap-2.5 mb-6">
                        {PRESET_OPTIONS.map((m) => {
                            const isSelected = tempMinutes === m;
                            return (
                                <AnimatedPressable
                                    key={m}
                                    onPress={() => setTempMinutes(m)}
                                    hapticMode="light"
                                    scaleTo={0.92}
                                    className={`flex-1 min-w-[21%] h-14 rounded-2xl items-center justify-center border ${isSelected
                                        ? "bg-accent border-accent"
                                        : "bg-surface border-border"
                                        }`}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${m} minutes`}
                                    accessibilityState={{ selected: isSelected }}
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
                        onPress={handleSave}
                        hapticMode="medium"
                        scaleTo={0.97}
                        className="w-full py-4 rounded-2xl bg-accent items-center justify-center shadow-sm"
                        style={{ elevation: 2 }}
                    >
                        <Text className="text-accentForeground font-black text-base">
                            Set as Default
                        </Text>
                    </AnimatedPressable>
                </View>
            </BlurView>
        </Modal>
    );
}