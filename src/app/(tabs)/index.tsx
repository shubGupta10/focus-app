import { PermissionModal } from "@/components/modals/PermissionModal";
import { useTheme } from "@/contexts/ThemeContext";
import { ActiveSessionUI } from "@/features/session/components/ActiveSessionUI";
import { CentralFocusOrb } from "@/features/session/components/CentralFocusOrb";
import { EndSessionModal } from "@/features/session/components/modals/EndSessionModal";
import { SessionResultModal } from "@/features/session/components/modals/SessionResultModal";
import TimerSelectionModal from "@/features/session/components/modals/TimerSelectionModal";
import { useSettings } from "@/hooks/useSettings";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSessionController } from "../../features/session/hooks/useSessionController";
import { secondsToHoursAndMinutes } from "../../utils/timeUtils";

export default function Index() {
    const { getSetting } = useSettings();
    const { activeStyle, colors, isDarkMode } = useTheme();
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

    const {
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
        confirmEndSession,
        handleFocusPress,
        handleClosePermissionModal,
        skipsRemaining,
        resetCountdownText,
        todayStats
    } = useSessionController();

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

    const { hours: todayHours, minutes: todayMinutes } = secondsToHoursAndMinutes(todayStats.today_focus_seconds);
    const todayTimeString = todayStats.today_focus_seconds === 0 ? "0h" : (todayHours > 0 ? `${todayHours}h ${todayMinutes}m` : `${todayMinutes}m`);

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

                        <Pressable
                            onPress={() => router.push("/shop")}
                            className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opactiy-70 mr-3"
                            accessibilityRole="button"
                            accessibilityLabel="Open Shop"
                        >
                            <Ionicons name="cart-outline" size={20} color={colors.textSecondary} />
                        </Pressable>

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
