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
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    const engine = useFocusEngine();
    const { getSetting } = useSettings();
    const { stats, savedCompletedSession, todayStats } = useUserStats();
    const { activeStyle, colors, isDarkMode } = useTheme();
    const { skipsRemaining, resetCountdownText, useEmergencySkip } = useStrictMode();
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

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
        if (engine.sessionStartTime) {
            const durationSeconds = engine.sessionEndTime && engine.sessionEndTime > 0
                ? Math.floor((Math.min(Date.now(), engine.sessionEndTime) - engine.sessionStartTime) / 1000)
                : Math.floor((Date.now() - engine.sessionStartTime) / 1000);

            const wasStrict = engine.isStrictSession;
            const { earnedCoins } = await savedCompletedSession(durationSeconds, wasStrict);
            setSessionResult({
                type: "completed",
                coins: earnedCoins,
                durationSeconds,
                isStrict: wasStrict,
            });
        }
        engine.stopSession();
    };

    const confirmEndSession = async () => {
        setIsEndModalVisible(false);
        if (engine.sessionStartTime) {
            const durationSeconds = Math.floor((Date.now() - engine.sessionStartTime) / 1000);
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
        engine.stopSession();
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
        return <SafeAreaView className="flex-1 bg-background" style={activeStyle} />
    }

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {!engine.isSessionActive && (
                <View className="flex-row justify-between items-center px-6 pt-3 pb-2 w-full">
                    <Text className="text-text font-black text-3xl tracking-tight">Lockout</Text>

                    <Pressable
                        onPress={() => router.push("/settings")}
                        className="w-10 h-10 rounded-full bg-surface items-center justify-center active:opacity-70 border border-border"
                        accessibilityRole="button"
                        accessibilityLabel="Open Settings"
                    >
                        <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
                    </Pressable>
                </View>
            )}

            {!engine.isSessionActive ? (
                <View className="flex-1 items-center justify-between px-6 py-4 w-full max-w-md mx-auto">
                    <View className="items-center">
                        <Text className="text-text text-4xl font-black tracking-tight text-center">
                            {!hasSelectedApps
                                ? "Set up your focus"
                                : !hasAllPermissions
                                    ? "Almost ready"
                                    : "Ready to focus?"}
                        </Text>

                        <Pressable
                            onPress={() => {
                                if (!hasSelectedApps) {
                                    router.push("/(tabs)/apps");
                                } else if (!hasAllPermissions) {
                                    setShowPermission(true);
                                } else {
                                    router.push("/(tabs)/apps");
                                }
                            }}
                            className="flex-row items-center bg-surface px-4 py-2 rounded-full border border-border mt-3 active:opacity-75"
                            accessibilityRole="button"
                            accessibilityLabel={
                                !hasSelectedApps
                                    ? "Step 1 of 2: Choose apps to guard"
                                    : !hasAllPermissions
                                        ? "Step 2 of 2: Enable permissions to guard apps"
                                        : `${engine.selectedApps.length} ${engine.selectedApps.length === 1 ? "app" : "apps"} guarded. Tap to change.`
                            }
                        >
                            <Ionicons
                                name={
                                    !hasSelectedApps
                                        ? "apps-outline"
                                        : !hasAllPermissions
                                            ? "shield-outline"
                                            : "shield-checkmark-outline"
                                }
                                size={15}
                                color={colors.accent}
                                style={{ marginRight: 6 }}
                            />
                            <Text className="text-text font-semibold text-xs mr-1">
                                {!hasSelectedApps
                                    ? "1. Choose apps to guard"
                                    : !hasAllPermissions
                                        ? "2. Enable permissions"
                                        : `${engine.selectedApps.length} ${engine.selectedApps.length === 1 ? "app" : "apps"} guarded`}
                            </Text>
                            <Ionicons name="chevron-forward" size={13} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    {/* Central Orb */}
                    <View className="items-center justify-center my-auto">
                        <CentralFocusOrb isActive={false} onStartPress={handleFocusPress} />
                        <Text className="text-textSecondary text-xs font-medium text-center mt-3">
                            {!hasSelectedApps
                                ? "Tap the orb to choose apps"
                                : !hasAllPermissions
                                    ? "Tap the orb to grant permissions"
                                    : "Tap the orb to begin"}
                        </Text>
                    </View>

                    {/* Bottom Section: Today's Metrics */}
                    <View className="w-full flex-row items-center justify-around px-6 pb-2">
                        <View className="items-center">
                            <Text className="text-text text-4xl font-black tracking-tight tabular-nums">
                                {todayTimeString}
                            </Text>
                            <Text className="text-textSecondary text-xs font-medium mt-1">
                                Focused today
                            </Text>
                        </View>

                        <View className="w-[1px] h-10 bg-border opacity-50" />

                        <View className="items-center">
                            <Text className="text-text text-4xl font-black tracking-tight tabular-nums">
                                {todayStats.today_sessions}
                            </Text>
                            <Text className="text-textSecondary text-xs font-medium mt-1">
                                Sessions
                            </Text>
                        </View>
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
