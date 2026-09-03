import { requireNativeModule } from 'expo-modules-core';

export type AppInfo = {
  name: string;
  packageName: string;
};

export declare class FocusBlockerModule {
  hasUsagePermission(): boolean;
  requestUsagePermission(): void;
  hasOverlayPermission(): boolean;
  requestOverlayPermission(): void;
  hasBatteryPermission(): boolean;
  requestBatteryPermission(): void;

  startService(customBlockedApps: string[], durationMs: number): Promise<string>;
  stopService(): Promise<string>;
  goHome(): void;

  getInstalledApps(): Promise<AppInfo[]>;
}

export default requireNativeModule<FocusBlockerModule>('FocusBlocker');
