import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FocusBlocker, { AppInfo } from "../../modules/focus-blocker/src/FocusBlockerModule";
import { recordSession } from '../store/statsRepository';

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
            await AsyncStorage.removeItem('active_session');
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
            
            await AsyncStorage.setItem('active_session', JSON.stringify({
                startTime: now,
                endTime: endTime,
                isStrict: isStrict
            }));

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
                }

                if (isSessionActive && sessionStartTime === nativeSession.startTime && sessionEndTime === nativeSession.endTime) {
                    return;
                }

                setSessionStartTime(nativeSession.startTime);
                setSessionEndTime(nativeSession.endTime);
                setIsStrictSession(Boolean(nativeSession.isStrict));
                setIsSessionActive(true);
                return;
            }

            try {
                const storedSession = await AsyncStorage.getItem('active_session');
                if (storedSession) {
                    const parsed = JSON.parse(storedSession);
                    
                    if (parsed.endTime !== -1 && now >= parsed.endTime) {
                        const durationSeconds = Math.floor((parsed.endTime - parsed.startTime) / 1000);
                        try {
                            await recordSession(db, durationSeconds, parsed.isStrict);
                        } catch (e) {
                            console.error("Failed to record background session", e);
                        }
                        await AsyncStorage.removeItem('active_session');
                    } else {
                        let appsToBlock: string[] = [];
                        try {
                            const rows = await db.getAllAsync<{ package_name: string }>("SELECT package_name FROM selected_apps");
                            appsToBlock = rows.map(row => row.package_name);
                        } catch (e) {}

                        if (parsed.isStrict) {
                            const systemApps = ["com.android.settings", "com.android.vending", "com.google.android.packageinstaller"];
                            systemApps.forEach(app => {
                                if (!appsToBlock.includes(app)) appsToBlock.push(app);
                            });
                        }

                        const remainingMs = parsed.endTime !== -1 ? parsed.endTime - now : -1;
                        await FocusBlocker.startService(appsToBlock, remainingMs, parsed.isStrict);
                        
                        setSessionStartTime(parsed.startTime);
                        setSessionEndTime(parsed.endTime);
                        setIsStrictSession(parsed.isStrict);
                        setIsSessionActive(true);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error handling AsyncStorage session fallback", error);
            }

            setSessionStartTime(null);
            setSessionEndTime(null);
            setIsStrictSession(false);
            setIsSessionActive(false);
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