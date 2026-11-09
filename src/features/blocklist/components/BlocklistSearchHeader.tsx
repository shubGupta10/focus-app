import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, TextInput, View } from "react-native";

interface BlocklistSearchHeaderProps {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    filterMode: "all" | "guarded";
    setFilterMode: (mode: "all" | "guarded") => void;
    installedAppsCount: number;
    selectedAppsCount: number;
}

export function BlocklistSearchHeader({
    searchQuery,
    setSearchQuery,
    filterMode,
    setFilterMode,
    installedAppsCount,
    selectedAppsCount
}: BlocklistSearchHeaderProps) {
    const { colors } = useTheme();

    return (
        <View className="px-6 mb-4">
            <View
                className="flex-row items-center bg-surfaceElevated border border-border rounded-2xl px-4 py-3"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                }}
            >
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                    className="flex-1 ml-2.5 text-text text-[15px] font-medium py-0"
                    placeholder="Search apps..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                    autoCapitalize="none"
                />

                {searchQuery.length > 0 && (
                    <Pressable
                        onPress={() => setSearchQuery("")}
                        className="p-1"
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Clear search text"
                    >
                        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                    </Pressable>
                )}
            </View>

            <View className="flex-row gap-2.5 mt-3.5">
                <AnimatedPressable
                    onPress={() => setFilterMode("all")}
                    hapticMode="light"
                    scaleTo={0.92}
                    className={`px-4 py-2 rounded-full border ${filterMode === "all"
                        ? "bg-accent border-transparent"
                        : "bg-surfaceElevated border-border"
                        }`}
                    accessibilityRole="button"
                    accessibilityLabel="Show all apps"
                >
                    <Text
                        className={`text-xs font-bold ${filterMode === "all" ? "text-accentForeground" : "text-textSecondary"
                            }`}
                    >
                        All ({installedAppsCount})
                    </Text>
                </AnimatedPressable>

                <AnimatedPressable
                    onPress={() => setFilterMode("guarded")}
                    hapticMode="light"
                    scaleTo={0.92}
                    className={`px-4 py-2 rounded-full border ${filterMode === "guarded"
                        ? "bg-accent border-transparent"
                        : "bg-surfaceElevated border-border"
                        }`}
                    accessibilityRole="button"
                    accessibilityLabel="Show guarded apps only"
                >
                    <Text
                        className={`text-xs font-bold ${filterMode === "guarded" ? "text-accentForeground" : "text-textSecondary"
                            }`}
                    >
                        Blocked ({selectedAppsCount})
                    </Text>
                </AnimatedPressable>
            </View>
        </View>
    );
}
