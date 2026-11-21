import { useTheme } from "@/contexts/ThemeContext";
import { Text, TextInput, View } from "react-native";
import { FeedbackCategory } from "../types";

interface FeedbackMessageInputProps {
    selectedType: FeedbackCategory;
    message: string;
    onChangeMessage: (val: string) => void;
}

export function FeedbackMessageInput({
    selectedType,
    message,
    onChangeMessage,
}: FeedbackMessageInputProps) {
    const { colors } = useTheme();

    const getPromptLabel = () => {
        if (selectedType === "bug") return "What happened?";
        if (selectedType === "feature") return "What's your idea?";
        return "What's on your mind?";
    };

    return (
        <View className="mb-6">
            <Text className="text-text font-bold text-base mb-3">
                {getPromptLabel()}
            </Text>
            <View
                className="bg-surfaceElevated border border-border rounded-3xl p-5 min-h-[200px] justify-between shadow-sm"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                }}
            >
                <TextInput
                    value={message}
                    onChangeText={onChangeMessage}
                    multiline
                    textAlignVertical="top"
                    placeholder="Write your thoughts..."
                    placeholderTextColor={colors.textMuted}
                    style={{
                        color: colors.text,
                        fontSize: 15,
                        lineHeight: 24,
                        minHeight: 130,
                    }}
                />
                <Text className="text-xs text-textMuted tabular-nums text-right font-medium mt-2">
                    {message.length} / 3000
                </Text>
            </View>
        </View>
    );
}
