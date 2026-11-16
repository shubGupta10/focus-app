import { useFocusEngine } from "@/hooks/useFocusEngine";
import { usePermissions } from "@/hooks/usePermissions";
import { useSettings } from "@/hooks/useSettings";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { analytics } from "@/utils/analytics";

export function useOnboardingController() {
    const engine = useFocusEngine();
    const { setSetting } = useSettings();
    const permissions = usePermissions();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set(engine.selectedApps));

    useEffect(() => {
        analytics.track("onboarding_step_viewed", { step })
    }, [step]);

    useEffect(() => {
        if (engine.installedApps.length === 0) {
            engine.loadApps();
        }
    }, [engine.installedApps.length, engine.loadApps]);

    useEffect(() => {
        if (engine.selectedApps.length > 0 && selectedSet.size === 0) {
            setSelectedSet(new Set(engine.selectedApps));
        }
    }, [engine.selectedApps]);

    const filteredApps = useMemo(() => {
        if (!searchQuery.trim()) {
            return engine.installedApps;
        }
        const query = searchQuery.toLowerCase();
        return engine.installedApps.filter((app) =>
            app.name.toLowerCase().includes(query) ||
            app.packageName.toLowerCase().includes(query)
        );
    }, [engine.installedApps, searchQuery]);

    const toggleAppSelection = useCallback((packageName: string) => {
        setSelectedSet((prev) => {
            const next = new Set(prev);
            if (next.has(packageName)) {
                next.delete(packageName);
            } else {
                next.add(packageName);
            }
            return next;
        });
    }, []);

    const handleSaveAppsAndContinue = async () => {
        const toSave = Array.from(selectedSet);
        await engine.setSelectedApps(toSave);
        setStep(3);
    };

    const handleCompleteOnboarding = async () => {
        const toSave = Array.from(selectedSet);
        await engine.setSelectedApps(toSave);
        analytics.track("onboarding_completed", {
            selected_apps_count: toSave.length,
        });

        await setSetting("has_completed_onboarding", "true");
        router.replace("/(tabs)");
    };

    return {
        engine,
        step,
        setStep,
        searchQuery,
        setSearchQuery,
        selectedSet,
        filteredApps,
        toggleAppSelection,
        handleSaveAppsAndContinue,
        handleCompleteOnboarding,
        allPermissionsGranted: permissions.allPermissionsGranted,
        hasUsage: permissions.hasUsage,
        hasOverlay: permissions.hasOverlay,
        hasBattery: permissions.hasBattery,
        hasNotification: permissions.hasNotification,
        requestNotification: permissions.requestNotification,
    };
}
