import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Text, View } from "react-native";

const DAYS = [
    { label: "Mo", value: 1 },
    { label: "Tu", value: 2 },
    { label: "We", value: 3 },
    { label: "Th", value: 4 },
    { label: "Fr", value: 5 },
    { label: "Sa", value: 6 },
    { label: "Su", value: 7 }
];

interface RoutineDaySelectorProps {
    selectedDays: Set<number>;
    onToggleDay: (day: number) => void;
}

export function RoutineDaySelector({
    selectedDays,
    onToggleDay
}: RoutineDaySelectorProps) {
    return (
        <View className="mb-7">
            <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider mb-2.5 px-1">
                Active Days
            </Text>
            <View className="flex-row justify-between">
                {DAYS.map((day) => {
                    const isSelected = selectedDays.has(day.value);
                    return (
                        <AnimatedPressable
                            key={day.value}
                            onPress={() => onToggleDay(day.value)}
                            hapticMode="light"
                            scaleTo={0.88}
                            className={`w-11 h-11 rounded-full items-center justify-center ${isSelected ? "bg-accent" : "bg-surface"
                                }`}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isSelected }}
                            accessibilityLabel={`${day.label}, ${isSelected ? "active" : "inactive"}`}
                        >
                            <Text
                                className={`font-black text-sm ${isSelected ? "text-accentForeground" : "text-textSecondary"
                                    }`}
                            >
                                {day.label}
                            </Text>
                        </AnimatedPressable>
                    );
                })}
            </View>
        </View>
    );
}
