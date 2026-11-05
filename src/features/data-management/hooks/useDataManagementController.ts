import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Alert } from "react-native";
import { Directory, File } from "expo-file-system"

export function useDataManagementController() {
    const db = useSQLiteContext();
    const [isExporting, setIsExporting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleCreateBackup = async () => {
        if (isExporting) return;
        setIsExporting(true);

        try {
            const [
                routines,
                selectedApps,
                sessions,
                userStats,
                shopPurchases,
                settings,
            ] = await Promise.all([
                db.getAllAsync("SELECT * FROM routines"),
                db.getAllAsync("SELECT * FROM selected_apps"),
                db.getAllAsync("SELECT * FROM sessions"),
                db.getAllAsync("SELECT * FROM user_stats WHERE id = 1"),
                db.getAllAsync("SELECT * FROM shop_purchases"),
                db.getAllAsync("SELECT * FROM settings"),
            ]);

            const backupData = {
                app: "lockout",
                schemaVersion: 1,
                exportedAt: new Date().toISOString(),
                data: {
                    routines,
                    selectedApps,
                    sessions,
                    userStats: userStats[0] || null,
                    shopPurchases,
                    settings,
                },
            };

            const jsonString = JSON.stringify(backupData, null, 2);

            const dateStr = new Date().toISOString().split("T")[0];
            const fileName = `lockout_backup_${dateStr}.json`;

            let targetDirectory: Directory;
            try {
                targetDirectory = await Directory.pickDirectoryAsync();
            } catch (error) {
                return;
            }

            const backupFile = targetDirectory.createFile(fileName, "application/json");
            await backupFile.write(jsonString);

            Alert.alert(
                "Backup Saved",
                `Your backup file "${fileName}" was successfully saved to ${targetDirectory.name || "your selected folder"}`
            )
        } catch (error: any) {
            console.error("Backup failed:", error);
            Alert.alert(
                "Backup Failed",
                error.message || "An error occurred while creating the backup."
            );
        } finally {
            setIsExporting(false);
        }
    };

    const handlePerformRestore = async (backupData: any) => {
        setIsRestoring(true);

        try {
            await db.withTransactionAsync(async () => {
                await db.execAsync(`
                    DELETE FROM routines;
                    DELETE FROM selected_apps;
                    DELETE FROM sessions;
                    DELETE FROM shop_purchases;
                    DELETE FROM settings;
                `);

                if (Array.isArray(backupData.routines)) {
                    for (const r of backupData.routines) {
                        await db.runAsync(
                            "INSERT INTO routines (name, start_time, end_time, days_of_week, is_enabled, is_strict, blocked_apps, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            [
                                r.name,
                                r.start_time,
                                r.end_time,
                                r.days_of_week,
                                r.is_enabled ?? 1,
                                r.is_strict ?? 0,
                                r.blocked_apps ?? "",
                                r.created_at || new Date().toISOString(),
                            ]
                        );
                    }
                }

                const appsList = backupData.selectedApps || backupData.selected_apps;
                if (Array.isArray(appsList)) {
                    for (const app of appsList) {
                        const pkg = typeof app === "string" ? app : app.package_name;
                        if (pkg) {
                            await db.runAsync(
                                "INSERT OR IGNORE INTO selected_apps (package_name) VALUES (?)",
                                [pkg]
                            );
                        }
                    }
                }

                if (Array.isArray(backupData.sessions)) {
                    for (const s of backupData.sessions) {
                        await db.runAsync(
                            "INSERT INTO sessions (start_time, end_time, duration_seconds, is_completed, coins_earned, is_strict, session_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            [
                                s.start_time,
                                s.end_time,
                                s.duration_seconds,
                                s.is_completed ?? 1,
                                s.coins_earned ?? 0,
                                s.is_strict ?? 0,
                                s.session_date,
                                s.created_at || new Date().toISOString(),
                            ]
                        );
                    }
                }

                if (backupData.userStats) {
                    await db.runAsync(
                        `INSERT INTO user_stats (id, total_coins, current_streak, longest_streak, last_active_date, total_focus_seconds)
                         VALUES (1, ?, ?, ?, ?, ?)
                         ON CONFLICT(id) DO UPDATE SET
                             total_coins = excluded.total_coins,
                             current_streak = excluded.current_streak,
                             longest_streak = excluded.longest_streak,
                             last_active_date = excluded.last_active_date,
                             total_focus_seconds = excluded.total_focus_seconds`,
                        [
                            backupData.userStats.total_coins ?? 0,
                            backupData.userStats.current_streak ?? 0,
                            backupData.userStats.longest_streak ?? 0,
                            backupData.userStats.last_active_date ?? null,
                            backupData.userStats.total_focus_seconds ?? 0,
                        ]
                    );
                }

                if (Array.isArray(backupData.shopPurchases)) {
                    for (const p of backupData.shopPurchases) {
                        await db.runAsync(
                            "INSERT OR IGNORE INTO shop_purchases (item_id, purchased_at) VALUES (?, ?)",
                            [p.item_id, p.purchased_at]
                        );
                    }
                }

                if (Array.isArray(backupData.settings)) {
                    for (const st of backupData.settings) {
                        await db.runAsync(
                            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                            [st.key, String(st.value)]
                        );
                    }
                }
            });

            Alert.alert("Success", "Your backup has been restored successfully!");
        } catch (error: any) {
            console.error("Restore failed:", error);
            Alert.alert(
                "Restore Failed",
                error.message || "Failed to restore data from backup."
            );
        } finally {
            setIsRestoring(false);
        }
    };

    const handleRestoreBackup = async () => {
        if (isRestoring || isExporting) return;

        try {
            const fileResult = await File.pickFileAsync({
                mimeTypes: ["application/json", "text/*", "*/*"],
            });

            if (fileResult.canceled || !fileResult.result) {
                return;
            }

            const file = fileResult.result;
            const content = await file.text();

            let parsed: any;
            try {
                parsed = JSON.parse(content);
            } catch {
                Alert.alert(
                    "Invalid File",
                    "The selected file is not a valid JSON document."
                );
                return;
            }

            if (!parsed || parsed.app !== "lockout" || !parsed.data) {
                Alert.alert(
                    "Invalid Backup",
                    "This file is not a valid Lockout backup file."
                );
                return;
            }

            const formattedDate = parsed.exportedAt
                ? new Date(parsed.exportedAt).toLocaleDateString()
                : "Unknown date";

            Alert.alert(
                "Restore Backup",
                `Backup Date: ${formattedDate}\n\nRestoring will replace your current routines, stats, and blocklist with the data in this backup. Do you want to continue?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Restore",
                        style: "destructive",
                        onPress: () => handlePerformRestore(parsed.data),
                    },
                ]
            );
        } catch (error: any) {
            console.error("Error reading backup file:", error);
            Alert.alert("Error", error.message || "Failed to read the backup file.");
        }
    };

    return {
        isExporting,
        isRestoring,
        handleCreateBackup,
        handleRestoreBackup,
    };
}

