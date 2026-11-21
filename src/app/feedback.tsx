import { useTheme } from "@/contexts/ThemeContext";
import { FeedbackCategorySelector } from "@/features/feedback/components/FeedbackCategorySelector";
import { FeedbackDeviceInfoCard } from "@/features/feedback/components/FeedbackDeviceInfoCard";
import { FeedbackEmailInput } from "@/features/feedback/components/FeedbackEmailInput";
import { FeedbackErrorAlert } from "@/features/feedback/components/FeedbackErrorAlert";
import { FeedbackHeader } from "@/features/feedback/components/FeedbackHeader";
import { FeedbackMessageInput } from "@/features/feedback/components/FeedbackMessageInput";
import { FeedbackSubmitButton } from "@/features/feedback/components/FeedbackSubmitButton";
import { FeedbackSuccessView } from "@/features/feedback/components/FeedbackSuccessView";
import { useFeedbackController } from "@/features/feedback/hooks/useFeedbackController";
import { router } from "expo-router";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedbackScreen() {
    const { activeStyle, colors } = useTheme();
    const {
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
    } = useFeedbackController();

    if (isSuccess) {
        return <FeedbackSuccessView onDone={() => router.back()} />;
    }

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle} edges={["top", "bottom", "left", "right"]}>
            <FeedbackHeader onBack={() => router.back()} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
                >
                    <FeedbackCategorySelector
                        selectedType={selectedType}
                        onSelect={setSelectedType}
                    />

                    <FeedbackMessageInput
                        selectedType={selectedType}
                        message={message}
                        onChangeMessage={setMessage}
                    />

                    <FeedbackEmailInput
                        email={email}
                        onChangeEmail={setEmail}
                    />

                    <FeedbackDeviceInfoCard
                        appVersion={appVersion}
                        osVersion={osVersion}
                        includeDeviceInfo={includeDeviceInfo}
                        onToggleDeviceInfo={setIncludeDeviceInfo}
                    />

                    <FeedbackErrorAlert message={errorMessage} />
                </ScrollView>

                <View
                    style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                    className="px-6 pt-4 pb-6 bg-background"
                >
                    <FeedbackSubmitButton
                        isSubmitting={isSubmitting}
                        disabled={isSubmitting || message.trim().length < 5}
                        onSubmit={handleSubmit}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
