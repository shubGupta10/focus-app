import { getDayDetails, DayDetailsResult } from "@/features/stats/db/statsRepository";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

export function useDayDetails(dateStr: string) {
    const db = useSQLiteContext();
    const [dayDetails, setDayDetails] = useState<DayDetailsResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setIsLoading(true);
            try {
                const result = await getDayDetails(db, dateStr);
                if (!cancelled) {
                    setDayDetails(result);
                }
            } catch (error) {
                console.error("useDayDetails: failed to load", error);
                if (!cancelled) {
                    setDayDetails({ sessions: [], blockedApps: [] });
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [db, dateStr]);

    return { dayDetails, isLoading };
}
