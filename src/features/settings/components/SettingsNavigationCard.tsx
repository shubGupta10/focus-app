import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function SettingsNavigationCard() {
    return (
        <View className="px-6 mb-6">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                Guides
            </Text>
            
            <View
                className="bg-surfaceElevated border border-border rounded-3xl p-5"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 10,
                }}
            >
                <View className="mb-5">
                    <Text className="text-text font-bold text-[16px] mb-1">Onboarding Guide</Text>
                    <Text className="text-textSecondary text-sm leading-5">
                        Review how Lockout works and learn about intentional focus.
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.push("/onboarding")}
                    className="bg-accent py-3 px-6 rounded-full items-center justify-center active:opacity-80 self-end"
                >
                    <Text className="text-accentForeground font-bold text-[14px] tracking-wide">
                        Revisit Guide
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
