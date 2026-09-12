import { Material3Switch } from "@/components/Material3Switch";
import { useTheme } from "@/contexts/ThemeContext";
import { Routine } from "@/types/routine";
import {
    formatRoutineDays,
    formatTime12Hour,
    getRoutineDurationMinutes
} from "@/utils/routineScheduler";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

interface RoutineCardProps {
    routine: Routine;
    onToggle: (val: boolean) => void;
    onPress: () => void;
    onDelete: () => void;
}

export function RoutineCardInner({
    routine,
    onToggle,
    onPress,
    onDelete
}: RoutineCardProps) {
    const { colors } = useTheme();
    const isEnabled = Boolean(routine.is_enabled);

    const formatDurationText = (start: string, end: string) => {
        const mins = getRoutineDurationMinutes(start, end);
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        if (hours > 0 && remainingMins > 0) return `${hours}h ${remainingMins}m`;
        if (hours > 0) return `${hours}h`;
        return `${remainingMins}m`;
    };

    return (
        <Pressable
            onPress={onPress}
            className={`bg-surface rounded-3xl p-5 mb-3.5 ${isEnabled ? "" : "opacity-55"
                } active:opacity-80`}
            accessibilityRole="button"
            accessibilityLabel={`Routine ${routine.name}`}
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1 mr-3">
                    <Text className="text-text font-bold text-lg mr-2" numberOfLines={1}>
                        {routine.name}
                    </Text>
                    {Boolean(routine.is_strict) && (
                        <View className="bg-accent/15 px-2 py-0.5 rounded-md">
                            <Text className="text-accent text-[10px] font-bold uppercase">
                                Strict
                            </Text>
                        </View>
                    )}
                </View>

                <Material3Switch
                    value={isEnabled}
                    onValueChange={onToggle}
                />
            </View>

            <View className="flex-row items-center justify-between pt-2">
                <View className="flex-1 mr-3">
                    <Text className="text-text font-semibold text-sm">
                        {formatTime12Hour(routine.start_time)} – {formatTime12Hour(routine.end_time)}
                    </Text>
                    <Text className="text-textSecondary text-xs mt-1 font-medium">
                        {formatRoutineDays(routine.days_of_week)} · {formatDurationText(routine.start_time, routine.end_time)}
                    </Text>
                </View>

                <Pressable
                    onPress={onDelete}
                    hitSlop={12}
                    className="p-2 active:opacity-60"
                    accessibilityRole="button"
                    accessibilityLabel="Delete routine"
                >
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </Pressable>
            </View>
        </Pressable>
    );
}

export const RoutineCard = memo(RoutineCardInner, (prev, next) => {
    return (
        prev.routine.id === next.routine.id && prev.routine.is_enabled === next.routine.is_enabled && prev.routine.name === next.routine.name && prev.routine.is_strict === next.routine.is_strict
    )
})