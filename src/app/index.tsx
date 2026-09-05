import { ActiveSessionUI } from "@/components/ActiveSessionUI";
import { CentralFocusOrb } from "@/components/CentralFocusOrb";
import { CustomBottomBar } from "@/components/CustomBottomBar";
import { AppApplicationModal } from "@/components/modals/AppSelectionModal";
import { PermissionModal } from "@/components/modals/PermissionModal";
import { SessionResultModal } from "@/components/modals/SessionResultModal";
import TimerSelectionModal from "@/components/modals/TimerSelectionModal";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useUserStats } from "@/hooks/useUserStats";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const engine = useFocusEngine();
  const { stats, savedCompletedSession } = useUserStats();

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
    <SafeAreaView className="flex-1 bg-background">
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
          <View className="items-center h-20 justify-center">
            <Text className="text-textSecondary text-xs font-bold tracking-[3px] uppercase text-center">
              READY TO FOCUS
            </Text>
            <Text className="text-text text-3xl font-black tracking-tight text-center mt-1">
              Start your session
            </Text>
          </View>

          <CentralFocusOrb isActive={false} />

          <View className="w-full px-8 items-center h-28 justify-center">
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
        onPermissionsPress={() => setShowPermission(true)}
        selectedCount={engine.selectedApps.length}
        hasAllPermissions={engine.hasUsage && engine.hasOverlay && engine.hasBattery}
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