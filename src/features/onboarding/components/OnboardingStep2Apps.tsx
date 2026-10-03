import { useTheme } from "@/contexts/ThemeContext";
import { AppListItem } from "@/features/blocklist/components/AppListItem";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Pressable, Text, TextInput, View } from "react-native";
import { GlobalLoader } from "@/components/GlobalLoader";

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

                <View className="flex-row items-center bg-surface border border-border rounded-full px-4 py-2 mb-3">
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search apps..."
                        placeholderTextColor={colors.textSecondary}
                        className="flex-1 text-text ml-2 text-[15px] py-1.5 font-medium"
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery("")} className="p-1">
                            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </Pressable>
                    )}
                </View>

                <View className="flex-row items-center justify-between mb-3 px-1 mt-2">
                    <Text className="text-textSecondary text-[11px] font-medium uppercase tracking-widest">
                        Installed Applications
                    </Text>
                    <Text className="text-accent text-[11px] font-bold uppercase tracking-widest">
                        {selectedSetSize} selected
                    </Text>
                </View>

                {installedAppsLength === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <GlobalLoader color={colors.accent} size="small" />
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
                    className="flex-1 bg-surface border border-border py-4 rounded-full items-center justify-center active:opacity-80"
                >
                    <Text className="text-text font-bold text-[15px] tracking-wide">
                        Skip
                    </Text>
                </Pressable>
                <Pressable
                    onPress={onContinue}
                    className="flex-1 bg-accent py-4 rounded-full items-center justify-center active:opacity-90"
                >
                    <Text className="text-accentForeground font-bold text-[15px] tracking-wide">
                        Continue
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
