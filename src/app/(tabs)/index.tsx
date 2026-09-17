import { ActiveSessionUI } from "@/components/ActiveSessionUI";
import { CentralFocusOrb } from "@/components/CentralFocusOrb";
import { EndSessionModal } from "@/components/modals/EndSessionModal";
import { PermissionModal } from "@/components/modals/PermissionModal";
import { SessionResultModal } from "@/components/modals/SessionResultModal";
import TimerSelectionModal from "@/components/modals/TimerSelectionModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useSettings } from "@/hooks/useSettings";
import { useStrictMode } from "@/hooks/useStrictMode";
import { useUserStats } from "@/hooks/useUserStats";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    const engine = useFocusEngine();
    const { getSetting } = useSettings();
    const { stats, savedCompletedSession, todayStats } = useUserStats();
    const { activeStyle, colors, isDarkMode } = useTheme();
    const { skipsRemaining, resetCountdownText, useEmergencySkip } = useStrictMode();
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
    const isSavingSession = useRef(false);

    useEffect(() => {
        const checkFirstRun = async () => {
            const completed = await getSetting("has_completed_onboarding");
            if (completed !== "true") {
                router.replace("/onboarding");
            } else {
                setIsCheckingOnboarding(false)
            }
        };
        checkFirstRun();
    }, [])

    useFocusEffect(
        useCallback(() => {
            engine.loadSelectedApps();
            engine.checkPermissions();
            engine.refreshSessionState();
        }, [])
    );

    const hasAllPermissions = engine.hasUsage && engine.hasOverlay && engine.hasBattery;
    const hasSelectedApps = engine.selectedApps.length > 0;

    const todayHours = Math.floor(todayStats.today_focus_seconds / 3600);
    const todayMinutes = Math.floor((todayStats.today_focus_seconds % 3600) / 60);
    const todayTimeString = todayStats.today_focus_seconds === 0 ? "0h" : (todayHours > 0 ? `${todayHours}h ${todayMinutes}m` : `${todayMinutes}m`);

    const [showPermission, setShowPermission] = useState(false);
    const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
    const [isEndModalVisible, setIsEndModalVisible] = useState(false);
    const [sessionResult, setSessionResult] = useState<{
        type: "completed" | "canceled";
        coins: number;
        durationSeconds: number;
        isStrict?: boolean;
    } | null>(null);

    const handleCompleteSession = async () => {
        if (isSavingSession.current) return;
        isSavingSession.current = true;
        try {
            if (engine.sessionStartTime) {
                const durationSeconds = engine.sessionEndTime && engine.sessionEndTime > 0
                    ? Math.round((Math.min(Date.now(), engine.sessionEndTime) - engine.sessionStartTime) / 1000)
                    : Math.round((Date.now() - engine.sessionStartTime) / 1000);

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

    const confirmEndSession = async () => {
        if (isSavingSession.current) return;
        isSavingSession.current = true;

        try {
            setIsEndModalVisible(false);
            if (engine.sessionStartTime) {
                const durationSeconds = Math.round((Date.now() - engine.sessionStartTime) / 1000);
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

    if (isCheckingOnboarding) {
        return <SafeAreaView className="flex-1 bg-surface" style={activeStyle} />
    }

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {!engine.isSessionActive && (
                <View className="flex-row justify-between items-center px-6 pt-5 pb-2 w-full">
                    <View>
                        <Text className="text-text font-black text-3xl tracking-tight leading-none">Lockout</Text>
                    </View>

                    <View className="flex-row items-center">
                        {/* <Pressable
                            onPress={() => router.push("/palette")}
                            className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70 mr-2"
                            accessibilityRole="button"
                        >
                            <Ionicons name="color-palette-outline" size={20} color={colors.textSecondary} />
                        </Pressable> */}
                        <Pressable
                            onPress={() => router.push("/settings")}
                            className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70"
                            accessibilityRole="button"
                            accessibilityLabel="Open Settings"
                        >
                            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                </View>
            )}

            {!engine.isSessionActive ? (
                <View className="flex-1 items-center justify-between px-6 py-4 w-full max-w-md mx-auto">

                    {(!hasSelectedApps || !hasAllPermissions) ? (
                        <View className="items-center mt-2">
                            <Pressable
                                onPress={() => {
                                    if (!hasSelectedApps) {
                                        router.push("/(tabs)/apps");
                                    } else if (!hasAllPermissions) {
                                        setShowPermission(true);
                                    }
                                }}
                                className="flex-row items-center bg-surfaceElevated px-4 py-2.5 rounded-full mt-3 active:opacity-75 shadow-sm"
                            >
                                <Ionicons
                                    name={!hasSelectedApps ? "apps-outline" : "shield-outline"}
                                    size={16}
                                    color={colors.accent}
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-text font-bold text-sm mr-1">
                                    {!hasSelectedApps ? "1. Choose apps to guard" : "2. Enable permissions"}
                                </Text>
                                <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                    ) : (
                        <View className="items-center mt-6 mb-2">
                            <Text className="text-text font-extrabold text-2xl tracking-tight mb-1">{greeting}</Text>
                            <Text className="text-textSecondary text-[15px] font-semibold">
                                <Text className="text-accent font-bold">{todayTimeString}</Text> focused today · <Text className="text-accent font-bold">{todayStats.today_sessions}</Text> sessions
                            </Text>
                        </View>
                    )}

                    <View className="items-center justify-center my-auto">
                        <CentralFocusOrb isActive={false} onStartPress={handleFocusPress} />
                        {(!hasSelectedApps || !hasAllPermissions) && (
                            <Text className="text-textSecondary text-xs font-medium text-center mt-6">
                                {!hasSelectedApps ? "Tap to choose apps" : "Tap to grant permissions"}
                            </Text>
                        )}
                    </View>

                    <View className="w-full mb-[120px] mt-auto">
                        <Pressable
                            onPress={() => router.push("/(tabs)/apps")}
                            className="self-center bg-surfaceElevated rounded-full px-5 py-3 flex-row items-center justify-center active:opacity-70"
                        >
                            <Ionicons name="shield-checkmark" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                            <Text className="text-text font-bold text-sm">
                                {engine.selectedApps.length} Apps blocked
                            </Text>
                            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 6, marginTop: 1 }} />
                        </Pressable>
                    </View>
                </View>
            ) : (
                <ActiveSessionUI
                    onStopPress={handleFocusPress}
                    startTime={engine.sessionStartTime}
                    endTime={engine.sessionEndTime}
                    blockedAppsCount={engine.selectedApps.length}
                    isStrict={engine.isStrictSession}
                    skipsRemaining={skipsRemaining}
                />
            )}

            <TimerSelectionModal
                visible={isTimerModalVisible}
                onClose={() => setIsTimerModalVisible(false)}
                onStartSession={(durationMinutes, isStrict) => {
                    setIsTimerModalVisible(false);
                    engine.startSession(durationMinutes, isStrict);
                }}
            />

            <PermissionModal
                visible={showPermission}
                onClose={handleClosePermissionModal}
                hasUsage={engine.hasUsage}
                hasOverlay={engine.hasOverlay}
                hasBattery={engine.hasBattery}
            />

            <SessionResultModal
                visible={sessionResult !== null}
                onClose={() => setSessionResult(null)}
                result={sessionResult}
            />

            <EndSessionModal
                visible={isEndModalVisible}
                onClose={() => setIsEndModalVisible(false)}
                onConfirmEnd={confirmEndSession}
                isStrict={engine.isStrictSession}
                resetCountdownText={resetCountdownText}
            />
        </SafeAreaView>
    );
}
