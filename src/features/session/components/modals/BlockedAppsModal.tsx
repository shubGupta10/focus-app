import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppStore } from "@/store/useAppStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useMemo } from "react";
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BlockedAppsModalProps {
    visible: boolean;
    onClose: () => void;
    isStrict?: boolean;
}

export function BlockedAppsModal({ visible, onClose, isStrict }: BlockedAppsModalProps) {
    const { colors, isDarkMode, activeStyle } = useTheme();
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const installedApps = useAppStore(state => state.installedApps);
    const selectedApps = useAppStore(state => state.selectedApps);

    const blockedApps = useMemo(() => {
        return installedApps.filter(app => selectedApps.includes(app.packageName));
    }, [installedApps, selectedApps]);

    if (!visible) return null;

    const listMaxHeight = Math.min(Math.max(height * 0.54, 340), 460);

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <BlurView
                intensity={isDarkMode ? 25 : 45}
                tint={isDarkMode ? "dark" : "light"}
                style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    backgroundColor: colors.scrim,
                }}
            >
                <Pressable style={{ flex: 1 }} onPress={onClose} />

                <View
                    className="bg-surfaceElevated rounded-t-[32px] border-t border-border px-6 pt-3"
                    style={[{ paddingBottom: Math.max(insets.bottom + 16, 24) }, activeStyle]}
                >
                    <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />

                    <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-2xl bg-accentMuted items-center justify-center">
                                <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
                            </View>

                            <View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-text text-lg font-black tracking-tight">
                                        Blocked Apps
                                    </Text>
                                    <View className="bg-surface px-2 py-0.5 rounded-full border border-border">
                                        <Text className="text-textSecondary text-[11px] font-bold">
                                            {blockedApps.length}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-textSecondary text-xs font-medium mt-0.5">
                                    {isStrict ? "Strict Mode · Locked until 00:00" : "Active Session · Cannot unblock while running"}
                                </Text>
                            </View>
                        </View>

                        <AnimatedPressable
                            className="w-9 h-9 rounded-full bg-surface items-center justify-center border border-border"
                            hapticMode="light"
                            scaleTo={0.88}
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close modal"
                        >
                            <Ionicons name="close" size={18} color={colors.textSecondary} />
                        </AnimatedPressable>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: listMaxHeight }}
                        className="my-1"
                        contentContainerStyle={{ paddingVertical: 4 }}
                    >
                        {blockedApps.length === 0 ? (
                            <View className="py-12 items-center justify-center">
                                <View className="w-12 h-12 rounded-2xl bg-surface items-center justify-center mb-2.5">
                                    <Ionicons name="apps-outline" size={24} color={colors.textMuted} />
                                </View>
                                <Text className="text-textSecondary text-sm font-medium">
                                    No apps are currently blocked
                                </Text>
                            </View>
                        ) : (
                            blockedApps.map(app => (
                                <View
                                    key={app.packageName}
                                    className="flex-row items-center justify-between py-2.5 px-3.5 mb-2 bg-surface rounded-2xl"
                                >
                                    <View className="flex-row items-center flex-1 mr-3">
                                        {app.icon ? (
                                            <Image
                                                source={{ uri: `data:image/png;base64,${app.icon}` }}
                                                style={{ width: 34, height: 34, borderRadius: 10, marginRight: 12 }}
                                            />
                                        ) : (
                                            <View className="w-[34px] h-[34px] rounded-xl bg-surfaceElevated items-center justify-center mr-3">
                                                <Ionicons name="apps" size={16} color={colors.textMuted} />
                                            </View>
                                        )}

                                        <Text className="text-text font-bold text-[14px] flex-1" numberOfLines={1}>
                                            {app.name}
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center bg-accentMuted px-2 py-0.5 rounded-full">
                                        <Ionicons name="lock-closed" size={10} color={colors.accent} style={{ marginRight: 3 }} />
                                        <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">
                                            Blocked
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <AnimatedPressable
                        onPress={onClose}
                        hapticMode="medium"
                        scaleTo={0.97}
                        className="w-full bg-accent py-3.5 rounded-2xl items-center justify-center mt-3 shadow-sm"
                    >
                        <Text className="text-accentForeground font-bold text-sm tracking-wider uppercase">
                            Back to Focus
                        </Text>
                    </AnimatedPressable>
                </View>
            </BlurView>
        </Modal>
    );
}