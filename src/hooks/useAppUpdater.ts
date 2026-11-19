import * as Updates from "expo-updates";
import { useState } from "react";
import { Alert } from "react-native";

export function useAppUpdate() {
    const [isChecking, setIsChecking] = useState(false);

    const checkForUpdates = async () => {
        if (__DEV__) {
            Alert.alert("Development Mode", "OTA Updates are not available in development builds.");
            return;
        }

        if (!Updates.isEnabled) {
            Alert.alert("OTA Unavailable", "Quick updates are not enabled for this build.");
            return;
        }

        try {
            setIsChecking(true);
            const updateCheck = await Updates.checkForUpdateAsync();

            if (updateCheck.isAvailable) {
                const fetchUpdate = await Updates.fetchUpdateAsync();

                if (fetchUpdate.isNew) {
                    Alert.alert(
                        "Update Downloaded",
                        "A new version of the app has been downloaded. Restart the app to apply the changes.",
                        [
                            {
                                text: "Restart Later",
                                style: "cancel"
                            },
                            {
                                text: "Restart Now",
                                onPress: () => Updates.reloadAsync()
                            }
                        ]
                    );
                }
            } else {
                Alert.alert("Up to Date", "You are already running the latest version.");
            }
        } catch (error) {
            console.error("Failed to check for updates:", error);
            Alert.alert("Check Failed", "Could not check for OTA updates right now. Please check your internet connection.");
        } finally {
            setIsChecking(false);
        }
    }

    return {
        isChecking,
        checkForUpdates
    }
}