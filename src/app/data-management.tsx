import { useTheme } from "@/contexts/ThemeContext";
import { BackupRestoreCard } from "@/features/data-management/components/BackupRestoreCard";
import { useDataManagementController } from "@/features/data-management/hooks/useDataManagementController";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DataManagement() {
    const { activeStyle, colors } = useTheme();
    const {
        isExporting,
        isRestoring,
        handleCreateBackup,
        handleRestoreBackup,
    } = useDataManagementController();

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
            <View className="flex-row items-center px-6 pt-5 pb-3">
                <Pressable
                    onPress={() => router.back()}
                    className="mr-4 w-10 h-10 rounded-full bg-surfaceElevated border border-border items-center justify-center active:opacity-70 shadow-sm"
                    style={{ elevation: 2 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="chevron-back" size={20} color={colors.text} />
                </Pressable>
                <Text className="text-text text-3xl font-black tracking-tight">Data Management</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                <Text className="text-textSecondary text-base leading-relaxed mb-6 font-medium">
                    Create your backup and restore if you decided to uninstall the app.
                </Text>

                <BackupRestoreCard
                    isExporting={isExporting}
                    isRestoring={isRestoring}
                    onCreateBackup={handleCreateBackup}
                    onRestoreBackup={handleRestoreBackup}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
