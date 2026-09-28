import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Polygon, G } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

export function PrismaticCoreBackground({ isActive, colorAccent }: OrbBackgroundProps) {
    const anim1 = useRef(new Animated.Value(0)).current;
    const anim2 = useRef(new Animated.Value(0)).current;
    const anim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isActive) {
            anim1.setValue(0);
            anim2.setValue(0);
            anim3.setValue(0);
            return;
        }

        const startRotation = (anim: Animated.Value, duration: number, reverse: boolean = false) => {
            Animated.loop(
                Animated.timing(anim, {
                    toValue: reverse ? -1 : 1,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        };

        startRotation(anim1, 30000); // Slowest, clockwise
        startRotation(anim2, 20000, true); // Medium, counter-clockwise
        startRotation(anim3, 40000); // Very slow, clockwise

        return () => {
            anim1.stopAnimation();
            anim2.stopAnimation();
            anim3.stopAnimation();
        };
    }, [isActive, anim1, anim2, anim3]);

    const AnimatedG = Animated.createAnimatedComponent(G);

    // Helper to generate a centered square polygon string
    // Radius of the circumscribed circle is roughly 135
    const size = 135;
    const cx = 170;
    const cy = 170;
    const squarePoints = `
        ${cx},${cy - size} 
        ${cx + size},${cy} 
        ${cx},${cy + size} 
        ${cx - size},${cy}
    `.trim();

    const hexagonPoints = `
        ${cx},${cy - size} 
        ${cx + size * 0.866},${cy - size * 0.5} 
        ${cx + size * 0.866},${cy + size * 0.5} 
        ${cx},${cy + size} 
        ${cx - size * 0.866},${cy + size * 0.5} 
        ${cx - size * 0.866},${cy - size * 0.5}
    `.trim();

    return (
        <View style={{ width: 340, height: 340 }}>
            {isActive && (
                <>
                    {/* Inner Hexagon */}
                    <Animated.View style={{
                        position: 'absolute',
                        width: 340, height: 340,
                        transform: [
                            { rotate: anim1.interpolate({ inputRange: [-1, 1], outputRange: ['-360deg', '360deg'] }) },
                        ]
                    }}>
                        <Svg width="340" height="340" viewBox="0 0 340 340">
                            <Polygon points={hexagonPoints} fill="none" stroke={colorAccent} strokeWidth="1.5" opacity={0.4} />
                            <Polygon points={squarePoints} fill="none" stroke={colorAccent} strokeWidth="1" opacity={0.2} />
                        </Svg>
                    </Animated.View>

                    {/* Middle Square */}
                    <Animated.View style={{
                        position: 'absolute',
                        width: 340, height: 340,
                        transform: [
                            { rotate: anim2.interpolate({ inputRange: [-1, 1], outputRange: ['-360deg', '360deg'] }) },
                        ]
                    }}>
                        <Svg width="340" height="340" viewBox="0 0 340 340">
                            <Polygon points={squarePoints} fill="none" stroke={colorAccent} strokeWidth="1" opacity={0.6} />
                        </Svg>
                    </Animated.View>

                    {/* Outer Square scaled up */}
                    <Animated.View style={{
                        position: 'absolute',
                        width: 340, height: 340,
                        transform: [
                            { rotate: anim3.interpolate({ inputRange: [-1, 1], outputRange: ['-360deg', '360deg'] }) },
                            { scale: 1.15 },
                        ]
                    }}>
                        <Svg width="340" height="340" viewBox="0 0 340 340">
                            <Polygon points={squarePoints} fill="none" stroke={colorAccent} strokeWidth="0.5" opacity={0.3} />
                        </Svg>
                    </Animated.View>
                </>
            )}
        </View>
    );
}
