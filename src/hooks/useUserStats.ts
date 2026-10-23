import { recordSession } from "@/features/stats/db/statsRepository";
import { useAppStore } from "@/store/useAppStore";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback } from "react";
import { addNotification } from "./useNotifications";
import { analytics } from "@/utils/analytics";


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

    const savedCompletedSession = async (durationSeconds: number, isStrict: boolean = false, endTimeMs?: number) => {
        try {
            const previousStreak = stats.current_streak;
            const { earnedCoins, newStreak } = await recordSession(db, durationSeconds, isStrict, endTimeMs);

            updateStatsLocally(earnedCoins, durationSeconds, newStreak);
            refreshStats(db);
            analytics.track("session_completed", {
                duration_minutes: Math.round(durationSeconds / 60)
            });

            if (newStreak > previousStreak) {
                const todayStr = new Date().toISOString().split("T")[0];

                await addNotification(db, {
                    id: `milestone_streak_${newStreak}_${todayStr}`,
                    type: "milestone",
                    title: `${newStreak}-day streak`,
                    description: `You've kept your focus habit going for ${newStreak} days in a row.`,
                    timestamp: Date.now(),
                    action_label: null,
                    action_url: null,
                });
            }

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
