import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Pressable, Text, View } from "react-native";
import { GlobalLoader } from "@/components/GlobalLoader";
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
                <GlobalLoader size="large" color={colors.accent} />
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
                <Text className="text-text font-bold text-[16px] mb-2">{searchQuery ? "No apps found" : installedAppsLength > 0 ? "Block List is Empty" : "No apps found"}</Text>
                <Text className="text-textSecondary text-sm mt-1 text-center px-4 leading-5">
                    {searchQuery 
                        ? `No results matching "${searchQuery}"` 
                        : installedAppsLength > 0 
                            ? "You haven't blocked any apps yet. Switch to 'All' to select apps that distract you most."
                            : "No installed apps detected"}
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
        <FlashList
            data={filteredApps}
            keyExtractor={(app) => app.packageName}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 130 }}
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
