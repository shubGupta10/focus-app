import { useTheme } from "@/contexts/ThemeContext";
import { AppList } from "@/features/blocklist/components/AppList";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
        }
    }, [visible, initialSelectedApps]);


    const filteredApps = installedApps.filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase()));


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
                    <Pressable onPress={onClose} hitSlop={10} className="w-9 h-9 rounded-full bg-surface items-center justify-center active:opacity-75">
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </Pressable>

                    <Text className="text-text font-black text-lg">
                        Select Apps
                    </Text>
                    <Pressable onPress={() => onSave(selectedApps)}
                        className="bg-accent px-5 py-2 rounded-full active:opacity-85"
                    >
                        <Text className="text-accentForeground font-bold text-xs uppercase tracking-wider">
                            Save
                        </Text>
                    </Pressable>
                </View>

                <View className="px-6 pb-2">
                    <Text className="text-textSecondary text-sm">
                        {selectedApps.length} apps selected to be blocked.
                    </Text>
                </View>

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