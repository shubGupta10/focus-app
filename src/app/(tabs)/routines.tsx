import { RoutineCard } from "../../features/routines/components/RoutineCard";
import { RoutineEmptyState } from "../../features/routines/components/RoutineEmptyState";
import { RoutineEditorModal } from "../../features/routines/components/modals/RoutineEditorModal";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoutinesController } from "../../features/routines/hooks/useRoutinesController";

export default function RoutinesTab() {
    const { colors, activeStyle } = useTheme();
    const {
        engine,
        routines,
        isLoading,
        isModalVisible,
        setIsModalVisible,
        selectedRoutine,
        handleOpenCreate,
        handleOpenEdit,
        handleSaveRoutine,
        handleDeleteRoutine,
        handleToggleRoutineState
    } = useRoutinesController();

    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <View className="flex-row items-center justify-between px-6 pt-5 pb-4">
                <View className="flex-1">
                    <Text className="text-text font-black text-3xl tracking-tight">Routines</Text>
                    <Text className="text-textSecondary text-sm font-medium mt-0.5">
                        {routines.length === 0
                            ? "Automated schedules"
                            : `${routines.filter((r) => r.is_enabled).length} of ${routines.length} active`}
                    </Text>
                </View>

                <Pressable
                    onPress={() => handleOpenCreate()}
                    className={`w-10 h-10 rounded-full bg-accent items-center justify-center active:opacity-80 ${engine.isSessionActive ? 'opacity-50' : ''} `}
                    accessibilityRole="button"
                    accessibilityLabel="Create new routine"
                >
                    <Ionicons name="add" size={24} color={colors.accentForeground} />
                </Pressable>
            </View>

            {engine.isSessionActive && (
                <View className="px-6 mb-4 mt-2">
                    <View className="bg-warningMuted border border-warning rounded-2xl p-4 flex-row items-center">
                        <Ionicons name="lock-closed" size={20} color={colors.warning} style={{ marginRight: 12 }} />
                        <Text className="text-warning font-bold text-sm flex-1">
                            {engine.isStrictSession ? "Routines are locked during a strict session" : "End your current session to modify routines"}
                        </Text>
                    </View>
                </View>
            )}

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={colors.accent} size="small" />
                </View>
            ) : routines.length === 0 ? (
                <RoutineEmptyState
                    onCreateCustom={() => handleOpenCreate()}
                    onSelectTemplate={(template) => handleOpenCreate(template)}
                />
            ) : (
                <FlatList
                    data={routines}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 6, paddingBottom: 130 }}
                    renderItem={({ item }) => (
                        <RoutineCard
                            routine={item}
                            onToggle={(val) => handleToggleRoutineState(item.id, val)}
                            onPress={() => handleOpenEdit(item)}
                            onDelete={() => handleDeleteRoutine(item.id, item.name)}
                        />
                    )}
                />
            )}

            <RoutineEditorModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveRoutine}
                routineToEdit={selectedRoutine}
            />
        </SafeAreaView>
    );
}
