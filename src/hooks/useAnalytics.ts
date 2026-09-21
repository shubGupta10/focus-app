import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { BlockedAttemptItem, getRecentBlockedAttempts } from "../store/statsRepository";

export interface DailyAnalytics {
    dayOfWeek: string;
    focusSeconds: number;
    blockedCount: number;
    dateStr: string;
}

export function useAnalytics() {
    const db = useSQLiteContext();
    const [weeklyData, setWeeklyData] = useState<DailyAnalytics[]>([]);
    const [totalBlockedThisWeek, setTotalBlockedThisWeek] = useState(0);
    const [totalBlockedAllTime, setTotalBlockedAllTime] = useState(0);
    const [recentBlockedAttempts, setRecentBlockedAttempts] = useState<BlockedAttemptItem[]>([]);

    const refreshAnalytics = useCallback(async () => {
        try {
            const days: DailyAnalytics[] = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let totalBlocked = 0;

            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);

                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });

                const sessionRows = await db.getAllAsync<{ duration_seconds: number }>(`SELECT duration_seconds FROM sessions WHERE session_date = ?`, [dateStr]);

                const focusSeconds = sessionRows.reduce((acc, row) => acc + row.duration_seconds, 0);

                const startOfDayMillis = d.getTime();
                const endOfDayMillis = startOfDayMillis + 86400000 - 1;

                const blockedResult = await db.getFirstAsync<{ count: number }>(
                    `SELECT COUNT(id) as count FROM blocked_attempts WHERE timestamp >= ? AND timestamp <= ?`,
                    [startOfDayMillis, endOfDayMillis]
                );

                const blockedCount = blockedResult?.count || 0;
                totalBlocked += blockedCount;

                days.push({
                    dayOfWeek,
                    dateStr,
                    focusSeconds,
                    blockedCount
                });
            }

            const allTimeBlockedResult = await db.getFirstAsync<{ count: number }>(
                `SELECT COUNT(id) as count FROM blocked_attempts`
            );

            const recentAttempts = await getRecentBlockedAttempts(db, 5);

            setWeeklyData(days);
            setTotalBlockedThisWeek(totalBlocked);
            setTotalBlockedAllTime(allTimeBlockedResult?.count || 0);
            setRecentBlockedAttempts(recentAttempts);
        } catch (error) {
            console.error("Failed to load analytics", error);
        }
    }, [db]);

    useFocusEffect(
        useCallback(() => {
            refreshAnalytics();
        }, [refreshAnalytics])
    );

    return {
        weeklyData,
        totalBlockedThisWeek,
        totalBlockedAllTime,
        recentBlockedAttempts,
        refreshAnalytics
    };
}