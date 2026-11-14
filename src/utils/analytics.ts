import Aptabase, { trackEvent, trackError } from "@aptabase/react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AnalyticsEvents = {

  app_started: undefined;

  onboarding_step_viewed: { step: number };
  onboarding_completed: { selected_apps_count: number };

  session_started: { duration_minutes: number; is_strict?: boolean };
  session_completed: { duration_minutes: number; is_strict?: boolean; coins_earned?: number };
  session_cancelled: { elapsed_minutes: number; target_minutes?: number; is_strict?: boolean; reason?: string };

  routine_created: { days_count?: number; is_strict?: boolean; has_repeat?: boolean; };
  routine_toggled: { is_enabled: boolean };

  theme_purchased: { item_id: string; item_type: "theme" | "animation"; cost: number };
  theme_equipped: { item_id: string; item_type: "theme" | "animation" };

  feature_toggled: { feature: string; enabled: boolean };
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
      trackEvent(event, properties as Record<string, string | number | boolean>);
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



export function parseGitHubReleaseBody(body: string): string[] {
  if (!body) return [];

  return body
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("*") || line.startsWith("-"))
    .map(line => line.replace(/^[-*]\s*/, "").replace(/[*`_]/g, "").trim())
    .filter(line =>
      line.length > 0 &&
      !line.toLowerCase().includes("full changelog") &&
      !line.toLowerCase().includes("merge pull request")
    )
    .slice(0, 5);
}