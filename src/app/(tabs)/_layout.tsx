import { ThemeColors, useTheme } from "@/contexts/ThemeContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({
    focused,
    name,
    outlineName,
    badgeCount,
    colors,
}: {
    focused: boolean;
    name: keyof typeof Ionicons.glyphMap;
    outlineName: keyof typeof Ionicons.glyphMap;
    badgeCount?: number;
    colors: ThemeColors;
}) {
    return (
        <View className="items-center justify-center">
            <Ionicons
                name={focused ? name : outlineName}
                size={22}
                color={focused ? colors.accent : colors.textSecondary}
            />
            {badgeCount !== undefined && badgeCount > 0 && (
                <View
                    className="absolute top-0 right-[-6px] w-2 h-2 rounded-full border-[1.5px]"
                    style={{
                        backgroundColor: colors.warning,
                        borderColor: colors.surfaceElevated,
                    }}
                />
            )}
        </View>
    );
}

export default function TabLayout() {
    const engine = useFocusEngine(true);
    const { colors, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    position: "absolute",
                    bottom: insets.bottom + 16,
                    left: 0,
                    right: 0,
                    marginHorizontal: 32,
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: colors.border,
                    height: 72,
                    paddingTop: 8,
                    paddingBottom: 8,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode ? 0.2 : 0.05,
                    shadowRadius: 12,
                },
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                    letterSpacing: 0.2,
                    marginTop: 4,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarItemStyle: {
                    alignItems: "center",
                    justifyContent: "center",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarAccessibilityLabel: "Home tab",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            name="home"
                            outlineName="home-outline"
                            colors={colors}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="routines"
                options={{
                    title: "Routines",
                    tabBarAccessibilityLabel: "Routines tab",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            name="calendar"
                            outlineName="calendar-outline"
                            colors={colors}
                        />
                    )
                }}
            />

            <Tabs.Screen
                name="apps"
                options={{
                    title: "Apps",
                    tabBarAccessibilityLabel: "Apps tab",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            name="apps"
                            outlineName="apps-outline"
                            badgeCount={engine.selectedApps.length === 0 ? 1 : undefined}
                            colors={colors}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="progress"
                options={{
                    title: "Progress",
                    tabBarAccessibilityLabel: "Progress tab",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            name="bar-chart"
                            outlineName="bar-chart-outline"
                            colors={colors}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}