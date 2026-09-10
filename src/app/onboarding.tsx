import { AppListItem } from "@/components/AppListItem";
import { PermissionRow } from "@/components/modals/PermissionModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useFocusEngine } from "@/hooks/useFocusEngine";
import { useSettings } from "@/hooks/useSettings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FocusBlocker from "../../modules/focus-blocker/src/FocusBlockerModule";

export default function OnboardingScreen() {
    const { colors, activeStyle } = useTheme();
    const engine = useFocusEngine();
    const { setSetting } = useSettings();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());

    const filteredApps = useMemo(() => {
        if (!searchQuery.trim()) {
            return engine.installedApps;
        }
        const query = searchQuery.toLowerCase();
        return engine.installedApps.filter((app) =>
            app.name.toLowerCase().includes(query) ||
            app.packageName.toLowerCase().includes(query)
        );
    }, [engine.installedApps, searchQuery]);

    const toggleAppSelection = (packageName: string) => {
        setSelectedSet((prev) => {
            const next = new Set(prev);
            if (next.has(packageName)) {
                next.delete(packageName);
            } else {
                next.add(packageName);
            }
            return next;
        });
    };

    const handleSaveAppsAndContinue = async () => {
        for (const pkg of selectedSet) {
            if (!engine.selectedApps.includes(pkg)) {
                await engine.toggleApp(pkg);
            }
        }
        setStep(3);
    };

    const handleCompleteOnboarding = async () => {
        await setSetting("has_completed_onboarding", "true");
        router.replace("/(tabs)");
    };

    const allPermissionsGranted = engine.hasUsage && engine.hasOverlay && engine.hasBattery;

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
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
                        onPress={() => setStep(2)}
                        className="bg-accent py-4 rounded-2xl items-center justify-center active:opacity-90 mt-4"
                        accessibilityRole="button"
                        accessibilityLabel="Get Started"
                    >
                        <Text className="text-accentForeground font-black text-sm tracking-wider uppercase">
                            Get Started
                        </Text>
                    </Pressable>
                </View>
            )}

            {step === 2 && (
                <View className="flex-1 px-6 pt-2 pb-6 justify-between">
                    <View className="flex-1">
                        <Text className="text-text text-3xl font-black tracking-tight mb-2">
                            Guard Distractions
                        </Text>
                        <Text className="text-textSecondary text-sm leading-5 mb-4">
                            Select the apps that pull you away during work or study. You can change these anytime.
                        </Text>

                        <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 py-2 mb-3">
                            <Ionicons name="search" size={18} color={colors.textSecondary} />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search apps..."
                                placeholderTextColor={colors.textSecondary}
                                className="flex-1 text-text ml-2 text-sm py-1 font-medium"
                            />
                            {searchQuery.length > 0 && (
                                <Pressable onPress={() => setSearchQuery("")}>
                                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                                </Pressable>
                            )}
                        </View>

                        <View className="flex-row items-center justify-between mb-3 px-1">
                            <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider">
                                Installed Applications
                            </Text>
                            <Text className="text-accent text-xs font-bold">
                                {selectedSet.size} selected
                            </Text>
                        </View>

                        {engine.installedApps.length === 0 ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator color={colors.accent} size="small" />
                            </View>
                        ) : (
                            <FlatList
                                data={filteredApps}
                                keyExtractor={(item) => item.packageName}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 16 }}
                                renderItem={({ item }) => (
                                    <AppListItem
                                        app={item}
                                        isSelected={selectedSet.has(item.packageName)}
                                        onToggle={toggleAppSelection}
                                    />
                                )}
                            />
                        )}
                    </View>

                    <View className="pt-3 flex-row gap-3">
                        <Pressable
                            onPress={() => setStep(3)}
                            className="flex-1 bg-surface border border-border py-4 rounded-2xl items-center justify-center active:opacity-80"
                        >
                            <Text className="text-textSecondary font-bold text-sm tracking-wider uppercase">
                                Skip Selection
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSaveAppsAndContinue}
                            className="flex-1 bg-accent py-4 rounded-2xl items-center justify-center active:opacity-90"
                        >
                            <Text className="text-accentForeground font-black text-sm tracking-wider uppercase">
                                Continue
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {step === 3 && (
                <View className="flex-1 px-6 justify-between py-6">
                    <View className="flex-1 justify-center">
                        <View className="w-14 h-14 rounded-2xl bg-accent/15 items-center justify-center mb-6">
                            <Ionicons name="options-outline" size={28} color={colors.accent} />
                        </View>
                        <Text className="text-text text-3xl font-black tracking-tight mb-2">
                            Enable Focus Engine
                        </Text>
                        <Text className="text-textSecondary text-sm leading-relaxed mb-8">
                            Android requires these system capabilities so Lockout can detect distractions and present the blocking guard.
                        </Text>

                        <View className="gap-3">
                            <PermissionRow
                                label="1. Usage Access"
                                description="To know when you open a distracting app"
                                isGranted={engine.hasUsage}
                                onRequest={() => FocusBlocker.requestUsagePermission()}
                                accessibilityLabel="Usage Access permission"
                                accessibilityHint="Opens system settings to grant usage access"
                            />

                            <PermissionRow
                                label="2. Display Over Apps"
                                description="To show the block screen over apps"
                                isGranted={engine.hasOverlay}
                                onRequest={() => FocusBlocker.requestOverlayPermission()}
                                accessibilityLabel="Display Over Apps permission"
                                accessibilityHint="Opens system settings to grant overlay permission"
                            />
                            <PermissionRow
                                label="3. Ignore Battery"
                                description="To keep background blocking alive"
                                isGranted={engine.hasBattery}
                                onRequest={() => FocusBlocker.requestBatteryPermission()}
                                accessibilityLabel="Ignore Battery Optimization permission"
                                accessibilityHint="Opens system settings to disable battery optimization"
                            />
                        </View>
                    </View>

                    <Pressable
                        onPress={handleCompleteOnboarding}
                        className="bg-accent py-4 rounded-2xl items-center justify-center active:opacity-90 mt-4"
                        accessibilityRole="button"
                        accessibilityLabel="Finish and Start Focusing"
                    >
                        <Text className="text-accentForeground font-black text-sm tracking-wider uppercase">
                            {allPermissionsGranted ? "Start Focusing" : "Complete Setup"}
                        </Text>
                    </Pressable>
                </View>
            )}
        </SafeAreaView>
    );
}
