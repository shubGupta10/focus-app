import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FeedbackSuccessViewProps {
    onDone: () => void;
}

export function FeedbackSuccessView({ onDone }: FeedbackSuccessViewProps) {
    const { activeStyle, colors } = useTheme();

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle} edges={["top", "bottom", "left", "right"]}>
            <View className="flex-1 items-center justify-center px-8">
                <View
                    className="w-20 h-20 rounded-full bg-surfaceElevated border border-accent items-center justify-center mb-6"
                    style={{ elevation: 4 }}
                >
                    <Ionicons name="checkmark-done" size={44} color={colors.accent} />
                </View>

                <Text className="text-text text-3xl font-black text-center tracking-tight mb-3">
                    Feedback Received
                </Text>

                <Text className="text-textSecondary text-base text-center leading-6 mb-8 max-w-xs">
                    Thank you for helping us improve Lockout. We review every note directly.
                </Text>

                <AnimatedPressable
                    onPress={onDone}
                    scaleTo={0.96}
                    hapticMode="medium"
                    className="w-full max-w-xs py-4 rounded-full bg-accent items-center justify-center"
                    style={{ elevation: 3 }}
                >
                    <Text className="text-accentForeground font-bold text-base">
                        Done
                    </Text>
                </AnimatedPressable>
            </View>
        </SafeAreaView>
    );
}
