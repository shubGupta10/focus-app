import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

interface FeedbackErrorAlertProps {
    message: string | null;
}

export function FeedbackErrorAlert({ message }: FeedbackErrorAlertProps) {
    const { colors } = useTheme();

    if (!message) return null;

    return (
        <View className="bg-surfaceElevated border border-destructive rounded-2xl p-3.5 mb-5 flex-row items-center">
            <Ionicons name="alert-circle" size={18} color={colors.destructive} style={{ marginRight: 8 }} />
            <Text className="text-destructive text-xs font-semibold flex-1">
                {message}
            </Text>
        </View>
    );
}
