import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
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
        <>
            <View className="px-6 mb-3">
                <View className="flex-row items-center bg-surfaceElevated border border-border rounded-full px-4 py-3">
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        className="flex-1 ml-2.5 text-text text-[15px] font-medium"
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

            <View className="flex-row px-6 mb-6 gap-2 mt-2">
                <Pressable
                    onPress={() => setFilterMode("all")}
                    className={`px-3.5 py-1.5 rounded-full border ${filterMode === "all"
                        ? "bg-accent border-accent"
                        : "bg-surfaceElevated border-transparent active:opacity-75"
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
                        : "bg-surfaceElevated border-transparent active:opacity-75"
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
                </Pressable>
            </View>
        </>
    );
}
