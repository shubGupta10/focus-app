import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { addNotification } from "./useNotifications";

export type AppNotification = {
    id: string;
    title: string;
    description: string;
    actionLabel?: string;
    downloadUrl?: string;
};

export type WhatsNewData = {
    version: string;
    title: string;
    body: string;
} | null;


export function useAutoUpdateCheck() {
    const db = useSQLiteContext();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [whatsNew, setWhatsNew] = useState<WhatsNewData>(null);

    const dismissWhatsNew = async () => {
        setWhatsNew(null);
        const currentVersion = Constants.expoConfig?.version;
        if (currentVersion) {
            await AsyncStorage.setItem("lastSeenVersion", currentVersion);
        }
    };

    useEffect(() => {
        const checkForUpdates = async () => {
            if (__DEV__) return;
            const currentVersion = Constants.expoConfig?.version ?? "1.0.0";
            let newNotifications: AppNotification[] = [];

            try {
                const lastSeenVersion = await AsyncStorage.getItem("lastSeenVersion");

                if (!lastSeenVersion) {
                    await AsyncStorage.setItem("lastSeenVersion", currentVersion);
                } else if (lastSeenVersion !== currentVersion) {
                    try {
                        let response = await fetch(`https://api.github.com/repos/shubGupta10/focus-app/releases/tags/v${currentVersion}`);
                        if (!response.ok) {
                            response = await fetch(`https://api.github.com/repos/shubGupta10/focus-app/releases/latest`);
                        }
                        const data = await response.json();
                        if (data.body && data.body.trim().length > 0) {
                            setWhatsNew({
                                version: currentVersion,
                                title: data.name || `Release v${currentVersion}`,
                                body: data.body,
                            });
                        }
                    } catch (error) {
                        console.log("Could not fetch release notes for modal:", error);
                    }

                    await addNotification(db, {
                        id: `ota_celebrate_${currentVersion}`,
                        type: "update",
                        title: `Updated to v${currentVersion}`,
                        description: `You're all set on version ${currentVersion} with the latest improvements.`,
                        timestamp: Date.now(),
                        action_label: null,
                        action_url: null,
                    });
                }

                const response = await fetch("https://api.github.com/repos/shubGupta10/focus-app/releases/latest");
                const data = await response.json();

                if (data.tag_name) {
                    const latest = data.tag_name.replace("v", "");
                    if (latest !== currentVersion) {
                        const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));
                        const downloadUrl = apkAsset?.browser_download_url || "https://github.com/shubGupta10/focus-app/releases/latest";

                        await addNotification(db, {
                            id: `update_${latest}`,
                            type: "update",
                            title: `Full update available (v${latest})`,
                            description:
                                data.body?.slice(0, 120)?.replace(/[#*`]/g, "")?.trim() ||
                                "A new update is ready for you with fixes and improvements.",
                            timestamp: Date.now(),
                            action_label: "View update",
                            action_url: "/updates",
                        })

                    }
                }

                if (newNotifications.length > 0) {
                    setNotifications(newNotifications);
                    const lastReadId = await AsyncStorage.getItem("lastReadNotificationId");
                    if (lastReadId !== newNotifications[0].id) {
                        setHasUnread(true);
                    }
                }
            } catch (error) {
                console.log("Silent update check failed:", error);
            }
        }
        checkForUpdates();
    }, [])

    const markAsRead = async () => {
        setHasUnread(false);
        if (notifications.length > 0) {
            await AsyncStorage.setItem("lastReadNotificationId", notifications[0].id);
        }
    };

    return {
        notifications,
        hasUnread,
        markAsRead,
        whatsNew,
        dismissWhatsNew,
    };
}
