import { useToast } from "@/contexts/ToastContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useRoutine } from "@/hooks/useRoutines";
import { Routine, RoutineInput } from "@/types/routine";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { StarterTemplate } from "../components/RoutineEmptyState";

export function useRoutinesController() {
    const engine = useFocusEngine();
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
    }, [engine.isSessionActive, selectedRoutine, editRoutine, addRoutine, showToast]);

    const handleDeleteRoutine = useCallback((id: number, name: string) => {
        if (engine.isSessionActive) return;
        Alert.alert(
            "Delete Routine",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: () => {
                        showToast(`${name} routine deleted`)
                        removeRoutine(id)
                    }
                }
            ]
        );
    }, [engine.isSessionActive, removeRoutine, showToast]);

    const handleToggleRoutineState = useCallback((id: number, val: boolean) => {
        if (engine.isSessionActive) return;
        toggleRoutineState(id, val);
    }, [engine.isSessionActive, toggleRoutineState]);

    return {
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
    };
}
