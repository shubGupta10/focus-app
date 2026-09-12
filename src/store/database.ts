import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 5;

    await db.execAsync(
        `PRAGMA journal_mode = "wal";
        
        CREATE TABLE IF NOT EXISTS selected_apps (
            package_name TEXT PRIMARY KEY NOT NULL 
        );
        
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time INTEGER NOT NULL,
            end_time INTEGER NOT NULL,
            duration_seconds INTEGER NOT NULL,
            is_completed INTEGER NOT NULL,
            coins_earned INTEGER NOT NULL,
            is_strict INTEGER NOT NULL DEFAULT 0,
            session_date TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

            CREATE TABLE IF NOT EXISTS active_session (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            start_time INTEGER NOT NULL,
            end_time INTEGER NOT NULL,
            is_strict INTEGER NOT NULL DEFAULT 0
        );

            
        CREATE TABLE IF NOT EXISTS user_stats (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            total_coins INTEGER NOT NULL DEFAULT 0,
            current_streak INTEGER NOT NULL DEFAULT 0,
            longest_streak INTEGER NOT NULL DEFAULT 0,
            last_active_date TEXT,
            total_focus_seconds INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS routines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          days_of_week TEXT NOT NULL,
          is_enabled INTEGER NOT NULL DEFAULT 1,
          is_strict INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- Insert the default stats row if it doesn't exist
        INSERT OR IGNORE INTO user_stats (id, total_coins, current_streak, longest_streak)
        VALUES (1, 0, 0, 0);`
    );

    const versionResult = await db.getFirstAsync<{
        user_version: number
    }>("PRAGMA user_version");
    const currentVersion = versionResult?.user_version ?? 0;

    if (currentVersion < 4) {
        try {
            await db.execAsync("ALTER TABLE active_session ADD COLUMN is_strict INTEGER NOT NULL DEFAULT 0;");
        } catch (error) {

        }
        try {
            await db.execAsync("ALTER TABLE sessions ADD COLUMN is_strict INTEGER NOT NULL DEFAULT 0;");
        } catch (error) {

        }
        await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    }
}