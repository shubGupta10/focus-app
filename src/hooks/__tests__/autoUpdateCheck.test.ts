import { checkForUpdates } from "../useAutoUpdateCheck";
import FocusBlocker from "../../../modules/focus-blocker/src/FocusBlockerModule";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addNotification } from "../useNotifications";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("../../../modules/focus-blocker/src/FocusBlockerModule", () => ({
    sendNotification: jest.fn(),
    startService: jest.fn(),
    stopService: jest.fn(),
}));

jest.mock("../useNotifications", () => ({
    addNotification: jest.fn(),
}));

describe("Auto-Update & Notification Engine", () => {
    const mockDb = {};
    const mockSetWhatsNew = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        AsyncStorage.clear();
    });

    it("sends a system notification and saves anti-spam key when a new version is released on GitHub", async () => {
        const currentVersion = "1.5.2";

        (globalThis as any).fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tag_name: "v1.6.0",
                name: "Release v1.6.0",
                body: "## Fixes\n- Improved focus timer",
                assets: [{ name: "Lockout.apk", browser_download_url: "https://github.com/apk" }]
            }),
        });

        await checkForUpdates(mockDb, currentVersion, mockSetWhatsNew, false);

        expect(FocusBlocker.sendNotification).toHaveBeenCalledTimes(1);
        expect(FocusBlocker.sendNotification).toHaveBeenCalledWith(
            "Full update available (v1.6.0)",
            "Fixes\n- Improved focus timer",
            "lockout://updates"
        );

        const antiSpamValue = await AsyncStorage.getItem("notified_system_update_1.6.0");
        expect(antiSpamValue).toBe("true");

        expect(addNotification).toHaveBeenCalledWith(mockDb, expect.objectContaining({
            id: "update_1.6.0",
            type: "update",
            title: "Full update available (v1.6.0)",
            action_url: "/updates",
        }));
    });

    it("does not send a duplicate notification if anti-spam key already exists in storage", async () => {
        const currentVersion = "1.5.2";

        await AsyncStorage.setItem("notified_system_update_1.6.0", "true");

        (globalThis as any).fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tag_name: "v1.6.0",
                name: "Release v1.6.0",
                body: "A new update",
                assets: []
            }),
        });

        await checkForUpdates(mockDb, currentVersion, mockSetWhatsNew, false);

        expect(FocusBlocker.sendNotification).not.toHaveBeenCalled();
    });

    it("does not trigger update notification when local version matches GitHub version", async () => {
        const currentVersion = "1.6.0";

        (globalThis as any).fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tag_name: "v1.6.0",
                name: "Release v1.6.0",
                body: "A new update",
                assets: []
            }),
        });

        await checkForUpdates(mockDb, currentVersion, mockSetWhatsNew, false);

        expect(FocusBlocker.sendNotification).not.toHaveBeenCalled();
    });

    it("triggers What's New modal when app version changes from previous launch", async () => {
        const currentVersion = "1.6.0";

        await AsyncStorage.setItem("lastSeenVersion", "1.5.2");

        (globalThis as any).fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                tag_name: "v1.6.0",
                name: "Release v1.6.0",
                body: "Changelog details",
                assets: []
            }),
        });

        await checkForUpdates(mockDb, currentVersion, mockSetWhatsNew, false);

        expect(mockSetWhatsNew).toHaveBeenCalledWith({
            version: "1.6.0",
            title: "Release v1.6.0",
            body: "Changelog details",
        });
    });
});
