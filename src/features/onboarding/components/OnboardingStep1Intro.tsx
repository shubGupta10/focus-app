import Ionicons from "@expo/vector-icons/Ionicons";
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
                <Text className="text-text text-4xl font-black tracking-tight mb-3">
                    Welcome to Lockout
                </Text>
                <Text className="text-textSecondary text-base leading-relaxed mb-10">
                    Put up a wall between you and your distractions so you can stay locked into what matters.
                </Text>

                <View className="space-y-6">
                    <View className="flex-row items-start mb-6">
                        <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-4 mt-0.5">
                            <Ionicons name="hourglass-outline" size={22} color={colors.accent} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-text font-bold text-lg mb-1">Timed Focus & Strict Mode</Text>
                            <Text className="text-textSecondary text-sm leading-relaxed">
                                Set a quick countdown or free-flow stopwatch. Turn on Strict Mode when you need zero loopholes.
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start mb-6">
                        <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-4 mt-0.5">
                            <Ionicons name="shield-checkmark-outline" size={22} color={colors.accent} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-text font-bold text-lg mb-1">Instant App Shield</Text>
                            <Text className="text-textSecondary text-sm leading-relaxed">
                                The moment you habitually open a distracting app, Lockout steps in and sends you back to focus.
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-start">
                        <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-4 mt-0.5">
                            <Ionicons name="finger-print-outline" size={22} color={colors.accent} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-text font-bold text-lg mb-1">100% Offline & Private</Text>
                            <Text className="text-textSecondary text-sm leading-relaxed">
                                No sign-up, no ads, and no tracking. Your focus history and guarded apps stay private on your phone.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <Pressable
                onPress={onNext}
                className="bg-accent py-4 rounded-full items-center justify-center active:opacity-90 mt-4"
                accessibilityRole="button"
                accessibilityLabel="Get Started"
            >
                <Text className="text-accentForeground font-bold text-[15px] tracking-wide">
                    Get Started
                </Text>
            </Pressable>
        </View>
    );
}
