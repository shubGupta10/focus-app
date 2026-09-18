import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { AppListItem } from "./AppListItem";

interface AppListProps {
    installedAppsLength: number;
    filteredApps: any[];
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    selectedApps: string[];
    isSessionActive: boolean;
    handleToggleApp: (packageName: string) => void;
}

export function AppList({
    installedAppsLength,
    filteredApps,
    searchQuery,
    setSearchQuery,
    selectedApps,
    isSessionActive,
    handleToggleApp
}: AppListProps) {
    const { colors } = useTheme();

    if (installedAppsLength === 0) {
        return (
            <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color={colors.accent} />
                <Text className="text-textSecondary text-sm font-medium mt-3">
                    Loading installed apps...
                </Text>
            </View>
        );
    }

    if (filteredApps.length === 0) {
        return (
            <View className="py-12 items-center justify-center">
                <View className="w-12 h-12 rounded-2xl bg-surfaceElevated items-center justify-center mb-3">
                    <Ionicons name="apps-outline" size={22} color={colors.textSecondary} />
                </View>
                <Text className="text-text font-bold text-base">No apps found</Text>
                <Text className="text-textSecondary text-xs mt-1 text-center">
                    {searchQuery ? `No results matching "${searchQuery}"` : "No installed apps detected"}
                </Text>
                {searchQuery.length > 0 && (
                    <Pressable
                        onPress={() => setSearchQuery("")}
                        className="mt-4 px-4 py-2 rounded-xl bg-surfaceElevated active:opacity-75"
                        accessibilityRole="button"
                        accessibilityLabel="Clear search and show all apps"
                    >
                        <Text className="text-text font-bold text-xs">Clear Search</Text>
                    </Pressable>
                )}
            </View>
        );
    }

    return (
        <FlatList
            data={filteredApps}
            keyExtractor={(app) => app.packageName}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 130 }}
            initialNumToRender={15}
            renderItem={({ item: app }) => (
                <AppListItem
                    app={app}
                    isSelected={selectedApps.includes(app.packageName)}
                    onToggle={handleToggleApp}
                    disabled={isSessionActive}
                />
            )}
        />
    );
}
