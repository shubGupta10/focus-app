import { useTheme } from "@/contexts/ThemeContext";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const { colors } = useTheme();
    const [message, setMessage] = useState("");
    const [visible, setVisible] = useState(false);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((msg: string) => {

        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
        }

        setMessage(msg);
        setVisible(true);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        hideTimer.current = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 20,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setVisible(false);
                setMessage("");
            });
        }, 2500);
    }, [opacity, translateY]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {visible && (
                <Animated.View
                    style={{
                        position: "absolute",
                        bottom: 100,
                        left: 24,
                        right: 24,
                        alignItems: "center",
                        opacity,
                        transform: [{ translateY }],
                        zIndex: 9999,
                        pointerEvents: "none",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: colors.surfaceElevated,
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            borderWidth: 1,
                            borderColor: colors.border,
                            shadowColor: "#000",
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 8,
                        }}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 13,
                                fontWeight: "600",
                            }}
                        >
                            {message}
                        </Text>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
}
