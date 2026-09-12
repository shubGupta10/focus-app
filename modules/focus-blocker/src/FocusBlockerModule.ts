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

export declare class FocusBlockerModule {
  hasUsagePermission(): boolean;
  requestUsagePermission(): void;
  hasOverlayPermission(): boolean;
  requestOverlayPermission(): void;
  hasBatteryPermission(): boolean;
  requestBatteryPermission(): void;

  startService(customBlockedApps: string[], durationMs: number, isStrict?: boolean): Promise<string>;
  stopService(): Promise<string>;
  getActiveSession(): ActiveSessionInfo;
  goHome(): void;

  getInstalledApps(): Promise<AppInfo[]>;
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
