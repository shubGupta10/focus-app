import { useAppStore } from '@/store/useAppStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import FocusBlocker from "../../modules/focus-blocker/src/FocusBlockerModule";
import { analytics } from "@/utils/analytics";



const engineListeners = new Set<() => void>();
let isStartingSession = false;

export function notifyEngineListeners() {
    engineListeners.forEach((listener) => {
        try {
            listener();
        } catch (e) {
            console.error(e);
        }
    });
}

export function endFocusBreak() {
    FocusBlocker.endBreak();
    useAppStore.getState().setBreakState(false, null, useAppStore.getState().breaksRemaining);
    notifyEngineListeners();
}

export function useFocusEngine(isRoot: boolean = false) {
    const db = useSQLiteContext();

    const installedApps = useAppStore(state => state.installedApps);
    const selectedApps = useAppStore(state => state.selectedApps);
    const isSessionActive = useAppStore(state => state.isSessionActive);
    const sessionStartTime = useAppStore(state => state.sessionStartTime);
    const sessionEndTime = useAppStore(state => state.sessionEndTime);
    const isStrictSession = useAppStore(state => state.isStrictSession);
    const isBreakActive = useAppStore(state => state.isBreakActive);
    const breakEndTime = useAppStore(state => state.breakEndTime);
    const breaksRemaining = useAppStore(state => state.breaksRemaining);
    const hasUsage = useAppStore(state => state.hasUsage);
    const hasOverlay = useAppStore(state => state.hasOverlay);
    const hasBattery = useAppStore(state => state.hasBattery);
    const setEngineState = useAppStore(state => state.setEngineState);
    const setSessionState = useAppStore(state => state.setSessionState);
    const clearSession = useAppStore(state => state.clearSession);


    const loadSelectedApps = async () => {
        try {
            const rows = await db.getAllAsync<{
                package_name: string
            }>("SELECT package_name FROM selected_apps");
            const apps = rows.map(row => row.package_name);
            setEngineState({ selectedApps: apps });
            FocusBlocker.updateGlobalBlocklist(apps);
        } catch (error) {
            console.error("Error loading selected apps:", error);
        }
    };

    const stopSession = async () => {
        try {
            await FocusBlocker.stopService();
            await AsyncStorage.removeItem('active_session');
            clearSession();
            notifyEngineListeners();
        } catch (error: any) {
            alert("Error, stopping:" + error.message);
        }
    };

    const startSession = async (durationMinutes: number, isStrict: boolean) => {
        if (isStartingSession) return;
        isStartingSession = true;
        try {
            if (Platform.OS === "android" && Platform.Version >= 33) {
                const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                if (!hasPermission) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        alert("Notification permission is required to keep the Focus session running in the background.");
                        return;
                    }
                }
            }
            const durationMs = durationMinutes > 0 ? durationMinutes * 60 * 1000 : -1;

            let appsToBlock = [...selectedApps];

            if (isStrict) {
                const systemApps = [
                    "com.android.settings",
                    "com.android.vending",
                    "com.google.android.packageinstaller"
                ]
                systemApps.forEach(app => {
                    if (!appsToBlock.includes(app)) {
                        appsToBlock.push(app);
                    }
                });
            }

            console.log(`[Lockout JS] Starting session for ${durationMinutes} mins.`);
            console.log(`[Lockout JS] Apps to block: ${JSON.stringify(appsToBlock)}`);
            console.log(`[Lockout JS] Strict mode: ${isStrict}`);

            let silenceNotification = false;

            try {
                const silenceSetting = await db.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = 'silence_notifications_enabled'");
                silenceNotification = silenceSetting?.value === "true" && FocusBlocker.hasNotificationListenerPermission();
            } catch (error) { }

            await FocusBlocker.startService(appsToBlock, durationMs, isStrict, silenceNotification);


            try {
                const setting = await db.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = 'haptics_enabled'");
                if (setting?.value !== "false") {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }
            } catch (e) {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => { });
            }

            const now = Date.now();
            const endTime = durationMs > 0 ? now + durationMs : -1;

            await AsyncStorage.setItem('active_session', JSON.stringify({
                startTime: now,
                endTime: endTime,
                isStrict: isStrict
            }));

            setSessionState(true, now, endTime, isStrict);
            analytics.track("session_started", {
                duration_minutes: durationMinutes,
                is_strict: isStrict
            });
        } catch (error: any) {
            alert("Error Starting:" + error.message);
        } finally {
            isStartingSession = false;
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
            const storeState = useAppStore.getState();

            if (nativeSession && nativeSession.isActive) {
                if (nativeSession.endTime !== -1 && now >= nativeSession.endTime) {
                }

                const isBreakActive = Boolean(nativeSession.breakEndTime && nativeSession.breakEndTime > now);
                const breakEndTime = isBreakActive ? (nativeSession.breakEndTime ?? null) : null;
                const breaksRemaining = nativeSession.breaksRemaining ?? 1;
                const nativeTotalBreakMs = typeof nativeSession.totalBreakMs === 'number' && nativeSession.totalBreakMs > 0
                    ? nativeSession.totalBreakMs
                    : undefined;

                if (storeState.isBreakActive !== isBreakActive || storeState.breakEndTime !== breakEndTime || storeState.breaksRemaining !== breaksRemaining || (nativeTotalBreakMs !== undefined && storeState.totalBreakMs < nativeTotalBreakMs)) {
                    useAppStore.getState().setBreakState(isBreakActive, breakEndTime, breaksRemaining, nativeTotalBreakMs);
                }

                if (storeState.isSessionActive && storeState.sessionStartTime === nativeSession.startTime && storeState.sessionEndTime === nativeSession.endTime) {
                    return;
                }

                setSessionState(true, nativeSession.startTime, nativeSession.endTime, Boolean(nativeSession.isStrict));
                return;
            }

            try {
                const storedSession = await AsyncStorage.getItem('active_session');
                if (storedSession) {
                    const parsed = JSON.parse(storedSession);

                    if (parsed.endTime !== -1 && now >= parsed.endTime) {
                        setSessionState(false,
                            parsed.startTime, parsed.endTime,
                            parsed.isStrict
                        );
                        return;
                    } else {
                        let appsToBlock: string[] = [];
                        try {
                            const rows = await db.getAllAsync<{ package_name: string }>("SELECT package_name FROM selected_apps");
                            appsToBlock = rows.map(row => row.package_name);
                        } catch (e) { }

                        if (parsed.isStrict) {
                            const systemApps = ["com.android.settings", "com.android.vending", "com.google.android.packageinstaller"];
                            systemApps.forEach(app => {
                                if (!appsToBlock.includes(app)) appsToBlock.push(app);
                            });
                        }

                        let silenceNotifications = false;
                        try {
                            const silenceSetting = await db.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key =  'silence_notifications_enabled'");
                            silenceNotifications = silenceSetting?.value === "true" && FocusBlocker.hasNotificationListenerPermission();
                        } catch (error) { }

                        const remainingMs = parsed.endTime !== -1 ? parsed.endTime - now : -1;
                        await FocusBlocker.startService(appsToBlock, remainingMs, parsed.isStrict, silenceNotifications);

                        setSessionState(true, parsed.startTime, parsed.endTime, parsed.isStrict);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error handling AsyncStorage session fallback", error);
            }

            if (storeState.isSessionActive) {
                setSessionState(false, storeState.sessionStartTime, storeState.sessionEndTime, storeState.isStrictSession);
            }
        } catch (error) {
            console.error("Error loading active session:", error);
        }
    };

    const loadApps = async () => {
        try {
            const apps = await FocusBlocker.getInstalledApps();
            setEngineState({ installedApps: apps.sort((a, b) => a.name.localeCompare(b.name)) });
        } catch (error) {
            console.error(error);
        }
    };

    const checkPermissions = () => {
        setEngineState({
            hasUsage: FocusBlocker.hasUsagePermission(),
            hasOverlay: FocusBlocker.hasOverlayPermission(),
            hasBattery: FocusBlocker.hasBatteryPermission()
        })
    };

    useEffect(() => {
        if (!isRoot) return;

        setTimeout(() => {
            loadApps();
        }, 500);

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
    }, [isRoot]);

    const toggleApp = async (packageName: string) => {
        try {
            if (selectedApps.includes(packageName)) {
                await db.runAsync("DELETE FROM selected_apps WHERE package_name = $packageName", {
                    $packageName: packageName
                });
                const newApps = selectedApps.filter(p => p !== packageName);
                setEngineState({ selectedApps: newApps });
                FocusBlocker.updateGlobalBlocklist(newApps);
            } else {
                await db.runAsync("INSERT INTO selected_apps (package_name) VALUES ($packageName)", {
                    $packageName: packageName
                });
                const newApps = [...selectedApps, packageName];
                setEngineState({ selectedApps: newApps });
                FocusBlocker.updateGlobalBlocklist(newApps);
            }
            notifyEngineListeners();
        } catch (error) {
            console.error("Error toggling app in DB:", error);
        }
    };

    const goHome = () => {
        FocusBlocker.goHome();
    };

    const startBreak = (durationMinutes: number) => {
        FocusBlocker.startBreak(durationMinutes);
        notifyEngineListeners();
    };

    const endBreak = () => {
        endFocusBreak();
    };

    return {
        installedApps,
        selectedApps,
        isSessionActive,
        isStrictSession,
        isBreakActive,
        breakEndTime,
        breaksRemaining,
        hasUsage,
        hasOverlay,
        hasBattery,
        checkPermissions,
        toggleApp,
        loadSelectedApps,
        startSession,
        stopSession,
        startBreak,
        endBreak,
        goHome,
        sessionStartTime,
        sessionEndTime,
        refreshSessionState: checkActiveSession,
    };
}