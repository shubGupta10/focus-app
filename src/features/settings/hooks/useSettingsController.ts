import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert, AppState, PermissionsAndroid, Platform } from "react-native";
import FocusBlocker from "../../../../modules/focus-blocker/src/FocusBlockerModule";

export function useSettingsController() {
    const [permissionModalVisible, setPermissionModalVisible] = useState(false);
    const db = useSQLiteContext();

    const [hasUsage, setHasUsage] = useState(false);
    const [hasOverlay, setHasOverlay] = useState(false);
    const [hasBattery, setHasBattery] = useState(false);
    const [hasNotification, setHasNotification] = useState(true);

    const checkPermissions = async () => {
        setHasUsage(FocusBlocker.hasUsagePermission());
        setHasOverlay(FocusBlocker.hasOverlayPermission());
        setHasBattery(FocusBlocker.hasBatteryPermission());
        
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            setHasNotification(status);
        }
    };

    useEffect(() => {
        checkPermissions();
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") checkPermissions();
        });
        return () => sub.remove();
    }, []);

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

    const requestNotification = async () => {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            setHasNotification(granted === PermissionsAndroid.RESULTS.GRANTED);
        }
    };

    const allPermissionsGranted = hasUsage && hasOverlay && hasBattery && hasNotification;

    return {
        permissionModalVisible,
        setPermissionModalVisible,
        hasUsage,
        hasOverlay,
        hasBattery,
        hasNotification,
        allPermissionsGranted,
        resetAllData,
        requestNotification
    };
}
