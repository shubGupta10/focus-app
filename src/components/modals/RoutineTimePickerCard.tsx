import { useTheme } from "@/contexts/ThemeContext";
import { formatTime12Hour } from "@/utils/routineScheduler";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface RoutineTimePickerCardProps {
    startTime: string;
    endTime: string;
    durationLabel: string;
    onSelectStartTime: () => void;
    onSelectEndTime: () => void;
}

export function RoutineTimePickerCard({
    startTime,
    endTime,
    durationLabel,
    onSelectStartTime,
    onSelectEndTime
}: RoutineTimePickerCardProps) {
    const { colors } = useTheme();

    return (
        <View className="mb-7">
            <View className="flex-row items-center justify-between mb-2.5 px-1">
                <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider">
                    Time Window
                </Text>
                <Text className="text-accent text-xs font-semibold">
                    {durationLabel} duration
                </Text>
            </View>

            <View className="flex-row items-center justify-between">
                <Pressable
                    onPress={onSelectStartTime}
                    className="flex-1 bg-surface rounded-3xl p-5 mr-2 active:opacity-80"
                    accessibilityRole="button"
                    accessibilityLabel="Select start time"
                >
                    <Text className="text-textSecondary text-xs font-medium mb-1.5">Starts</Text>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-text font-black text-xl tracking-tight">
                            {formatTime12Hour(startTime)}
                        </Text>
                        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                    </View>
                </Pressable>

                <Pressable
                    onPress={onSelectEndTime}
                    className="flex-1 bg-surface rounded-3xl p-5 ml-2 active:opacity-80"
                    accessibilityRole="button"
                    accessibilityLabel="Select end time"
                >
                    <Text className="text-textSecondary text-xs font-medium mb-1.5">Ends</Text>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-text font-black text-xl tracking-tight">
                            {formatTime12Hour(endTime)}
                        </Text>
                        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                    </View>
                </Pressable>
            </View>
        </View>
    );
}
