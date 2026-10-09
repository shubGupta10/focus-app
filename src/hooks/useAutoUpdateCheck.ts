import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type AppNotification = {
    id: string;
    title: string;
    description: string;
    actionLabel?: string;
    downloadUrl?: string;
};

export function useAutoUpdateCheck() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const checkForUpdates = async () => {
            if (__DEV__) return;
            const currentVersion = Constants.expoConfig?.version!;
            let newNotifications: AppNotification[] = [];

            try {
                const lastSeenVersion = await AsyncStorage.getItem("lastSeenVersion");
                if (lastSeenVersion && lastSeenVersion !== currentVersion) {
                    newNotifications.push({
                        id: 'ota_celebrate',
                        title: 'Update Successful! 🎉',
                        description: `Lockout silently updated to v${currentVersion} in the background.`,
                    });
                    await AsyncStorage.setItem("lastSeenVersion", currentVersion);
                } else if (!lastSeenVersion) {
                    await AsyncStorage.setItem("lastSeenVersion", currentVersion);
                }

                const response = await fetch("https://api.github.com/repos/shubGupta10/focus-app/releases/latest");
                const data = await response.json();

                if (data.tag_name) {
                    const latest = data.tag_name.replace("v", "");
                    if (latest !== currentVersion) {
                        const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));
                        const downloadUrl = apkAsset?.browser_download_url || "https://github.com/shubGupta10/focus-app/releases/latest";

                        newNotifications.push({
                            id: `update_${latest}`,
                            title: `Version ${latest} is ready!`,
                            description: 'A major update is available with new features and improvements.',
                            actionLabel: 'Download Update',
                            downloadUrl: downloadUrl
                        });
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

    return { notifications, hasUnread, markAsRead };
}
