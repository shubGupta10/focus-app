import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

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
        <>
            <View className="px-6 mb-3">
                <View className="flex-row items-center bg-surfaceElevated rounded-2xl px-4 py-2.5">
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        className="flex-1 ml-2.5 text-text text-sm font-medium"
                        placeholder="Search apps by name..."
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
            </View>

            <View className="flex-row px-6 mb-4 gap-2">
                <Pressable
                    onPress={() => setFilterMode("all")}
                    className={`px-3.5 py-1.5 rounded-full border ${filterMode === "all"
                        ? "bg-accent border-accent"
                        : "bg-surfaceElevated active:opacity-75"
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
                </Pressable>

                <Pressable
                    onPress={() => setFilterMode("guarded")}
                    className={`px-3.5 py-1.5 rounded-full border ${filterMode === "guarded"
                        ? "bg-accent border-accent"
                        : "bg-surfaceElevated active:opacity-75"
                        }`}
                    accessibilityRole="button"
                    accessibilityLabel="Show guarded apps only"
                >
                    <Text
                        className={`text-xs font-bold ${filterMode === "guarded" ? "text-accentForeground" : "text-textSecondary"
                            }`}
                    >
                        Guarded ({selectedAppsCount})
                    </Text>
                </Pressable>
            </View>
        </>
    );
}
