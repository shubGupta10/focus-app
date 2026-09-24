import { Routine, RoutineInput } from "@/types/routine";
import { SQLiteDatabase } from "expo-sqlite";

export async function getRoutines(db: SQLiteDatabase): Promise<Routine[]> {
    try {
        const rows = await db.getAllAsync<Routine>(
            "SELECT * FROM routines ORDER BY start_time ASC"
        );
        return rows;
    } catch (error) {
        console.error("Error fetching routines:", error);
        return [];
    }
}

export async function getRoutineById(db: SQLiteDatabase, id: number): Promise<Routine | null> {
    try {
        const routine = await db.getFirstAsync<Routine>(
            "SELECT * FROM routines WHERE id = ?",
            [id]
        );
        return routine || null;
    } catch (error) {
        console.error("Error fetching routine by id:", error);
        return null;
    }
}

export async function createRoutine(db: SQLiteDatabase, input: RoutineInput): Promise<number> {
    const result = await db.runAsync(
        `INSERT INTO routines (name, start_time, end_time, days_of_week, is_enabled, is_strict) VALUES (?, ?, ?, ?, 1, ?)`,
        [
            input.name.trim(),
            input.start_time,
            input.end_time,
            input.days_of_week,
            input.is_strict ? 1 : 0
        ]
    );
    return result.lastInsertRowId;
}

export async function updateRoutine(
    db: SQLiteDatabase,
    id: number,
    input: RoutineInput
): Promise<void> {
    await db.runAsync(
        `UPDATE routines SET name = ?, start_time = ?, end_time = ?, days_of_week = ?, is_strict = ? WHERE id = ?`,
        [
            input.name.trim(),
            input.start_time,
            input.end_time,
            input.days_of_week,
            input.is_strict ? 1 : 0,
            id
        ]
    );
}

export async function toggleRoutine(
    db: SQLiteDatabase,
    id: number,
    isEnabled: boolean
): Promise<void> {
    await db.runAsync(
        "UPDATE routines SET is_enabled = ? WHERE id = ?",
        [isEnabled ? 1 : 0, id]
    );
}

export async function deleteRoutine(db: SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync("DELETE FROM routines WHERE id = ?", [id]);
}