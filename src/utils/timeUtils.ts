/**
 * Safely calculates duration in seconds between two JS timestamps (in ms).
 * Uses Math.round to account for React Native bridge delays.
 */
export function getDurationSeconds(startMs: number, endMs: number): number {
    return Math.round((endMs - startMs) / 1000);
}

/**
 * Converts total seconds into hours and remaining minutes.
 * Useful for "Total Focus Time: 1h 25m" displays.
 */
export function secondsToHoursAndMinutes(totalSeconds: number): { hours: number; minutes: number } {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return { hours, minutes };
}

/**
 * Gets a timezone-safe "Today" date string in YYYY-MM-DD format for SQLite queries.
 */
export function getTodayDateString(): string {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
}

/**
 * Formats a UNIX timestamp into a readable exact time (e.g., "10:25 AM").
 */
export function formatExactTime(timestampMs: number): string {
    return new Date(timestampMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Converts seconds into a relative "time ago" string (e.g., "5m ago", "2d ago").
 */
export function formatTimeAgo(timestampMs: number): string {
    const diffInSeconds = Math.floor((Date.now() - timestampMs) / 1000);
    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return `${Math.floor(diffInHours / 24)}d ago`;
}

/**
 * Formats seconds into a live timer string, e.g. "1:05:30" or "05:30".
 */
export function formatTimerDisplay(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}:${String(remainingMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
