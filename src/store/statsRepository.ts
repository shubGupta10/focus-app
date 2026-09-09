import { SQLiteDatabase } from "expo-sqlite";

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

export async function recordSession(db: SQLiteDatabase, durationSeconds: number, isStrict: boolean = false): Promise<{ earnedCoins: number, newStreak: number }> {
    const baseCoins = Math.floor(durationSeconds / 60);
    const earnedCoins = isStrict ? Math.floor(baseCoins * 1.5) : baseCoins;

    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];

    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterday = new Date(yesterdayDate.getTime() - yesterdayDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];

    const currentStats = await getUserStats(db);
    let newStreak = currentStats.current_streak;

    if (currentStats.last_active_date === today) {
        newStreak = currentStats.current_streak;
    } else if (currentStats.last_active_date === yesterday) {
        newStreak += 1;
    } else {
        newStreak = 1;
    }

    const newLongestStreak = Math.max(currentStats.longest_streak, newStreak);

    await db.runAsync(
        `INSERT INTO sessions (start_time, end_time, duration_seconds, is_completed, coins_earned, is_strict, session_date)
        VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [
            Date.now() - durationSeconds * 1000,
            Date.now(),
            durationSeconds,
            1,
            earnedCoins,
            isStrict ? 1 : 0,
            today,
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
        [newTotalCoins, newStreak, newLongestStreak, today, newTotalFocus]
    );

    return {
        earnedCoins,
        newStreak
    }
}

export async function getTodayStats(db: SQLiteDatabase): Promise<TodayStats> {
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];

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