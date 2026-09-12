import { AppListItem } from "@/components/AppListItem";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { cssInterop } from "nativewind";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


cssInterop(Ionicons, {
    className: {
        target: "style",
        nativeStyleToProp: {
            color: true,
        },
    },
});



export default function AppsTab() {
    const { activeStyle, colors } = useTheme();
    const engine = useFocusEngine();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState<"all" | "guarded">("all");
    const { showToast } = useToast();

    useFocusEffect(
        useCallback(() => {
            if (engine.refreshSessionState) {
                engine.refreshSessionState();
            }
        }, [engine])
    );

    const filteredApps = engine.installedApps.filter((app) => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (filterMode === "guarded") {
            return engine.selectedApps.includes(app.packageName);
        }
        return true;
    });

    const handleToggleApp = useCallback((packageName: string) => {
        if (engine.isSessionActive) return;
        const isCurrentlySelected = engine.selectedApps.includes(packageName);

        try {
            Vibration.vibrate(8);
        } catch { }

        engine.toggleApp(packageName);

        if (isCurrentlySelected) {
            showToast("App removed from block list")
        } else {
            showToast("App added to block list")
        }
    }, [engine.isSessionActive, engine.selectedApps, showToast, engine.toggleApp]);

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
            <View className="flex-row justify-between items-center px-6 pt-5 pb-3">
                <View className="flex-1">
                    <Text className="text-text font-black text-3xl tracking-tight">Block List</Text>
                    <Text className="text-textSecondary text-sm mt-0.5 font-medium">
                        {engine.selectedApps.length === 0
                            ? "No apps guarded yet"
                            : `${engine.selectedApps.length} of ${engine.installedApps.length} apps guarded`}
                    </Text>
                </View>

                <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-full border border-border">
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: engine.selectedApps.length > 0 ? colors.success : colors.textMuted,
                            marginRight: 6,
                        }}
                    />
                    <Text className="text-textSecondary text-xs font-semibold">
                        {engine.selectedApps.length > 0 ? "Auto-saved" : "Ready"}
                    </Text>
                </View>
            </View>

            {engine.selectedApps.length === 0 && !engine.isSessionActive && (
                <View className="px-6 mb-3">
                    <View className="bg-surface rounded-2xl p-4 border border-border flex-row items-center">
                        <Ionicons name="shield-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                        <Text className="text-textSecondary text-xs leading-5 flex-1 font-medium">
                            Choose the apps that distract you most. Lockout will guard them when you start a focus session.
                        </Text>
                    </View>
                </View>
            )}

            <View className="px-6 mb-3">
                <View className="flex-row items-center bg-surface rounded-2xl px-4 py-2.5 border border-border">
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
                        : "bg-surface border-border active:opacity-75"
                        }`}
                    accessibilityRole="button"
                    accessibilityLabel="Show all apps"
                >
                    <Text
                        className={`text-xs font-bold ${filterMode === "all" ? "text-accentForeground" : "text-textSecondary"
                            }`}
                    >
                        All ({engine.installedApps.length})
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setFilterMode("guarded")}
                    className={`px-3.5 py-1.5 rounded-full border ${filterMode === "guarded"
                        ? "bg-accent border-accent"
                        : "bg-surface border-border active:opacity-75"
                        }`}
                    accessibilityRole="button"
                    accessibilityLabel="Show guarded apps only"
                >
                    <Text
                        className={`text-xs font-bold ${filterMode === "guarded" ? "text-accentForeground" : "text-textSecondary"
                            }`}
                    >
                        Guarded ({engine.selectedApps.length})
                    </Text>
                </Pressable>
            </View>

            {engine.isSessionActive && (
                <View className="px-6 mb-4">
                    <View className="bg-warningMuted border border-warning rounded-2xl p-4 flex-row items-center">
                        <Ionicons name="lock-closed" size={20} color={colors.warning} style={{ marginRight: 12 }} />
                        <Text className="text-warning font-bold text-sm flex-1">
                            {engine.isStrictSession
                                ? "Block list is locked during a strict session."
                                : "End your current session to modify the block list."}
                        </Text>
                    </View>
                </View>
            )}

            <View className="flex-1 px-6">
                {engine.installedApps.length === 0 ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text className="text-textSecondary text-sm font-medium mt-3">
                            Loading installed apps...
                        </Text>
                    </View>
                ) : filteredApps.length === 0 ? (
                    <View className="py-12 items-center justify-center">
                        <View className="w-12 h-12 rounded-2xl bg-surface items-center justify-center mb-3 border border-border">
                            <Ionicons name="apps-outline" size={22} color={colors.textSecondary} />
                        </View>
                        <Text className="text-text font-bold text-base">No apps found</Text>
                        <Text className="text-textSecondary text-xs mt-1 text-center">
                            {searchQuery ? `No results matching "${searchQuery}"` : "No installed apps detected"}
                        </Text>
                        {searchQuery.length > 0 && (
                            <Pressable
                                onPress={() => setSearchQuery("")}
                                className="mt-4 px-4 py-2 rounded-xl bg-surface border border-border active:opacity-75"
                                accessibilityRole="button"
                                accessibilityLabel="Clear search and show all apps"
                            >
                                <Text className="text-text font-bold text-xs">Clear Search</Text>
                            </Pressable>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={filteredApps}
                        keyExtractor={(app) => app.packageName}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        initialNumToRender={15}
                        renderItem={({ item: app }) => (
                            <AppListItem
                                app={app}
                                isSelected={engine.selectedApps.includes(app.packageName)}
                                onToggle={handleToggleApp}
                                disabled={engine.isSessionActive}
                            />
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
