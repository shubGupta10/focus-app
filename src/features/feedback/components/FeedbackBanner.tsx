import { Text, View } from "react-native";

interface FeedbackBannerProps {
    isMilestone: boolean;
}

export function FeedbackBanner({ isMilestone }: FeedbackBannerProps) {
    return (
        <View className="bg-surfaceElevated border border-border rounded-3xl p-5 mb-5 shadow-sm">
            <Text className="text-accent font-bold text-xs tracking-wider uppercase mb-1">
                {isMilestone ? "Milestone Reached" : "Direct Developer Line"}
            </Text>
            <Text className="text-text text-base font-semibold leading-5 mb-1.5">
                {isMilestone
                    ? "You've crushed 2 focus sessions!"
                    : "We review every idea & report."}
            </Text>
            <Text className="text-textSecondary text-xs leading-4">
                {isMilestone
                    ? "Tell us how your sessions felt so far. What do you love, and what should we build next to help you lock in?"
                    : "Whether it is a bug report, workflow suggestion, or general review, your voice shapes the app."}
            </Text>
        </View>
    );
}
