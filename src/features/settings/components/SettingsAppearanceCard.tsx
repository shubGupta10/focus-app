import { Material3Switch } from "@/components/Material3Switch";
import { useTheme } from "@/contexts/ThemeContext";
import { Text, View } from "react-native";

export function SettingsAppearanceCard() {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <View className="px-6 mt-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Appearance
            </Text>

            <View className="bg-surfaceElevated rounded-3xl overflow-hidden">
                <View className="flex-row items-center justify-between p-5">
                    <View className="flex-1 pr-4">
                        <Text className="text-text font-bold text-[16px] mb-1">Dark Mode</Text>
                        <Text className="text-textSecondary text-sm leading-5">
                            Switch between dark and light appearance.
                        </Text>
                    </View>
                    <View pointerEvents="none">
                        <Material3Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                        />
                    </View>
                </View>
            </View>

            {/* <View className="bg-surfaceElevated rounded-2xl p-5 mb-6 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                    <Text className="text-text font-bold text-lg mb-1">Dynamic Colors</Text>
                    <Text className="text-textSecondary text-sm leading-5">
                        Use Material You to match the app's theme to your Android wallpaper.
                    </Text>
                </View>
                <Material3Switch
                    value={isMaterialYou}
                    onValueChange={setIsMaterialYou}
                />
            </View> */}
        </View>
    );
}
