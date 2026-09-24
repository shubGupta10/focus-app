import {
    SessionHistoryItem,
    TodayStats,
    UserStats,
    getRecentSessions,
    getTodaySessionList,
    getTodayStats,
    getTotalSessionsCount,
    getUserStats
} from '@/features/stats/db/statsRepository';
import { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';
import { AppInfo } from '../../modules/focus-blocker/src/FocusBlockerModule';

interface AppState {
    isSessionActive: boolean;
    sessionStartTime: number | null;
    sessionEndTime: number | null;
    isStrictSession: boolean;

    setSessionState: (isActive: boolean, startTime: number | null, endTime: number | null, isStrict: boolean) => void;
    clearSession: () => void;

    stats: UserStats;
    todayStats: TodayStats;
    recentSessions: SessionHistoryItem[];
    totalSessionsCount: number;
    todaySessionList: SessionHistoryItem[];

    refreshStats: (db: SQLiteDatabase) => Promise<void>;
    updateStatsLocally: (earnedCoins: number, durationSeconds: number, newStreak: number) => void;

    installedApps: AppInfo[];
    selectedApps: string[];
    hasUsage: boolean;
    hasOverlay: boolean;
    hasBattery: boolean;

    setEngineState: (state: Partial<AppState>) => void;

}

const defaultStats: UserStats = {
    total_coins: 0,
    current_streak: 0,
    longest_streak: 0,
    last_active_date: null,
    total_focus_seconds: 0,
};

const defaultTodayStats: TodayStats = {
    today_focus_seconds: 0,
    today_sessions: 0,
    today_coins: 0,
};

export const useAppStore = create<AppState>((set) => ({
    isSessionActive: false,
    sessionStartTime: null,
    sessionEndTime: null,
    isStrictSession: false,
    setSessionState: (isActive, startTime, endTime, isStrict) => set({
        isSessionActive: isActive,
        sessionStartTime: startTime,
        sessionEndTime: endTime,
        isStrictSession: isStrict
    }),
    clearSession: () => set({
        isSessionActive: false,
        sessionStartTime: null,
        sessionEndTime: null,
        isStrictSession: false
    }),
    stats: defaultStats,
    todayStats: defaultTodayStats,
    recentSessions: [],
    totalSessionsCount: 0,
    todaySessionList: [],

    refreshStats: async (db: SQLiteDatabase) => {
        try {
            const [
                stats,
                todayStats,
                recentSessions,
                totalSessionsCount,
                todaySessionList
            ] = await Promise.all([
                getUserStats(db),
                getTodayStats(db),
                getRecentSessions(db, 4),
                getTotalSessionsCount(db),
                getTodaySessionList(db)
            ])

            set({
                stats,
                todayStats,
                recentSessions,
                totalSessionsCount,
                todaySessionList
            });
        } catch (error) {
            console.error("Error refreshing stats from DB:", error);
        }
    },

    updateStatsLocally: (earnedCoins, durationSeconds, newStreak) => {
        set((state) => ({
            stats: {
                ...state.stats,
                total_coins: state.stats.total_coins + earnedCoins,
                current_streak: newStreak,
                longest_streak: Math.max(state.stats.longest_streak, newStreak),
                total_focus_seconds: state.stats.total_focus_seconds + durationSeconds,
            },
            todayStats: {
                ...state.todayStats,
                today_focus_seconds: state.todayStats.today_focus_seconds + durationSeconds,
                today_sessions: state.todayStats.today_sessions + 1,
                today_coins: state.todayStats.today_coins + earnedCoins,
            }
        }));
    },
    installedApps: [],
    selectedApps: [],
    hasUsage: false,
    hasOverlay: false,
    hasBattery: false,

    setEngineState: (newState) => set((state) => ({ ...state, ...newState })),
}));
