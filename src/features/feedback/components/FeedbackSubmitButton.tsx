import { AnimatedPressable } from "@/components/AnimatedPressable";
import { GlobalLoader } from "@/components/GlobalLoader";
import { useTheme } from "@/contexts/ThemeContext";
import { Text } from "react-native";

interface FeedbackSubmitButtonProps {
    isSubmitting: boolean;
    disabled: boolean;
    onSubmit: () => void;
}

export function FeedbackSubmitButton({
    isSubmitting,
    disabled,
    onSubmit,
}: FeedbackSubmitButtonProps) {
    const { colors } = useTheme();

    return (
        <AnimatedPressable
            onPress={onSubmit}
            disabled={disabled}
            scaleTo={0.97}
            hapticMode="medium"
            className="w-full py-4 rounded-full items-center justify-center bg-accent"
            style={[
                { backgroundColor: colors.accent },
                disabled ? { opacity: 0.5 } : { elevation: 2 },
            ]}
        >
            {isSubmitting ? (
                <GlobalLoader size="small" color={colors.accentForeground} />
            ) : (
                <Text
                    className="text-accentForeground font-bold text-base text-center"
                    style={{ color: colors.accentForeground }}
                >
                    Send Feedback
                </Text>
            )}
        </AnimatedPressable>
    );
}
