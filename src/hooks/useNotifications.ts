import { useFocusEffect } from "expo-router";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

export type NotificationType = "update" | "milestone" | "session" | "defense";

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    timestamp: number;
    is_read: number;
    action_label?: string | null;
    action_url?: string | null;
}
export interface GroupedNotifications {
    today: NotificationItem[];
    yesterday: NotificationItem[];
    earlier: NotificationItem[];
}

export async function addNotification(
    db: SQLiteDatabase,
    notification: Omit<NotificationItem, "is_read">
) {
    try {
        await db.runAsync(
            `INSERT OR IGNORE INTO notifications (id, type, title, description, timestamp, is_read, action_label, action_url)
             VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
            [
                notification.id,
                notification.type,
                notification.title,
                notification.description,
                notification.timestamp,
                notification.action_label ?? null,
                notification.action_url ?? null,
            ]
        );
    } catch (error) {
        console.error("Failed to add notification:", error);
    }
}

export function useNotification() {
    const db = useSQLiteContext();
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [isLoading, setIsLoading] = useState(true);

    const loadNotification = useCallback(async () => {
        try {
            const rows = await db.getAllAsync<NotificationItem>(`
                 SELECT * FROM notifications ORDER BY timestamp DESC
                `);
            setNotifications(rows);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [db]);


    useFocusEffect(
        useCallback(() => {
            loadNotification();
        }, [loadNotification])
    );

    const markAllAsRead = async () => {
        try {
            await db.runAsync(
                `UPDATE notifications SET is_read = 1 WHERE is_read = 0`);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    }

    const clearAll = async () => {
        try {
            await db.runAsync(`DELETE FROM notifications`);
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const grouped: GroupedNotifications = {
        today: [],
        yesterday: [],
        earlier: [],
    };

    for (const item of notifications) {
        if (item.timestamp >= startOfToday) {
            grouped.today.push(item);
        } else if (item.timestamp >= startOfYesterday) {
            grouped.yesterday.push(item);
        } else {
            grouped.earlier.push(item);
        }
    }
    const hasUnread = notifications.some((n) => n.is_read === 0);

    return {
        notifications,
        grouped,
        hasUnread,
        isLoading,
        markAllAsRead,
        clearAll,
        refresh: loadNotification,
    }
}