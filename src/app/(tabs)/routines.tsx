import { RoutineCard } from "@/components/RoutineCard";
import { RoutineEmptyState, StarterTemplate } from "@/components/RoutineEmptyState";
import { RoutineEditorModal } from "@/components/modals/RoutineEditorModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useRoutine } from "@/hooks/useRoutines";
import { Routine, RoutineInput } from "@/types/routine";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoutinesTab() {
    const { colors, activeStyle } = useTheme();
    const engine = useFocusEngine()
    const {
        routines,
        isLoading,
        loadRoutines,
        addRoutine,
        editRoutine,
        toggleRoutineState,
        removeRoutine
    } = useRoutine();
    const { showToast } = useToast();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadRoutines();
        }, [loadRoutines])
    );

    const handleOpenCreate = (template?: StarterTemplate) => {
        if (engine.isSessionActive) return;
        if (template) {
            setSelectedRoutine({
                id: 0,
                name: template.name,
                start_time: template.start_time,
                end_time: template.end_time,
                days_of_week: template.days_of_week,
                is_enabled: 1,
                is_strict: template.is_strict ? 1 : 0,
                created_at: ""
            });
        } else {
            setSelectedRoutine(null);
        }
        setIsModalVisible(true);
    };

    const handleOpenEdit = useCallback((routine: Routine) => {
        if (engine.isSessionActive) return;
        setSelectedRoutine(routine);
        setIsModalVisible(true);
    }, [engine.isSessionActive]);

    const handleSaveRoutine = useCallback(async (input: RoutineInput) => {
        if (engine.isSessionActive) return;
        if (selectedRoutine && selectedRoutine.id > 0) {
            await editRoutine(selectedRoutine.id, input);
            showToast(`"${input.name}" updated`);
        } else {
            await addRoutine(input);
            showToast(`"${input.name}" routine created`);
        }
    }, [engine.isSessionActive, selectedRoutine, editRoutine, addRoutine]);

    const handleDeleteRoutine = useCallback((id: number, name: string) => {
        if (engine.isSessionActive) return;
        Alert.alert(
            "Delete Routine",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => removeRoutine(id) }
            ]
        );
        showToast(`${name} routine deleted`)
    }, [engine.isSessionActive, removeRoutine]);

    const renderRoutineItem = useCallback(({ item }: { item: Routine }) => (
        <RoutineCard
            routine={item}
            onToggle={(val) => {
                if (engine.isSessionActive) return;
                toggleRoutineState(item.id, val);
            }}
            onPress={() => handleOpenEdit(item)}
            onDelete={() => handleDeleteRoutine(item.id, item.name)}
        />
    ), [engine.isSessionActive, toggleRoutineState, handleOpenEdit, handleDeleteRoutine]);


    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
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
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 6, paddingBottom: 40 }}
                    renderItem={renderRoutineItem}
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
