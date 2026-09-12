import { useTheme } from "@/contexts/ThemeContext";
import { RoutineInput } from "@/types/routine";
import { formatRoutineDays, formatTime12Hour } from "@/utils/routineScheduler";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

export type StarterTemplate = RoutineInput & {
    icon: keyof typeof Ionicons.glyphMap;
};

export const STARTER_TEMPLATES: StarterTemplate[] = [
    {
        name: "Workday Focus",
        start_time: "09:00",
        end_time: "17:00",
        days_of_week: "1,2,3,4,5",
        is_strict: false,
        icon: "briefcase-outline"
    },
    {
        name: "Bedtime Wind-down",
        start_time: "22:00",
        end_time: "06:00",
        days_of_week: "1,2,3,4,5,6,7",
        is_strict: false,
        icon: "moon-outline"
    }
];

interface RoutineEmptyStateProps {
    onCreateCustom: () => void;
    onSelectTemplate: (template: StarterTemplate) => void;
}

export function RoutineEmptyState({
    onCreateCustom,
    onSelectTemplate
}: RoutineEmptyStateProps) {
    const { colors } = useTheme();

    return (
        <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="items-center pt-8 pb-8">
                <View className="w-16 h-16 rounded-3xl bg-surface items-center justify-center mb-4">
                    <Ionicons name="calendar-outline" size={28} color={colors.accent} />
                </View>
                <Text className="text-text font-black text-2xl text-center tracking-tight mb-2">
                    Automate Your Schedule
                </Text>
                <Text className="text-textSecondary text-sm text-center leading-relaxed px-4 max-w-xs">
                    Recurring focus blocks start automatically and guard your selected apps on cue.
                </Text>

                <Pressable
                    onPress={onCreateCustom}
                    className="mt-6 flex-row items-center bg-accent px-7 py-3.5 rounded-full active:opacity-85"
                    accessibilityRole="button"
                    accessibilityLabel="Create Custom Routine"
                >
                    <Ionicons name="add" size={20} color={colors.accentForeground} style={{ marginRight: 6 }} />
                    <Text className="text-accentForeground font-bold text-sm">
                        Create Routine
                    </Text>
                </Pressable>
            </View>

            <View className="mb-3.5 px-1">
                <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider">
                    Suggested Templates
                </Text>
            </View>

            <View className="space-y-3">
                {STARTER_TEMPLATES.map((template) => (
                    <Pressable
                        key={template.name}
                        onPress={() => onSelectTemplate(template)}
                        className="bg-surface rounded-3xl p-5 mb-3 active:opacity-80"
                        accessibilityRole="button"
                        accessibilityLabel={`Use template ${template.name}`}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 mr-3">
                                <View className="w-11 h-11 rounded-2xl bg-surfaceElevated items-center justify-center mr-3.5">
                                    <Ionicons name={template.icon} size={22} color={colors.accent} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-text font-bold text-base mb-0.5">
                                        {template.name}
                                    </Text>
                                    <Text className="text-textSecondary text-xs font-medium">
                                        {formatTime12Hour(template.start_time)} – {formatTime12Hour(template.end_time)} · {formatRoutineDays(template.days_of_week)}
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-accent/15 px-3.5 py-1.5 rounded-full">
                                <Text className="text-accent font-bold text-xs">
                                    Use
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}
