import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { migrateDbIfNeeded } from "@/store/database";
import { Inter_400Regular, Inter_900Black } from "@expo-google-fonts/inter";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect } from "react";
import { Text, TextInput, Alert } from "react-native";
import "../global.css";
import * as Updates from "expo-updates"


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



function Layout() {
  const { isUpdatePending } = Updates.useUpdates();

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
            <Stack screenOptions={{
              headerShown: false,
              animation: 'default',
              contentStyle: {
                backgroundColor: "#161517"
              }
            }}
            >
              <Stack.Screen name="(tabs)" />

              <Stack.Screen
                name="onboarding"
              />

              <Stack.Screen
                name="shop"
                options={{
                  presentation: "modal"
                }}
              />

              <Stack.Screen
                name="settings"
                options={{
                  presentation: "modal"
                }}
              />

              <Stack.Screen name="day-details" />

              <Stack.Screen name="notifications" />

              <Stack.Screen name="shop-animations" />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </SQLiteProvider>
    </ErrorBoundary>
  );
}

export default Layout;
