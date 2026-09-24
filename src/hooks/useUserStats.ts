import { recordSession } from "@/features/stats/db/statsRepository";
import { useAppStore } from "@/store/useAppStore";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback } from "react";

export function useUserStats() {
    const db = useSQLiteContext();

    const stats = useAppStore(state => state.stats);
    const todayStats = useAppStore(state => state.todayStats);
    const recentSessions = useAppStore(state => state.recentSessions);
    const totalSessionsCount = useAppStore(state => state.totalSessionsCount);
    const todaySessionList = useAppStore(state => state.todaySessionList);
    const refreshStats = useAppStore(state => state.refreshStats);
    const updateStatsLocally = useAppStore(state => state.updateStatsLocally);

    useFocusEffect(
        useCallback(() => {
            refreshStats(db);
        }, [refreshStats, db])
    );

    const savedCompletedSession = async (durationSeconds: number, isStrict: boolean = false) => {
        try {
            const { earnedCoins, newStreak } = await recordSession(db, durationSeconds, isStrict);
            updateStatsLocally(earnedCoins, durationSeconds, newStreak);
            refreshStats(db);
            return { earnedCoins, newStreak };
        } catch (error) {
            console.error("Error recording session:", error);
            throw error;
        }
    };

    return {
        stats,
        refreshStats: () => refreshStats(db),
        savedCompletedSession,
        todayStats,
        recentSessions,
        totalSessionsCount,
        todaySessionList,
    };
}
