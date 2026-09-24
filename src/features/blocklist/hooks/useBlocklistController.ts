import { useToast } from "@/contexts/ToastContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useCallback, useState } from "react";
import { Vibration } from "react-native";

export function useBlocklistController() {
    const engine = useFocusEngine();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState<"all" | "guarded">("all");

    const filteredApps = engine.installedApps.filter((app) => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (filterMode === "guarded") {
            return engine.selectedApps.includes(app.packageName);
        }
        return true;
    });

    const handleToggleApp = useCallback((packageName: string) => {
        if (engine.isSessionActive) return;
        const isCurrentlySelected = engine.selectedApps.includes(packageName);

        try {
            Vibration.vibrate(8);
        } catch { }

        engine.toggleApp(packageName);

        if (isCurrentlySelected) {
            showToast("App removed from block list")
        } else {
            showToast("App added to block list")
        }
    }, [engine.isSessionActive, engine.selectedApps, showToast, engine.toggleApp]);

    return {
        engine,
        searchQuery,
        setSearchQuery,
        filterMode,
        setFilterMode,
        filteredApps,
        handleToggleApp
    };
}
