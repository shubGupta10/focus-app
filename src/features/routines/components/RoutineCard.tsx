import { Material3Switch } from "@/components/Material3Switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppStore } from "@/store/useAppStore";
import { Routine } from "@/types/routine";
import {
    formatRoutineDays,
    formatTime12Hour,
    getRoutineDurationMinutes
} from "@/utils/routineScheduler";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Image, Pressable, Text, View } from "react-native";

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
    const { installedApps } = useAppStore()

    const isCustomBlocklist = Boolean(routine.blocked_apps && routine.blocked_apps.trim().length > 0);
    const customBlockedPackages = isCustomBlocklist ? routine.blocked_apps.split(",") : [];

    const displayApps = installedApps.filter((app) => customBlockedPackages.includes(app.packageName)).slice(0, 5);

    const extraCount = Math.max(0, customBlockedPackages.length - 5);

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
            className={`bg-surfaceElevated rounded-[24px] p-5 mb-3 ${isEnabled ? "" : "opacity-55"
                } active:opacity-80 border border-border`}
            accessibilityRole="button"
            accessibilityLabel={`Routine ${routine.name}`}
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1 mr-3">
                    <Text className="text-text font-bold text-lg mr-2" numberOfLines={1}>
                        {routine.name}
                    </Text>
                    {Boolean(routine.is_strict) && (
                        <View className="px-2 py-0.5 rounded-md">
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

                    {isCustomBlocklist && displayApps.length > 0 && (
                        <View className="flex-row items-center mt-2.5">
                            {displayApps.map((app, index) => (
                                <View key={app.packageName}
                                    className="w-6 h-6 rounded-full bg-surface border border-surfaceElevated overflow-hidden items-center justify-center"
                                    style={{ marginLeft: index > 0 ? -8 : 0, zIndex: 10 - index }}
                                >
                                    <Image
                                        source={{ uri: `data:image/png;base64,${app.icon}` }}
                                        className="w-4 h-4"
                                    />
                                </View>
                            ))}
                            {extraCount > 0 && (
                                <View
                                    className="w-6 h-6 rounded-full bg-surfaceMuted border border-surfaceElevated items-center justify-center"
                                    style={{ marginLeft: -8, zIndex: 0 }}
                                >
                                    <Text className="text-text font-bold" style={{ fontSize: 9 }}>
                                        +{extraCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

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
            </View >
        </Pressable >
    );
}

export const RoutineCard = memo(RoutineCardInner, (prev, next) => {
    return (
        prev.routine.id === next.routine.id && prev.routine.is_enabled === next.routine.is_enabled && prev.routine.name === next.routine.name && prev.routine.is_strict === next.routine.is_strict && prev.routine.start_time === next.routine.start_time && prev.routine.end_time === next.routine.end_time && prev.routine.days_of_week === next.routine.days_of_week && prev.routine.blocked_apps === next.routine.blocked_apps
    )
})