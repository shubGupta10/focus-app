import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { migrateDbIfNeeded } from "@/store/database";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { Stack, DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect } from "react";
import { Alert } from "react-native";
import "../global.css";
import * as Updates from "expo-updates";
import { initAnalytics, analytics } from "@/utils/analytics";
import { configureTextDefaults } from "@/utils/configureTextDefaults";
import { ObserveRoot } from "expo-observe";

initAnalytics();
configureTextDefaults();

SplashScreen.preventAutoHideAsync();


function RootNavigator() {
  const { colors, isDarkMode } = useTheme();

  const navTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surfaceElevated,
      border: colors.border,
      text: colors.text,
    },
  };

  return (
    <NavThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "default",
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="shop"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen name="day-details" />
        <Stack.Screen name="notifications" />
      </Stack>
    </NavThemeProvider>
  );
}

function Layout() {
  const { isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    analytics.track("app_started");
  }, [])

  useEffect(() => {
    if (__DEV__) return;

    if (isUpdatePending) {
      Alert.alert(
        "Update Ready",
        "A new update has been downloaded. Restart the app to apply changes",
        [
          { text: "Later", style: "cancel" },
          { text: "Restart Now", onPress: () => Updates.reloadAsync() }
        ]
      )
    }
  }, [isUpdatePending])

  useEffect(() => {
    if (__DEV__) return;

    async function checkSilently() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      } catch (error) {
        //silently fails
      }
    }
    checkSilently();
  }, [])

  const [loaded, error] = useFonts({
    ...Ionicons.font,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null;
  }
  return (
    <ErrorBoundary>
      <SQLiteProvider
        databaseName="focus.db"
        onInit={migrateDbIfNeeded}
      >
        <ThemeProvider>
          <ToastProvider>
            <RootNavigator />
          </ToastProvider>
        </ThemeProvider>
      </SQLiteProvider>
    </ErrorBoundary>
  );
}

export default ObserveRoot.wrap(Layout);
