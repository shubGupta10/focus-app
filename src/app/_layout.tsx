import { migrateDbIfNeeded } from "@/store/database";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import "../global.css";

export default function Layout() {
  return (
    <SQLiteProvider databaseName="focus.db" onInit={migrateDbIfNeeded}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </SQLiteProvider>
  );
}
