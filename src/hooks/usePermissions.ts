import { useAppStore } from "@/store/useAppStore";
import { useCallback, useEffect } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import FocusBlocker from "../../modules/focus-blocker/src/FocusBlockerModule";

export function usePermissions() {
    const hasUsage = useAppStore((state) => state.hasUsage);
    const hasOverlay = useAppStore((state) => state.hasOverlay);
    const hasBattery = useAppStore((state) => state.hasBattery);
    const hasNotification = useAppStore((state) => state.hasNotification);
    const setEngineState = useAppStore((state) => state.setEngineState);

    const checkPermissions = useCallback(async () => {
        const usage = FocusBlocker.hasUsagePermission();
        const overlay = FocusBlocker.hasOverlayPermission();
        const battery = FocusBlocker.hasBatteryPermission();
        let notification = true;

        if (Platform.OS === "android" && Platform.Version >= 33) {
            try {
                notification = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
            } catch {
                notification = false;
            }
        }

        setEngineState({
            hasUsage: usage,
            hasOverlay: overlay,
            hasBattery: battery,
            hasNotification: notification,
        });
    }, [setEngineState]);

    const requestUsage = useCallback(() => {
        FocusBlocker.requestUsagePermission();
    }, []);

    const requestOverlay = useCallback(() => {
        FocusBlocker.requestOverlayPermission();
    }, []);

    const requestBattery = useCallback(() => {
        FocusBlocker.requestBatteryPermission();
    }, []);

    const requestNotification = useCallback(async () => {
        if (Platform.OS === "android" && Platform.Version >= 33) {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                setEngineState({ hasNotification: isGranted });
                return isGranted;
            } catch {
                return false;
            }
        }
        return true;
    }, [setEngineState]);

    useEffect(() => {
        checkPermissions();
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                checkPermissions();
            }
        });
        return () => sub.remove();
    }, [checkPermissions]);

    const allPermissionsGranted =
        hasUsage && hasOverlay && hasBattery && hasNotification;

    return {
        hasUsage,
        hasOverlay,
        hasBattery,
        hasNotification,
        allPermissionsGranted,
        checkPermissions,
        requestUsage,
        requestOverlay,
        requestBattery,
        requestNotification,
    };
}

