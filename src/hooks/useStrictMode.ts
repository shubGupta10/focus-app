import { useSettings } from "@/hooks/useSettings";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

export function getNextMondayMidnight(): number {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = ((1 - dayOfWeek + 7) % 7) || 7;
    const nextMonday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntilMonday,
        0,
        0,
        0,
        0
    );
    return nextMonday.getTime();
}

export function formatResetCountdown(resetTimestamp: number): string {
    const now = Date.now();
    const diffMs = resetTimestamp - now;

    if (diffMs <= 0) return "Renews today";

    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days === 1) return "Renews tomorrow";
    if (days <= 6) return `Renews in ${days} days`;
    return "Renews Monday";
}

export function useStrictMode() {
    const { getSetting, setSetting } = useSettings();
    const [skipsRemaining, setSkipsRemaining] = useState<number>(1);
    const [nextResetTimestamp, setNextResetTimestamp] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAndApplyWeeklyReset = useCallback(async () => {
        try {
            const rawSkips = await getSetting("strict_skips_remaining");
            const rawReset = await getSetting("strict_skips_reset_timestamp");
            const now = Date.now();

            let resetTime = rawReset ? parseInt(rawReset, 10) : 0;
            let currentSkips = rawSkips !== null ? parseInt(rawSkips, 10) : 1;

            if (!resetTime || now >= resetTime) {
                currentSkips = 1;
                resetTime = getNextMondayMidnight();

                await setSetting("strict_skips_remaining", "1");
                await setSetting("strict_skips_reset_timestamp", resetTime.toString());
            }

            setSkipsRemaining(currentSkips);
            setNextResetTimestamp(resetTime);
        } catch (error) {
            console.error("Error checking strict mode reset:", error);
        } finally {
            setIsLoading(false);
        }
    }, [getSetting, setSetting]);

    useEffect(() => {
        checkAndApplyWeeklyReset();

        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                checkAndApplyWeeklyReset();
            }
        });

        return () => subscription.remove();
    }, [checkAndApplyWeeklyReset]);

    const useEmergencySkip = useCallback(async (): Promise<boolean> => {
        if (skipsRemaining <= 0) {
            return false;
        }

        const newSkips = 0;
        setSkipsRemaining(newSkips);
        await setSetting("strict_skips_remaining", newSkips.toString());
        return true;
    }, [skipsRemaining, setSetting]);

    const resetCountdownText = formatResetCountdown(nextResetTimestamp);

    return {
        skipsRemaining,
        nextResetTimestamp,
        resetCountdownText,
        isLoading,
        useEmergencySkip,
        refreshStrictMode: checkAndApplyWeeklyReset,
    };
}
