import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useSettings } from "@/hooks/useSettings";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";

export function useOnboardingController() {
    const engine = useFocusEngine();
    const { setSetting } = useSettings();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set(engine.selectedApps));

    useEffect(() => {
        if (step === 3) {
            engine.checkPermissions();
            const subscription = AppState.addEventListener("change", (state) => {
                if (state === "active") {
                    engine.checkPermissions();
                }
            })
            return () => subscription.remove();
        }
    }, [step])

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
        setSelectedSet((prev) => {
            const next = new Set(prev);
            if (next.has(packageName)) {
                next.delete(packageName);
            } else {
                next.add(packageName);
            }
            return next;
        });
    };

    const handleSaveAppsAndContinue = async () => {
        for (const pkg of selectedSet) {
            if (!engine.selectedApps.includes(pkg)) {
                await engine.toggleApp(pkg);
            }
        }
        setStep(3);
    };

    const handleCompleteOnboarding = async () => {
        await setSetting("has_completed_onboarding", "true");
        router.replace("/(tabs)");
    };

    const allPermissionsGranted = engine.hasUsage && engine.hasOverlay && engine.hasBattery;

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
        allPermissionsGranted
    };
}
