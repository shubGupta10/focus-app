import { Material3Switch } from "@/components/Material3Switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(Ionicons, {
    className: {
        target: "style",
        nativeStyleToProp: {
            color: true,
        },
    },
});

/**
 * B2: Deterministic background color from app name/package.
 * No new dependency — simple hash of first char of package segments.
 * Produces a consistent warm-palette hue per app so the list is visually scannable.
 */
const APP_AVATAR_COLORS = [
    "#C0392B", "#E67E22", "#F39C12", "#27AE60",
    "#16A085", "#2980B9", "#8E44AD", "#D35400",
    "#1ABC9C", "#E74C3C", "#3498DB", "#9B59B6",
];

function getAppColor(packageName: string): string {
    let hash = 0;
    for (let i = 0; i < packageName.length; i++) {
        hash = (hash * 31 + packageName.charCodeAt(i)) >>> 0;
    }
    return APP_AVATAR_COLORS[hash % APP_AVATAR_COLORS.length];
}

export default function AppsTab() {
    const { activeStyle, colors } = useTheme();
    const engine = useFocusEngine();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const filteredApps = engine.installedApps.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleApp = (packageName: string) => {
        try {
            Vibration.vibrate(8);
        } catch { }
        engine.toggleApp(packageName);
        setHasChanges(true);
        setIsSaved(false);
    };

    const handleSave = async () => {
        try {
            Vibration.vibrate(25);
        } catch { }
        await engine.loadSelectedApps();
        setIsSaved(true);
        setHasChanges(false);
        setTimeout(() => {
            setIsSaved(false);
        }, 2000);
    };

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
            <View className="flex-row justify-between items-center px-6 pt-5 pb-3">
                <View className="flex-1 mr-3">
                    <Text className="text-text font-black text-3xl tracking-tight">Block List</Text>
                    <Text className="text-textSecondary text-sm mt-0.5 font-medium">
                        {engine.selectedApps.length} of {engine.installedApps.length} apps selected
                    </Text>
                </View>

                {/* Save button — explicit save flow (hasChanges tracks pending toggles) */}
                <Pressable
                    onPress={handleSave}
                    disabled={!hasChanges || isSaved}
                    hitSlop={8}
                    style={{ opacity: !hasChanges ? 0.4 : 1 }}
                    className={`px-4 py-2 rounded-xl flex-row items-center justify-center active:opacity-80 ${isSaved
                            ? "bg-accent/20 border border-accent/40"
                            : "bg-accent shadow-sm"
                        }`}
                    accessibilityRole="button"
                    accessibilityLabel={isSaved ? "Saved" : "Save block list"}
                    // B1: Accessibility hint when button is disabled explains why
                    accessibilityHint={!hasChanges ? "Toggle an app to enable saving" : undefined}
                >
                    <Ionicons
                        name={isSaved ? "checkmark-circle" : "checkmark"}
                        size={16}
                        color={isSaved ? colors.accent : colors.background}
                        style={{ marginRight: 4 }}
                    />
                    <Text
                        style={{ color: isSaved ? colors.accent : colors.background }}
                        className="font-bold text-sm"
                    >
                        {isSaved ? "Saved!" : "Save"}
                    </Text>
                </Pressable>
            </View>

            {/* B3: Reduced py-3 → py-2.5 for slightly more proportionate search field */}
            <View className="px-6 mb-4">
                <View className="flex-row items-center bg-surface rounded-2xl px-4 py-2.5 border border-border">
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        className="flex-1 ml-2.5 text-text text-sm font-medium"
                        placeholder="Search apps by name..."
                        placeholderTextColor={colors.textSecondary}
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

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {engine.installedApps.length === 0 ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text className="text-textSecondary text-sm font-medium mt-3">
                            Loading installed apps...
                        </Text>
                    </View>
                ) : filteredApps.length === 0 ? (
                    // B4: Reduced icon container from w-16 h-16 to w-12 h-12 so it doesn't overpower search context
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
                                <Text className="text-accent font-bold text-xs">Clear Search</Text>
                            </Pressable>
                        )}
                    </View>
                ) : (
                    filteredApps.map((app) => {
                        const isSelected = engine.selectedApps.includes(app.packageName);
                        const initial = app.name ? app.name.charAt(0).toUpperCase() : "?";
                        // B2: Deterministic color per app — makes list visually scannable
                        const avatarBg = getAppColor(app.packageName);

                        return (
                            <Pressable
                                key={app.packageName}
                                onPress={() => handleToggleApp(app.packageName)}
                                className="flex-row justify-between items-center p-3.5 mb-2.5 rounded-2xl bg-surface border border-border"
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: isSelected }}
                                accessibilityLabel={`${app.name}, ${isSelected ? 'selected to block' : 'not blocked'}`}
                                accessibilityHint="Double tap to toggle blocking"
                            >
                                <View className="flex-row items-center flex-1 mr-3">
                                    {/* B2: Colored avatar background — distinct per app */}
                                    <View
                                        className="w-11 h-11 rounded-2xl items-center justify-center mr-3.5"
                                        style={{ backgroundColor: avatarBg }}
                                    >
                                        <Text className="font-black text-base text-white">
                                            {initial}
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="font-bold text-base text-text" numberOfLines={1}>
                                            {app.name}
                                        </Text>
                                    </View>
                                </View>

                                <View pointerEvents="none">
                                    <Material3Switch
                                        value={isSelected}
                                        onValueChange={() => { }}
                                    />
                                </View>
                            </Pressable>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
