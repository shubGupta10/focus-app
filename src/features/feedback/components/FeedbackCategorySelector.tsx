import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { FeedbackCategory } from "../types";

interface FeedbackCategorySelectorProps {
    selectedType: FeedbackCategory;
    onSelect: (type: FeedbackCategory) => void;
}

export function FeedbackCategorySelector({
    selectedType,
    onSelect,
}: FeedbackCategorySelectorProps) {
    const { colors } = useTheme();

    const categories: { key: FeedbackCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { key: "feedback", label: "Feedback", icon: "chatbubble-outline" },
        { key: "feature", label: "Idea", icon: "bulb-outline" },
        { key: "bug", label: "Bug", icon: "bug-outline" },
    ];

    return (
        <View className="flex-row bg-surfaceElevated border border-border rounded-full p-1.5 mb-6 items-center">
            {categories.map((cat) => {
                const isSelected = selectedType === cat.key;
                const itemColor = isSelected ? colors.accentForeground : colors.text;

                return (
                    <AnimatedPressable
                        key={cat.key}
                        onPress={() => onSelect(cat.key)}
                        scaleTo={0.96}
                        hapticMode="light"
                        className={`flex-1 py-3.5 rounded-full flex-row items-center justify-center ${
                            isSelected ? "bg-accent" : "bg-transparent"
                        }`}
                        style={isSelected ? { backgroundColor: colors.accent } : {}}
                    >
                        <Ionicons
                            name={cat.icon}
                            size={18}
                            color={itemColor}
                            style={{ marginRight: 8 }}
                        />
                        <Text
                            className="font-bold text-[15px]"
                            style={{ color: itemColor }}
                        >
                            {cat.label}
                        </Text>
                    </AnimatedPressable>
                );
            })}
        </View>
    );
}
