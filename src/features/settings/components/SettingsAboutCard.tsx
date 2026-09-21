import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
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
        Linking.openURL("https://lockoutapp.com/privacy"); // Replace with actual URL later
    };

    const handleTerms = () => {
        Linking.openURL("https://lockoutapp.com/terms"); // Replace with actual URL later
    };

    return (
        <View className="px-6 py-5 mb-6">
            <Text className="text-textSecondary font-bold text-xs tracking-wider uppercase mb-3">
                About & Support
            </Text>

            <View className="bg-surfaceElevated rounded-2xl overflow-hidden border border-border">
                <Pressable
                    onPress={handleRateApp}
                    className="flex-row items-center justify-between p-5 border-b border-border active:bg-surface"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="star" size={20} color="#f59e0b" style={{ marginRight: 12 }} />
                        <Text className="text-text font-bold text-base">Rate the App</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </Pressable>

                <Pressable
                    onPress={handleContactSupport}
                    className="flex-row items-center justify-between p-5 border-b border-border active:bg-surface"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="mail" size={20} color="#3b82f6" style={{ marginRight: 12 }} />
                        <Text className="text-text font-bold text-base">Contact Support</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </Pressable>

                <Pressable
                    onPress={handlePrivacyPolicy}
                    className="flex-row items-center justify-between p-5 border-b border-border active:bg-surface"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="shield-checkmark" size={20} color="#10b981" style={{ marginRight: 12 }} />
                        <Text className="text-text font-bold text-base">Privacy Policy</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </Pressable>

                <Pressable
                    onPress={handleTerms}
                    className="flex-row items-center justify-between p-5 active:bg-surface"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="document-text" size={20} color="#8b5cf6" style={{ marginRight: 12 }} />
                        <Text className="text-text font-bold text-base">Terms of Service</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </Pressable>
            </View>

            <View className="items-center mt-6">
                <Text className="text-textSecondary text-xs font-medium tracking-widest uppercase opacity-60">
                    Lockout v{Constants.expoConfig?.version ?? '1.0.0'}
                </Text>
            </View>
        </View>
    );
}
