import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { useAutoUpdateCheck } from "@/hooks/useAutoUpdateCheck";
import { migrateDbIfNeeded } from "@/store/database";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { Inter_400Regular, Inter_900Black } from "@expo-google-fonts/inter";
import "../global.css";

interface TextWithDefaultProps extends Function {
  defaultProps?: { allowFontScaling?: boolean; style?: any };
}
const TextOverride = (Text as unknown) as TextWithDefaultProps;
TextOverride.defaultProps = TextOverride.defaultProps || {};
TextOverride.defaultProps.allowFontScaling = false;
TextOverride.defaultProps.style = { includeFontPadding: false };

const TextInputOverride = (TextInput as unknown) as TextWithDefaultProps;
TextInputOverride.defaultProps = TextInputOverride.defaultProps || {};
TextInputOverride.defaultProps.allowFontScaling = false;
TextInputOverride.defaultProps.style = { includeFontPadding: false };

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useAutoUpdateCheck();
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    Inter_400Regular,
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

            <Stack.Screen
              name="day-details"
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
