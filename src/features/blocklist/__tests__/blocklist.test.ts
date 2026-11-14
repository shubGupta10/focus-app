import { AppInfo } from "../../../../modules/focus-blocker/src/FocusBlockerModule";

describe("Blocklist Engine & App Filtering", () => {
    const mockInstalledApps: AppInfo[] = [
        { name: "Instagram", packageName: "com.instagram.android", icon: "" },
        { name: "YouTube", packageName: "com.google.android.youtube", icon: "" },
        { name: "YouTube Music", packageName: "com.google.android.apps.youtube.music", icon: "" },
        { name: "Settings", packageName: "com.android.settings", icon: "" },
        { name: "Camera", packageName: "com.android.camera", icon: "" },
    ];

    const filterApps = (
        apps: AppInfo[],
        searchQuery: string,
        filterMode: "all" | "guarded",
        selectedApps: string[]
    ) => {
        return apps.filter((app) => {
            const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            if (filterMode === "guarded") {
                return selectedApps.includes(app.packageName);
            }
            return true;
        });
    };

    describe("Search Filtering", () => {
        it("returns all apps when search query is empty", () => {
            const results = filterApps(mockInstalledApps, "", "all", []);
            expect(results.length).toBe(5);
        });

        it("filters apps case-insensitively", () => {
            const results = filterApps(mockInstalledApps, "tube", "all", []);
            expect(results.length).toBe(2);
            expect(results.map(a => a.name)).toEqual(["YouTube", "YouTube Music"]);
        });

        it("returns empty array when search query matches nothing", () => {
            const results = filterApps(mockInstalledApps, "netflix", "all", []);
            expect(results).toEqual([]);
        });
    });

    describe("Filter Mode (All vs Guarded)", () => {
        const blockedApps = ["com.instagram.android", "com.google.android.youtube"];

        it("shows only blocked apps when filterMode is guarded", () => {
            const results = filterApps(mockInstalledApps, "", "guarded", blockedApps);
            expect(results.length).toBe(2);
            expect(results.map(a => a.name)).toEqual(["Instagram", "YouTube"]);
        });

        it("combines search query with guarded filter correctly", () => {
            const results = filterApps(mockInstalledApps, "music", "guarded", blockedApps);
            expect(results).toEqual([]);
        });
    });

    describe("Session Active Lockout (Anti-Cheat)", () => {
        const toggleApp = (
            selectedApps: string[],
            packageToToggle: string,
            isSessionActive: boolean
        ) => {
            // Anti-cheat guard
            if (isSessionActive) {
                return selectedApps;
            }

            if (selectedApps.includes(packageToToggle)) {
                return selectedApps.filter(pkg => pkg !== packageToToggle);
            } else {
                return [...selectedApps, packageToToggle];
            }
        };

        it("blocks toggling or removing apps when a focus session is currently active", () => {
            const currentBlocked = ["com.instagram.android", "com.google.android.youtube"];
            const isSessionActive = true;

            const result = toggleApp(currentBlocked, "com.instagram.android", isSessionActive);

            // Must NOT remove Instagram while session is active
            expect(result).toEqual(currentBlocked);
            expect(result.length).toBe(2);
        });

        it("adds an app when session is inactive", () => {
            const currentBlocked = ["com.instagram.android"];
            const isSessionActive = false;

            const result = toggleApp(currentBlocked, "com.google.android.youtube", isSessionActive);

            expect(result).toContain("com.google.android.youtube");
            expect(result.length).toBe(2);
        });

        it("removes an existing app when session is inactive", () => {
            const currentBlocked = ["com.instagram.android", "com.google.android.youtube"];
            const isSessionActive = false;

            const result = toggleApp(currentBlocked, "com.instagram.android", isSessionActive);

            expect(result).not.toContain("com.instagram.android");
            expect(result).toEqual(["com.google.android.youtube"]);
        });
    });

    describe("Stale Package Cleanup", () => {
        it("purges dead packages when an app is uninstalled from the phone", () => {
            const installedPackages = new Set([
                "com.instagram.android",
                "com.google.android.youtube",
            ]);

            const savedBlockedApps = [
                "com.instagram.android",
                "com.twitter.android",
                "com.google.android.youtube"
            ];

            const cleanApps = savedBlockedApps.filter(pkg => installedPackages.has(pkg));
            const staleApps = savedBlockedApps.filter(pkg => !installedPackages.has(pkg));

            expect(cleanApps).toEqual(["com.instagram.android", "com.google.android.youtube"]);
            expect(staleApps).toEqual(["com.twitter.android"]);
        });
    });
});