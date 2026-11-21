import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Modal,
    Pressable,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

interface FeedbackMilestoneModalProps {
    visible: boolean;
    onClose: () => void;
    sessionCount?: number;
}

export function FeedbackMilestoneModal({
    visible,
    onClose,
    sessionCount = 2,
}: FeedbackMilestoneModalProps) {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const modalWidth = Math.min(width - 48, 360);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 65,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.92);
        }
    }, [visible]);

    if (!visible) return null;

    const handleGiveFeedback = () => {
        onClose();
        router.push({ pathname: "/feedback", params: { milestone: "true" } });
    };

    return (
        <Modal
            transparent
            animationType="none"
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View className="flex-1 justify-center items-center px-6">
                <Animated.View
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: colors.scrim,
                        opacity: fadeAnim,
                    }}
                >
                    <Pressable style={{ flex: 1 }} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                        width: modalWidth,
                        elevation: 6,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                    }}
                    className="rounded-[28px] p-6 border flex-col items-center"
                >
                    <View
                        className="w-13 h-13 rounded-full items-center justify-center mb-4"
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: 26,
                            backgroundColor: colors.accentMuted,
                        }}
                    >
                        <Ionicons name="chatbubble-outline" size={24} color={colors.accent} />
                    </View>

                    <Text className="text-text text-2xl font-black tracking-tight text-center mb-2">
                        How's Lockout going?
                    </Text>

                    <Text className="text-textSecondary text-sm leading-5 text-center mb-6 px-1">
                        You've finished {sessionCount} sessions. Tell us what's working and what isn't.
                    </Text>

                    <View className="flex-row items-center gap-3 w-full">
                        <AnimatedPressable
                            onPress={onClose}
                            hapticMode="light"
                            scaleTo={0.96}
                            className="flex-1 py-3.5 rounded-full items-center justify-center border border-border bg-surfaceElevated"
                        >
                            <Text className="text-text font-bold text-[15px]">
                                Not now
                            </Text>
                        </AnimatedPressable>

                        <AnimatedPressable
                            onPress={handleGiveFeedback}
                            hapticMode="light"
                            scaleTo={0.96}
                            className="flex-1 py-3.5 rounded-full items-center justify-center bg-accent"
                            style={{ backgroundColor: colors.accent }}
                        >
                            <Text
                                className="font-bold text-[15px]"
                                style={{ color: colors.accentForeground }}
                            >
                                Give feedback
                            </Text>
                        </AnimatedPressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
