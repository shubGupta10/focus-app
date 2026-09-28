import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

export function EclipseBackground({ isActive, colorAccent }: OrbBackgroundProps) {
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isActive) {
            pulseAnim.setValue(0);
            rotateAnim.setValue(0);
            return;
        }

        // Deep, calm breathing of the outer aura
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        );

        // Smooth, elegant sweeping motion of the light crescent
        const rotateLoop = Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 12000, useNativeDriver: true, easing: Easing.linear })
        );

        pulseLoop.start();
        rotateLoop.start();

        return () => {
            pulseLoop.stop();
            rotateLoop.stop();
        };
    }, [isActive, pulseAnim, rotateAnim]);

    const auraScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
    const auraOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.7] });
    const sweepRotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <View style={{ width: 340, height: 340 }}>
            {isActive && (
                <>
                    {/* Layer 1: The Breathing Aura (Soft, massive background glow) */}
                    <Animated.View style={{
                        position: 'absolute',
                        width: 340, height: 340,
                        transform: [{ scale: auraScale }],
                        opacity: auraOpacity
                    }}>
                        <Svg width="340" height="340" viewBox="0 0 340 340">
                            <Defs>
                                <RadialGradient id="auraGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                                    <Stop offset="40%" stopColor={colorAccent} stopOpacity="0.8" />
                                    <Stop offset="70%" stopColor={colorAccent} stopOpacity="0.3" />
                                    <Stop offset="100%" stopColor={colorAccent} stopOpacity="0" />
                                </RadialGradient>
                            </Defs>
                            <Circle cx="170" cy="170" r="160" fill="url(#auraGrad)" />
                        </Svg>
                    </Animated.View>

                    {/* Layer 2: The Sweeping Crescent & The Void */}
                    <Animated.View style={{
                        position: 'absolute',
                        width: 340, height: 340,
                        transform: [{ rotate: sweepRotation }]
                    }}>
                        <Svg width="340" height="340" viewBox="0 0 340 340">
                            <Defs>
                                <RadialGradient id="crescentGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                                    <Stop offset="70%" stopColor="#ffffff" stopOpacity="1" />
                                    <Stop offset="100%" stopColor={colorAccent} stopOpacity="0" />
                                </RadialGradient>
                            </Defs>
                            
                            {/* The Sun: Offset slightly by 6 pixels on the X-axis. 
                                As the container rotates, this offset circles the center, 
                                creating a beautiful sweeping crescent of light behind the moon. */}
                            <Circle cx="176" cy="170" r="128" fill="url(#crescentGrad)" />
                            
                            {/* The Moon: Perfectly centered. Pitch black void. */}
                            <Circle cx="170" cy="170" r="126" fill="#000000" />
                            
                            {/* A razor-thin crisp inner rim to perfectly define the void */}
                            <Circle cx="170" cy="170" r="126" fill="none" stroke="#000000" strokeWidth="2" />
                        </Svg>
                    </Animated.View>
                </>
            )}
        </View>
    );
}
