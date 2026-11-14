import {
    formatTime12Hour,
    formatRoutineDays,
    getRoutineDurationMinutes,
    calculateNextTrigger,
    isRoutineActiveNow
} from "@/utils/routineScheduler";
import { Routine } from "@/types/routine";

describe("Routine Scheduler Engine", () => {
    describe("Time Formatting (12-Hour Display)", () => {
        it("formats midnight 00:00 as 12:00 AM", () => {
            expect(formatTime12Hour("00:00")).toBe("12:00 AM");
        });

        it("formats midnight with minutes as 12:05 AM with leading zero", () => {
            expect(formatTime12Hour("00:05")).toBe("12:05 AM");
        });

        it("formats noon 12:00 as 12:00 PM", () => {
            expect(formatTime12Hour("12:00")).toBe("12:00 PM");
        });

        it("formats afternoon times into 12-hour PM", () => {
            expect(formatTime12Hour("14:30")).toBe("2:30 PM");
            expect(formatTime12Hour("23:59")).toBe("11:59 PM");
        });

        it("formats morning times into 12-hour AM", () => {
            expect(formatTime12Hour("09:15")).toBe("9:15 AM");
        });
    });

    describe("Routine Days Formatting", () => {
        it("returns No days for empty string", () => {
            expect(formatRoutineDays("")).toBe("No days");
        });

        it("identifies all 7 days as Every day", () => {
            expect(formatRoutineDays("1,2,3,4,5,6,7")).toBe("Every day");
        });

        it("identifies Monday to Friday as Weekdays", () => {
            expect(formatRoutineDays("1,2,3,4,5")).toBe("Weekdays");
        });

        it("identifies Saturday and Sunday as Weekends", () => {
            expect(formatRoutineDays("6,7")).toBe("Weekends");
        });

        it("formats custom days and sorts them chronologically", () => {
            expect(formatRoutineDays("5,1,3")).toBe("Mon, Wed, Fri");
            expect(formatRoutineDays("2,4")).toBe("Tue, Thu");
        });
    });

    describe("Duration Calculation & Midnight Crossover", () => {
        it("calculates standard same-day routine duration in minutes", () => {
            expect(getRoutineDurationMinutes("09:00", "17:00")).toBe(480);
            expect(getRoutineDurationMinutes("14:00", "14:45")).toBe(45);
        });

        it("calculates overnight routines that cross midnight without negative numbers", () => {
            expect(getRoutineDurationMinutes("23:00", "01:00")).toBe(120);
            expect(getRoutineDurationMinutes("22:30", "06:30")).toBe(480);
        });
    });

    describe("Next Alarm Trigger Calculation", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        const baseRoutine: Routine = {
            id: 1,
            name: "Deep Work",
            start_time: "09:00",
            end_time: "11:00",
            days_of_week: "1,2,3,4,5",
            is_enabled: 1,
            is_strict: 1,
            blocked_apps: "com.instagram.android",
            created_at: "2026-01-01",
        };

        it("returns null if routine is disabled", () => {
            const routine = { ...baseRoutine, is_enabled: 0 };
            expect(calculateNextTrigger(routine)).toBeNull();
        });

        it("returns null if routine has no active days", () => {
            const routine = { ...baseRoutine, days_of_week: "" };
            expect(calculateNextTrigger(routine)).toBeNull();
        });

        it("schedules for today when start time is in the future", () => {
            const wednesdayMorning = new Date(2026, 10, 11, 8, 0, 0);
            jest.setSystemTime(wednesdayMorning);

            const trigger = calculateNextTrigger(baseRoutine);
            expect(trigger).not.toBeNull();

            const triggerDate = new Date(trigger!);
            expect(triggerDate.getFullYear()).toBe(2026);
            expect(triggerDate.getMonth()).toBe(10);
            expect(triggerDate.getDate()).toBe(11);
            expect(triggerDate.getHours()).toBe(9);
            expect(triggerDate.getMinutes()).toBe(0);
        });

        it("schedules for tomorrow when today's start time has passed", () => {
            const wednesdayAfternoon = new Date(2026, 10, 11, 14, 0, 0);
            jest.setSystemTime(wednesdayAfternoon);

            const trigger = calculateNextTrigger(baseRoutine);
            expect(trigger).not.toBeNull();

            const triggerDate = new Date(trigger!);
            expect(triggerDate.getDate()).toBe(12);
            expect(triggerDate.getHours()).toBe(9);
            expect(triggerDate.getMinutes()).toBe(0);
        });

        it("schedules for upcoming weekend day when active on weekends only", () => {
            const wednesday = new Date(2026, 10, 11, 12, 0, 0);
            jest.setSystemTime(wednesday);

            const weekendRoutine: Routine = {
                ...baseRoutine,
                days_of_week: "6,7",
                start_time: "10:00",
                end_time: "12:00",
            };

            const trigger = calculateNextTrigger(weekendRoutine);
            expect(trigger).not.toBeNull();

            const triggerDate = new Date(trigger!);
            expect(triggerDate.getDay()).toBe(6);
            expect(triggerDate.getHours()).toBe(10);
        });
    });

    describe("Active Window Detection (isRoutineActiveNow)", () => {
        const standardRoutine: Routine = {
            id: 1,
            name: "Focus Hours",
            start_time: "09:00",
            end_time: "12:00",
            days_of_week: "1,2,3,4,5",
            is_enabled: 1,
            is_strict: 0,
            blocked_apps: "",
            created_at: "2026-01-01",
        };

        const overnightRoutine: Routine = {
            id: 2,
            name: "Night Blocker",
            start_time: "23:00",
            end_time: "02:00",
            days_of_week: "1,2,3,4,5,6,7",
            is_enabled: 1,
            is_strict: 1,
            blocked_apps: "",
            created_at: "2026-01-01",
        };

        it("returns inactive if routine is disabled", () => {
            const routine = { ...standardRoutine, is_enabled: 0 };
            const wednesday10am = new Date(2026, 10, 11, 10, 0, 0);
            expect(isRoutineActiveNow(routine, wednesday10am)).toEqual({ isActive: false, remainingMinutes: 0 });
        });

        it("returns inactive if current day is not in schedule", () => {
            const sunday10am = new Date(2026, 10, 15, 10, 0, 0);
            expect(isRoutineActiveNow(standardRoutine, sunday10am)).toEqual({ isActive: false, remainingMinutes: 0 });
        });

        it("returns active and remaining minutes when inside daytime window", () => {
            const wednesday1030 = new Date(2026, 10, 11, 10, 30, 0);
            const result = isRoutineActiveNow(standardRoutine, wednesday1030);
            expect(result.isActive).toBe(true);
            expect(result.remainingMinutes).toBe(90);
        });

        it("returns inactive when daytime window has ended", () => {
            const wednesday1205 = new Date(2026, 10, 11, 12, 5, 0);
            const result = isRoutineActiveNow(standardRoutine, wednesday1205);
            expect(result.isActive).toBe(false);
            expect(result.remainingMinutes).toBe(0);
        });

        it("returns active and remaining minutes before midnight in overnight routine", () => {
            const nightTime = new Date(2026, 10, 11, 23, 40, 0);
            const result = isRoutineActiveNow(overnightRoutine, nightTime);
            expect(result.isActive).toBe(true);
            expect(result.remainingMinutes).toBe(140);
        });

        it("returns active and remaining minutes after midnight in overnight routine", () => {
            const morningTime = new Date(2026, 10, 12, 1, 15, 0);
            const result = isRoutineActiveNow(overnightRoutine, morningTime);
            expect(result.isActive).toBe(true);
            expect(result.remainingMinutes).toBe(45);
        });
    });
});
