import { useTheme } from "@/contexts/ThemeContext";
import { Text, TextInput, View } from "react-native";

interface FeedbackEmailInputProps {
    email: string;
    onChangeEmail: (val: string) => void;
}

export function FeedbackEmailInput({ email, onChangeEmail }: FeedbackEmailInputProps) {
    const { colors } = useTheme();

    return (
        <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-text font-bold text-base">Email</Text>
                <Text className="text-textMuted text-xs font-medium">Optional</Text>
            </View>
            <View
                className="bg-surfaceElevated border border-border rounded-2xl px-5 py-4 mb-2 shadow-sm"
                style={{
                    elevation: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                }}
            >
                <TextInput
                    value={email}
                    onChangeText={onChangeEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="name@example.com"
                    placeholderTextColor={colors.textMuted}
                    style={{
                        color: colors.text,
                        fontSize: 15,
                        padding: 0,
                    }}
                />
            </View>
            <Text className="text-xs text-textMuted px-1 leading-4">
                Only used if we need to reply to you.
            </Text>
        </View>
    );
}
