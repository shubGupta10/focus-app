import { useTheme } from "@/contexts/ThemeContext";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBlocklistController } from "../../features/blocklist/hooks/useBlocklistController";
import { BlocklistSearchHeader } from "../../features/blocklist/components/BlocklistSearchHeader";
import { BlocklistStatusBanners } from "../../features/blocklist/components/BlocklistStatusBanners";
import { AppList } from "../../features/blocklist/components/AppList";

export default function AppsTab() {
    const { activeStyle } = useTheme();
    const {
        engine,
        searchQuery,
        setSearchQuery,
        filterMode,
        setFilterMode,
        filteredApps,
        handleToggleApp
    } = useBlocklistController();

    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <View className="flex-row justify-between items-center px-6 pt-5 pb-4">
                <View className="flex-1">
                    <Text className="text-text font-black text-3xl tracking-tight">Block List</Text>
                </View>
            </View>

            <BlocklistStatusBanners
                isSessionActive={engine.isSessionActive}
                isStrictSession={engine.isStrictSession}
                selectedAppsCount={engine.selectedApps.length}
            />

            <BlocklistSearchHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterMode={filterMode}
                setFilterMode={setFilterMode}
                installedAppsCount={engine.installedApps.length}
                selectedAppsCount={engine.selectedApps.length}
            />

            <View className="flex-1 px-6">
                <AppList
                    installedAppsLength={engine.installedApps.length}
                    filteredApps={filteredApps}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedApps={engine.selectedApps}
                    isSessionActive={engine.isSessionActive}
                    handleToggleApp={handleToggleApp}
                />
            </View>
        </SafeAreaView>
    );
}
