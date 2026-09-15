import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PaletteDebugScreen() {
    const { palette, isDarkMode, colors } = useTheme();
    const insets = useSafeAreaInsets();

    if (!palette) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.text }}>No Material You palette found.</Text>
            </View>
        );
    }

    const renderColorRow = (name: string, array: string[]) => {
        if (!array) return null;
        return (
            <View className="mb-6">
                <Text className="text-text font-bold text-lg mb-2">{name}</Text>
                {array.map((color, index) => (
                    <View key={index} className="flex-row items-center mb-1">
                        <View style={{ width: 40, height: 40, backgroundColor: color, borderRadius: 8, marginRight: 12, borderWidth: 1, borderColor: colors.border }} />
                        <Text className="text-text font-medium text-base">Index [{index}]: {color}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, paddingHorizontal: 20 }}>
            <Stack.Screen options={{ title: "Palette Debug", headerShown: true, headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }} />
            <Text className="text-text font-black text-2xl mb-4">Material You Palette</Text>
            <Text className="text-textSecondary mb-6">Mode: {isDarkMode ? "Dark" : "Light"}</Text>
            {renderColorRow("system_accent1 (Primary)", palette.system_accent1)}
            {renderColorRow("system_neutral1 (Backgrounds)", palette.system_neutral1)}
            {renderColorRow("system_neutral2 (Borders)", palette.system_neutral2)}
        </ScrollView>
    );
}
