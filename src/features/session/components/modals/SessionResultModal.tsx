import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Modal, Pressable, Text, View } from "react-native";

interface SessionResultModalProps {
    visible: boolean;
    onClose: () => void;
    result: {
        type: "completed" | "canceled";
        coins: number;
        durationSeconds: number;
        isStrict?: boolean;
    } | null;
}

export function SessionResultModal({ visible, onClose, result }: SessionResultModalProps) {
    const { colors, isDarkMode } = useTheme();
    if (!result) return null;

    const isSuccess = result.type === "completed";
    const minutes = Math.floor(result.durationSeconds / 60);

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <BlurView
                intensity={isDarkMode ? 30 : 45}
                tint={isDarkMode ? "dark" : "light"}
                className="absolute inset-0"
            />
            <View style={{ backgroundColor: colors.scrim }} className="absolute inset-0" />

            <View className="flex-1 justify-center items-center px-6">
                <View className="w-full max-w-sm bg-surfaceElevated rounded-[32px] p-8 shadow-xl items-center">
                    
                    <View className="w-20 h-20 rounded-[24px] items-center justify-center mb-6 bg-surface">
                        <Text className="text-5xl">{isSuccess ? "🎉" : "🔔"}</Text>
                    </View>

                    <Text className="text-text text-2xl font-black tracking-tight text-center mb-3">
                        {isSuccess ? "Session Complete" : "Session Ended"}
                    </Text>

                    <Text className="text-textSecondary text-center leading-5 text-base px-2 font-medium mb-6">
                        {isSuccess
                            ? `You stayed locked in for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}. Great work!`
                            : `You focused for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}. Every minute counts!`}
                    </Text>

                    {isSuccess && result.coins > 0 && (
                        <View className="bg-surface rounded-2xl py-4 px-6 w-full items-center mb-2">
                            <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-wider mb-1">
                                Reward Earned
                            </Text>
                            <View className="flex-row items-center justify-center">
                                <Text style={{ fontSize: 26, marginRight: 6 }}>🪙</Text>
                                <Text className="text-accent text-4xl font-black tracking-tighter">+{result.coins}</Text>
                            </View>
                            {result.isStrict && (
                                <View className="flex-row items-center mt-2">
                                    <Ionicons name="shield-checkmark" size={12} color={colors.accent} style={{ marginRight: 4 }} />
                                    <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">
                                        Includes 1.5x Strict Bonus
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    <Pressable
                        onPress={onClose}
                        className="w-full rounded-2xl p-4 items-center justify-center active:opacity-80 bg-accent mt-4"
                        accessibilityRole="button"
                        accessibilityLabel={isSuccess ? "Continue" : "Dismiss"}
                    >
                        <Text className="font-black text-base uppercase text-accentForeground">
                            {isSuccess ? "CONTINUE" : "DISMISS"}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
