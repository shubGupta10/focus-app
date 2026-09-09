import { Material3Switch } from "@/components/Material3Switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";


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
    const [isSaved, setIsSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (engine.refreshSessionState) {
                engine.refreshSessionState();
            }
        }, [engine])
    );

    const filteredApps = engine.installedApps.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleApp = (packageName: string) => {
        if (engine.isSessionActive) {
            try { Vibration.vibrate([0, 50, 100, 50]); } catch { }
            return;
        }
        try {
            Vibration.vibrate(8);
        } catch { }
        engine.toggleApp(packageName);
        setHasChanges(true);
        setIsSaved(false);
    };

    const handleSave = async () => {
        if (engine.isSessionActive) return;
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
                    disabled={!hasChanges || isSaved || engine.isSessionActive}
                    hitSlop={8}
                    className={`px-4 py-2 rounded-xl flex-row items-center justify-center active:opacity-80 ${isSaved
                        ? "bg-successMuted border border-success"
                        : hasChanges && !engine.isSessionActive
                            ? "bg-accent shadow-sm"
                            : "bg-surface border border-border opacity-50"
                        }`}
                    accessibilityRole="button"
                    accessibilityLabel={isSaved ? "Saved" : "Save block list"}
                    // B1: Accessibility hint when button is disabled explains why
                    accessibilityHint={!hasChanges ? "Toggle an app to enable saving" : undefined}
                >
                    <Ionicons
                        name={isSaved ? "checkmark-circle" : "checkmark"}
                        size={16}
                        color={isSaved ? colors.success : hasChanges ? colors.accentForeground : colors.textMuted}
                        style={{ marginRight: 4 }}
                    />
                    <Text
                        style={{ color: isSaved ? colors.success : hasChanges ? colors.accentForeground : colors.textMuted }}
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
                        renderItem={({ item: app }) => {
                            const isSelected = engine.selectedApps.includes(app.packageName);
                            return (
                                <Pressable
                                    onPress={() => handleToggleApp(app.packageName)}
                                    className={`flex-row justify-between items-center p-3.5 mb-2.5 rounded-2xl bg-surface border border-border ${engine.isSessionActive ? 'opacity-50' : ''}`}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: isSelected }}
                                    accessibilityLabel={`${app.name}, ${isSelected ? 'selected to block' : 'not blocked'}`}
                                    accessibilityHint="Double tap to toggle blocking"
                                >
                                    <View className="flex-row items-center flex-1 mr-3">

                                        {app.icon ? (
                                            <Image
                                                source={{ uri: `data:image/png;base64,${app.icon}` }}
                                                className="w-11 h-11 rounded-xl mr-3.5"
                                            />
                                        ) : (
                                            <View className="w-11 h-11 rounded-xl bg-surfaceElevated border border-border items-center justify-center mr-3.5">
                                                <Ionicons name="help" size={20} color={colors.textMuted} />
                                            </View>
                                        )}

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
                        }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
