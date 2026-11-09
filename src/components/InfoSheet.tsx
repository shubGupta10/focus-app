import { AnimatedPressable } from "@/components/AnimatedPressable";
import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface InfoSheetProps {
    title: string;
    description: string;
    children?: ReactNode;
}

export function InfoSheet({ title, description, children }: InfoSheetProps) {
    const { colors, activeStyle } = useTheme();
    const insets = useSafeAreaInsets();
    const [isVisible, setIsVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(500)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 65, useNativeDriver: true })
            ]).start();
        }
    }, [isVisible]);

    const closeSheet = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 500, duration: 200, useNativeDriver: true })
        ]).start(() => setIsVisible(false));
    };

    return (
        <>
            <AnimatedPressable
                onPress={() => setIsVisible(true)}
                hapticMode="light"
                scaleTo={0.88}
                className="w-8 h-8 rounded-full bg-surfaceElevated items-center justify-center border border-border shadow-sm"
                style={{ elevation: 1 }}
                accessibilityRole="button"
                accessibilityLabel={`More information about ${title}`}
            >
                <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            </AnimatedPressable>

            <Modal transparent={true} visible={isVisible} animationType="none" onRequestClose={closeSheet}>
                <View className="flex-1 justify-end">

                    <Animated.View
                        style={{ opacity: fadeAnim, backgroundColor: colors.scrim }}
                        className="absolute inset-0"
                    >
                        <Pressable className="flex-1" onPress={closeSheet} />
                    </Animated.View>


                    <Animated.View
                        style={[
                            {
                                transform: [{ translateY: slideAnim }],
                                paddingBottom: Math.max(insets.bottom + 16, 28)
                            },
                            activeStyle
                        ]}
                        className="bg-surfaceElevated rounded-t-[32px] border-t border-border px-6 pt-3 mt-24"
                    >

                        <View className="w-10 h-1 bg-border rounded-full self-center mb-5" />

                        <Text className="text-text font-black text-2xl mb-3 tracking-tight">{title}</Text>
                        <Text className="text-textSecondary text-sm leading-relaxed mb-6 font-medium">{description}</Text>

                        {children}

                        <AnimatedPressable
                            onPress={closeSheet}
                            hapticMode="light"
                            scaleTo={0.96}
                            className="mt-2 bg-accent py-4 rounded-full items-center"
                            accessibilityRole="button"
                            accessibilityLabel="Dismiss sheet"
                        >
                            <Text className="text-accentForeground font-bold text-base uppercase tracking-wider">Got it</Text>
                        </AnimatedPressable>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}