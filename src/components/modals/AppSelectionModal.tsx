import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { cssInterop } from "nativewind";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Material3Switch } from "../Material3Switch";
import { AppInfo } from "../../../modules/focus-blocker/src/FocusBlockerModule";
import { useTheme } from "../../contexts/ThemeContext";

cssInterop(Ionicons, {
    className: {
        target: "style",
        nativeStyleToProp: {
            color: true,
        },
    },
});

interface AppApplicationModalProps {
    visible: boolean;
    onClose: () => void;
    installedApps: AppInfo[];
    selectedApps: string[];
    onToggleApp: (packageName: string) => void;
}

export function AppApplicationModal({
    visible,
    onClose,
    installedApps,
    selectedApps,
    onToggleApp
}: AppApplicationModalProps) {
    const { isMaterialYou, switchColors, activeStyle, palette } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredApps = installedApps.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <BlurView intensity={25} tint="dark" style={{ flex: 1, justifyContent: "flex-end" }}>
                <Pressable className="flex-1" onPress={onClose} />

                <View className="h-[88%] bg-surface rounded-t-[36px] shadow-2xl flex flex-col">
                    <View className="w-12 h-1.5 bg-border rounded-full self-center mt-3 mb-2" />

                    <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
                        <View>
                            <Text className="text-text font-black text-2xl tracking-tight">Block List</Text>
                            <Text className="text-textSecondary text-xs mt-0.5 font-medium">
                                {selectedApps.length} of {installedApps.length} apps selected
                            </Text>
                        </View>

                        <Pressable
                            onPress={onClose}
                            className="bg-accent px-6 py-2.5 rounded-full active:opacity-85 shadow-sm"
                        >
                            <Text className="text-background font-black text-xs tracking-widest uppercase">DONE</Text>
                        </Pressable>
                    </View>

                    <View className="px-6 mb-4">
                        <View className="flex-row items-center bg-surface rounded-2xl px-4 py-3">
                            <Ionicons name="search" size={18} className="text-textSecondary" />
                            <TextInput
                                className="flex-1 ml-2.5 text-text text-sm font-medium"
                                placeholder="Search apps by name..."
                                placeholderTextColor={isMaterialYou ? palette.system_neutral2[6] : "#A39992"}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                                autoCapitalize="none"
                            />
                            {searchQuery.length > 0 && (
                                <Pressable onPress={() => setSearchQuery("")} className="p-1">
                                    <Ionicons name="close-circle" size={18} className="text-textSecondary" />
                                </Pressable>
                            )}
                        </View>
                    </View>

                    <ScrollView
                        className="flex-1 px-6"
                        contentContainerStyle={{ paddingBottom: 32 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredApps.length === 0 ? (
                            <View className="py-16 items-center justify-center">
                                <View className="w-16 h-16 rounded-3xl bg-surface items-center justify-center mb-3">
                                    <Ionicons name="apps-outline" size={30} className="text-textSecondary" />
                                </View>
                                <Text className="text-text font-bold text-base">No apps found</Text>
                                <Text className="text-textSecondary text-xs mt-1">
                                    {searchQuery ? `No results matching "${searchQuery}"` : "No installed apps detected"}
                                </Text>
                            </View>
                        ) : (
                            filteredApps.map((app) => {
                                const isSelected = selectedApps.includes(app.packageName);
                                const initial = app.name ? app.name.charAt(0).toUpperCase() : "?";

                                return (
                                    <Pressable
                                        key={app.packageName}
                                        onPress={() => onToggleApp(app.packageName)}
                                        className="flex-row justify-between items-center p-3.5 mb-2.5 rounded-2xl bg-background"
                                    >
                                        <View className="flex-row items-center flex-1 mr-3">
                                            <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3.5 bg-surface">
                                                <Text className="font-black text-base text-text">
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
                                                onValueChange={() => {}}
                                            />
                                        </View>
                                    </Pressable>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </BlurView>
        </Modal>
    );
}