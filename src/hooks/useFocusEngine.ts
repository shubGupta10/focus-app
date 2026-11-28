import { useAppStore } from '@/store/useAppStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import FocusBlocker, { AppInfo } from '../../modules/focus-blocker/src/FocusBlockerModule';
import { analytics } from "@/utils/analytics";



const engineListeners = new Set<() => void>();
let isStartingSession = false;
let inFlightLoadApps: Promise<void> | null = null;
let lastSyncedBlocklistKey: string | null = null;

function stringArraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function syncNativeBlocklist(apps: string[]) {
    const key = apps.join(",");
    if (lastSyncedBlocklistKey === key) return;
    lastSyncedBlocklistKey = key;
    FocusBlocker.updateGlobalBlocklist(apps);
}

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


    const loadSelectedApps = useCallback(async () => {
        try {
            const rows = await db.getAllAsync<{
                package_name: string
            }>("SELECT package_name FROM selected_apps");
            const apps = rows.map(row => row.package_name);

            const installedPackages = new Set(
                useAppStore.getState().installedApps.map(a => a.packageName)
            );

            let nextApps = apps;
            if (installedPackages.size > 0) {
                const staleApps = apps.filter(pkg => !installedPackages.has(pkg));
                if (staleApps.length > 0) {
                    for (const pkg of staleApps) {
                        await db.runAsync("DELETE FROM selected_apps WHERE package_name = ?", [pkg]);
                    }
                }
                nextApps = apps.filter(pkg => installedPackages.has(pkg));
            }

            if (!stringArraysEqual(useAppStore.getState().selectedApps, nextApps)) {
                setEngineState({ selectedApps: nextApps });
            }
            syncNativeBlocklist(nextApps);
        } catch (error) {
            console.error("Error loading selected apps:", error);
        }
    }, [db, setEngineState]);

    const stopSession = useCallback(async () => {
        try {
            await FocusBlocker.stopService();
            await AsyncStorage.removeItem('active_session');
            clearSession();
            notifyEngineListeners();
        } catch (error: any) {
            alert("Error, stopping:" + error.message);
        }
    }, [clearSession]);

    const startSession = useCallback(async (durationMinutes: number, isStrict: boolean) => {
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

            let appsToBlock = [...useAppStore.getState().selectedApps];

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
    }, [db, setSessionState]);

    const checkActiveSession = useCallback(async () => {
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

                if (storeState.isBreakActive !== isBreakActive || storeState.breakEndTime !== breakEndTime || storeState.breaksRemaining !== breaksRemaining || (nativeTotalBreakMs !== undefined && storeState.totalBreakMs !== nativeTotalBreakMs)) {
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
                        if (storeState.isSessionActive || storeState.sessionStartTime !== parsed.startTime || storeState.sessionEndTime !== parsed.endTime) {
                            setSessionState(false,
                                parsed.startTime, parsed.endTime,
                                parsed.isStrict
                            );
                        }
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
    }, [db, setSessionState]);

    const loadApps = useCallback(async () => {
        if (inFlightLoadApps) {
            return inFlightLoadApps;
        }
        inFlightLoadApps = (async () => {
            try {
                const apps = await FocusBlocker.getInstalledApps();
                setEngineState({ installedApps: apps.sort((a, b) => a.name.localeCompare(b.name)) });
                await loadSelectedApps();
            } catch (error) {
                console.error(error);
            } finally {
                inFlightLoadApps = null;
            }
        })();
        return inFlightLoadApps;
    }, [setEngineState, loadSelectedApps]);

    const checkPermissions = useCallback(() => {
        const usage = FocusBlocker.hasUsagePermission();
        const overlay = FocusBlocker.hasOverlayPermission();
        const battery = FocusBlocker.hasBatteryPermission();
        const current = useAppStore.getState();

        if (
            current.hasUsage !== usage ||
            current.hasOverlay !== overlay ||
            current.hasBattery !== battery
        ) {
            setEngineState({
                hasUsage: usage,
                hasOverlay: overlay,
                hasBattery: battery,
            });
        }
    }, [setEngineState]);

    useEffect(() => {
        if (!isRoot) return;

        const loadAppsTimer = setTimeout(() => {
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
            clearTimeout(loadAppsTimer);
            subscription.remove();
            clearInterval(syncInterval);
            engineListeners.delete(handleSync);
        };
    }, [isRoot, loadApps, checkPermissions, loadSelectedApps, checkActiveSession]);

    const setSelectedApps = useCallback(async (apps: string[]) => {
        try {
            await db.withTransactionAsync(async () => {
                await db.runAsync("DELETE FROM selected_apps");
                for (const pkg of apps) {
                    await db.runAsync("INSERT INTO selected_apps (package_name) VALUES (?)", [pkg]);
                }
            });
            setEngineState({ selectedApps: apps });
            syncNativeBlocklist(apps);
            notifyEngineListeners();
        } catch (error) {
            console.error("Error setting selected apps in DB:", error);
        }
    }, [db, setEngineState]);

    const toggleApp = useCallback(async (packageName: string) => {
        try {
            const currentSelected = useAppStore.getState().selectedApps;
            if (currentSelected.includes(packageName)) {
                await db.runAsync("DELETE FROM selected_apps WHERE package_name = $packageName", {
                    $packageName: packageName
                });
                const newApps = currentSelected.filter(p => p !== packageName);
                setEngineState({ selectedApps: newApps });
                syncNativeBlocklist(newApps);
            } else {
                await db.runAsync("INSERT INTO selected_apps (package_name) VALUES ($packageName)", {
                    $packageName: packageName
                });
                const newApps = [...currentSelected, packageName];
                setEngineState({ selectedApps: newApps });
                syncNativeBlocklist(newApps);
            }
            notifyEngineListeners();
        } catch (error) {
            console.error("Error toggling app in DB:", error);
        }
    }, [db, setEngineState]);

    const goHome = useCallback(() => {
        FocusBlocker.goHome();
    }, []);

    const startBreak = useCallback(async (durationMinutes: number) => {
        FocusBlocker.startBreak(durationMinutes);
        const breakDurationMs = durationMinutes * 60 * 1000;
        const breakEndTime = Date.now() + breakDurationMs;
        useAppStore.getState().setBreakState(true, breakEndTime, 0);

        try {
            const stored = await AsyncStorage.getItem('active_session');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.endTime !== -1) {
                    parsed.endTime += breakDurationMs;
                    await AsyncStorage.setItem('active_session', JSON.stringify(parsed));
                }
            }
        } catch (e) {
        }

        notifyEngineListeners();
    }, []);

    const endBreak = useCallback(() => {
        endFocusBreak();
    }, []);

    return useMemo(() => ({
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
        loadApps,
        loadSelectedApps,
        setSelectedApps,
        startSession,
        stopSession,
        startBreak,
        endBreak,
        goHome,
        sessionStartTime,
        sessionEndTime,
        refreshSessionState: checkActiveSession,
    }), [
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
        loadApps,
        loadSelectedApps,
        setSelectedApps,
        startSession,
        stopSession,
        startBreak,
        endBreak,
        goHome,
        sessionStartTime,
        sessionEndTime,
        checkActiveSession,
    ]);
}
