import { ThemeProvider } from "@/contexts/ThemeContext";
import { migrateDbIfNeeded } from "@/store/database";
import { MaterialYouService, defaultPalette } from "@assembless/react-native-material-you";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import "../global.css";

export default function Layout() {
  return (
    <SQLiteProvider
      databaseName="focus.db"
      onInit={migrateDbIfNeeded}
    >
      <MaterialYouService fallbackPalette={defaultPalette}>
        <ThemeProvider>
          <Stack screenOptions={{
            headerShown: false,
            animation: 'none'
          }}
          />
        </ThemeProvider>
      </MaterialYouService>
    </SQLiteProvider>
  );
}
