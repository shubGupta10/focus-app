import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import { AppList } from "@/features/blocklist/components/AppList";
import { BlocklistSearchHeader } from "@/features/blocklist/components/BlocklistSearchHeader";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FocusBlocker from "../../../../../modules/focus-blocker/src/FocusBlockerModule";

interface RoutineAppSelectionModalProps {
    visible: boolean;
    initialSelectedApps: string[];
    onClose: () => void;
    onSave: (selectedApps: string[]) => void;
}


export function RoutineAppSelectionModal({
    visible,
    initialSelectedApps,
    onClose,
    onSave
}: RoutineAppSelectionModalProps) {
    const { colors, activeStyle } = useTheme();
    const [installedApps, setInstalledApps] = useState<any[]>([]);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMode, setFilteredMode] = useState<"all" | "guarded">("all")

    useEffect(() => {
        if (visible) {
            setSelectedApps(initialSelectedApps);

            FocusBlocker.getInstalledApps().then((apps: any) => {
                const sortedApps = apps.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, {
                    sensivity: "base"
                })
                );
                setInstalledApps(sortedApps);
            })
        } else {
            setSearchQuery("");
            setFilteredMode("all");
        }
    }, [visible, initialSelectedApps]);


    const filteredApps = useMemo(() => {
        return installedApps.filter((app) => {
            const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (filteredMode === "guarded") {
                return selectedApps.includes(app.packageName);
            }
            return true;
        })
    }, [installedApps, searchQuery, filteredMode, selectedApps]);


    const handleToggleApp = (packageName: string) => {
        setSelectedApps((prev) =>
            prev.includes(packageName)
                ? prev.filter((p) => p !== packageName)
                : [...prev, packageName]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
                <View className="flex-row items-center justify-between px-6 pt-5 pb-4">
                    <AnimatedPressable
                        onPress={onClose}
                        hitSlop={10}
                        scaleTo={0.88}
                        hapticMode="light"
                        className="w-10 h-10 rounded-full bg-surface items-center justify-center"
                        accessibilityRole="button"
                        accessibilityLabel="Close app selection"
                    >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </AnimatedPressable>

                    <Text className="text-text font-black text-lg">
                        Select Apps
                    </Text>
                    {/* M3 Filled Button Pill */}
                    <AnimatedPressable
                        onPress={() => onSave(selectedApps)}
                        scaleTo={0.92}
                        hapticMode="light"
                        className="bg-accent px-5 py-2 rounded-full"
                        style={{ elevation: 1 }}
                        accessibilityRole="button"
                        accessibilityLabel="Save app selections"
                    >
                        <Text className="text-accentForeground font-bold text-xs uppercase tracking-wider">
                            Save
                        </Text>
                    </AnimatedPressable>
                </View>

                <View className="px-6 pb-2">
                    <Text className="text-textSecondary text-sm">
                        {selectedApps.length} {selectedApps.length === 1 ? "app" : "apps"} selected to be blocked.
                    </Text>
                </View>

                <BlocklistSearchHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterMode={filteredMode}
                    setFilterMode={setFilteredMode}
                    installedAppsCount={installedApps.length}
                    selectedAppsCount={selectedApps.length}
                />

                <View className="flex-1 px-6">
                    <AppList
                        installedAppsLength={installedApps.length}
                        filteredApps={filteredApps}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedApps={selectedApps}
                        isSessionActive={false}
                        handleToggleApp={handleToggleApp}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    )
}