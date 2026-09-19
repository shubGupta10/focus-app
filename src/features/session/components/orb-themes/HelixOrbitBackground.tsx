import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

const DOT_COUNT = 16;
const BASE_RADIUS = 132;
const AMPLITUDE = 28;
const CENTER = 170;
const WAVE_CYCLES = 3;

function generateStrand(phaseOffset: number) {
    return Array.from({ length: DOT_COUNT }, (_, i) => {
        const angle = (i / DOT_COUNT) * 360;
        const waveAngle = (angle * WAVE_CYCLES + phaseOffset) * (Math.PI / 180);
        const sinVal = Math.sin(waveAngle);
        const radius = BASE_RADIUS + AMPLITUDE * sinVal;
        const angleRad = (angle - 90) * (Math.PI / 180);
        const normalizedSin = (sinVal + 1) / 2;

        return {
            x: CENTER + radius * Math.cos(angleRad),
            y: CENTER + radius * Math.sin(angleRad),
            size: 1.5 + 3 * normalizedSin,
            opacity: 0.15 + 0.6 * normalizedSin,
            hasGlow: normalizedSin > 0.7,
        };
    });
}

function generateRungs(strandA: ReturnType<typeof generateStrand>, strandB: ReturnType<typeof generateStrand>) {
    return strandA.map((dotA, i) => ({
        x1: dotA.x,
        y1: dotA.y,
        x2: strandB[i].x,
        y2: strandB[i].y,
        opacity: 0.06 + 0.08 * Math.abs(dotA.opacity - strandB[i].opacity),
    }));
}

export function HelixOrbitBackground({
    isActive,
    colorAccent,
}: OrbBackgroundProps) {
    const spin = useRef(new Animated.Value(0)).current;

    const strandA = useMemo(() => generateStrand(0), []);
    const strandB = useMemo(() => generateStrand(180), []);
    const rungs = useMemo(() => generateRungs(strandA, strandB), [strandA, strandB]);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(spin, {
                toValue: 1,
                duration: 14000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        loop.start();
        return () => loop.stop();
    }, [spin]);

    const rotation = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={{ width: 340, height: 340 }}>
            <View style={{ position: "absolute", width: 340, height: 340 }}>
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={BASE_RADIUS + AMPLITUDE}
                        stroke={colorAccent}
                        strokeWidth="0.5"
                        fill="none"
                        opacity={0.06}
                    />
                    <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={BASE_RADIUS - AMPLITUDE}
                        stroke={colorAccent}
                        strokeWidth="0.5"
                        fill="none"
                        opacity={0.06}
                    />
                </Svg>
            </View>

            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: rotation }],
                }}
            >
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    {rungs.map((rung, i) => (
                        <Line
                            key={`r-${i}`}
                            x1={rung.x1}
                            y1={rung.y1}
                            x2={rung.x2}
                            y2={rung.y2}
                            stroke={colorAccent}
                            strokeWidth="0.8"
                            opacity={rung.opacity}
                        />
                    ))}

                    {strandA.map((dot, i) => (
                        <React.Fragment key={`a-${i}`}>
                            {dot.hasGlow && (
                                <Circle
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.size + 4}
                                    fill={colorAccent}
                                    opacity={0.08}
                                />
                            )}
                            <Circle
                                cx={dot.x}
                                cy={dot.y}
                                r={dot.size}
                                fill={colorAccent}
                                opacity={dot.opacity}
                            />
                        </React.Fragment>
                    ))}

                    {strandB.map((dot, i) => (
                        <React.Fragment key={`b-${i}`}>
                            {dot.hasGlow && (
                                <Circle
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.size + 4}
                                    fill={colorAccent}
                                    opacity={0.08}
                                />
                            )}
                            <Circle
                                cx={dot.x}
                                cy={dot.y}
                                r={dot.size}
                                fill={colorAccent}
                                opacity={dot.opacity}
                            />
                        </React.Fragment>
                    ))}
                </Svg>
            </Animated.View>
        </View>
    );
}
