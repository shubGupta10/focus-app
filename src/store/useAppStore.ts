import {
    DailyAnalytics,
    SessionHistoryItem,
    TodayStats,
    UserStats,
    getRecentSessions,
    getTodaySessionList,
    getTodayStats,
    getTotalSessionsCount,
    getUserStats,
    getWeeklyAnalytics
} from '@/features/stats/db/statsRepository';
import { getTodayDateString } from '@/utils/timeUtils';
import { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';
import FocusBlocker, { AppInfo } from '../../modules/focus-blocker/src/FocusBlockerModule';
import { AppState as RNAppState, Platform, Appearance } from "react-native"
import { Colors } from '@/constants/Colors';

interface AppState {
    isSessionActive: boolean;
    sessionStartTime: number | null;
    sessionEndTime: number | null;
    isStrictSession: boolean;
    isBreakActive: boolean;
    breakEndTime: number | null;
    breakStartTime: number | null;
    breakDurationMs: number | null;
    breaksRemaining: number;
    totalBreakMs: number;
    hapticsEnabled: boolean;
    setHapticsEnabled: (enabled: boolean) => void;
    defaultDurationMinutes: number;
    setDefaultDurationMinutes: (minutes: number) => void;

    setSessionState: (isActive: boolean, startTime: number | null, endTime: number | null, isStrict: boolean) => void;
    setBreakState: (isBreakActive: boolean, breakEndTime: number | null, breaksRemaining: number, totalBreakMs?: number) => void;
    clearSession: () => void;

    stats: UserStats;
    todayStats: TodayStats;
    weeklyData: DailyAnalytics[];
    recentSessions: SessionHistoryItem[];
    totalSessionsCount: number;
    todaySessionList: SessionHistoryItem[];

    refreshStats: (db: SQLiteDatabase) => Promise<void>;
    updateStatsLocally: (earnedCoins: number, durationSeconds: number, newStreak: number) => void;

    installedApps: AppInfo[];
    selectedApps: string[];
    hasUsage: boolean;
    hasOverlay: boolean;
    hasBattery: boolean;
    hasNotification: boolean;

    setEngineState: (state: Partial<AppState>) => void;

}

const defaultStats: UserStats = {
    total_coins: 0,
    current_streak: 0,
    longest_streak: 0,
    last_active_date: null,
    total_focus_seconds: 0,
};

const defaultTodayStats: TodayStats = {
    today_focus_seconds: 0,
    today_sessions: 0,
    today_coins: 0,
};

export interface WidgetThemePalette {
    bgColor: string;
    textColor: string;
    subtextColor: string;
    badgeBg: string;
    badgeTextColor: string;
    buttonBg: string;
    buttonTextColor: string;
    accentColor: string;
    progressTrackColor: string;
}

export interface WidgetThemeConfig {
    themeMode: 'system' | 'light' | 'dark';
    useDynamicTheme: boolean;
    hasCustomOrbTheme: boolean;
    activePalette: WidgetThemePalette;
    lightPalette: WidgetThemePalette;
    darkPalette: WidgetThemePalette;
}

let activeWidgetThemeConfig: WidgetThemeConfig | null = null;

function blendHexOver(fgHex: string, bgHex: string, alpha: number): string {
    const parse = (h: string) => {
        const clean = h.replace('#', '');
        const hex6 = clean.length >= 6 ? clean.slice(0, 6) : '000000';
        const n = parseInt(hex6, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const [fr, fg, fb] = parse(fgHex);
    const [br, bg, bb] = parse(bgHex);
    const r = Math.round(fr * alpha + br * (1 - alpha));
    const g = Math.round(fg * alpha + bg * (1 - alpha));
    const b = Math.round(fb * alpha + bb * (1 - alpha));
    const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function normalizeAndroidHex(color: string, fallbackBg: string): string {
    if (!color.startsWith('#')) return color;
    const raw = color.slice(1);
    if (raw.length === 6) return color;
    if (raw.length === 8) {
        const alpha = parseInt(raw.slice(6, 8), 16) / 255;
        return blendHexOver(`#${raw.slice(0, 6)}`, fallbackBg, alpha);
    }
    return fallbackBg;
}

export function toWidgetPalette(colors: typeof Colors.dark): WidgetThemePalette {
    const bg = normalizeAndroidHex(colors.surface, '#1D2024');
    return {
        bgColor: bg,
        textColor: normalizeAndroidHex(colors.text, bg),
        subtextColor: normalizeAndroidHex(colors.textSecondary, bg),
        badgeBg: normalizeAndroidHex(colors.accentMuted, bg),
        badgeTextColor: normalizeAndroidHex(colors.accent, bg),
        buttonBg: normalizeAndroidHex(colors.accent, bg),
        buttonTextColor: normalizeAndroidHex(colors.accentForeground, bg),
        accentColor: normalizeAndroidHex(colors.accent, bg),
        progressTrackColor: normalizeAndroidHex(colors.border, bg),
    };
}

export function setWidgetTheme(
    colors: typeof Colors.dark,
    options?: {
        themeMode?: 'system' | 'light' | 'dark';
        useDynamicTheme?: boolean;
        hasCustomOrbTheme?: boolean;
        lightColors?: typeof Colors.dark;
        darkColors?: typeof Colors.dark;
    }
) {
    activeWidgetThemeConfig = {
        themeMode: options?.themeMode ?? 'system',
        useDynamicTheme: options?.useDynamicTheme ?? false,
        hasCustomOrbTheme: options?.hasCustomOrbTheme ?? false,
        activePalette: toWidgetPalette(colors),
        lightPalette: toWidgetPalette(options?.lightColors ?? Colors.light),
        darkPalette: toWidgetPalette(options?.darkColors ?? Colors.dark),
    };
}

let widgetTicker: ReturnType<typeof setInterval> | null = null;
let lastWidgetSnapshotJson: string | null = null;

function stopWidgetTicker() {
    if (widgetTicker) {
        clearInterval(widgetTicker);
        widgetTicker = null;
    }
}

function startWidgetTicker() {
    if (Platform.OS !== 'android') return;
    stopWidgetTicker();
    widgetTicker = setInterval(() => {
        const state = useAppStore.getState();
        if (!state.isSessionActive) {
            stopWidgetTicker();
            return;
        }
        if (RNAppState.currentState !== 'active') return;
        syncWidget(
            state.isSessionActive,
            state.stats.current_streak,
            state.todayStats.today_focus_seconds,
            state.sessionEndTime,
            state.sessionStartTime
        );
    }, 20000);
}

function formatWidgetClockTime(timeMs: number): string {
    try {
        return new Date(timeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
        const d = new Date(timeMs);
        const hours24 = d.getHours();
        const mins = d.getMinutes().toString().padStart(2, '0');
        const suffix = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = hours24 % 12 || 12;
        return `${hours12}:${mins} ${suffix}`;
    }
}

function formatWidgetEndLabel(endTimeMs: number | null): string {
    if (!endTimeMs || endTimeMs <= 0) return '';
    return `Ends at ${formatWidgetClockTime(endTimeMs)}`;
}

function formatWidgetDuration(minutes: number): string {
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

export interface WidgetWeeklyDay {
    day: string;
    dateStr: string;
    focusSeconds: number;
}

export function buildWidgetWeeklyDays(
    weeklyData: DailyAnalytics[],
    todayFocusSeconds: number,
    referenceDate: Date = new Date()
): WidgetWeeklyDay[] {
    if (weeklyData.length === 7) {
        return weeklyData.map((entry, idx) => ({
            day: entry.dayOfWeek,
            dateStr: entry.dateStr,
            focusSeconds: idx === 6
                ? Math.max(0, Math.round(Math.max(entry.focusSeconds, todayFocusSeconds)))
                : Math.max(0, Math.round(entry.focusSeconds)),
        }));
    }

    const base = new Date(referenceDate);
    base.setHours(0, 0, 0, 0);
    const days: WidgetWeeklyDay[] = [];
    for (let offset = -6; offset <= 0; offset++) {
        const d = new Date(base);
        d.setDate(base.getDate() + offset);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayNum}`;
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        days.push({
            day,
            dateStr,
            focusSeconds: offset === 0 ? Math.max(0, Math.round(todayFocusSeconds)) : 0,
        });
    }
    return days;
}

export function syncWidget(
    isFocusing: boolean,
    streak: number,
    todaySeconds: number,
    sessionEndTime: number | null,
    sessionStartTime: number | null = null,
    weeklyDataOverride?: DailyAnalytics[]
) {
    if (Platform.OS !== 'android') return;

    try {
        const now = Date.now();
        const storeState = useAppStore.getState();
        const todayMinutes = Math.floor(todaySeconds / 60);
        const isInfinite = Boolean(isFocusing && sessionEndTime === -1);
        const isOnBreak = Boolean(
            isFocusing &&
            storeState.isBreakActive &&
            storeState.breakEndTime &&
            storeState.breakEndTime > now
        );
        const breakRemainingMinutes =
            isOnBreak && storeState.breakEndTime
                ? Math.max(1, Math.ceil((storeState.breakEndTime - now) / 60000))
                : 0;
        const breakProgress =
            isOnBreak && storeState.breakStartTime && storeState.breakDurationMs && storeState.breakDurationMs > 0
                ? Math.min(1, Math.max(0, (now - storeState.breakStartTime) / storeState.breakDurationMs))
                : 0;

        // Freeze focus countdown at endTime - breakEndTime while a break is active.
        const focusRemainingMs =
            isFocusing && sessionEndTime && sessionEndTime > 0
                ? Math.max(
                    0,
                    isOnBreak && storeState.breakEndTime
                        ? sessionEndTime - storeState.breakEndTime
                        : sessionEndTime - now
                )
                : 0;
        const remainingMinutes = isInfinite && sessionStartTime
            ? Math.floor(
                Math.max(
                    0,
                    now - sessionStartTime - (storeState.totalBreakMs ?? 0) -
                    (isOnBreak && storeState.breakStartTime ? Math.max(0, now - storeState.breakStartTime) : 0)
                ) / 60000
            )
            : focusRemainingMs > 0
                ? Math.ceil(focusRemainingMs / 60000)
                : 0;

        const totalFocusMs =
            isFocusing && sessionStartTime && sessionEndTime && sessionEndTime > 0
                ? Math.max(1, sessionEndTime - sessionStartTime - (storeState.totalBreakMs ?? 0))
                : 0;
        const progress = isInfinite
            ? 1
            : isFocusing && totalFocusMs > 0
                ? Math.min(1, Math.max(0, (totalFocusMs - focusRemainingMs) / totalFocusMs))
                : 0;

        const defaultMinutes = storeState.defaultDurationMinutes ?? 25;
        const sessionEndTimeMs =
            isFocusing && !isOnBreak && !isInfinite && sessionEndTime && sessionEndTime > 0
                ? sessionEndTime
                : 0;
        const sessionEndLabel = isFocusing && !isOnBreak
            ? isInfinite
                ? 'Flow state'
                : formatWidgetEndLabel(sessionEndTime)
            : '';
        const breakPausedLabel =
            isOnBreak && storeState.breakEndTime
                ? isInfinite
                    ? 'Flow paused'
                    : remainingMinutes > 0
                        ? `${formatWidgetDuration(remainingMinutes)} paused`
                        : `Resumes ${formatWidgetClockTime(storeState.breakEndTime)}`
                : '';
        const snapshotDate = getTodayDateString();
        const weeklyDays = buildWidgetWeeklyDays(
            weeklyDataOverride ?? storeState.weeklyData,
            todaySeconds
        );

        const isDark = Appearance.getColorScheme() !== 'light';
        const fallbackTheme = isDark ? Colors.dark : Colors.light;
        const defaultLight = toWidgetPalette(Colors.light);
        const defaultDark = toWidgetPalette(Colors.dark);
        const config: WidgetThemeConfig = activeWidgetThemeConfig ?? {
            themeMode: 'system',
            useDynamicTheme: false,
            hasCustomOrbTheme: false,
            activePalette: toWidgetPalette(fallbackTheme),
            lightPalette: defaultLight,
            darkPalette: defaultDark,
        };

        const snapshot = {
            isFocusing,
            isOnBreak,
            isInfinite,
            streak,
            todayMinutes,
            remainingMinutes,
            progress,
            breakRemainingMinutes,
            breakProgress,
            defaultMinutes,
            sessionEndTimeMs,
            sessionEndLabel,
            breakPausedLabel,
            snapshotDate,
            weeklyDays,
            themeMode: config.themeMode,
            useDynamicTheme: config.useDynamicTheme,
            hasCustomOrbTheme: config.hasCustomOrbTheme,
            lightPalette: config.lightPalette,
            darkPalette: config.darkPalette,
        };

        const serialized = JSON.stringify(snapshot);
        if (serialized !== lastWidgetSnapshotJson) {
            lastWidgetSnapshotJson = serialized;
            FocusBlocker.syncWidgetState?.(serialized);
        }
    } catch (error) {
    }
}

if (Platform.OS === 'android') {
    Appearance.addChangeListener(() => {
        try {
            const state = useAppStore.getState();
            syncWidget(
                state.isSessionActive,
                state.stats.current_streak,
                state.todayStats.today_focus_seconds,
                state.sessionEndTime,
                state.sessionStartTime
            );
        } catch { }
    });
}

let widgetSyncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleWidgetSync() {
    if (Platform.OS !== 'android') return;
    if (widgetSyncTimer) clearTimeout(widgetSyncTimer);
    widgetSyncTimer = setTimeout(() => {
        widgetSyncTimer = null;
        const latest = useAppStore.getState();
        syncWidget(
            latest.isSessionActive,
            latest.stats.current_streak,
            latest.todayStats.today_focus_seconds,
            latest.sessionEndTime,
            latest.sessionStartTime
        );
    }, 0);
}

export const useAppStore = create<AppState>((set) => ({
    isSessionActive: false,
    sessionStartTime: null,
    sessionEndTime: null,
    isStrictSession: false,
    isBreakActive: false,
    breakEndTime: null,
    breakStartTime: null,
    breakDurationMs: null,
    breaksRemaining: 1,
    totalBreakMs: 0,
    hapticsEnabled: true,
    setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
    defaultDurationMinutes: 25,
    setDefaultDurationMinutes: (minutes) => set((state) => {
        const valid = Number.isFinite(minutes) && (minutes > 0 || minutes === -1) ? minutes : 25;
        scheduleWidgetSync();
        return { defaultDurationMinutes: valid };
    }),

    setSessionState: (isActive, startTime, endTime, isStrict) => set((state) => {
        if (isActive) {
            startWidgetTicker();
        } else {
            stopWidgetTicker();
        }
        scheduleWidgetSync();
        return {
            isSessionActive: isActive,
            sessionStartTime: startTime,
            sessionEndTime: endTime,
            isStrictSession: isStrict,
            ...(isActive && !state.isSessionActive ? {
                isBreakActive: false,
                breakEndTime: null,
                breakStartTime: null,
                breakDurationMs: null,
                breaksRemaining: 1,
                totalBreakMs: 0
            } : {})
        }
    }),

    setBreakState: (isBreakActive, breakEndTime, breaksRemaining, totalBreakMs) => set((state) => {
        const now = Date.now();
        let newBreakStartTime = state.breakStartTime;
        let newBreakDurationMs = state.breakDurationMs;
        let newTotalBreakMs = totalBreakMs !== undefined ? totalBreakMs : state.totalBreakMs;

        if (!state.isBreakActive && isBreakActive) {
            newBreakStartTime = now;
            newBreakDurationMs = breakEndTime ? Math.max(0, breakEndTime - now) : null;
        } else if (state.isBreakActive && !isBreakActive) {
            newBreakStartTime = null;
            newBreakDurationMs = null;
        }

        scheduleWidgetSync();

        return {
            isBreakActive,
            breakEndTime,
            breakStartTime: newBreakStartTime,
            breakDurationMs: newBreakDurationMs,
            breaksRemaining,
            totalBreakMs: newTotalBreakMs,
        };
    }),

    clearSession: () => set((state) => {
        stopWidgetTicker();
        scheduleWidgetSync();
        return {
            isSessionActive: false,
            sessionStartTime: null,
            sessionEndTime: null,
            isStrictSession: false,
            isBreakActive: false,
            breakEndTime: null,
            breakStartTime: null,
            breakDurationMs: null,
            breaksRemaining: 1,
            totalBreakMs: 0
        }
    }),
    stats: defaultStats,
    todayStats: defaultTodayStats,
    weeklyData: [],
    recentSessions: [],
    totalSessionsCount: 0,
    todaySessionList: [],

    refreshStats: async (db: SQLiteDatabase) => {
        try {
            const [
                stats,
                todayStats,
                weeklyResult,
                recentSessions,
                totalSessionsCount,
                todaySessionList
            ] = await Promise.all([
                getUserStats(db),
                getTodayStats(db),
                getWeeklyAnalytics(db, 0),
                getRecentSessions(db, 4),
                getTotalSessionsCount(db),
                getTodaySessionList(db)
            ])

            set((state) => {
                syncWidget(
                    state.isSessionActive,
                    stats.current_streak,
                    todayStats.today_focus_seconds,
                    state.sessionEndTime,
                    state.sessionStartTime,
                    weeklyResult.weeklyData
                );
                return {
                    stats,
                    todayStats,
                    weeklyData: weeklyResult.weeklyData,
                    recentSessions,
                    totalSessionsCount,
                    todaySessionList
                }
            });
        } catch (error) {
            console.error("Error refreshing stats from DB:", error);
        }
    },

    updateStatsLocally: (earnedCoins, durationSeconds, newStreak) => {
        set((state) => {
            const newTodaySeconds = state.todayStats.today_focus_seconds + durationSeconds;
            const todayStr = getTodayDateString();
            const updatedWeekly = state.weeklyData.length === 7
                ? state.weeklyData.map((item, idx) =>
                    idx === 6 || item.dateStr === todayStr
                        ? { ...item, focusSeconds: Math.max(item.focusSeconds + durationSeconds, newTodaySeconds) }
                        : item
                )
                : state.weeklyData;
            syncWidget(
                state.isSessionActive,
                newStreak,
                newTodaySeconds,
                state.sessionEndTime,
                state.sessionStartTime,
                updatedWeekly
            );
            return {
                stats: {
                    ...state.stats,
                    total_coins: state.stats.total_coins + earnedCoins,
                    current_streak: newStreak,
                    longest_streak: Math.max(state.stats.longest_streak, newStreak),
                    total_focus_seconds: state.stats.total_focus_seconds + durationSeconds,
                },
                todayStats: {
                    ...state.todayStats,
                    today_focus_seconds: newTodaySeconds,
                    today_sessions: state.todayStats.today_sessions + 1,
                    today_coins: state.todayStats.today_coins + earnedCoins,
                },
                weeklyData: updatedWeekly,
            };
        });
    },
    installedApps: [],
    selectedApps: [],
    hasUsage: false,
    hasOverlay: false,
    hasBattery: false,
    hasNotification: true,

    setEngineState: (newState) => set((state) => ({ ...state, ...newState })),
}));
