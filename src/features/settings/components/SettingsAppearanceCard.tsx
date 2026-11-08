import { Material3Switch } from "@/components/Material3Switch";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";

export function SettingsAppearanceCard() {
    const {
        themeMode,
        setThemeMode,
        colors,
        useDynamicTheme,
        setUseDynamicTheme,
        isDynamicColorSupported,
    } = useTheme();

    const handleDynamicToggle = (val: boolean) => {
        setUseDynamicTheme(val);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    };

    return (
        <View className="px-6 mt-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Appearance
            </Text>

            <View
                className="bg-surfaceElevated border border-border rounded-3xl overflow-hidden p-5"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 10,
                }}
            >
                <View className="mb-4">
                    <Text className="text-text font-bold text-[16px] mb-1">Theme</Text>
                    <Text className="text-textSecondary text-sm leading-5">
                        Choose how Lockout looks.
                    </Text>
                </View>

                <View className="flex-row bg-surface rounded-2xl p-1">
                    {(["system", "light", "dark"] as const).map((mode) => {
                        const isActive = themeMode === mode;
                        const iconName =
                            mode === "system" ? "settings-outline" :
                                mode === "light" ? "sunny-outline" : "moon-outline";
                        const label = mode.charAt(0).toUpperCase() + mode.slice(1);

                        return (
                            <Pressable
                                key={mode}
                                onPress={() => setThemeMode(mode)}
                                className={`flex-1 py-2.5 flex-row items-center justify-center rounded-xl ${isActive ? "bg-accent" : "bg-transparent"
                                    }`}
                            >
                                <Ionicons
                                    name={iconName}
                                    size={16}
                                    color={isActive ? "#ffffff" : colors.textSecondary}
                                    style={{ marginRight: 6 }}
                                />
                                <Text
                                    className={`text-sm font-medium ${isActive ? "text-white" : "text-textSecondary"
                                        }`}
                                >
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                <View className="h-[1px] bg-border my-4" />

                <Pressable
                    onPress={() => isDynamicColorSupported && handleDynamicToggle(!useDynamicTheme)}
                    className={`flex-row items-center justify-between ${isDynamicColorSupported ? "active:opacity-80" : "opacity-60"
                        }`}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: useDynamicTheme, disabled: !isDynamicColorSupported }}
                    accessibilityLabel="Toggle Dynamic Colors (Material You)"
                    disabled={!isDynamicColorSupported}
                >
                    <View className="flex-1 pr-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-text font-bold text-[16px]">
                                Dynamic Colors
                            </Text>
                            <View className="bg-accent/15 px-2 py-0.5 rounded-full">
                            </View>
                        </View>
                        <Text className="text-textSecondary text-sm leading-5">
                            {isDynamicColorSupported
                                ? "Match app colors with your phone's active wallpaper & palette."
                                : "Requires Android 12 or newer."}
                        </Text>
                    </View>
                    <Material3Switch
                        value={useDynamicTheme}
                        onValueChange={handleDynamicToggle}
                        disabled={!isDynamicColorSupported}
                    />
                </Pressable>
            </View>
        </View>
    );
}
