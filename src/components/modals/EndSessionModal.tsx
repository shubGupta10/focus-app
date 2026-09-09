import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface EndSessionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirmEnd: () => void;
    isStrict?: boolean;
    resetCountdownText?: string;
}

export function EndSessionModal({ visible, onClose, onConfirmEnd, isStrict = false, resetCountdownText = "Renews Monday" }: EndSessionModalProps) {
    const { colors, isDarkMode } = useTheme();
    const [countdown, setCountdown] = useState<number>(5);

    useEffect(() => {
        if (!visible || !isStrict) {
            setCountdown(5);
            return;
        }
        setCountdown(5);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [visible, isStrict]);
    const isButtonDisabled = isStrict && countdown > 0;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center">
                <BlurView
                    intensity={isDarkMode ? 30 : 60}
                    tint={isDarkMode ? "dark" : "light"}
                    className="absolute inset-0"
                />
                <View style={{ backgroundColor: colors.scrim }} className="absolute inset-0" />

                <View className="bg-surface w-[88%] max-w-sm rounded-3xl p-6 border border-border shadow-2xl">
                    <View className="flex-row items-center mb-3">
                        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isStrict ? "bg-warningMuted border border-warning" : "bg-surfaceElevated border border-border"
                            }`}>
                            <Ionicons
                                name={isStrict ? "alert-circle" : "stopwatch-outline"}
                                size={22}
                                color={isStrict ? colors.warning : colors.textSecondary}
                            />
                        </View>
                        <Text className="text-text font-black text-xl tracking-tight flex-1">
                            {isStrict ? "Use Emergency Skip?" : "End Session"}
                        </Text>
                    </View>

                    <Text className="text-textSecondary text-sm leading-5 mb-6 font-medium">
                        {isStrict
                            ? `This will consume your ONLY emergency skip this week (${resetCountdownText}). Any future strict sessions this week cannot be ended early.`
                            : "Your focus session will end early and you won't earn the completion reward for this session."}
                    </Text>
                    <View className="gap-3">
                        {/* Primary Action: Keep Focusing */}
                        <Pressable
                            onPress={onClose}
                            className="bg-accent py-3.5 rounded-xl items-center justify-center active:opacity-80"
                            accessibilityRole="button"
                            accessibilityLabel="Keep focusing"
                        >
                            <Text className="text-accentForeground font-black text-sm tracking-wider uppercase">
                                Keep focusing
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={isButtonDisabled ? undefined : onConfirmEnd}
                            disabled={isButtonDisabled}
                            className={`py-3.5 rounded-xl items-center justify-center ${isButtonDisabled
                                ? "bg-surfaceElevated border border-border opacity-50"
                                : "bg-destructive active:opacity-80"
                                }`}
                            accessibilityRole="button"
                            accessibilityLabel={isStrict ? "Use Emergency Skip" : "End session"}
                        >
                            <Text
                                className={`font-black text-sm tracking-wider uppercase ${isButtonDisabled ? "text-textMuted" : "text-text"
                                    }`}
                            >
                                {isStrict
                                    ? isButtonDisabled
                                        ? `Use Emergency Skip (${countdown}s)`
                                        : "Use Emergency Skip"
                                    : "End session"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
