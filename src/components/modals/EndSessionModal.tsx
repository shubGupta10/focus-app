import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "expo-blur";
import { Modal, Pressable, Text, View } from "react-native";

interface EndSessionModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirmEnd: () => void;
}

export function EndSessionModal({ visible, onClose, onConfirmEnd }: EndSessionModalProps) {
    const { colors, isDarkMode } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center">
                <BlurView
                    intensity={isDarkMode ? 30 : 60}
                    tint={isDarkMode ? "dark" : "light"}
                    className="absolute inset-0"
                />

                <View className="bg-surface w-[85%] max-w-sm rounded-3xl p-6 border border-border shadow-2xl">
                    <Text className="text-text font-black text-2xl tracking-tight mb-3">
                        End session early?
                    </Text>

                    <Text className="text-textSecondary text-base leading-6 mb-8">
                        Your focus session will end early and you won't earn the completion reward for this session.
                    </Text>

                    <View className="gap-3">
                        {/* Primary Action: Keep Focusing */}
                        <Pressable
                            onPress={onClose}
                            className="bg-accent py-4 rounded-xl items-center justify-center active:opacity-80"
                            accessibilityRole="button"
                        >
                            <Text className="text-background font-black text-sm tracking-wider uppercase">
                                Keep focusing
                            </Text>
                        </Pressable>

                        {/* Secondary Action: End Session */}
                        <Pressable
                            onPress={onConfirmEnd}
                            className="py-4 rounded-xl items-center justify-center active:opacity-60 bg-background border border-border"
                            accessibilityRole="button"
                        >
                            <Text className="text-text font-bold text-sm tracking-wider uppercase">
                                End session
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
