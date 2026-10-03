import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function SettingsAboutCard() {
    const handleContactSupport = () => {
        Linking.openURL("mailto:support@lockoutapp.com?subject=Lockout Support");
    };

    const handleRateApp = () => {
        Linking.openURL("market://details?id=com.lockout.app").catch(() => {
            Linking.openURL("https://play.google.com/store/apps/details?id=com.lockout.app");
        });
    };

    const handlePrivacyPolicy = () => {
        Linking.openURL("https://github.com/shubGupta10/focus-app/blob/main/PRIVACY_POLICY.md");
    };

    const handleTerms = () => {
        Linking.openURL("https://lockoutapp.com/terms"); // Replace with actual URL later
    };

    return (
        <View className="px-6 mb-10">
            <Text className="text-accent font-bold text-sm tracking-widest uppercase mb-3 ml-2">
                About & Support
            </Text>

            <View className="bg-surfaceElevated rounded-3xl overflow-hidden py-2">
                <Pressable
                    onPress={() => router.push("/updates")}
                    className="flex-row items-center justify-between px-5 py-4 active:bg-black/5 dark:active:bg-white/5"
                >
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-[#3b82f6]/10 items-center justify-center mr-4">
                            <Ionicons name="cloud-download" size={16} color="#3b82f6" />
                        </View>
                        <Text className="text-text font-bold text-[16px]">
                            App Updates
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </Pressable>

                <Pressable
                    onPress={handleRateApp}
                    className="flex-row items-center justify-between px-5 py-4 active:bg-black/5 dark:active:bg-white/5"
                >
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-[#f59e0b]/10 items-center justify-center mr-4">
                            <Ionicons name="star" size={16} color="#f59e0b" />
                        </View>
                        <Text className="text-text font-bold text-[16px]">Rate the App</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </Pressable>

                <Pressable
                    onPress={handleContactSupport}
                    className="flex-row items-center justify-between px-5 py-4 active:bg-black/5 dark:active:bg-white/5"
                >
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-[#3b82f6]/10 items-center justify-center mr-4">
                            <Ionicons name="mail" size={16} color="#3b82f6" />
                        </View>
                        <Text className="text-text font-bold text-[16px]">Contact Support</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </Pressable>

                <Pressable
                    onPress={handlePrivacyPolicy}
                    className="flex-row items-center justify-between px-5 py-4 active:bg-black/5 dark:active:bg-white/5"
                >
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-[#10b981]/10 items-center justify-center mr-4">
                            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                        </View>
                        <Text className="text-text font-bold text-[16px]">Privacy Policy</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </Pressable>

                <Pressable
                    onPress={handleTerms}
                    className="flex-row items-center justify-between px-5 py-4 active:bg-black/5 dark:active:bg-white/5"
                >
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-[#8b5cf6]/10 items-center justify-center mr-4">
                            <Ionicons name="document-text" size={16} color="#8b5cf6" />
                        </View>
                        <Text className="text-text font-bold text-[16px]">Terms of Service</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </Pressable>
            </View>

            <View className="items-center mt-6">
                <Text className="text-textSecondary text-[11px] font-medium tracking-widest uppercase opacity-60">
                    Lockout v{Constants.expoConfig?.version ?? '1.0.0'}
                </Text>
            </View>
        </View>
    );
}
