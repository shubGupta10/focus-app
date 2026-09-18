import { useTheme } from "@/contexts/ThemeContext";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingController } from "../features/onboarding/hooks/useOnboardingController";
import { OnboardingStep1Intro } from "../features/onboarding/components/OnboardingStep1Intro";
import { OnboardingStep2Apps } from "../features/onboarding/components/OnboardingStep2Apps";
import { OnboardingStep3Permissions } from "../features/onboarding/components/OnboardingStep3Permissions";

export default function OnboardingScreen() {
    const { activeStyle } = useTheme();
    const {
        engine,
        step,
        setStep,
        searchQuery,
        setSearchQuery,
        selectedSet,
        filteredApps,
        toggleAppSelection,
        handleSaveAppsAndContinue,
        handleCompleteOnboarding,
        allPermissionsGranted
    } = useOnboardingController();

    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <View
                            key={s}
                            className={`h-1.5 rounded-full ${s === step
                                ? "w-8 bg-accent"
                                : s < step
                                    ? "w-4 bg-accent/40"
                                    : "w-4 bg-surface border border-border"
                                }`}
                        />
                    ))}
                </View>
                {step < 3 && (
                    <Pressable
                        onPress={handleCompleteOnboarding}
                        className="py-1 px-3 active:opacity-60"
                        accessibilityRole="button"
                        accessibilityLabel="Skip onboarding"
                    >
                        <Text className="text-textSecondary text-xs font-bold tracking-wider uppercase">
                            Skip
                        </Text>
                    </Pressable>
                )}
            </View>

            {step === 1 && (
                <OnboardingStep1Intro onNext={() => setStep(2)} />
            )}

            {step === 2 && (
                <OnboardingStep2Apps
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedSetSize={selectedSet.size}
                    installedAppsLength={engine.installedApps.length}
                    filteredApps={filteredApps}
                    selectedSet={selectedSet}
                    toggleAppSelection={toggleAppSelection}
                    onSkip={() => setStep(3)}
                    onContinue={handleSaveAppsAndContinue}
                />
            )}

            {step === 3 && (
                <OnboardingStep3Permissions
                    hasUsage={engine.hasUsage}
                    hasOverlay={engine.hasOverlay}
                    hasBattery={engine.hasBattery}
                    allPermissionsGranted={allPermissionsGranted}
                    onComplete={handleCompleteOnboarding}
                />
            )}
        </SafeAreaView>
    );
}
