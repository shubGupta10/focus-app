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

export function useSessionController() {
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
                engine.sessionEndTime > 0 &&
                Date.now() >= engine.sessionEndTime
            ) {
                durationSeconds = getDurationSeconds(engine.sessionStartTime, engine.sessionEndTime);
                wasStrict = engine.isStrictSession;
                endTimeMs = engine.sessionEndTime;
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

                await engine.stopSession();
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
        if (!engine.isSessionActive && engine.sessionStartTime && engine.sessionEndTime && Date.now() >= engine.sessionEndTime) {
            handleCompleteSession();
        }
    }, [engine.isSessionActive, engine.sessionStartTime, engine.sessionEndTime]);

    const confirmEndSession = async () => {
        if (isSavingSession.current) return;
        isSavingSession.current = true;

        try {
            setIsEndModalVisible(false);
            if (engine.sessionStartTime) {
                const durationSeconds = getDurationSeconds(engine.sessionStartTime, Date.now());
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
            if (engine.sessionEndTime && engine.sessionEndTime > 0 && Date.now() >= engine.sessionEndTime) {
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
