import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import FocusBlocker, { AppInfo } from "../../modules/focus-blocker/src/FocusBlockerModule";

const engineListeners = new Set<() => void>();

export function notifyEngineListeners() {
    engineListeners.forEach((listener) => {
        try {
            listener();
        } catch (e) {
            console.error(e);
        }
    });
}

export function useFocusEngine() {
    const db = useSQLiteContext();

    const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
    const [isStrictSession, setIsStrictSession] = useState<boolean>(false);

    const [hasUsage, setHasUsage] = useState(false);
    const [hasOverlay, setHasOverlay] = useState(false);
    const [hasBattery, setHasBattery] = useState(false);

    const loadSelectedApps = async () => {
        try {
            const rows = await db.getAllAsync<{
                package_name: string
            }>("SELECT package_name FROM selected_apps");
            setSelectedApps(rows.map(row => row.package_name));
        } catch (error) {
            console.error("Error loading selected apps:", error);
        }
    };

    const stopSession = async () => {
        try {
            await FocusBlocker.stopService();
            await db.runAsync("DELETE FROM active_session WHERE id = 1");
            setIsSessionActive(false);
            setIsStrictSession(false);
            setSessionStartTime(null);
            setSessionEndTime(null);
            notifyEngineListeners();
        } catch (error: any) {
            alert("Error, stopping:" + error.message);
        }
    };

    const startSession = async (durationMinutes: number, isStrict: boolean) => {
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

            const rows = await db.getAllAsync<{ package_name: string }>("SELECT package_name FROM selected_apps");
            let appsToBlock = rows.map(r => r.package_name);
            if (isStrict) {
                const systemApps = [
                    "com.android.settings",
                    "com.android.vending",
                    "com.google.android.packageinstaller"
                ];
                systemApps.forEach(app => {
                    if (!appsToBlock.includes(app)) {
                        appsToBlock.push(app);
                    }
                });
            }

            await FocusBlocker.startService(appsToBlock, durationMs, isStrict);

            const now = Date.now();
            const endTime = durationMs > 0 ? now + durationMs : -1;

            await db.runAsync(
                "INSERT OR REPLACE INTO active_session(id, start_time, end_time, is_strict) VALUES (1, ?, ?, ?)",
                [now, endTime, isStrict ? 1 : 0]
            );
            setSessionStartTime(now);
            setSessionEndTime(durationMs > 0 ? now + durationMs : -1);
            setIsStrictSession(isStrict);
            setIsSessionActive(true);
            notifyEngineListeners();
        } catch (error: any) {
            alert("Error Starting:" + error.message);
        }
    };

    const checkActiveSession = async () => {
        try {
            let nativeSession = null;
            try {
                nativeSession = FocusBlocker.getActiveSession();
            } catch (e) {
            }

            const now = Date.now();

            if (nativeSession && nativeSession.isActive) {
                if (nativeSession.endTime !== -1 && now >= nativeSession.endTime) {
                    await stopSession();
                    return;
                }

                if (isSessionActive && sessionStartTime === nativeSession.startTime && sessionEndTime === nativeSession.endTime) {
                    return;
                }

                setSessionStartTime(nativeSession.startTime);
                setSessionEndTime(nativeSession.endTime);
                setIsStrictSession(Boolean(nativeSession.isStrict));
                setIsSessionActive(true);

                try {
                    await db.runAsync(
                        "INSERT OR REPLACE INTO active_session(id, start_time, end_time, is_strict) VALUES (1, ?, ?, ?)",
                        [nativeSession.startTime, nativeSession.endTime, nativeSession.isStrict ? 1 : 0]
                    );
                } catch (e) {
                }
                return;
            }

            let active: { start_time: number; end_time: number; is_strict?: number } | null = null;
            try {
                active = await db.getFirstAsync<{ start_time: number; end_time: number; is_strict?: number }>("SELECT * FROM active_session WHERE id = 1");
            } catch (e) {
            }

            if (active) {
                const now = Date.now();
                if (active.end_time !== -1 && now >= active.end_time) {
                    await stopSession();
                    return;
                }

                if (isSessionActive && sessionStartTime === active.start_time && sessionEndTime === active.end_time) {
                    return;
                }

                setSessionStartTime(active.start_time);
                setSessionEndTime(active.end_time);
                setIsStrictSession(Boolean(active.is_strict));
                setIsSessionActive(true);

                let appsToBlock: string[] = [];
                try {
                    const rows = await db.getAllAsync<{ package_name: string }>("SELECT package_name FROM selected_apps");
                    appsToBlock = rows.map(row => row.package_name);
                } catch (e) {
                }

                if (Boolean(active.is_strict)) {
                    const systemApps = [
                        "com.android.settings",
                        "com.android.vending",
                        "com.google.android.packageinstaller"
                    ];
                    systemApps.forEach(app => {
                        if (!appsToBlock.includes(app)) {
                            appsToBlock.push(app);
                        }
                    });
                }

                const durationMs = active.end_time !== -1 ? active.end_time - now : -1;
                await FocusBlocker.startService(appsToBlock, durationMs, Boolean(active.is_strict));
            } else {
                if (!isSessionActive && sessionStartTime === null) {
                    return;
                }
                setSessionStartTime(null);
                setSessionEndTime(null);
                setIsStrictSession(false);
                setIsSessionActive(false);
            }
        } catch (error) {
            console.error("Error loading active session:", error);
        }
    };

    const loadApps = async () => {
        try {
            const apps = await FocusBlocker.getInstalledApps();
            setInstalledApps(apps.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error(error);
        }
    };

    const checkPermissions = () => {
        setHasUsage(FocusBlocker.hasUsagePermission());
        setHasOverlay(FocusBlocker.hasOverlayPermission());
        setHasBattery(FocusBlocker.hasBatteryPermission());
    };

    useEffect(() => {
        loadApps();
        checkPermissions();
        loadSelectedApps();
        checkActiveSession();

        const handleSync = () => {
            loadSelectedApps();
            checkActiveSession();
            checkPermissions();
        };

        engineListeners.add(handleSync);

        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                checkPermissions();
                loadSelectedApps();
                checkActiveSession();
            }
        });

        const syncInterval = setInterval(() => {
            checkActiveSession();
        }, 1500);

        return () => {
            subscription.remove();
            clearInterval(syncInterval);
            engineListeners.delete(handleSync);
        };
    }, []);

    const toggleApp = async (packageName: string) => {
        try {
            if (selectedApps.includes(packageName)) {
                await db.runAsync("DELETE FROM selected_apps WHERE package_name = $packageName", {
                    $packageName: packageName
                });
                setSelectedApps(prev => prev.filter(p => p !== packageName));
            } else {
                await db.runAsync("INSERT INTO selected_apps (package_name) VALUES ($packageName)", {
                    $packageName: packageName
                });
                setSelectedApps(prev => [...prev, packageName]);
            }
            notifyEngineListeners();
        } catch (error) {
            console.error("Error toggling app in DB:", error);
        }
    };

    const goHome = () => {
        FocusBlocker.goHome();
    };

    return {
        installedApps,
        selectedApps,
        isSessionActive,
        isStrictSession,
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
        refreshSessionState: checkActiveSession,
    };
}