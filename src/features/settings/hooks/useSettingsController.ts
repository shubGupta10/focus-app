import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";
import { usePermissions } from "@/hooks/usePermissions";

export function useSettingsController() {
    const db = useSQLiteContext();
    const permissions = usePermissions();

    const resetAllData = () => {
        Alert.alert(
            "Reset All Data",
            "This will permanently delete all sessions, stats, coins, and cached data. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset Everything",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await db.execAsync(`
                                DELETE FROM sessions;
                                DELETE FROM blocked_attempts;
                                UPDATE user_stats SET total_coins = 0, current_streak = 0, longest_streak = 0, last_active_date = NULL, total_focus_seconds = 0 WHERE id = 1;
                            `);
                            await AsyncStorage.removeItem('active_session');
                            Alert.alert("Done", "All data has been reset.");
                        } catch (e: any) {
                            Alert.alert("Error", e.message);
                        }
                    },
                },
            ]
        );
    };

    return {
        ...permissions,
        resetAllData,
    };
}
