import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

const PARTICLE_COUNT = 18;

function generateParticles() {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: 30 + Math.random() * 280,
        startY: Math.random() * 340,
        size: 2 + Math.random() * 4,
        opacity: 0.25 + Math.random() * 0.5,
        duration: 8000 + Math.random() * 7000,
    }));
}

export function ParticleDriftBackground({
    isActive,
    colorAccent,
}: OrbBackgroundProps) {
    const particles = useMemo(() => generateParticles(), []);
    const anims = useRef(particles.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (!isActive) return;

        const loops = particles.map((p, i) => {
            anims[i].setValue(0);
            return Animated.loop(
                Animated.timing(anims[i], {
                    toValue: 1,
                    duration: p.duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
        });

        loops.forEach(l => l.start());
        return () => loops.forEach(l => l.stop());
    }, [anims, particles, isActive]);

    return (
        <View style={{ width: 340, height: 340 }}>
            {particles.map((p, i) => {
                const translateY = anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [p.startY, p.startY - 340],
                });

                return (
                    <Animated.View
                        key={p.id}
                        style={{
                            position: "absolute",
                            left: p.x,
                            top: 0,
                            transform: [{ translateY }],
                        }}
                    >
                        <Svg width={p.size * 2} height={p.size * 2}>
                            <Circle
                                cx={p.size}
                                cy={p.size}
                                r={p.size}
                                fill={colorAccent}
                                opacity={p.opacity}
                            />
                        </Svg>
                    </Animated.View>
                );
            })}
        </View>
    );
}
