import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

interface FeedbackHeaderProps {
    onBack: () => void;
}

export function FeedbackHeader({ onBack }: FeedbackHeaderProps) {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-center px-6 pt-5 pb-3">
            <AnimatedPressable
                onPress={onBack}
                scaleTo={0.88}
                hapticMode="light"
                className="w-10 h-10 rounded-full bg-surfaceElevated border border-border items-center justify-center mr-4 shadow-sm"
                style={{ elevation: 2 }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
            >
                <Ionicons name="chevron-back" size={20} color={colors.text} />
            </AnimatedPressable>

            <Text className="text-text font-black text-3xl tracking-tight">
                Feedback
            </Text>
        </View>
    );
}
