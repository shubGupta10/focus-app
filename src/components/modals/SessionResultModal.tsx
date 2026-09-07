import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

interface SessionResultModalProps {
    visible: boolean;
    onClose: () => void;
    result: {
        type: "completed" | "canceled";
        coins: number;
        durationSeconds: number;
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
            <Animated.View
                entering={FadeIn}
                className={isDarkMode ? "absolute inset-0 bg-black/50" : "absolute inset-0 bg-black/25"}
            />

            <View className="flex-1 justify-center items-center px-6">
                <Animated.View
                    entering={ZoomIn.springify().damping(20).stiffness(200)}
                    className="w-full max-w-sm bg-surface rounded-3xl p-6 border border-border shadow-lg"
                >
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-text text-xl font-black tracking-tight">
                            {isSuccess ? "Session Completed" : "Session Ended Early"}
                        </Text>
                        <Pressable
                            className="w-10 h-10 rounded-full bg-background items-center justify-center active:opacity-70"
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close session result modal"
                        >
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    <View className="items-center mb-6 mt-1">
                        <View className="w-20 h-20 rounded-full items-center justify-center mb-3.5 bg-background border border-border/80">
                            {/* SR2: 🔔 for interrupted/canceled — clearer than ⏱️ which is just a timer */}
                        <Text className="text-4xl">{isSuccess ? "🎉" : "🔔"}</Text>
                        </View>

                        <Text className="text-textSecondary text-center leading-5 text-sm px-2 font-medium">
                            {isSuccess
                                ? `Great focus session! You stayed locked in for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`
                                : `Session ended early · ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} focused. Every minute of focus builds the habit!`}
                        </Text>
                    </View>

                    {isSuccess && (
                        <View className="bg-background rounded-2xl p-4 mb-6 flex-row items-center justify-between border border-border">
                            <Text className="text-textSecondary font-bold text-xs tracking-wider uppercase">COINS EARNED</Text>
                            <View className="flex-row items-center">
                                <Text className="text-accent font-black text-2xl mr-2">
                                    +{result.coins}
                                </Text>
                                <Text className="text-xl">🪙</Text>
                            </View>
                        </View>
                    )}

                    <Pressable
                        onPress={onClose}
                        className="w-full rounded-2xl p-4 items-center justify-center active:opacity-80 bg-accent"
                        accessibilityRole="button"
                        accessibilityLabel={isSuccess ? "Continue" : "Dismiss"}
                    >
                        {/* SR1: Removed tracking-wider — font-black text-base uppercase is already strong enough */}
                        <Text className="font-black text-base uppercase text-background">
                            {isSuccess ? "CONTINUE" : "DISMISS"}
                        </Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}
