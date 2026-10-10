import * as Haptics from "expo-haptics"
import { ReactNode } from "react";
import { Pressable, PressableProps, ViewStyle, StyleProp } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
    children: ReactNode;
    hapticMode?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'none'
    scaleTo?: number;
    className?: string;
    style?: StyleProp<ViewStyle>
}

export function AnimatedPressable({
    children,
    hapticMode = 'light',
    scaleTo = 0.86,
    className,
    style,
    onPressIn,
    onPressOut,
    onPress,
    ...rest
}: AnimatedPressableProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value
        };
    });

    const triggerHaptic = () => {
        switch (hapticMode) {
            case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;

            case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;

            case 'heavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;

            case 'success': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;

            case 'error': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;

            case 'none':
            default:
                break;
        }
    };

    return (
        <AnimatedPressableComponent
            className={className}
            style={[style, animatedStyle]}

            onPressIn={(e) => {
                scale.value = withSpring(scaleTo, {
                    damping: 15, stiffness: 300
                });
                opacity.value = withTiming(0.8, {
                    duration: 100
                })
                if (onPressIn) onPressIn(e);
            }}

            onPressOut={(e) => {
                scale.value = withSpring(1, {
                    damping: 15, stiffness: 300
                })
                opacity.value = withTiming(1, {
                    duration: 150
                });
                if (onPressOut) onPressOut(e);
            }}

            onPress={(e) => {
                triggerHaptic();
                if (onPress) onPress(e);
            }}
            {...rest}
        >
            {children}
        </AnimatedPressableComponent>
    )
}