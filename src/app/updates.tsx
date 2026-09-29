import { useTheme } from "@/contexts/ThemeContext";
import { useAppUpdate } from "@/hooks/useAppUpdater";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpdatesScreen() {
    const { activeStyle, colors } = useTheme();
    const { isChecking, checkForUpdates } = useAppUpdate();

    const [isFetchingRelease, setIsFetchingRelease] = useState(false);

    const handleFullUpdate = async () => {
        try {
            setIsFetchingRelease(true);
            const response = await fetch("https://api.github.com/repos/shubGupta10/focus-app/releases/latest");
            const data = await response.json();

            // Find the .apk file in the release assets
            const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));

            if (apkAsset && apkAsset.browser_download_url) {
                // Instantly start downloading the APK!
                Linking.openURL(apkAsset.browser_download_url);
            } else {
                // Fallback to the releases page if no APK is found
                Linking.openURL("https://github.com/shubGupta10/focus-app/releases");
            }
        } catch (error) {
            // Fallback to the releases page if the network request fails
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
                                    <ActivityIndicator
                                        color="#3b82f6"
                                        size="small"
                                        style={{ marginRight: 12 }}
                                    />
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
                                    <ActivityIndicator
                                        color="#10b981"
                                        size="small"
                                        style={{ marginRight: 12 }}
                                    />
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
