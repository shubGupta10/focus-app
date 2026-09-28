import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

export function ZenRipplesBackground({ isActive, colorAccent }: OrbBackgroundProps) {
    const anims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;
    const timeouts = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        if (!isActive) {
            anims.forEach(a => a.setValue(0));
            timeouts.current.forEach(clearTimeout);
            return;
        }

        const duration = 15000; // Slower, longer ripples
        const stagger = duration / anims.length;

        anims.forEach((anim, index) => {
            anim.setValue(0);
            
            const timeout = setTimeout(() => {
                Animated.loop(
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: duration,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    })
                ).start();
            }, index * stagger);
            
            timeouts.current.push(timeout);
        });

        return () => {
            anims.forEach(a => a.stopAnimation());
            timeouts.current.forEach(clearTimeout);
        };
    }, [isActive, anims]);

    const getScale = (anim: Animated.Value) => anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.2] // expand further out
    });

    const getOpacity = (anim: Animated.Value) => anim.interpolate({
        inputRange: [0, 0.1, 1],
        outputRange: [0, 0.4, 0]
    });

    return (
        <View style={{ width: 340, height: 340 }}>
            {isActive && anims.map((anim, index) => (
                <Animated.View key={`ripple-${index}`} style={{
                    position: 'absolute',
                    width: 340, height: 340,
                    transform: [{ scale: getScale(anim) }],
                    opacity: getOpacity(anim)
                }}>
                    <Svg width="340" height="340" viewBox="0 0 340 340">
                        <Circle cx="170" cy="170" r="110" fill="none" stroke={colorAccent} strokeWidth="2" />
                    </Svg>
                </Animated.View>
            ))}
        </View>
    );
}
