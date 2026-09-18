import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface OnboardingStep1IntroProps {
    onNext: () => void;
}

export function OnboardingStep1Intro({ onNext }: OnboardingStep1IntroProps) {
    const { colors } = useTheme();

    return (
        <View className="flex-1 px-6 justify-between py-6">
            <View className="flex-1 justify-center">
                <View className="w-14 h-14 rounded-2xl bg-accent/15 items-center justify-center mb-6">
                    <Ionicons name="shield-checkmark" size={28} color={colors.accent} />
                </View>
                <Text className="text-text text-4xl font-black tracking-tight mb-3">
                    Welcome to Lockout
                </Text>
                <Text className="text-textSecondary text-base leading-relaxed mb-10">
                    Intentional focus, zero distractions. Reclaim your attention through deliberate app guarding.
                </Text>

                <View className="space-y-6">
                    <View className="flex-row items-start mb-6">
                        <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-4 mt-0.5">
                            <Ionicons name="hourglass-outline" size={22} color={colors.accent} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-text font-bold text-lg mb-1">Calm Sessions</Text>
                            <Text className="text-textSecondary text-sm leading-relaxed">
                                Choose preset or custom timers with an optional Strict Mode to curb impulsive phone unlocks.
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start mb-6">
                        <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-4 mt-0.5">
                            <Ionicons name="lock-closed-outline" size={22} color={colors.accent} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-text font-bold text-lg mb-1">System-Level Guard</Text>
                            <Text className="text-textSecondary text-sm leading-relaxed">
                                Distracting apps are gently intercepted the moment you attempt to open them.
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start">
                        <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-4 mt-0.5">
                            <Ionicons name="finger-print-outline" size={22} color={colors.accent} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-text font-bold text-lg mb-1">100% Private & Local</Text>
                            <Text className="text-textSecondary text-sm leading-relaxed">
                                No tracking, no external servers, and no user accounts. Your data never leaves your device.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <Pressable
                onPress={onNext}
                className="bg-accent py-4 rounded-2xl items-center justify-center active:opacity-90 mt-4"
                accessibilityRole="button"
                accessibilityLabel="Get Started"
            >
                <Text className="text-accentForeground font-black text-sm tracking-wider uppercase">
                    Get Started
                </Text>
            </Pressable>
        </View>
    );
}
