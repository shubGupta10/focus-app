import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 2;

    await db.execAsync(
        `PRAGMA journal_mode = "wal";
        
        CREATE TABLE IF NOT EXISTS selected_apps (
            package_name TEXT PRIMARY KEY NOT NULL 
        );
        
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time INTEGER NOT NULL,
            end_time INTEGER NOT NULL,
            duration_seconds INTEGER NOT NULL,
            is_completed INTEGER NOT NULL,
            coins_earned INTEGER NOT NULL,
            session_date TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

            CREATE TABLE IF NOT EXISTS active_session (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            start_time INTEGER NOT NULL,
            end_time INTEGER NOT NULL
        );

            
        CREATE TABLE IF NOT EXISTS user_stats (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            total_coins INTEGER NOT NULL DEFAULT 0,
            current_streak INTEGER NOT NULL DEFAULT 0,
            longest_streak INTEGER NOT NULL DEFAULT 0,
            last_active_date TEXT,
            total_focus_seconds INTEGER NOT NULL DEFAULT 0
        );

        -- Insert the default stats row if it doesn't exist
        INSERT OR IGNORE INTO user_stats (id, total_coins, current_streak, longest_streak)
        VALUES (1, 0, 0, 0);`
    );

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}