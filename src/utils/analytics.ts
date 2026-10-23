import Aptabase, { trackEvent, trackError } from "@aptabase/react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AnalyticsEvents = {
  app_started: undefined;
  onboarding_completed: undefined;
  session_started: { duration_minutes: number; is_strict?: boolean };
  session_completed: { duration_minutes: number };
  session_cancelled: { elapsed_minutes: number; reason?: string };
  routine_created: { has_repeat?: boolean };
  theme_unlocked: { theme_id: string };
};

let isInitialized = false;

let isAnalyticsEnabled = true;

export async function setAnalyticsEnabled(enabled: boolean) {
  isAnalyticsEnabled = enabled;
  await AsyncStorage.setItem("analytics_enabled", enabled ? "true" : "false");
}

export async function getAnalyticsEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem("analytics_enabled");
  if (val !== null) {
    isAnalyticsEnabled = val === "true";
  }
  return isAnalyticsEnabled;
}

export function initAnalytics() {
  if (isInitialized) return;

  getAnalyticsEnabled();

  const appKey = process.env.EXPO_PUBLIC_APTABASE_APP_KEY;
  if (!appKey) {
    if (__DEV__) {
      console.log("Analytics: No EXPO_PUBLIC_APTABASE_APP_KEY found in environment.");
    }
    return;
  }

  const appVersion = Constants.expoConfig?.version ?? "1.3.0";

  Aptabase.init(appKey, {
    appVersion,
  });

  isInitialized = true;
}

export const analytics = {
  track<T extends keyof AnalyticsEvents>(
    event: T,
    ...[properties]: AnalyticsEvents[T] extends undefined ? [] : [AnalyticsEvents[T]]
  ) {
    if (!isAnalyticsEnabled) return;

    if (__DEV__) {
      console.log(`Analytics: Tracked: "${event}"`, properties ?? {});
    }

    if (!isInitialized) return;

    try {
      trackEvent(event, properties as Record<string, string | number>);
    } catch {

    }
  },

  error(error: unknown) {
    if (!isAnalyticsEnabled) return;

    if (__DEV__) {
      console.warn("Analytics: Handled error:", error);
    }

    if (!isInitialized) return;

    try {
      trackError(error);
    } catch {

    }
  },
};
