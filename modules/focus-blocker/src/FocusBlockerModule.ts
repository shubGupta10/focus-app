import { requireNativeModule } from 'expo-modules-core';

export type AppInfo = {
  name: string;
  packageName: string;
  icon: string;
};

export type TimePickerResult = {
  hour: number;
  minute: number;
} | null;

export type ActiveSessionInfo = {
  isActive: boolean;
  startTime: number;
  endTime: number;
  isStrict: boolean;
} | null;

export type CompletedSessionInfo = {
  durationSeconds: number;
  isStrict: boolean;
  endTime: number;
} | null;

export declare class FocusBlockerModule {
  hasUsagePermission(): boolean;
  requestUsagePermission(): void;
  hasOverlayPermission(): boolean;
  requestOverlayPermission(): void;
  hasBatteryPermission(): boolean;
  requestBatteryPermission(): void;
  hasExactAlarmPermission(): boolean;
  requestExactAlarmPermission(): void;

  startService(customBlockedApps: string[], durationMs: number, isStrict?: boolean): Promise<string>;
  stopService(): Promise<string>;
  getActiveSession(): ActiveSessionInfo;
  getPendingCompletedSession(): Promise<CompletedSessionInfo>;
  clearCompletedSession(): Promise<void>;
  claimCompletedSession(): Promise<CompletedSessionInfo>;
  goHome(): void;

  getInstalledApps(): Promise<AppInfo[]>;
  updateGlobalBlocklist(apps: string[]): void;
  scheduleRoutineAlarm(
    routineId: number,
    triggerAtMillis: number,
    durationMs: number,
    isStrict: boolean,
    blockedApps: string[],
    daysOfWeek: string,
    startTime: string,
    endTime: string
  ): void;
  cancelRoutineAlarm(routineId: number): void;
  showTimePicker(initialHour: number, initialMinute: number, is24Hour?: boolean): Promise<TimePickerResult>;
}

export default requireNativeModule<FocusBlockerModule>('FocusBlocker');
