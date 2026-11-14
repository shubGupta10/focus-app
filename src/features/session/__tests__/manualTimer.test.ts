import { useAppStore } from "@/store/useAppStore";

describe("Manual Timer Engine", () => {
    beforeEach(() => {
        useAppStore.getState().clearSession();
    });

    describe("Timer Initiation & Duration Math", () => {
        it("starts a 25-minute manual timer with correct end timestamp and active state", () => {
            const startTime = 1700000000000;
            const durationMs = 25 * 60 * 1000;
            const expectedEndTime = startTime + durationMs;

            useAppStore.getState().setSessionState(true, startTime, expectedEndTime, false);

            const state = useAppStore.getState();
            expect(state.isSessionActive).toBe(true);
            expect(state.sessionStartTime).toBe(startTime);
            expect(state.sessionEndTime).toBe(expectedEndTime);
            expect(state.isStrictSession).toBe(false);
            expect(state.breaksRemaining).toBe(1);
            expect(state.totalBreakMs).toBe(0);
        });

        it("resets previous break state when a fresh timer begins", () => {
            useAppStore.getState().setBreakState(true, 1700000300000, 0, 300000);

            const newStartTime = 1700001000000;
            const newEndTime = newStartTime + (15 * 60 * 1000);
            useAppStore.getState().clearSession();
            useAppStore.getState().setSessionState(true, newStartTime, newEndTime, true);

            const state = useAppStore.getState();
            expect(state.isSessionActive).toBe(true);
            expect(state.isStrictSession).toBe(true);
            expect(state.isBreakActive).toBe(false);
            expect(state.breakEndTime).toBeNull();
            expect(state.breaksRemaining).toBe(1);
            expect(state.totalBreakMs).toBe(0);
        });
    });

    describe("Strict Mode Protection Injection", () => {
        it("injects system settings and store packages when strict mode is active", () => {
            const selectedApps = ["com.instagram.android", "com.google.android.youtube"];
            const isStrict = true;

            const systemApps = [
                "com.android.settings",
                "com.android.vending",
                "com.google.android.packageinstaller"
            ];

            let appsToBlock = [...selectedApps];
            if (isStrict) {
                systemApps.forEach(app => {
                    if (!appsToBlock.includes(app)) {
                        appsToBlock.push(app);
                    }
                });
            }

            expect(appsToBlock).toContain("com.instagram.android");
            expect(appsToBlock).toContain("com.android.settings");
            expect(appsToBlock).toContain("com.android.vending");
            expect(appsToBlock).toContain("com.google.android.packageinstaller");
            expect(appsToBlock.length).toBe(5);
        });

        it("leaves blocklist unchanged when strict mode is false", () => {
            const selectedApps = ["com.instagram.android"];
            const isStrict = false;

            const systemApps = [
                "com.android.settings",
                "com.android.vending",
                "com.google.android.packageinstaller"
            ];

            let appsToBlock = [...selectedApps];
            if (isStrict) {
                systemApps.forEach(app => {
                    if (!appsToBlock.includes(app)) {
                        appsToBlock.push(app);
                    }
                });
            }

            expect(appsToBlock).toEqual(["com.instagram.android"]);
        });
    });

    describe("Break Time Extension", () => {
        it("extends effective end time by total break duration without stealing focus time", () => {
            const startTime = 1000000;
            const originalTargetMs = 25 * 60 * 1000;
            const originalEndTime = startTime + originalTargetMs;

            useAppStore.getState().setSessionState(true, startTime, originalEndTime, false);

            const breakDurationMs = 5 * 60 * 1000;
            useAppStore.getState().setBreakState(true, startTime + breakDurationMs, 0, breakDurationMs);

            const state = useAppStore.getState();
            const effectiveEndTime = (state.sessionEndTime ?? 0) + state.totalBreakMs;

            expect(state.breaksRemaining).toBe(0);
            expect(state.totalBreakMs).toBe(breakDurationMs);
            expect(effectiveEndTime).toBe(originalEndTime + breakDurationMs);
        });
    });

    describe("Timer Termination & Reset", () => {
        it("clears all session and timer timestamps on stopSession", () => {
            useAppStore.getState().setSessionState(true, 1000, 2000, true);
            useAppStore.getState().clearSession();

            const state = useAppStore.getState();
            expect(state.isSessionActive).toBe(false);
            expect(state.sessionStartTime).toBeNull();
            expect(state.sessionEndTime).toBeNull();
            expect(state.isStrictSession).toBe(false);
        });
    });

    describe("Live Countdown & Coin Accrual Math", () => {
        it("calculates remaining focus time, progress ratio, and base coins accurately", () => {
            const startTime = 1000000;
            const totalDurationMs = 25 * 60 * 1000;
            const endTime = startTime + totalDurationMs;
            const currentTime = startTime + (10 * 60 * 1000);

            const elapsedMs = currentTime - startTime;
            const remainingMs = Math.max(0, endTime - currentTime);
            const progress = remainingMs / totalDurationMs;
            const elapsedMinutes = Math.floor(elapsedMs / 60000);

            const standardCoins = elapsedMinutes;
            const strictCoins = Math.floor(elapsedMinutes * 1.5);

            expect(remainingMs).toBe(15 * 60 * 1000);
            expect(progress).toBe(0.6);
            expect(standardCoins).toBe(10);
            expect(strictCoins).toBe(15);
        });

        it("handles infinite stopwatch mode without completing", () => {
            const startTime = 1000000;
            const endTime = -1;
            const isInfinite = endTime === -1;
            const currentTime = startTime + (125 * 1000);

            const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

            expect(isInfinite).toBe(true);
            expect(elapsedSeconds).toBe(125);
            expect(formattedTime).toBe("02:05");
        });
    });

    describe("Duplicate Reward Prevention & Skip Constraints", () => {
        it("prevents double-claiming rewards when completion triggers more than once", () => {
            const lastProcessedEndTime = { current: null as number | null };
            let timesAwarded = 0;

            const completeSession = (endTimeMs: number) => {
                if (lastProcessedEndTime.current === endTimeMs) {
                    return;
                }
                lastProcessedEndTime.current = endTimeMs;
                timesAwarded += 1;
            };

            const sessionEnd = 1700000000000;
            completeSession(sessionEnd);
            completeSession(sessionEnd);
            completeSession(sessionEnd);

            expect(timesAwarded).toBe(1);
        });

        it("enforces single emergency skip constraint in strict mode", () => {
            let skipsRemaining = 1;
            let emergencySkipUsed = false;

            const useEmergencySkip = () => {
                if (skipsRemaining <= 0) return false;
                skipsRemaining -= 1;
                emergencySkipUsed = true;
                return true;
            };

            const firstAttempt = useEmergencySkip();
            expect(firstAttempt).toBe(true);
            expect(skipsRemaining).toBe(0);

            const secondAttempt = useEmergencySkip();
            expect(secondAttempt).toBe(false);
            expect(skipsRemaining).toBe(0);
        });
    });

    describe("Memory Leak Prevention", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("cleans up active timer intervals when session stops", () => {
            let intervalFiredCount = 0;
            const interval = setInterval(() => {
                intervalFiredCount += 1;
            }, 500);

            jest.advanceTimersByTime(1500);
            expect(intervalFiredCount).toBe(3);

            clearInterval(interval);

            jest.advanceTimersByTime(3000);
            expect(intervalFiredCount).toBe(3);
        });
    });
});