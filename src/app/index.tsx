import { ActiveSessionUI } from "@/components/ActiveSessionUI";
import { CentralFocusOrb } from "@/components/CentralFocusOrb";
import { CustomBottomBar } from "@/components/CustomBottomBar";
import { AppApplicationModal } from "@/components/modals/AppSelectionModal";
import { PermissionModal } from "@/components/modals/PermissionModal";
import { SessionResultModal } from "@/components/modals/SessionResultModal";
import TimerSelectionModal from "@/components/modals/TimerSelectionModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useUserStats } from "@/hooks/useUserStats";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const engine = useFocusEngine();
  const { stats, refreshStats, savedCompletedSession, todayStats } = useUserStats();
  const { activeStyle } = useTheme();

  const todayHours = Math.floor(todayStats.today_focus_seconds / 3600);
  const todayMinutes = Math.floor((todayStats.today_focus_seconds % 3600) / 60);
  const todayTimeString = todayStats.today_focus_seconds === 0 ? "0h" : (todayHours > 0 ? `${todayHours}h ${todayMinutes}m` : `${todayMinutes}m`);

  const [showAppList, setShowAppList] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [isTimerModalVisible, setIsTimeModalVisible] = useState(false);
  const [sessionResult, setSessionResult] = useState<{
    type: "completed" | "canceled",
    coins: number;
    durationSeconds: number;
  } | null>(null)

  const handleFocusPress = () => {
    if (engine.isSessionActive) {
      if (engine.sessionStartTime) {
        const durationSeconds = engine.sessionEndTime && engine.sessionEndTime > 0
          ? Math.floor((Math.min(Date.now(), engine.sessionEndTime) - engine.sessionStartTime) / 1000)
          : Math.floor((Date.now() - engine.sessionStartTime) / 1000);


        const isCountdown = engine.sessionEndTime && engine.sessionEndTime > 0;

        if (isCountdown) {
          setSessionResult({
            type: "canceled",
            coins: 0,
            durationSeconds
          })
        } else {
          savedCompletedSession(durationSeconds).then(({ earnedCoins }) => {
            setSessionResult({ type: "completed", coins: earnedCoins, durationSeconds });
          });
        }
      }
      engine.stopSession();
      return;
    }

    if (engine.selectedApps.length === 0) {
      alert("You must select apps to block first!");
      setShowAppList(true);
      return;
    }

    engine.checkPermissions();
    if (!engine.hasUsage || !engine.hasOverlay || !engine.hasBattery) {
      setShowPermission(true);
    } else {
      setIsTimeModalVisible(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
      <StatusBar style="auto" />

      <View className="flex-row justify-between items-center px-6 pt-4">
        <View className="flex-row items-center bg-surface px-4 py-2 rounded-full border border-border shadow-sm">
          <Text className="text-xl mr-2">🪙</Text>
          <Text className="text-text font-black text-lg">{stats.total_coins.toLocaleString()}</Text>
        </View>

        <View className="flex-row items-center bg-surface px-4 py-2 rounded-full border border-border shadow-sm">
          <Text className="text-base mr-1.5">🔥</Text>
          <Text className="text-text font-bold text-sm">{stats.current_streak === 1 ? "1 Days" : `${stats.current_streak} Days`}</Text>
        </View>
      </View>

      {!engine.isSessionActive ? (
        <View className="flex-1 items-center justify-between pb-32 pt-6">
          <View className="items-center">

            <Text className="text-text text-3xl font-black tracking-tight text-center mt-1">
              Start your session
            </Text>

            {/* Today's Stats */}
            <View className="flex-row items-center mt-6">
              <View className="items-center px-6">
                <Text className="text-text font-bold text-xl">{todayTimeString}</Text>
                <Text className="text-textSecondary text-[10px] mt-1 uppercase tracking-wider">Today</Text>
              </View>

              <View className="w-[1px] h-6 bg-border" />

              <View className="items-center px-6">
                <Text className="text-text font-bold text-xl">{todayStats.today_sessions}</Text>
                <Text className="text-textSecondary text-[10px] mt-1 uppercase tracking-wider">Sessions</Text>
              </View>
            </View>
          </View>

          <CentralFocusOrb isActive={false} />

          <View className="w-full px-8 items-center">
            <Text className="text-textSecondary text-xs text-center font-medium">
              Block distractions. Earn coins. Build your streak.
            </Text>
          </View>
        </View>
      ) : (
        <ActiveSessionUI
          onStopPress={() => {
            if (engine.sessionStartTime) {
              const durationSeconds = engine.sessionEndTime && engine.sessionEndTime > 0
                ? Math.floor((Math.min(Date.now(), engine.sessionEndTime) - engine.sessionStartTime) / 1000)
                : Math.floor((Date.now() - engine.sessionStartTime) / 1000);

              savedCompletedSession(durationSeconds).then(({ earnedCoins }) => {
                setSessionResult({ type: "completed", coins: earnedCoins, durationSeconds });
              });
            }
            engine.stopSession();
          }}
          startTime={engine.sessionStartTime}
          endTime={engine.sessionEndTime}
        />
      )}

      <CustomBottomBar
        onFocusPress={handleFocusPress}
        onAppsPress={() => setShowAppList(true)}
        onSettingsPress={() => router.push("/settings")}
        selectedCount={engine.selectedApps.length}
        isSessionActive={engine.isSessionActive}
      />

      <AppApplicationModal
        visible={showAppList}
        onClose={() => setShowAppList(false)}
        installedApps={engine.installedApps}
        selectedApps={engine.selectedApps}
        onToggleApp={engine.toggleApp}
      />

      <TimerSelectionModal
        visible={isTimerModalVisible}
        onClose={() => setIsTimeModalVisible(false)}
        onStartSession={(durationMinutes) => {
          engine.startSession(durationMinutes);
          setIsTimeModalVisible(false);
        }}
      />

      <PermissionModal
        visible={showPermission}
        onClose={() => setShowPermission(false)}
        hasUsage={engine.hasUsage}
        hasOverlay={engine.hasOverlay}
        hasBattery={engine.hasBattery}
      />

      <SessionResultModal
        visible={sessionResult !== null}
        onClose={() => setSessionResult(null)}
        result={sessionResult}
      />
    </SafeAreaView>
  );
}