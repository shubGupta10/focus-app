import { getUserStats, recordSession, UserStats, getTodayStats, TodayStats } from "@/store/statsRepository";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

export function useUserStats() {
    const db = useSQLiteContext();
    const [stats, setStats] = useState<UserStats>({
        total_coins: 0,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: null,
        total_focus_seconds: 0,
    });
    const [todayStats, setTodayStats] = useState<TodayStats>({
        today_focus_seconds: 0,
        today_sessions: 0,
        today_coins: 0,
    });

    const refreshStats = useCallback(async () => {
        try {
            const currentStats = await getUserStats(db);
            setStats(currentStats);
            const currentToday = await getTodayStats(db);
            setTodayStats(currentToday);
        } catch (error) {
            console.error("Error refreshing stats:", error);
        }
    }, [db]);

    useEffect(() => {
        refreshStats();
    }, [refreshStats])

    const savedCompletedSession = async (durationSeconds: number) => {
        try {
            const { earnedCoins, newStreak } = await recordSession(db, durationSeconds);
            await refreshStats();
            return { earnedCoins, newStreak };
        } catch (error) {
            console.error("Error recording session:", error);
            throw error;
        }
    }

    return {
        stats,
        refreshStats,
        savedCompletedSession,
        todayStats
    }
}