import { Pressable, Text, View } from "react-native";

const DAYS = [
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "T", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
    { label: "S", value: 7 }
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
                        <Pressable
                            key={day.value}
                            onPress={() => onToggleDay(day.value)}
                            className={`w-11 h-11 rounded-full items-center justify-center ${
                                isSelected ? "bg-accent" : "bg-surface"
                            } active:opacity-80`}
                        >
                            <Text
                                className={`font-black text-sm ${
                                    isSelected ? "text-accentForeground" : "text-textSecondary"
                                }`}
                            >
                                {day.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
