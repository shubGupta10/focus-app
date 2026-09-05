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
    if (!result) return null;

    const isSuccess = result.type === "completed";
    const minutes = Math.floor(result.durationSeconds / 60);

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>

            <BlurView intensity={30} tint="dark" className="absolute inset-0" />
            <Animated.View entering={FadeIn} className="absolute inset-0 bg-black/40" />

            <View className="flex-1 justify-center items-center px-4">

                <Animated.View
                    entering={ZoomIn.springify().damping(20).stiffness(200)}
                    className="w-full bg-surface rounded-3xl p-6 border border-border shadow-lg"
                >
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-text text-xl font-black tracking-wider">
                            {isSuccess ? "SESSION COMPLETED" : "SESSION CANCELED"}
                        </Text>
                        <Pressable className="p-2" onPress={onClose}>
                            <Ionicons name="close" size={24} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    <View className="items-center mb-8 mt-2">
                        <View className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${isSuccess ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            <Text className="text-6xl">{isSuccess ? "🎉" : "💔"}</Text>
                        </View>

                        <Text className="text-textSecondary text-center leading-6 text-base px-4 font-medium">
                            {isSuccess
                                ? `Incredible deep work. You stayed focused for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`
                                : `You gave up after ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}. Discipline takes time to build!`}
                        </Text>
                    </View>

                    {isSuccess && (
                        <View className="bg-background rounded-2xl p-5 mb-8 flex-row items-center justify-between border border-border">
                            <Text className="text-textSecondary font-bold text-sm tracking-widest uppercase">COINS EARNED</Text>
                            <View className="flex-row items-center">
                                <Text className="text-accent font-black text-3xl mr-2">
                                    +{result.coins}
                                </Text>
                                <Text className="text-2xl">🪙</Text>
                            </View>
                        </View>
                    )}

                    <Pressable
                        onPress={onClose}
                        className={`w-full rounded-2xl p-5 items-center justify-center active:opacity-80 ${isSuccess ? 'bg-accent' : 'bg-background border border-border'}`}
                    >
                        <Text className={`font-black text-xl tracking-widest ${isSuccess ? 'text-white' : 'text-text'}`}>
                            {isSuccess ? "CONTINUE" : "DISMISS"}
                        </Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}
