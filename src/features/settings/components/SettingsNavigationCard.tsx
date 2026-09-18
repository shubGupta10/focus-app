import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function SettingsNavigationCard() {
    return (
        <View className="mx-6 mt-4 bg-surfaceElevated rounded-2xl p-5 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
                <Text className="text-text font-bold text-lg mb-1">Onboarding Guide</Text>
                <Text className="text-textSecondary text-sm leading-5">
                    Review how Lockout works and learn about intentional focus.
                </Text>
            </View>
            <Pressable
                onPress={() => router.push("/onboarding")}
                className="bg-surface px-3.5 py-2 rounded-xl active:opacity-75"
            >
                <Text className="text-text font-bold text-xs uppercase tracking-wider">
                    Revisit
                </Text>
            </Pressable>
        </View>
    );
}
