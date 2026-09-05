import { useSQLiteContext } from "expo-sqlite";
import { useCallback } from "react";

export function useSettings() {
    const db = useSQLiteContext();

    const getSetting = useCallback(async (key: string): Promise<string | null> => {
        try {
            const result = await db.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = ?", [key]);
            return result ? result.value : null;
        } catch (error) {
            console.error(`Error getting setting for key ${key}:`, error);
            return null;
        }
    }, [db]);

    const setSetting = useCallback(async (key: string, value: string) => {
        try {
            await db.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
        } catch (error) {
            console.error(`Error setting value for key ${key}:`, error);
        }
    }, [db]);

    return {
        getSetting,
        setSetting
    };
}
