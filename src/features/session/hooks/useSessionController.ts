import { useState, useRef, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useUserStats } from "@/hooks/useUserStats";
import { useStrictMode } from "@/hooks/useStrictMode";
import { getDurationSeconds } from "../../../utils/timeUtils";

export function useSessionController() {
    const engine = useFocusEngine();
    const { savedCompletedSession, todayStats, refreshStats } = useUserStats();
    const { skipsRemaining, resetCountdownText, useEmergencySkip } = useStrictMode();

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

    const handleCompleteSession = async () => {
        if (isSavingSession.current) return;
        isSavingSession.current = true;
        try {
            if (engine.sessionStartTime) {
                const durationSeconds = engine.sessionEndTime && engine.sessionEndTime > 0
                    ? getDurationSeconds(engine.sessionStartTime, Math.min(Date.now(), engine.sessionEndTime))
                    : getDurationSeconds(engine.sessionStartTime, Date.now());

                const wasStrict = engine.isStrictSession;
                const { earnedCoins } = await savedCompletedSession(durationSeconds, wasStrict);
                setSessionResult({
                    type: "completed",
                    coins: earnedCoins,
                    durationSeconds,
                    isStrict: wasStrict,
                });
            }
            await engine.stopSession();
        } finally {
            isSavingSession.current = false;
        }
    };

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
                } else {
                    const { earnedCoins } = await savedCompletedSession(durationSeconds, false);
                    setSessionResult({
                        type: "completed",
                        coins: earnedCoins,
                        durationSeconds,
                        isStrict: false,
                    });
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
