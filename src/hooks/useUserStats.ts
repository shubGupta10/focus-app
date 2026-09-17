import { getRecentSessions, getTodaySessionList, getTodayStats, getTotalSessionsCount, getUserStats, recordSession, SessionHistoryItem, TodayStats, UserStats } from "@/store/statsRepository";
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
    const [recentSessions, setRecentSessions] = useState<SessionHistoryItem[]>([]);
    const [totalSessionsCount, setTotalSessionsCount] = useState<number>(0);
    const [todaySessionList, setTodaySessionList] = useState<SessionHistoryItem[]>([]);

    const refreshStats = useCallback(async () => {
        try {
            const currentStats = await getUserStats(db);
            setStats(currentStats);
            const currentToday = await getTodayStats(db);
            setTodayStats(currentToday);
            const recent = await getRecentSessions(db, 4);
            setRecentSessions(recent);
            const totalCount = await getTotalSessionsCount(db);
            setTotalSessionsCount(totalCount);
            const todayList = await getTodaySessionList(db);
            setTodaySessionList(todayList);
        } catch (error) {
            console.error("Error refreshing stats:", error);
        }
    }, [db]);

    useEffect(() => {
        refreshStats();
    }, [refreshStats]);

    const savedCompletedSession = async (durationSeconds: number, isStrict: boolean = false) => {
        try {
            const { earnedCoins, newStreak } = await recordSession(db, durationSeconds, isStrict);
            await refreshStats();
            return { earnedCoins, newStreak };
        } catch (error) {
            console.error("Error recording session:", error);
            throw error;
        }
    };

    return {
        stats,
        refreshStats,
        savedCompletedSession,
        todayStats,
        recentSessions,
        totalSessionsCount,
        todaySessionList,
    };
}
