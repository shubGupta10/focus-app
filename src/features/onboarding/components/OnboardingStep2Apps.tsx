import { useTheme } from "@/contexts/ThemeContext";
import { AppListItem } from "@/features/blocklist/components/AppListItem";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

interface OnboardingStep2AppsProps {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    selectedSetSize: number;
    installedAppsLength: number;
    filteredApps: any[];
    selectedSet: Set<string>;
    toggleAppSelection: (packageName: string) => void;
    onSkip: () => void;
    onContinue: () => void;
}

export function OnboardingStep2Apps({
    searchQuery,
    setSearchQuery,
    selectedSetSize,
    installedAppsLength,
    filteredApps,
    selectedSet,
    toggleAppSelection,
    onSkip,
    onContinue
}: OnboardingStep2AppsProps) {
    const { colors } = useTheme();

    return (
        <View className="flex-1 px-6 pt-2 pb-6 justify-between">
            <View className="flex-1">
                <Text className="text-text text-3xl font-black tracking-tight mb-2">
                    Guard Distractions
                </Text>
                <Text className="text-textSecondary text-sm leading-5 mb-4">
                    Select the apps that pull you away during work or study. You can change these anytime.
                </Text>

                <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 py-2 mb-3">
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search apps..."
                        placeholderTextColor={colors.textSecondary}
                        className="flex-1 text-text ml-2 text-sm py-1 font-medium"
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                        </Pressable>
                    )}
                </View>

                <View className="flex-row items-center justify-between mb-3 px-1">
                    <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider">
                        Installed Applications
                    </Text>
                    <Text className="text-accent text-xs font-bold">
                        {selectedSetSize} selected
                    </Text>
                </View>

                {installedAppsLength === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={colors.accent} size="small" />
                    </View>
                ) : (
                    <FlashList
                        data={filteredApps}
                        keyExtractor={(item) => item.packageName}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        renderItem={({ item }) => (
                            <AppListItem
                                app={item}
                                isSelected={selectedSet.has(item.packageName)}
                                onToggle={toggleAppSelection}
                            />
                        )}
                    />
                )}
            </View>

            <View className="pt-3 flex-row gap-3">
                <Pressable
                    onPress={onSkip}
                    className="flex-1 bg-surface border border-border py-4 rounded-2xl items-center justify-center active:opacity-80"
                >
                    <Text className="text-textSecondary font-bold text-sm tracking-wider uppercase">
                        Skip Selection
                    </Text>
                </Pressable>
                <Pressable
                    onPress={onContinue}
                    className="flex-1 bg-accent py-4 rounded-2xl items-center justify-center active:opacity-90"
                >
                    <Text className="text-accentForeground font-black text-sm tracking-wider uppercase">
                        Continue
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
