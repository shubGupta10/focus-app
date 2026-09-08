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
    isDarkMode,
}: {
    focused: boolean;
    name: keyof typeof Ionicons.glyphMap;
    outlineName: keyof typeof Ionicons.glyphMap;
    badgeCount?: number;
    colors: ThemeColors;
    isDarkMode: boolean;
}) {
    const pillBg = focused
        ? isDarkMode
            ? `${colors.accent}2E`
            : `${colors.accent}1E`
        : "transparent";

    return (
        <View className="items-center justify-center">
            <View
                style={{
                    backgroundColor: pillBg,
                    width: 60,
                    height: 32,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Ionicons
                    name={focused ? name : outlineName}
                    size={22}
                    color={focused ? colors.accent : colors.textSecondary}
                />
                {badgeCount !== undefined && badgeCount > 0 && (
                    <View
                        style={{
                            backgroundColor: colors.accent,
                            borderColor: colors.surface,
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            borderWidth: 1.5,
                            position: "absolute",
                            top: 0,
                            right: 10,
                        }}
                    />
                )}
            </View>
        </View>
    );
}

export default function TabLayout() {
    const engine = useFocusEngine();
    const { colors, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();

    const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;

    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    height: 64 + bottomPadding,
                    paddingTop: 8,
                    paddingBottom: bottomPadding,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 0.3,
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
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            name="home"
                            outlineName="home-outline"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="apps"
                options={{
                    // N1: Shortened 'Block List' → 'Apps' to prevent wrapping on 360dp screens
                    title: "Apps",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            name="apps"
                            outlineName="apps-outline"
                            // N2: Badge only when 0 apps selected (action-needed state)
                            // Showing "25" in a 9px badge is misleading — badges signal attention, not quantity
                            badgeCount={engine.selectedApps.length === 0 ? 1 : undefined}
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="progress"
                options={{
                    title: "Progress",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            name="bar-chart"
                            outlineName="bar-chart-outline"
                            colors={colors}
                            isDarkMode={isDarkMode}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}