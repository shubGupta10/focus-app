import Constants from "expo-constants";
import { useEffect } from "react";
import { ToastAndroid } from "react-native";

export function useAutoUpdateCheck() {
    useEffect(() => {
        const checkForUpdates = async () => {
            if (__DEV__) return;

            try {
                const currentVersion = Constants.expoConfig?.version!;

                const response = await fetch("https://api.github.com/repos/shubGupta10/focus-app/releases/latest");
                const data = await response.json();

                if (data.tag_name) {
                    const latestVersion = data.tag_name.replace("v", "");
                    if (latestVersion !== currentVersion) {
                        ToastAndroid.showWithGravity(
                            `Lockout Update Available (v${latestVersion}) in Settings!`,
                            ToastAndroid.LONG,
                            ToastAndroid.BOTTOM
                        )
                    }
                }
            } catch (error) {
                console.log("Silent update check failed:", error);
            }
        }
        checkForUpdates();
    }, [])
}