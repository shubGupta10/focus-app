import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useSettings } from "@/hooks/useSettings";
import { useStrictMode } from "@/hooks/useStrictMode";
import { useUserStats } from "@/hooks/useUserStats";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";
import FocusBlocker from "../../../../modules/focus-blocker/src/FocusBlockerModule";
import { getDurationSeconds } from "../../../utils/timeUtils";
import { useSQLiteContext } from "expo-sqlite";
import { addNotification } from "@/hooks/useNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppStore } from "@/store/useAppStore";

export function useSessionController() {
    const db = useSQLiteContext();
    const engine = useFocusEngine();
    const { savedCompletedSession, todayStats, refreshStats } = useUserStats();
    const { skipsRemaining, resetCountdownText, useEmergencySkip } = useStrictMode();
    const { getSetting } = useSettings();

    const [showPermission, setShowPermission] = useState(false);
    const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
    const [isEndModalVisible, setIsEndModalVisible] = useState(false);
    const [sessionResult, setSessionResult] = useState<{
        type: "completed" | "canceled";
        coins: number;
        durationSeconds: number;
        isStrict?: boolean;
    } | null>(null);

    const isSavingSession = useRef(false);
    const lastProcessedEndTime = useRef<number | null>(null);

    const playCompletionFeedback = async (isSuccess: boolean) => {
        try {
            const hapticsEnabled = await getSetting("haptics_enabled") !== "false";

            if (hapticsEnabled) {
                await Haptics.notificationAsync(
                    isSuccess
                        ? Haptics.NotificationFeedbackType.Success
                        : Haptics.NotificationFeedbackType.Warning
                );
            }
        } catch (error) {
            console.error("Failed to play feedback", error);
        }
    };

    const handleCompleteSession = async () => {
        if (isSavingSession.current) return;
        isSavingSession.current = true;

        try {
            const completed = await FocusBlocker.getPendingCompletedSession();

            let durationSeconds = 0;
            let wasStrict = false;
            let endTimeMs: number | undefined = undefined;

            if (completed && completed.durationSeconds > 0) {
                durationSeconds = completed.durationSeconds;
                wasStrict = completed.isStrict;
                endTimeMs = completed.endTime;
            } else if (
                engine.sessionStartTime &&
                engine.sessionEndTime &&
                engine.sessionEndTime > 0
            ) {
                const store = useAppStore.getState();
                const effectiveEndTime = engine.sessionEndTime + store.totalBreakMs;
                if (Date.now() >= effectiveEndTime) {
                    const totalTargetSeconds = getDurationSeconds(engine.sessionStartTime, engine.sessionEndTime);
                    durationSeconds = totalTargetSeconds;
                    wasStrict = engine.isStrictSession;
                    endTimeMs = effectiveEndTime;
                }
            }

            if (durationSeconds > 0) {
                if (endTimeMs && lastProcessedEndTime.current === endTimeMs) {
                    await engine.stopSession();
                    return;
                }
                if (endTimeMs) {
                    lastProcessedEndTime.current = endTimeMs;
                }

                const { earnedCoins } = await savedCompletedSession(durationSeconds, wasStrict, endTimeMs);

                const minutes = Math.max(1, Math.floor(durationSeconds / 60));

                await addNotification(db, {
                    id: `session_${endTimeMs || Date.now()}`,
                    type: "session",
                    title: wasStrict ? "Strict session completed" : "Session completed",
                    description: `You focused for ${minutes} min${minutes > 1 ? "s" : ""} and earned +${earnedCoins} coins.`,
                    timestamp: endTimeMs || Date.now(),
                    action_label: null,
                    action_url: null,
                })

                try {
                    const sessionStartTime = endTimeMs ? endTimeMs - durationSeconds * 1000 : Date.now() - durationSeconds * 1000;

                    const blockedRows = await db.getAllAsync<{ count: number }>(
                        ` SELECT COUNT(*) as count FROM blocked_attempts WHERE timestamp >= ? AND timestamp <= ?`,
                        [sessionStartTime, endTimeMs || Date.now()]
                    );
                    const blockCount = blockedRows[0]?.count ?? 0;

                    if (blockCount > 0) {
                        await addNotification(db, {
                            id: `defense_${endTimeMs || Date.now()}`,
                            type: "defense",
                            title: `${blockCount} app open${blockCount > 1 ? "s" : ""} blocked`,
                            description: `Lockout blocked ${blockCount} attempt${blockCount > 1 ? "s" : ""} to open distracting apps during your session.`,
                            timestamp: (endTimeMs || Date.now()) + 1,
                            action_label: null,
                            action_url: null,
                        })
                    }
                } catch (error) {
                    console.error("Failed to check blocked attempts:", error);
                }

                try {
                    await FocusBlocker.clearCompletedSession();
                } catch (e) {
                    console.error("Failed to clear native bookmark", e);
                }

                setSessionResult({
                    type: "completed",
                    coins: earnedCoins,
                    durationSeconds,
                    isStrict: wasStrict,
                });
                playCompletionFeedback(true);

                const currentNative = FocusBlocker.getActiveSession();

                if (!currentNative || !currentNative.isActive) {
                    await engine.stopSession();
                } else {
                    await AsyncStorage.removeItem("active_session");
                    useAppStore.getState().clearSession();
                }

            }
        } catch (error) {
            console.error("Failed to complete session", error);
        } finally {
            isSavingSession.current = false;
        }
    };

    const handleCompleteRef = useRef(handleCompleteSession);
    handleCompleteRef.current = handleCompleteSession;

    useEffect(() => {
        handleCompleteRef.current();

        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                handleCompleteRef.current();
            }
        });

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        const effectiveEndTime = engine.sessionEndTime && engine.sessionEndTime > 0 ? engine.sessionEndTime + useAppStore.getState().totalBreakMs : null;
        if (!engine.isSessionActive && engine.sessionStartTime && effectiveEndTime && Date.now() >= effectiveEndTime) {
            handleCompleteSession();
        }
    }, [engine.isSessionActive, engine.sessionStartTime, engine.sessionEndTime]);

    const confirmEndSession = async () => {
        if (isSavingSession.current) return;
        isSavingSession.current = true;

        try {
            setIsEndModalVisible(false);
            if (engine.sessionStartTime) {
                const now = Date.now();
                const store = useAppStore.getState();
                let durationSeconds: number;
                if (store.isBreakActive) {
                    const breakStart = store.breakStartTime ?? (store.breakEndTime && store.breakDurationMs ? store.breakEndTime - store.breakDurationMs : now);
                    durationSeconds = Math.max(0, Math.floor((breakStart - engine.sessionStartTime - store.totalBreakMs) / 1000));
                } else {
                    durationSeconds = Math.max(0, Math.floor((now - engine.sessionStartTime - store.totalBreakMs) / 1000));
                }
                const wasStrict = engine.isStrictSession;
                const isCountdown = engine.sessionEndTime && engine.sessionEndTime > 0;

                if (isCountdown) {
                    if (wasStrict) {
                        await useEmergencySkip();
                    }

                    setSessionResult({
                        type: "canceled",
                        coins: 0,
                        durationSeconds,
                        isStrict: wasStrict,
                    });
                    playCompletionFeedback(false);
                } else {
                    const { earnedCoins } = await savedCompletedSession(durationSeconds, false);
                    setSessionResult({
                        type: "completed",
                        coins: earnedCoins,
                        durationSeconds,
                        isStrict: false,
                    });
                    playCompletionFeedback(true);
                }
            }
            await engine.stopSession();
        } finally {
            isSavingSession.current = false;
        }
    };

    const hasAllPermissions = engine.hasUsage && engine.hasOverlay && engine.hasBattery;
    const hasSelectedApps = engine.selectedApps.length > 0;

    const handleFocusPress = () => {
        if (engine.isSessionActive) {
            const store = useAppStore.getState();
            const effectiveEndTime = engine.sessionEndTime && engine.sessionEndTime > 0 ? engine.sessionEndTime + store.totalBreakMs : null;
            if (effectiveEndTime && Date.now() >= effectiveEndTime) {
                handleCompleteSession();
                return;
            }

            if (engine.isStrictSession && skipsRemaining <= 0) {
                Alert.alert(
                    "Strict Mode Active",
                    `This session is locked in Strict Mode and you have 0 emergency skips left this week (${resetCountdownText}). It will unlock when the timer finishes.`
                );
                return;
            }

            setIsEndModalVisible(true);
            return;
        }

        if (!hasSelectedApps) {
            router.push("/(tabs)/apps");
            return;
        }

        engine.checkPermissions();
        if (!engine.hasUsage || !engine.hasOverlay || !engine.hasBattery) {
            setShowPermission(true);
            return;
        }

        setIsTimerModalVisible(true);
    };

    const handleClosePermissionModal = () => {
        setShowPermission(false);
        engine.checkPermissions();
        if (hasSelectedApps && engine.hasUsage && engine.hasOverlay && engine.hasBattery) {
            setIsTimerModalVisible(true);
        }
    };

    return {
        engine,
        hasAllPermissions,
        hasSelectedApps,
        showPermission,
        setShowPermission,
        isTimerModalVisible,
        setIsTimerModalVisible,
        isEndModalVisible,
        setIsEndModalVisible,
        sessionResult,
        setSessionResult,
        handleCompleteSession,
        confirmEndSession,
        handleFocusPress,
        handleClosePermissionModal,
        skipsRemaining,
        resetCountdownText,
        todayStats,
        refreshStats
    };
}
