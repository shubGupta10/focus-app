import { ThemeColors, useTheme } from "@/contexts/ThemeContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import Ionicons from "@expo/vector-icons/Ionicons";
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
            <View
                className="w-16 h-8 items-center justify-center"
                style={{
                    backgroundColor: focused ? colors.accent : "transparent",
                    borderRadius: 16,
                }}
            >
                <Ionicons
                    name={focused ? name : outlineName}
                    size={22}
                    color={focused ? colors.accentForeground : colors.textSecondary}
                />
            </View>
            {badgeCount !== undefined && badgeCount > 0 && (
                <View
                    className="absolute top-0 right-3 w-2.5 h-2.5 rounded-full border-[1.5px]"
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
            detachInactiveScreens={false}
            screenOptions={{
                headerShown: false,
                animation: "fade",
                tabBarHideOnKeyboard: true,
                sceneStyle: {
                    backgroundColor: colors.background,
                },
                tabBarStyle: {
                    backgroundColor: colors.surfaceElevated,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: 62 + insets.bottom,
                    paddingTop: 6,
                    paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 8,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: isDarkMode ? 0.25 : 0.06,
                    shadowRadius: 8,
                },
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.2,
                    marginTop: 3,
                },
                tabBarActiveTintColor: colors.text,
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