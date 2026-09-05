import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface Material3SwitchProps {
    value: boolean;
    onValueChange: (val: boolean) => void;
    disabled?: boolean;
}

export function Material3Switch({ value, onValueChange, disabled }: Material3SwitchProps) {
    const { switchColors } = useTheme();
    const progress = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        progress.value = withSpring(value ? 1 : 0, {
            mass: 1,
            damping: 15,
            stiffness: 120,
            overshootClamping: false,
        });
    }, [value]);

    const trackStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: value ? switchColors.trackActive : switchColors.trackInactive,
        };
    });

    const thumbStyle = useAnimatedStyle(() => {
        const size = value ? 24 : 16;
        const margin = value ? 4 : 8;
        // Total width is 52. 
        // When progress is 0, translateX is 0 (left edge + margin).
        // When progress is 1, translateX is max travel distance.
        const translateX = progress.value * (52 - size - (margin * 2));

        return {
            width: withTiming(size, { duration: 150 }),
            height: withTiming(size, { duration: 150 }),
            transform: [{ translateX }],
            backgroundColor: value ? switchColors.thumbActive : switchColors.thumbInactive,
            left: margin,
        };
    });

    return (
        <Pressable
            onPress={() => !disabled && onValueChange(!value)}
            style={[{ width: 52, height: 32, justifyContent: 'center' }, disabled ? { opacity: 0.5 } : {}]}
        >
            <Animated.View
                style={[{ width: 52, height: 32, borderRadius: 16, position: 'absolute' }, trackStyle]}
            />
            <Animated.View
                style={[{ borderRadius: 12, position: 'absolute', left: 0 }, thumbStyle]}
            />
        </Pressable>
    );
}
