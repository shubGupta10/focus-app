import { SQLiteDatabase } from "expo-sqlite";
import { getTodayDateString } from "../../../utils/timeUtils";

export type UserStats = {
    total_coins: number;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
    total_focus_seconds: number;
}

export type TodayStats = {
    today_focus_seconds: number;
    today_sessions: number;
    today_coins: number;
}

export interface SessionHistoryItem {
    id: number;
    start_time: number;
    duration_seconds: number;
    coins_earned: number;
    is_strict: number;
    session_date: string;
}

export interface BlockedAttemptItem {
    id: number;
    package_name: string;
    timestamp: number;
}

export interface DayBlockedApp {
    package_name: string;
    count: number;
}
export interface DayDetailsResult {
    sessions: SessionHistoryItem[];
    blockedApps: DayBlockedApp[];
}

export async function getUserStats(db: SQLiteDatabase): Promise<UserStats> {
    const stats = await db.getFirstAsync<UserStats>("SELECT * FROM user_stats WHERE id = 1");

    if (!stats) {
        return {
            total_coins: 0,
            current_streak: 0,
            longest_streak: 0,
            last_active_date: null,
            total_focus_seconds: 0,
        };
    }
    return stats
}

export async function recordSession(db: SQLiteDatabase, durationSeconds: number, isStrict: boolean = false, endTimeMs?: number): Promise<{ earnedCoins: number, newStreak: number }> {
    let finalEarnedCoins = 0;
    let finalNewStreak = 0;

    await db.withTransactionAsync(async () => {

        const baseCoins = Math.floor(durationSeconds / 60);
        const earnedCoins = isStrict ? Math.floor(baseCoins * 1.5) : baseCoins;

        const finalEndTime = (endTimeMs && endTimeMs > 0) ? endTimeMs : Date.now();
        const finalStartTime = finalEndTime - (durationSeconds * 1000);

        const sessionDateObj = new Date(finalEndTime);
        const sessionDateString = new Date(sessionDateObj.getTime() - sessionDateObj.getTimezoneOffset() * 60000).toISOString().split("T")[0];

        const yesterdayDate = new Date(sessionDateObj.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayString = new Date(yesterdayDate.getTime() - yesterdayDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];

        const currentStats = await getUserStats(db);
        let newStreak = currentStats.current_streak;

        if (currentStats.last_active_date === sessionDateString) {
            newStreak = currentStats.current_streak;
        } else if (currentStats.last_active_date === yesterdayString) {
            newStreak += 1;
        } else {
            newStreak = 1;
        }

        const newLongestStreak = Math.max(currentStats.longest_streak, newStreak);

        await db.runAsync(
            `INSERT INTO sessions (start_time, end_time, duration_seconds, is_completed, coins_earned, is_strict, session_date)
        VALUES(?, ?, ?, ?, ?, ?, ?)`,
            [
                finalStartTime,
                finalEndTime,
                durationSeconds,
                1,
                earnedCoins,
                isStrict ? 1 : 0,
                sessionDateString,
            ]
        );

        const newTotalCoins = currentStats.total_coins + earnedCoins;
        const newTotalFocus = currentStats.total_focus_seconds + durationSeconds;

        await db.runAsync(
            `UPDATE user_stats SET 
            total_coins = ?, 
            current_streak = ?, 
            longest_streak = ?, 
            last_active_date = ?, 
            total_focus_seconds = ? 
        WHERE id = 1`,
            [newTotalCoins, newStreak, newLongestStreak, sessionDateString, newTotalFocus]
        );

        finalEarnedCoins = earnedCoins;
        finalNewStreak = newStreak;
    });

    return {
        earnedCoins: finalEarnedCoins,
        newStreak: finalNewStreak,
    }
}

export async function getTodayStats(db: SQLiteDatabase): Promise<TodayStats> {
    const today = getTodayDateString();

    const result = await db.getFirstAsync<{
        today_focus_seconds: number,
        today_sessions: number,
        today_coins: number
    }>(
        `SELECT 
            COALESCE(SUM(duration_seconds), 0) as today_focus_seconds,
            COUNT(id) as today_sessions,
            COALESCE(SUM(coins_earned), 0) as today_coins
         FROM sessions 
         WHERE session_date = ? AND is_completed = 1`,
        [today]
    );

    return result || { today_focus_seconds: 0, today_sessions: 0, today_coins: 0 };
}

export async function getRecentSessions(db: SQLiteDatabase, limit: number = 4): Promise<SessionHistoryItem[]> {
    const results = await db.getAllAsync<SessionHistoryItem>(
        `SELECT id, start_time, duration_seconds, coins_earned, is_strict, session_date 
         FROM sessions 
         WHERE is_completed = 1 
         ORDER BY start_time DESC 
         LIMIT ?`,
        [limit]
    );
    return results || [];
}

export async function getTotalSessionsCount(db: SQLiteDatabase): Promise<number> {
    const result = await db.getFirstAsync<{ total_sessions: number }>(
        `SELECT COUNT(id) as total_sessions FROM sessions WHERE is_completed = 1`
    );
    return result?.total_sessions ?? 0;
}

export async function getRecentBlockedAttempts(db: SQLiteDatabase, limit: number = 5): Promise<BlockedAttemptItem[]> {
    const results = await db.getAllAsync<BlockedAttemptItem>(
        `SELECT id, package_name, timestamp 
         FROM blocked_attempts 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [limit]
    );
    return results || [];
}

export async function getTodaySessionList(db: SQLiteDatabase): Promise<SessionHistoryItem[]> {
    const today = getTodayDateString();

    const result = await db.getAllAsync<SessionHistoryItem>(
        `SELECT id, start_time, duration_seconds, coins_earned,
        is_strict, session_date
        FROM sessions
        WHERE is_completed = 1 AND session_date = ?
        ORDER BY start_time DESC`,
        [today]
    );
    return result || [];
}

export async function getDayDetails(db: SQLiteDatabase, dateStr: string): Promise<DayDetailsResult> {
    const sessions = await db.getAllAsync<SessionHistoryItem>(
        `SELECT id, start_time, duration_seconds, coins_earned, is_strict, session_date
        FROM sessions
        WHERE session_date = ? AND is_completed = 1
        ORDER BY start_time ASC
        `,
        [dateStr]
    );

    const [year, month, day] = dateStr.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
    const endOfDay = startOfDay + 86400000 - 1;

    const blockedApps = await db.getAllAsync<DayBlockedApp>(
        `SELECT package_name, COUNT(id) as count 
        FROM blocked_attempts
        WHERE timestamp >= ? AND timestamp <= ?
        GROUP BY package_name
        ORDER BY count DESC
        LIMIT 4`,
        [startOfDay, endOfDay]
    );

    return {
        sessions: sessions || [],
        blockedApps: blockedApps || [],
    }
}
