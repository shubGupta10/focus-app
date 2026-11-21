import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device"
import * as Haptics from "expo-haptics"
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";
import { FeedbackCategory } from "../types";

export function useFeedbackController() {
    const params = useLocalSearchParams<{ type?: FeedbackCategory }>();

    const [selectedType, setSelectedType] = useState<FeedbackCategory>(
        params.type === "bug" || params.type === "feature" ? params.type : "bug"
    );
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [includeDeviceInfo, setIncludeDeviceInfo] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const appVersion = Constants.expoConfig?.version || "1.8.1";
    const osVersion = `Android ${Platform.Version}`;
    const deviceModel = Device.modelName || "";


    const handleSubmit = async () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage.length < 5) {
            setErrorMessage("Please enter at least 5 characters");
            return;
        }

        setErrorMessage(null);
        setIsSubmitting(true);

        const deviceInfo = includeDeviceInfo ? [`App: v${appVersion}`, `Platform: ${Platform.OS} ${Platform.Version}`, deviceModel ? `Model: ${deviceModel}` : null,].filter(Boolean).join(" | ") : null;

        try {
            const response = await fetch("https://lockout-website.vercel.app/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: selectedType,
                    message: trimmedMessage,
                    email: email.trim() || null,
                    device_info: deviceInfo,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || "Failed to submit feedback");
            }

            await AsyncStorage.setItem("has_submitted_feedback", "true");
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
            setIsSuccess(true);
        } catch (error: any) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
            setErrorMessage(error?.message || "Could not submit. Please check your internet connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        selectedType,
        setSelectedType,
        message,
        setMessage,
        email,
        setEmail,
        includeDeviceInfo,
        setIncludeDeviceInfo,
        isSubmitting,
        errorMessage,
        isSuccess,
        appVersion,
        osVersion,
        handleSubmit,
    }
}