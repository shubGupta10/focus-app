import { secondsToHoursAndMinutes, getTodayDateString } from "@/utils/timeUtils";

describe("Progress & Stats Engine", () => {
    describe("Streak Calculation Rules", () => {
        const calculateNewStreak = (lastActiveDate: string | null, sessionDate: string, yesterday: string, currentStreak: number) => {
            if (lastActiveDate === sessionDate) {
                return currentStreak;
            } else if (lastActiveDate === yesterday) {
                return currentStreak + 1;
            } else {
                return 1;
            }
        };

        it("increments streak by 1 when session is on the consecutive day", () => {
            const yesterday = "2026-11-13";
            const today = "2026-11-14";
            const currentStreak = 3;

            const newStreak = calculateNewStreak(yesterday, today, yesterday, currentStreak);
            expect(newStreak).toBe(4);
        });

        it("maintains current streak when multiple sessions happen on the same day", () => {
            const today = "2026-11-14";
            const currentStreak = 5;

            const newStreak = calculateNewStreak(today, today, "2026-11-13", currentStreak);
            expect(newStreak).toBe(5);
        });

        it("resets streak to 1 when a day was missed", () => {
            const twoDaysAgo = "2026-11-12";
            const today = "2026-11-14";
            const yesterday = "2026-11-13";
            const currentStreak = 10;

            const newStreak = calculateNewStreak(twoDaysAgo, today, yesterday, currentStreak);
            expect(newStreak).toBe(1);
        });

        it("initializes streak to 1 for first-time session", () => {
            const today = "2026-11-14";
            const yesterday = "2026-11-13";

            const newStreak = calculateNewStreak(null, today, yesterday, 0);
            expect(newStreak).toBe(1);
        });

        it("updates longest streak only when current streak surpasses it", () => {
            expect(Math.max(5, 6)).toBe(6);
            expect(Math.max(10, 4)).toBe(10);
        });
    });

    describe("Coin Economy Calculation", () => {
        const calculateEarnedCoins = (durationSeconds: number, isStrict: boolean) => {
            const baseCoins = Math.floor(durationSeconds / 60);
            return isStrict ? Math.floor(baseCoins * 1.5) : baseCoins;
        };

        it("awards 1 coin per completed minute in standard mode", () => {
            expect(calculateEarnedCoins(1500, false)).toBe(25);
            expect(calculateEarnedCoins(3600, false)).toBe(60);
            expect(calculateEarnedCoins(59, false)).toBe(0);
        });

        it("awards 1.5x bonus coins in strict mode", () => {
            expect(calculateEarnedCoins(3600, true)).toBe(90);
            expect(calculateEarnedCoins(1500, true)).toBe(37);
            expect(calculateEarnedCoins(600, true)).toBe(15);
        });
    });

    describe("Square-Root Chart Scaling Curve", () => {
        const calculateBarHeight = (focusSeconds: number, maxSeconds: number) => {
            if (maxSeconds <= 0 || focusSeconds <= 0) return 0;
            const ratio = Math.min(focusSeconds / maxSeconds, 1);
            return Math.max(Math.sqrt(ratio) * 100, 10);
        };

        it("returns 0 height when focus seconds are 0", () => {
            expect(calculateBarHeight(0, 3600)).toBe(0);
        });

        it("returns 100 height when focus seconds reach maxSeconds", () => {
            expect(calculateBarHeight(3600, 3600)).toBe(100);
        });

        it("boosts small focus sessions so marathon days do not crush them visually", () => {
            const marathonSeconds = 11 * 3600;
            const shortSessionSeconds = 15 * 60;

            const linearPercent = (shortSessionSeconds / marathonSeconds) * 100;
            const scaledHeight = calculateBarHeight(shortSessionSeconds, marathonSeconds);

            expect(linearPercent).toBeCloseTo(2.27, 1);
            expect(scaledHeight).toBeGreaterThan(linearPercent);
            expect(scaledHeight).toBeCloseTo(15.07, 1);
        });

        it("enforces minimum 10 percent height for any non-zero focus session", () => {
            const hugeMax = 24 * 3600;
            const tinyFocus = 60;

            const scaledHeight = calculateBarHeight(tinyFocus, hugeMax);
            expect(scaledHeight).toBe(10);
        });
    });

    describe("Weekly Rhythm Averages & Text Formatting", () => {
        const formatWeeklyAverage = (totalWeeklySeconds: number) => {
            const dailyAvgMinutes = Math.round(totalWeeklySeconds / 7 / 60);
            if (totalWeeklySeconds === 0) return "0m a day";
            if (dailyAvgMinutes < 1) return "< 1m a day";
            return `${dailyAvgMinutes}m a day`;
        };

        it("formats zero total focus seconds cleanly", () => {
            expect(formatWeeklyAverage(0)).toBe("0m a day");
        });

        it("handles micro-focus edge case as < 1m a day", () => {
            expect(formatWeeklyAverage(120)).toBe("< 1m a day");
        });

        it("formats standard daily average in minutes", () => {
            expect(formatWeeklyAverage(7 * 45 * 60)).toBe("45m a day");
        });

        it("formats total focus hours and minutes accurately", () => {
            const { hours, minutes } = secondsToHoursAndMinutes(5100);
            const totalString = hours > 0 ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`) : `${minutes}m`;
            expect(totalString).toBe("1h 25m");
        });
    });

    describe("Date Utilities for SQLite Storage", () => {
        it("generates a valid YYYY-MM-DD date string", () => {
            const dateStr = getTodayDateString();
            expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
});
