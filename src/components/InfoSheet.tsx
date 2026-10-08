import { Feather } from "@expo/vector-icons";
import { ReactNode, useState, useEffect, useRef } from "react";
import { Modal, Pressable, Text, View, Animated } from "react-native";

interface InfoSheetProps {
    title: string;
    description: string;
    children?: ReactNode
}

export function InfoSheet({ title, description, children }: InfoSheetProps) {
    const [isVisible, setIsVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(500)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true })
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
            <Pressable
                onPress={() => setIsVisible(true)}
                className="w-8 h-8 rounded-full bg-surfaceElevated items-center justify-center border border-border active:opacity-70"
            >
                <Feather name="info" size={16} color="#8A8082" />
            </Pressable>


            <Modal transparent={true} visible={isVisible} animationType="none">
                <View className="flex-1 justify-end">


                    <Animated.View
                        style={{ opacity: fadeAnim }}
                        className="absolute top-0 bottom-0 left-0 right-0 bg-scrim"
                    >
                        <Pressable className="flex-1" onPress={closeSheet} />
                    </Animated.View>


                    <Animated.View
                        style={{ transform: [{ translateY: slideAnim }] }}
                        className="bg-surface rounded-t-[32px] p-6 pb-10 shadow-lg mt-24"
                    >

                        <View className="w-12 h-1.5 bg-surfaceElevated rounded-full self-center mb-6" />

                        <Text className="text-text font-black text-2xl mb-5">{title}</Text>
                        <Text className="text-textSecondary text-base leading-relaxed mb-6">{description}</Text>

                        {children}

                        <Pressable
                            onPress={closeSheet}
                            className="mt-4 bg-accent py-4 rounded-full items-center active:opacity-80 border border-border"
                        >
                            <Text className="text-text font-bold text-base">Got it</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </Modal>
        </>
    )
}
