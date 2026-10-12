import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

const DOT_COUNT = 16;
const BASE_RADIUS = 132;
const AMPLITUDE = 28;
const CENTER = 170;
const WAVE_CYCLES = 3;

interface HelixDot {
    x: number;
    y: number;
    size: number;
    opacity: number;
    normalizedSin: number;
    hasGlow: boolean;
    isCrest: boolean;
}

function generateStrand(phaseOffset: number): HelixDot[] {
    return Array.from({ length: DOT_COUNT }, (_, i) => {
        const angle = (i / DOT_COUNT) * 360;
        const waveAngle = (angle * WAVE_CYCLES + phaseOffset) * (Math.PI / 180);
        const sinVal = Math.sin(waveAngle);
        const radius = BASE_RADIUS + AMPLITUDE * sinVal;
        const angleRad = (angle - 90) * (Math.PI / 180);
        const normalizedSin = (sinVal + 1) / 2;

        return {
            x: Math.round((CENTER + radius * Math.cos(angleRad)) * 10) / 10,
            y: Math.round((CENTER + radius * Math.sin(angleRad)) * 10) / 10,
            size: Math.round((2.2 + 2.8 * normalizedSin) * 10) / 10,
            opacity: Math.round((0.35 + 0.60 * normalizedSin) * 100) / 100,
            normalizedSin,
            hasGlow: normalizedSin > 0.65,
            isCrest: normalizedSin > 0.78,
        };
    });
}

function generateRungs(strandA: HelixDot[], strandB: HelixDot[]) {
    return strandA.map((dotA, i) => {
        const avgNorm = (dotA.normalizedSin + strandB[i].normalizedSin) / 2;
        return {
            x1: dotA.x,
            y1: dotA.y,
            x2: strandB[i].x,
            y2: strandB[i].y,
            opacity: Math.round((0.20 + 0.25 * avgNorm) * 100) / 100,
        };
    });
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
        if (!isActive) return;

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
    }, [spin, isActive]);

    const rotation = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={{ width: 340, height: 340 }}>
            {/* Guide Tracks (Crisp dashed perimeter guides) */}
            <View style={{ position: "absolute", width: 340, height: 340 }}>
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={BASE_RADIUS + AMPLITUDE}
                        stroke={colorAccent}
                        strokeWidth="1"
                        strokeDasharray="2, 6"
                        fill="none"
                        opacity={0.12}
                    />
                    <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={BASE_RADIUS - AMPLITUDE}
                        stroke={colorAccent}
                        strokeWidth="1"
                        strokeDasharray="2, 6"
                        fill="none"
                        opacity={0.12}
                    />
                </Svg>
            </View>

            {/* Rotating Double Helix Structure */}
            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: rotation }],
                }}
            >
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    {/* Helix Ladder Rungs */}
                    {rungs.map((rung, i) => (
                        <Line
                            key={`r-${i}`}
                            x1={rung.x1}
                            y1={rung.y1}
                            x2={rung.x2}
                            y2={rung.y2}
                            stroke={colorAccent}
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            opacity={rung.opacity}
                        />
                    ))}

                    {/* Strand A Nodes */}
                    {strandA.map((dot, i) => (
                        <React.Fragment key={`a-${i}`}>
                            {dot.hasGlow && (
                                <Circle
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.size + 3.5}
                                    fill={colorAccent}
                                    opacity={0.22}
                                />
                            )}
                            <Circle
                                cx={dot.x}
                                cy={dot.y}
                                r={dot.size}
                                fill={colorAccent}
                                opacity={dot.opacity}
                            />
                            {dot.isCrest && (
                                <Circle
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.size * 0.42}
                                    fill="#ffffff"
                                    opacity={0.92}
                                />
                            )}
                        </React.Fragment>
                    ))}

                    {/* Strand B Nodes */}
                    {strandB.map((dot, i) => (
                        <React.Fragment key={`b-${i}`}>
                            {dot.hasGlow && (
                                <Circle
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.size + 3.5}
                                    fill={colorAccent}
                                    opacity={0.22}
                                />
                            )}
                            <Circle
                                cx={dot.x}
                                cy={dot.y}
                                r={dot.size}
                                fill={colorAccent}
                                opacity={dot.opacity}
                            />
                            {dot.isCrest && (
                                <Circle
                                    cx={dot.x}
                                    cy={dot.y}
                                    r={dot.size * 0.42}
                                    fill="#ffffff"
                                    opacity={0.92}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </Svg>
            </Animated.View>
        </View>
    );
}
