import { useAnalytics } from "@/hooks/useAnalytics";
import { useUserStats } from "@/hooks/useUserStats";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function useProgressController() {
    const { refreshStats } = useUserStats();
    const { refreshAnalytics } = useAnalytics();

    useFocusEffect(
        useCallback(() => {
            refreshStats();
            refreshAnalytics();
        }, [refreshStats, refreshAnalytics])
    );

    return {};
}
