import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export function SettingsAppearanceCard() {
    const { themeMode, setThemeMode, colors } = useTheme();

    return (
        <View className="px-6 mt-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Appearance
            </Text>

            <View className="bg-surfaceElevated rounded-3xl overflow-hidden p-5">
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
            </View>
        </View>
    );
}
