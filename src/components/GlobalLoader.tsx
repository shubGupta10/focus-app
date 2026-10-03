import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GlobalLoaderProps {
    color?: string;
    size?: 'small' | 'medium' | 'large';
    fullScreen?: boolean;
}

export function GlobalLoader({ color, size = 'medium', fullScreen = false }: GlobalLoaderProps) {
    const { colors } = useTheme();
    const activeColor = color || colors.accent;

    const dimensions = {
        small: 20,
        medium: 36,
        large: 54
    }[size];

    const strokeWidth = dimensions * 0.12;
    const radius = (dimensions - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const rotation = useSharedValue(0);
    const progress = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 1000, easing: Easing.linear }),
            -1,
            false
        );
        
        progress.value = withRepeat(
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });

    const animatedProps = useAnimatedProps(() => {
        // Material spinners grow from a small tail to a large tail
        const strokeDashoffset = circumference - (0.15 + progress.value * 0.6) * circumference;
        return {
            strokeDashoffset,
        };
    });

    const LoaderContent = (
        <View style={{ width: dimensions, height: dimensions, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={[{ width: dimensions, height: dimensions }, animatedStyle]}>
                <Svg width={dimensions} height={dimensions} viewBox={`0 0 ${dimensions} ${dimensions}`}>
                    <AnimatedCircle
                        cx={dimensions / 2}
                        cy={dimensions / 2}
                        r={radius}
                        stroke={activeColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                    />
                </Svg>
            </Animated.View>
        </View>
    );

    if (fullScreen) {
        return (
            <View className="flex-1 items-center justify-center bg-surface">
                {LoaderContent}
            </View>
        );
    }

    return LoaderContent;
}
