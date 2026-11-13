import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
    BlockedAttemptItem,
    DailyAnalytics,
    DayBlockedApp,
    getRecentBlockedAttempts,
    getTodayBlockedAppsGrouped,
    getTodayBlockedAttempts,
    getTodayBlockedCount,
    getWeeklyAnalytics,
    WeeklyAnalyticsResult
} from "../features/stats/db/statsRepository";

export { DailyAnalytics };

export function useAnalytics(weekOffset: number = 0) {
    const db = useSQLiteContext();
    const [analytics, setAnalytics] = useState<WeeklyAnalyticsResult>({
        weeklyData: [],
        totalWeeklyFocusSeconds: 0,
        totalBlockedThisWeek: 0,
        mostBlockedThisWeek: [],
    });
    const [totalBlockedAllTime, setTotalBlockedAllTime] = useState(0);
    const [recentBlockedAttempts, setRecentBlockedAttempts] = useState<BlockedAttemptItem[]>([]);
    const [todayBlockedAttempts, setTodayBlockedAttempts] = useState<BlockedAttemptItem[]>([]);
    const [todayBlockedApps, setTodayBlockedApps] = useState<DayBlockedApp[]>([]);
    const [todayBlockedCount, setTodayBlockedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const refreshAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const [weeklyResult, recentAttempts, allTimeBlocked, todayAttempts, todayCount, todayApps] = await Promise.all([
                getWeeklyAnalytics(db, weekOffset),
                getRecentBlockedAttempts(db, 5),
                db.getFirstAsync<{ count: number }>(`SELECT COUNT(id) as count FROM blocked_attempts`),
                getTodayBlockedAttempts(db, 10),
                getTodayBlockedCount(db),
                getTodayBlockedAppsGrouped(db, 5),
            ]);

            setAnalytics(weeklyResult);
            setRecentBlockedAttempts(recentAttempts);
            setTotalBlockedAllTime(allTimeBlocked?.count || 0);
            setTodayBlockedAttempts(todayAttempts);
            setTodayBlockedCount(todayCount);
            setTodayBlockedApps(todayApps);
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setIsLoading(false);
        }
    }, [db, weekOffset]);

    useFocusEffect(
        useCallback(() => {
            refreshAnalytics();
        }, [refreshAnalytics])
    );

    return {
        weeklyData: analytics.weeklyData,
        totalWeeklyFocusSeconds: analytics.totalWeeklyFocusSeconds,
        totalBlockedThisWeek: analytics.totalBlockedThisWeek,
        mostBlockedThisWeek: analytics.mostBlockedThisWeek,
        totalBlockedAllTime,
        recentBlockedAttempts,
        todayBlockedAttempts,
        todayBlockedApps,
        todayBlockedCount,
        refreshAnalytics,
        isLoading,
    };
}