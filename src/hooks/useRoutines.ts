import { createRoutine, deleteRoutine, getRoutines, toggleRoutine, updateRoutine } from "@/store/routineRepository";
import { Routine, RoutineInput } from "@/types/routine";
import { calculateNextTrigger, getRoutineDurationMinutes } from "@/utils/routineScheduler";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import FocusBlocker from "../../modules/focus-blocker/src/FocusBlockerModule";
import { notifyEngineListeners } from "./useFocusEngine";

export function useRoutine() {
    const db = useSQLiteContext();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const syncAlarmForRoutine = async (routine: Routine) => {
        if (routine.is_enabled) {
            const trigger = calculateNextTrigger(routine);
            if (trigger) {
                const durationMinutes = getRoutineDurationMinutes(routine.start_time, routine.end_time);
                let apps: string[] = [];
                try {
                    const rows = await db.getAllAsync<{ package_name: string }>("SELECT package_name FROM selected_apps");
                    apps = rows.map(r => r.package_name);
                } catch (e) {
                }
                FocusBlocker.scheduleRoutineAlarm(
                    routine.id,
                    trigger,
                    durationMinutes * 60 * 1000,
                    Boolean(routine.is_strict),
                    apps,
                    routine.days_of_week,
                    routine.start_time,
                    routine.end_time
                );
            }
        } else {
            FocusBlocker.cancelRoutineAlarm(routine.id);
        }
    };

    const loadRoutines = useCallback(async () => {
        setIsLoading(true);
        const data = await getRoutines(db);
        setRoutines(data);
        for (const r of data) {
            await syncAlarmForRoutine(r);
        }
        setIsLoading(false);
    }, [db]);

    useEffect(() => {
        loadRoutines();
    }, [loadRoutines])

    const addRoutine = async (input: RoutineInput) => {
        const id = await createRoutine(db, input);
        const newRoutine: Routine = {
            id,
            name: input.name,
            start_time: input.start_time,
            end_time: input.end_time,
            days_of_week: input.days_of_week,
            is_enabled: 1,
            is_strict: input.is_strict ? 1 : 0,
            created_at: new Date().toISOString()
        }
        await syncAlarmForRoutine(newRoutine);
        await loadRoutines();
        notifyEngineListeners();
        return id;
    }

    const editRoutine = async (id: number, input: RoutineInput) => {
        await updateRoutine(db, id, input);
        const updatedRoutine: Routine = {
            id,
            name: input.name,
            start_time: input.start_time,
            end_time: input.end_time,
            days_of_week: input.days_of_week,
            is_enabled: 1,
            is_strict: input.is_strict ? 1 : 0,
            created_at: ""
        };
        FocusBlocker.cancelRoutineAlarm(id);
        await syncAlarmForRoutine(updatedRoutine);
        await loadRoutines();
        notifyEngineListeners();
    };

    const toggleRoutineState = async (id: number, isEnabled: boolean) => {
        await toggleRoutine(db, id, isEnabled);
        const existing = routines.find((r) => r.id === id);
        if (existing) {
            await syncAlarmForRoutine({ ...existing, is_enabled: isEnabled ? 1 : 0 });
        }
        setRoutines((prev) =>
            prev.map((r) => (r.id === id ? { ...r, is_enabled: isEnabled ? 1 : 0 } : r))
        );
        notifyEngineListeners();
    };

    const removeRoutine = async (id: number) => {
        FocusBlocker.cancelRoutineAlarm(id);
        await deleteRoutine(db, id);
        setRoutines((prev) => prev.filter((r) => r.id !== id));
        notifyEngineListeners();
    };

    const nextUpcoming = useMemo(() => {
        let earliestRoutine: Routine | null = null;
        let earliestTimestamp: number | null = null;
        for (const routine of routines) {
            if (!routine.is_enabled) continue;
            const trigger = calculateNextTrigger(routine);
            if (trigger) {
                if (!earliestTimestamp || trigger < earliestTimestamp) {
                    earliestTimestamp = trigger;
                    earliestRoutine = routine;
                }
            }
        }
        return {
            routine: earliestRoutine,
            timestamp: earliestTimestamp
        };
    }, [routines]);


    return {
        routines,
        isLoading,
        loadRoutines,
        addRoutine,
        editRoutine,
        toggleRoutineState,
        removeRoutine,
        nextUpcomingRoutine: nextUpcoming.routine,
        nextUpcomingTrigger: nextUpcoming.timestamp
    }

}