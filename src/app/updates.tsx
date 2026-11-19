import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppUpdate } from "@/hooks/useAppUpdater";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { GlobalLoader } from "@/components/GlobalLoader";
import { SafeAreaView } from "react-native-safe-area-context";
import { isNewerVersion } from "@/utils/versionUtils";

export default function UpdatesScreen() {
    const { activeStyle, colors } = useTheme();
    const { isChecking, checkForUpdates } = useAppUpdate();
    const [hasOTAUpdateAvailable, setHasOTAUpdateAvailable] = useState(false);
    const [hasFullUpdateAvailable, setHasFullUpdateAvailable] = useState(false);
    const [latestVersionTag, setLatestVersionTag] = useState<string | null>(null);
    const [isFetchingRelease, setIsFetchingRelease] = useState(false);
    const currentVersion = Constants.expoConfig?.version ?? "1.0.0";

    const checkOTAUpdateAvailable = async () => {
        if (__DEV__ || !Updates.isEnabled) return;
        try {
            const checkUpdate = await Updates.checkForUpdateAsync();
            setHasOTAUpdateAvailable(Boolean(checkUpdate.isAvailable));
        } catch (error) {
            setHasOTAUpdateAvailable(false);
        }
    };

    const checkFullUpdateAvailable = async () => {
        try {
            const response = await fetch("https://api.github.com/repos/shubGupta10/focus-app/releases/latest");
            if (!response.ok) {
                setHasFullUpdateAvailable(false);
                return;
            }
            const data = await response.json();
            if (data.tag_name && isNewerVersion(data.tag_name, currentVersion)) {
                setHasFullUpdateAvailable(true);
                setLatestVersionTag(data.tag_name);
            } else {
                setHasFullUpdateAvailable(false);
            }
        } catch (error) {
            setHasFullUpdateAvailable(false);
        }
    };

    useEffect(() => {
        checkOTAUpdateAvailable();
        checkFullUpdateAvailable();
    }, []);

    const handleFullUpdate = async () => {
        if (isFetchingRelease) return;
        try {
            setIsFetchingRelease(true);
            const response = await fetch("https://api.github.com/repos/shubGupta10/focus-app/releases/latest");
            if (!response.ok) {
                Linking.openURL("https://github.com/shubGupta10/focus-app/releases");
                return;
            }
            const data = await response.json();
            const remoteTag = data.tag_name;

            if (!remoteTag || !isNewerVersion(remoteTag, currentVersion)) {
                Alert.alert("Up to Date", `You already have the latest version installed (v${currentVersion}).`);
                return;
            }

            const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));
            if (apkAsset && apkAsset.browser_download_url) {
                Linking.openURL(apkAsset.browser_download_url);
            } else {
                Linking.openURL("https://github.com/shubGupta10/focus-app/releases/latest");
            }
        } catch (error) {
            Linking.openURL("https://github.com/shubGupta10/focus-app/releases");
        } finally {
            setIsFetchingRelease(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
            <View className="flex-row items-center px-6 pt-5 pb-3">
                <AnimatedPressable
                    onPress={() => router.back()}
                    scaleTo={0.88}
                    hapticMode="light"
                    className="mr-4 w-10 h-10 rounded-full bg-surfaceElevated border border-border items-center justify-center shadow-sm"
                    style={{ elevation: 2 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="chevron-back" size={20} color={colors.text} />
                </AnimatedPressable>
                <Text className="text-text text-3xl font-black tracking-tight">App Updates</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                <View className="flex-row items-center justify-between bg-surfaceElevated border border-border rounded-2xl px-4 py-3 mb-6">
                    <View className="flex-row items-center">
                        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider">Installed Version</Text>
                    </View>
                    <View className="bg-surface px-2.5 py-1 rounded-full border border-border">
                        <Text className="text-text font-bold text-xs">v{currentVersion}</Text>
                    </View>
                </View>

                <Text className="text-textSecondary text-sm leading-relaxed mb-6 font-medium">
                    Keep your app running smoothly with the latest features, improvements, and fixes.
                </Text>

                <View
                    className="bg-surfaceElevated rounded-3xl overflow-hidden border border-border mb-6 shadow-sm"
                    style={{
                        elevation: 2,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.06,
                        shadowRadius: 10,
                    }}
                >
                    <Pressable
                        onPress={checkForUpdates}
                        disabled={isChecking}
                        className="p-5 border-b border-border active:bg-surface"
                    >
                        <View className="flex-row items-center justify-between mb-1.5">
                            <View className="flex-row items-center flex-1 mr-2">
                                {isChecking ? (
                                    <View style={{ marginRight: 12 }}>
                                        <GlobalLoader color={colors.accent} size="small" />
                                    </View>
                                ) : (
                                    <Ionicons
                                        name="cloud-download-outline"
                                        size={22}
                                        color={colors.accent}
                                        style={{ marginRight: 12 }}
                                    />
                                )}
                                <Text className="text-text font-bold text-base">
                                    {isChecking ? "Checking for updates..." : "Quick Update"}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                {hasOTAUpdateAvailable && (
                                    <View className="bg-accent px-2 py-0.5 rounded-full mr-2">
                                        <Text className="text-accentForeground text-[10px] font-bold">Update Ready</Text>
                                    </View>
                                )}
                                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                            </View>
                        </View>
                        <Text className="text-textSecondary text-xs leading-relaxed ml-9">
                            Applies the latest interface improvements and fixes instantly without reinstalling.
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={handleFullUpdate}
                        disabled={isFetchingRelease}
                        className="p-5 active:bg-surface"
                    >
                        <View className="flex-row items-center justify-between mb-1.5">
                            <View className="flex-row items-center flex-1 mr-2">
                                {isFetchingRelease ? (
                                    <View style={{ marginRight: 12 }}>
                                        <GlobalLoader color={colors.accent} size="small" />
                                    </View>
                                ) : (
                                    <Ionicons
                                        name="logo-github"
                                        size={22}
                                        color={colors.accent}
                                        style={{ marginRight: 12 }}
                                    />
                                )}
                                <Text className="text-text font-bold text-base">
                                    {isFetchingRelease ? "Finding latest release..." : "Full App Release"}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                {hasFullUpdateAvailable && latestVersionTag && (
                                    <View className="bg-accent px-2 py-0.5 rounded-full mr-2">
                                        <Text className="text-accentForeground text-[10px] font-bold">Update Available {latestVersionTag}</Text>
                                    </View>
                                )}
                                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                            </View>
                        </View>
                        <Text className="text-textSecondary text-xs leading-relaxed ml-9">
                            Download the newest standalone release directly from GitHub with all core system upgrades.
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
