import { Routine } from "@/types/routine";

export function formatTime12Hour(time24: string): string {
    const [hourStr, minStr] = time24.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;
    return `${displayHour}:${displayMinute} ${period}`;
}

export function formatRoutineDays(daysOfWeek: string): string {
    if (!daysOfWeek) return "No days";
    const days = daysOfWeek.split(",").map(Number).sort((a, b) => a - b);
    if (days.length === 7) return "Every day";
    if (days.length === 5 && days.join(",") === "1,2,3,4,5") return "Weekdays";
    if (days.length === 2 && days.join(",") === "6,7") return "Weekends";

    const dayLabels: Record<number, string> = {
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat",
        7: "Sun"
    };

    return days.map((d) => dayLabels[d] || "").filter(Boolean).join(", ");
}

export function getRoutineDurationMinutes(startTime: string, endTime: string): number {
    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);
    const startTotal = sH * 60 + sM;
    const endTotal = eH * 60 + eM;

    if (endTotal > startTotal) {
        return endTotal - startTotal;
    }
    return (24 * 60 - startTotal) + endTotal;
}

export function calculateNextTrigger(routine: Routine): number | null {
    if (!routine.is_enabled || !routine.days_of_week) {
        return null;
    }

    const activeDays = new Set(routine.days_of_week.split(",").map(Number));
    if (activeDays.size === 0) {
        return null;
    }

    const [startHour, startMinute] = routine.start_time.split(":").map(Number);
    const now = new Date();

    for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
        const candidate = new Date(now);
        candidate.setDate(now.getDate() + dayOffset);
        candidate.setHours(startHour, startMinute, 0, 0);

        const jsDay = candidate.getDay();
        const isoDay = jsDay === 0 ? 7 : jsDay;

        if (activeDays.has(isoDay)) {
            if (candidate.getTime() > now.getTime()) {
                return candidate.getTime();
            }
        }
    }

    return null;
}

export function isRoutineActiveNow(routine: Routine, date: Date = new Date()): { isActive: boolean; remainingMinutes: number } {
    if (!routine.is_enabled || !routine.days_of_week) {
        return { isActive: false, remainingMinutes: 0 };
    }

    const activeDays = new Set(routine.days_of_week.split(",").map(Number));
    const jsDay = date.getDay();
    const isoDay = jsDay === 0 ? 7 : jsDay;

    if (!activeDays.has(isoDay)) {
        return { isActive: false, remainingMinutes: 0 };
    }

    const [sH, sM] = routine.start_time.split(":").map(Number);
    const [eH, eM] = routine.end_time.split(":").map(Number);

    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const startMinutes = sH * 60 + sM;
    const endMinutes = eH * 60 + eM;

    if (endMinutes > startMinutes) {
        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            return {
                isActive: true,
                remainingMinutes: endMinutes - currentMinutes
            };
        }
    } else if (endMinutes < startMinutes) {
        if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
            const remaining = currentMinutes >= startMinutes
                ? (24 * 60 - currentMinutes) + endMinutes
                : endMinutes - currentMinutes;
            return {
                isActive: true,
                remainingMinutes: remaining
            };
        }
    }

    return { isActive: false, remainingMinutes: 0 };
}
