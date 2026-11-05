import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

interface BackupRestoreCardProps {
    isExporting: boolean;
    isRestoring: boolean;
    onCreateBackup: () => void;
    onRestoreBackup: () => void;
}

export function BackupRestoreCard({
    isExporting,
    isRestoring,
    onCreateBackup,
    onRestoreBackup,
}: BackupRestoreCardProps) {
    const { colors } = useTheme();

    return (
        <View
            className="bg-surfaceElevated rounded-3xl overflow-hidden border border-border mb-6 shadow-sm"
            style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
            }}
        >
            <Pressable
                onPress={onCreateBackup}
                disabled={isExporting}
                className="p-5 border-b border-border active:bg-surface"
                accessibilityRole="button"
                accessibilityLabel="Create Backup"
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <Ionicons
                            name="cloud-upload"
                            size={20}
                            color="#3b82f6"
                            style={{ marginRight: 12 }}
                        />
                        <Text className="text-text font-bold text-base">
                            {isExporting ? "Creating Backup..." : "Create Backup"}
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textSecondary}
                    />
                </View>
                <Text className="text-textSecondary text-sm ml-8">
                    Export your routines, blocked apps, focus history, and stats into a backup.
                </Text>
            </Pressable>

            <Pressable
                onPress={onRestoreBackup}
                disabled={isRestoring}
                className="p-5 active:bg-surface"
                accessibilityRole="button"
                accessibilityLabel="Restore Backup"
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <Ionicons
                            name="cloud-download"
                            size={20}
                            color="#10b981"
                            style={{ marginRight: 12 }}
                        />
                        <Text className="text-text font-bold text-base">
                            {isRestoring ? "Restoring..." : "Restore Backup"}
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textSecondary}
                    />
                </View>
                <Text className="text-textSecondary text-sm ml-8">
                    Import and restore your routines, stats, and blocklist from a backup.
                </Text>
            </Pressable>
        </View>
    );
}

