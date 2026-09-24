import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { migrateDbIfNeeded } from "@/store/database";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect } from "react";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
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
    <SQLiteProvider
      databaseName="focus.db"
      onInit={migrateDbIfNeeded}
    >
      <ThemeProvider>
        <ToastProvider>
          <Stack screenOptions={{
            headerShown: false,
            animation: 'none'
          }}
          >
            <Stack.Screen name="(tabs)" />

            <Stack.Screen
              name="onboarding"
              options={{
                animation: "fade"
              }}
            />

            <Stack.Screen
              name="shop"
              options={{
                animation: "default"
              }}
            />

            <Stack.Screen
              name="settings"
              options={{
                animation: "default"
              }}
            />
          </Stack>
        </ToastProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
