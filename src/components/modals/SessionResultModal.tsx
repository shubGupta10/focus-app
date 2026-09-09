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
                <View
                    className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-border shadow-lg"
                >
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-text text-xl font-black tracking-tight">
                            {isSuccess ? "Session Completed" : "Session Ended Early"}
                        </Text>
                        <Pressable
                            className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70 border border-border"
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close session result modal"
                        >
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    <View className="items-center mb-6 mt-1">
                        <View className="w-20 h-20 rounded-full items-center justify-center mb-3.5 bg-surfaceElevated border border-border">
                            {/* SR2: 🔔 for interrupted/canceled — clearer than ⏱️ which is just a timer */}
                            <Text className="text-4xl">{isSuccess ? "🎉" : "🔔"}</Text>
                        </View>

                        <Text className="text-textSecondary text-center leading-5 text-sm px-2 font-medium">
                            {isSuccess
                                ? `Great focus session! You stayed locked in for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`
                                : `Session ended early · ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} focused. Every minute of focus builds the habit!`}
                        </Text>
                    </View>

                    {isSuccess && result.isStrict && (
                        <View className="flex-row items-center justify-center rounded-full px-3 py-1 mb-3 self-center">
                            <Ionicons name="shield-checkmark" size={13} color={colors.accent} style={{ marginRight: 5 }} />
                            <Text className="text-accent text-xs font-bold uppercase tracking-wider">
                                Strict Focus Completed · 1.5x Coins
                            </Text>
                        </View>
                    )}

                    <Pressable
                        onPress={onClose}
                        className="w-full rounded-2xl p-4 items-center justify-center active:opacity-80 bg-accent"
                        accessibilityRole="button"
                        accessibilityLabel={isSuccess ? "Continue" : "Dismiss"}
                    >
                        {/* SR1: Removed tracking-wider — font-black text-base uppercase is already strong enough */}
                        <Text className="font-black text-base uppercase text-accentForeground">
                            {isSuccess ? "CONTINUE" : "DISMISS"}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
