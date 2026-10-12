import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

interface DriftParticle {
    x: number;
    y: number;
    size: number;
    opacity: number;
}

const GROUPS_CONFIG = [
    { count: 7, minR: 110, maxR: 125, duration: 32000, reverse: false, offsetAngle: 0 },
    { count: 7, minR: 128, maxR: 144, duration: 24000, reverse: true, offsetAngle: 25 },
    { count: 7, minR: 146, maxR: 160, duration: 40000, reverse: false, offsetAngle: 50 },
];

function generateGroupParticles(
    count: number,
    minR: number,
    maxR: number,
    offsetAngle: number
): DriftParticle[] {
    return Array.from({ length: count }, (_, i) => {
        const angleDeg = (i / count) * 360 + offsetAngle + ((i * 13) % 20);
        const angleRad = (angleDeg - 90) * (Math.PI / 180);
        const radius = minR + ((i * 17) % (maxR - minR + 1));
        const size = 1.8 + (i % 3) * 1.1;
        const opacity = 0.3 + (i % 4) * 0.12;

        return {
            x: 170 + radius * Math.cos(angleRad),
            y: 170 + radius * Math.sin(angleRad),
            size,
            opacity,
        };
    });
}

export function ParticleDriftBackground({
    isActive,
    colorAccent,
}: OrbBackgroundProps) {
    const groups = useMemo(
        () =>
            GROUPS_CONFIG.map((cfg) => ({
                particles: generateGroupParticles(
                    cfg.count,
                    cfg.minR,
                    cfg.maxR,
                    cfg.offsetAngle
                ),
                duration: cfg.duration,
                reverse: cfg.reverse,
            })),
        []
    );

    const anims = useRef(GROUPS_CONFIG.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (!isActive) {
            anims.forEach((a) => a.setValue(0));
            return;
        }

        const loops = anims.map((anim, i) => {
            anim.setValue(0);
            return Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: groups[i].duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
        });

        loops.forEach((l) => l.start());
        return () => loops.forEach((l) => l.stop());
    }, [anims, groups, isActive]);

    return (
        <View style={{ width: 340, height: 340 }}>
            {groups.map((group, groupIdx) => {
                const rotation = anims[groupIdx].interpolate({
                    inputRange: [0, 1],
                    outputRange: group.reverse ? ["360deg", "0deg"] : ["0deg", "360deg"],
                });

                return (
                    <Animated.View
                        key={`group-${groupIdx}`}
                        style={{
                            position: "absolute",
                            width: 340,
                            height: 340,
                            transform: [{ rotate: rotation }],
                        }}
                    >
                        <Svg width="340" height="340" viewBox="0 0 340 340">
                            {group.particles.map((p, pIdx) => (
                                <Circle
                                    key={`p-${groupIdx}-${pIdx}`}
                                    cx={p.x}
                                    cy={p.y}
                                    r={p.size}
                                    fill={colorAccent}
                                    opacity={p.opacity}
                                />
                            ))}
                        </Svg>
                    </Animated.View>
                );
            })}
        </View>
    );
}
