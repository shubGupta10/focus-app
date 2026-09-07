import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import FocusBlocker, { AppInfo } from "../../modules/focus-blocker/src/FocusBlockerModule";

export function useFocusEngine() {
    const db = useSQLiteContext();

    const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);


    //permission states
    const [hasUsage, setHasUsage] = useState(false);
    const [hasOverlay, setHasOverlay] = useState(false);
    const [hasBattery, setHasBattery] = useState(false);

    useEffect(() => {
        loadApps();
        checkPermissions();
        loadSelectedApps();
        checkActiveSession();

        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                checkPermissions();
            }
        });

        return () => subscription.remove();
    }, []);

    const loadSelectedApps = async () => {
        try {
            const rows = await db.getAllAsync<{
                package_name: string
            }>("SELECT package_name FROM selected_apps");
            setSelectedApps(rows.map(row => row.package_name))
        } catch (error) {
            console.error("Error loading selected apps:", error);
        }
    }

    const checkActiveSession = async () => {
        try {
            const active = await db.getFirstAsync<{ start_time: number, end_time: number }>("SELECT * FROM active_session WHERE id = 1")

            if (active) {
                setSessionStartTime(active.start_time);
                setSessionEndTime(active.end_time);
                setIsSessionActive(true)
            }
        } catch (error) {
            console.error("Error loading active session:", error);
        }
    }

    const loadApps = async () => {
        try {
            const apps = await FocusBlocker.getInstalledApps();
            setInstalledApps(apps.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error(error)
        }
    }

    const checkPermissions = () => {
        setHasUsage(FocusBlocker.hasUsagePermission());
        setHasOverlay(FocusBlocker.hasOverlayPermission());
        setHasBattery(FocusBlocker.hasBatteryPermission());
    }

    const toggleApp = async (packageName: string) => {
        try {
            if (selectedApps.includes(packageName)) {
                await db.runAsync("DELETE FROM selected_apps WHERE package_name = $packageName", {
                    $packageName: packageName
                });
                setSelectedApps(prev => prev.filter(p => p !== packageName))
            } else {
                await db.runAsync("INSERT INTO selected_apps (package_name) VALUES ($packageName)", {
                    $packageName: packageName
                })
                setSelectedApps(prev => [...prev, packageName]);
            }
        } catch (error) {
            console.error("Error toggling app in DB:", error);
        }

    };

    const startSession = async (durationMinutes: number) => {
        try {
            if (Platform.OS === "android" && Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    alert("Notification permission is required to keep the Focus session running in the background.");
                    return;
                }
            }
            const durationMs = durationMinutes > 0 ? durationMinutes * 60 * 1000 : -1;
            await FocusBlocker.startService(selectedApps, durationMs);

            const now = Date.now();
            const endTime = durationMs > 0 ? now + durationMs : -1;

            await db.runAsync(
                "INSERT OR REPLACE INTO active_session(id, start_time, end_time) VALUES (1, ?, ?)",
                [now, endTime]
            )
            setSessionStartTime(now);
            setSessionEndTime(durationMs > 0 ? now + durationMs : -1);
            setIsSessionActive(true);
        } catch (error: any) {
            alert("Error Starting:" + error.message);
        }
    }

    const stopSession = async () => {
        try {
            await FocusBlocker.stopService();
            await db.runAsync("DELETE FROM active_session WHERE id = 1");
            setIsSessionActive(false);
            setSessionStartTime(null);
            setSessionEndTime(null);
        } catch (error: any) {
            alert("Error, stopping:" + error.message);
        }
    }

    const goHome = () => {
        FocusBlocker.goHome();
    }

    return {
        installedApps,
        selectedApps,
        isSessionActive,
        hasUsage,
        hasOverlay,
        hasBattery,
        checkPermissions,
        toggleApp,
        loadSelectedApps,
        startSession,
        stopSession,
        goHome,
        sessionStartTime,
        sessionEndTime,
    }

}