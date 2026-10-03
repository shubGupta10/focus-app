import { useTheme } from "@/contexts/ThemeContext";
import { useAppUpdate } from "@/hooks/useAppUpdater";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View, ToastAndroid } from "react-native";
import { GlobalLoader } from "@/components/GlobalLoader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpdatesScreen() {
    const { activeStyle, colors } = useTheme();
    const { isChecking, checkForUpdates } = useAppUpdate();
    const [isCheckingBackground, setIsCheckingBackground] = useState(true);
    const [hasOTAUpdateAvailable, setHasOTAUpdateAvailable] = useState(false);
    const [hasFullUpdateAvailable, setHasFullUpdateAvailable] = useState(false);

    const [isFetchingRelease, setIsFetchingRelease] = useState(false);

    const checkOTAUpdateAvailable = async () => {
        try {
            const checkUpdate = await Updates.checkForUpdateAsync();
            if (checkUpdate.isAvailable) {
                setHasOTAUpdateAvailable(true);
                ToastAndroid.show("A new OTA update is ready! Click the button to apply it.", ToastAndroid.LONG);
            } else {
                setHasOTAUpdateAvailable(false);
            }
        } catch (error) {
            console.error("Background OTA check failed:", error);
            setHasOTAUpdateAvailable(false);
        }
    }

    const checkFullUpdateAvailable = async () => {
        try {
            const currentVersion = Constants.expoConfig?.version;
            const response = await fetch("https://api.github.com/repos/shubGupta10/focus-app/releases/latest");
            const data = await response.json();

            if (data.tag_name && data.tag_name !== `v${currentVersion}`) {
                setHasFullUpdateAvailable(true);
                ToastAndroid.show(`A full app update (${data.tag_name}) is available on GitHub!`, ToastAndroid.LONG);
            } else {
                setHasFullUpdateAvailable(false);
            }
        } catch (error) {
            console.error("Background Full update check failed:", error);
            setHasFullUpdateAvailable(false);
        }
    }

    useEffect(() => {
        const runChecks = async () => {
            setIsCheckingBackground(true);
            await Promise.all([
                checkOTAUpdateAvailable(),
                checkFullUpdateAvailable()
            ]);
            setIsCheckingBackground(false);
        };
        runChecks();
    }, []);

    const handleFullUpdate = async () => {
        try {
            setIsFetchingRelease(true);
            const currentVersion = Constants.expoConfig?.version!;

            const response = await fetch("https://api.github.com/repos/shubGupta10/focus-app/releases/latest");
            const data = await response.json();

            if (data.tag_name) {
                const latestVersion = data.tag_name.replace("v", "");

                if (latestVersion === currentVersion) {
                    Alert.alert("Up to Date", "You already have the latest version installed!");
                    return;
                }
            }

            const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));

            if (apkAsset && apkAsset.browser_download_url) {

                Linking.openURL(apkAsset.browser_download_url);
            } else {

                Linking.openURL("https://github.com/shubGupta10/focus-app/releases");
            }
        } catch (error) {
            Linking.openURL("https://github.com/shubGupta10/focus-app/releases");
        } finally {
            setIsFetchingRelease(false);
        }
    };
    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <View className="flex-row items-center px-6 pt-5 pb-5 border-b border-border">
                <Pressable
                    onPress={() => router.back()}
                    className="mr-4 w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </Pressable>
                <Text className="text-text text-3xl font-black tracking-tight">App Updates</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                <Text className="text-textSecondary text-base leading-relaxed mb-6">
                    Keep your app running smoothly with the latest features and bug fixes.
                </Text>

                <View className="bg-surfaceElevated rounded-2xl overflow-hidden border border-border mb-6">
                    <Pressable
                        onPress={checkForUpdates}
                        disabled={isChecking}
                        className="p-5 border-b border-border active:bg-surface"
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center">
                                {isChecking ? (
                                    <View style={{ marginRight: 12 }}>
                                        <GlobalLoader color="#3b82f6" size="small" />
                                    </View>
                                ) : (
                                    <Ionicons
                                        name="cloud-download"
                                        size={20}
                                        color="#3b82f6"
                                        style={{ marginRight: 12 }}
                                    />
                                )}
                                <Text className="text-text font-bold text-base">
                                    {isChecking ? "Checking for updates..." : "Check for Update (OTA)"}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </View>
                        <Text className="text-textSecondary text-sm ml-8">
                            Seamlessly update the app's interface and logic over the air. No downloading required!
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={handleFullUpdate}
                        className="p-5 active:bg-surface"
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center">
                                {isFetchingRelease ? (
                                    <View style={{ marginRight: 12 }}>
                                        <GlobalLoader color="#10b981" size="small" />
                                    </View>
                                ) : (
                                    <Ionicons
                                        name="logo-github"
                                        size={20}
                                        color="#10b981"
                                        style={{ marginRight: 12 }}
                                    />
                                )}
                                <Text className="text-text font-bold text-base">
                                    {isFetchingRelease ? "Finding update..." : "Full App Update (.apk)"}
                                </Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color="#9ca3af" />
                        </View>
                        <Text className="text-textSecondary text-sm ml-8">
                            Download the latest native app directly from GitHub. Use this for major engine overhauls.
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
