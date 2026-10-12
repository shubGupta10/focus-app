import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

const STAR_COUNT = 24;
const MIN_RADIUS = 112;
const MAX_RADIUS = 158;
const CENTER = 170;
const CONNECTION_DISTANCE = 56;

function seededRandom(seed: number) {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
}

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    baseOpacity: number;
    isMajor: boolean;
    group: number;
}

interface Connection {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

function generateConstellationSky() {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        const baseAngle = (i / STAR_COUNT) * 360;
        const angleJitter = (seededRandom(i * 7 + 1) - 0.5) * (360 / STAR_COUNT) * 1.2;
        const angle = baseAngle + angleJitter;
        const radius = MIN_RADIUS + seededRandom(i * 13 + 3) * (MAX_RADIUS - MIN_RADIUS);
        const angleRad = (angle - 90) * (Math.PI / 180);

        const size = 2 + seededRandom(i * 19 + 5) * 2.2;
        const isMajor = size > 3.4;

        stars.push({
            id: i,
            x: CENTER + radius * Math.cos(angleRad),
            y: CENTER + radius * Math.sin(angleRad),
            size,
            baseOpacity: 0.8 + seededRandom(i * 23 + 7) * 0.2,
            isMajor,
            group: i % 2,
        });
    }

    const connections: Connection[] = [];
    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < CONNECTION_DISTANCE) {
                connections.push({
                    x1: stars[i].x,
                    y1: stars[i].y,
                    x2: stars[j].x,
                    y2: stars[j].y,
                });
            }
        }
    }

    return { stars, connections };
}

function renderStarNodes(starList: Star[], colorAccent: string) {
    return starList.map((star) => (
        <React.Fragment key={`s-${star.id}`}>
            {star.isMajor && (
                <Circle
                    cx={star.x}
                    cy={star.y}
                    r={star.size + 2}
                    fill={colorAccent}
                    opacity={0.18}
                />
            )}
            <Circle
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill={colorAccent}
                opacity={star.baseOpacity}
            />
            {star.isMajor && (
                <Circle
                    cx={star.x}
                    cy={star.y}
                    r={star.size * 0.45}
                    fill="#ffffff"
                    opacity={0.8}
                />
            )}
        </React.Fragment>
    ));
}

export function ConstellationBackground({
    isActive,
    colorAccent,
}: OrbBackgroundProps) {
    const { stars, connections } = useMemo(() => generateConstellationSky(), []);

    const steadyStars = useMemo(() => stars.filter((s) => s.group === 0), [stars]);
    const shimmerStars = useMemo(() => stars.filter((s) => s.group === 1), [stars]);

    const drift = useRef(new Animated.Value(0)).current;
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isActive) {
            drift.setValue(0);
            shimmer.setValue(0);
            return;
        }

        const driftLoop = Animated.loop(
            Animated.timing(drift, {
                toValue: 1,
                duration: 60000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const shimmerLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        driftLoop.start();
        shimmerLoop.start();

        return () => {
            driftLoop.stop();
            shimmerLoop.stop();
        };
    }, [drift, shimmer, isActive]);

    const rotation = drift.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const shimmerOpacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.45],
    });

    return (
        <View style={{ width: 340, height: 340 }}>
            <Animated.View
                style={{
                    width: 340,
                    height: 340,
                    transform: [{ rotate: rotation }],
                }}
            >
                {/* Layer 1: Connection Lines and Steady Stars */}
                <Svg width="340" height="340" viewBox="0 0 340 340" style={{ position: "absolute" }}>
                    {connections.map((conn, i) => (
                        <Line
                            key={`c-${i}`}
                            x1={conn.x1}
                            y1={conn.y1}
                            x2={conn.x2}
                            y2={conn.y2}
                            stroke={colorAccent}
                            strokeWidth="1"
                            strokeLinecap="round"
                            opacity={0.32}
                        />
                    ))}
                    {renderStarNodes(steadyStars, colorAccent)}
                </Svg>

                {/* Layer 2: Shimmering Stars (100% Native GPU Driver) */}
                <Animated.View
                    style={{
                        position: "absolute",
                        width: 340,
                        height: 340,
                        opacity: shimmerOpacity,
                    }}
                >
                    <Svg width="340" height="340" viewBox="0 0 340 340">
                        {renderStarNodes(shimmerStars, colorAccent)}
                    </Svg>
                </Animated.View>
            </Animated.View>
        </View>
    );
}
