import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import { WhatsNewData } from "@/hooks/useAutoUpdateCheck";
import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";

interface WhatsNewModalProps {
    visible: boolean;
    data: WhatsNewData;
    onClose: () => void;
}

function renderFormattedInline(text: string) {
    const cleanText = text.replace(/`/g, "");
    const parts = cleanText.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <Text key={i} className="font-bold text-text">
                    {part.slice(2, -2)}
                </Text>
            );
        }
        return part;
    });
}

function renderMarkdownBody(body: string) {
    if (!body) return null;

    const lines = body.split("\n");

    return lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
            return <View key={index} className="h-2" />;
        }

        const lower = trimmed.toLowerCase();

        // Omit automated changelog footer links & redundant APK install steps
        if (
            lower.includes("full changelog") ||
            lower.includes("see merge request") ||
            lower.includes("view full changelog") ||
            lower.includes("installation") ||
            lower.includes("app-release.apk") ||
            lower.includes("download and install") ||
            lower.includes(".apk below")
        ) {
            return null;
        }

        // Level 1 or 2 Headings (e.g. ## What's Changed)
        if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
            const headingText = trimmed.replace(/^#+\s*/, "");
            return (
                <Text key={index} className="text-text text-lg font-black tracking-tight mt-4 mb-2">
                    {headingText}
                </Text>
            );
        }

        // Level 3 Headings (e.g. ### Bug Fixes)
        if (trimmed.startsWith("### ")) {
            const headingText = trimmed.replace(/^###\s*/, "");
            return (
                <Text key={index} className="text-text text-[15px] font-black tracking-tight mt-3 mb-1.5">
                    {headingText}
                </Text>
            );
        }

        // Bullet lists (* item or - item)
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
            const itemText = trimmed.replace(/^[-*]\s*/, "");
            return (
                <View key={index} className="flex-row items-start mb-2 pl-0.5">
                    <Text className="text-textSecondary text-base leading-6 mr-2.5">•</Text>
                    <Text className="text-text text-[15px] font-normal leading-6 flex-1">
                        {renderFormattedInline(itemText)}
                    </Text>
                </View>
            );
        }

        // Regular paragraphs
        return (
            <Text key={index} className="text-text text-[15px] font-normal leading-relaxed mb-2.5">
                {renderFormattedInline(trimmed)}
            </Text>
        );
    });
}

export function WhatsNewModal({ visible, data, onClose }: WhatsNewModalProps) {
    const { colors } = useTheme();
    const { height, width } = useWindowDimensions();

    const modalHeight = Math.min(height * 0.82, 720);
    const modalWidth = Math.min(width - 32, 500);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        if (visible && data) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 70,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.95);
        }
    }, [visible, data]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    if (!data) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={handleDismiss}
            statusBarTranslucent
        >
            <View className="flex-1 justify-center items-center px-6">
                {/* Backdrop Scrim */}
                <Animated.View
                    style={{ opacity: fadeAnim, backgroundColor: colors.scrim }}
                    className="absolute inset-0"
                >
                    <Pressable className="flex-1" onPress={handleDismiss} />
                </Animated.View>

                {/* Main Card */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                        height: modalHeight,
                        width: modalWidth,
                        elevation: 6,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                    }}
                    className="rounded-[32px] p-6 border flex-col"
                >
                    {/* Header */}
                    <Text
                        style={{ color: colors.accent }}
                        className="text-xs font-bold tracking-widest uppercase mb-1"
                    >
                        RELEASE NOTES · v{data.version}
                    </Text>

                    <Text className="text-text text-2xl font-black tracking-tight leading-tight mb-4">
                        {data.title}
                    </Text>

                    <View className="h-[1px] bg-border mb-3" />

                    {/* Full GitHub Markdown Changelog */}
                    <ScrollView
                        className="flex-1 pr-1"
                        showsVerticalScrollIndicator={true}
                        bounces={false}
                    >
                        {renderMarkdownBody(data.body)}
                    </ScrollView>

                    <View className="h-[1px] bg-border mt-3 mb-4" />

                    {/* M3 Filled Button */}
                    <AnimatedPressable
                        onPress={handleDismiss}
                        hapticMode="light"
                        scaleTo={0.97}
                        className="w-full py-4 rounded-full items-center justify-center bg-accent"
                        accessibilityRole="button"
                        accessibilityLabel="Got it"
                    >
                        <Text
                            className="font-bold text-base tracking-wider uppercase"
                            style={{ color: colors.accentForeground }}
                        >
                            Got it
                        </Text>
                    </AnimatedPressable>
                </Animated.View>
            </View>
        </Modal>
    );
}
