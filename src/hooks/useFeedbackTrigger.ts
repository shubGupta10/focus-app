import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

export function useFeedbackTrigger() {
    const db = useSQLiteContext();
    const [isPromptVisible, setIsPromptVisible] = useState(false);
    const [completedSessionCount, setCompletedSessionCount] = useState(2);

    const checkMilestone = useCallback(async () => {
        try {
            const hasSubmitted = await AsyncStorage.getItem("has_submitted_feedback");
            if (hasSubmitted === "true") return;

            const hasPrompted = await AsyncStorage.getItem("feedback_milestone_prompted");
            if (hasPrompted === "true") return;

            const result = await db.getFirstAsync<{ count: number }>(
                "SELECT COUNT(*) as count FROM sessions WHERE is_completed = 1"
            );

            const completedCount = result?.count ?? 0;
            if (completedCount >= 2) {
                setCompletedSessionCount(completedCount);
                setIsPromptVisible(true);
            }
        } catch {
        }
    }, [db]);

    const dismissPrompt = useCallback(async () => {
        setIsPromptVisible(false);
        try {
            await AsyncStorage.setItem("feedback_milestone_prompted", "true");
        } catch {
        }
    }, []);

    return {
        isPromptVisible,
        completedSessionCount,
        checkMilestone,
        dismissPrompt,
    };
}
