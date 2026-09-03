import { ActiveSessionUI } from "@/components/ActiveSessionUI";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { AppApplicationModal } from "@/components/modals/AppSelectionModal";
import { PermissionModal } from "@/components/modals/PermissionModal";
import TimerSelectionModal from "@/components/modals/TimerSelectionModal";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const engine = useFocusEngine();

  const [showAppList, setShowAppList] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTimerModalVisible, setIsTimeModalVisible] = useState(false);

  const handleFocusPress = () => {
    if (engine.selectedApps.length === 0) {
      alert("You must select apps to block first!");
      setShowAppList(true);
      return;
    }

    engine.checkPermissions();
    if (!engine.hasUsage || !engine.hasOverlay || !engine.hasBattery) {
      setShowPermission(true);
    } else {
      setIsTimeModalVisible(true)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-3xl font-black opacity-10 tracking-[10px] uppercase text-center px-4">
          Future Background Theme
        </Text>
      </View>

      {
        !engine.isSessionActive && (
          <FloatingActionButtons
            onFocusPress={handleFocusPress}
            onAppsPress={() => setShowAppList(true)}
            selectedCount={engine.selectedApps.length}
          />
        )
      }

      {engine.isSessionActive && (
        <ActiveSessionUI
          onStopPress={engine.stopSession}
          startTime={engine.sessionStartTime}
          endTime={engine.sessionEndTime}
        />
      )}

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
          engine.startSession(durationMinutes)
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
    </SafeAreaView >
  )
}