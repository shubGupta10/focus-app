import { useFocusEngine } from "@/hooks/useFocusEngine";
import { usePermissions } from "@/hooks/usePermissions";
import { useSettings } from "@/hooks/useSettings";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

export function useOnboardingController() {
    const engine = useFocusEngine();
    const { setSetting } = useSettings();
    const permissions = usePermissions();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set(engine.selectedApps));

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

    const toggleAppSelection = (packageName: string) => {
        const next = new Set(selectedSet);
        if (next.has(packageName)) {
            next.delete(packageName);
        } else {
            next.add(packageName);
        }
        setSelectedSet(next);
    };

    const handleSaveAppsAndContinue = async () => {
        const toSave = Array.from(selectedSet);
        for (const app of engine.selectedApps) {
            if (!selectedSet.has(app)) {
                await engine.toggleApp(app);
            }
        }
        for (const app of toSave) {
            if (!engine.selectedApps.includes(app)) {
                await engine.toggleApp(app);
            }
        }
        setStep(3);
    };

    const handleCompleteOnboarding = async () => {
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
