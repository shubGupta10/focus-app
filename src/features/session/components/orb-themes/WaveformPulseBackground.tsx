import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

const TRAIL_COUNT = 10;
const INNER_RADIUS = 105;
const OUTER_RADIUS = 155;
const CENTER = 170;

function getLineCoords(angleDeg: number) {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
        x1: CENTER + INNER_RADIUS * Math.cos(angleRad),
        y1: CENTER + INNER_RADIUS * Math.sin(angleRad),
        x2: CENTER + OUTER_RADIUS * Math.cos(angleRad),
        y2: CENTER + OUTER_RADIUS * Math.sin(angleRad),
    };
}

function SweepBeam({
    colorAccent,
    trailSpacing = 10,
    reverseTrail = false,
}: {
    colorAccent: string;
    trailSpacing?: number;
    reverseTrail?: boolean;
}) {
    const leadCoords = getLineCoords(0);

    return (
        <Svg width="340" height="340" viewBox="0 0 340 340">
            {Array.from({ length: TRAIL_COUNT }, (_, i) => {
                const angle = reverseTrail ? i * trailSpacing : -(i * trailSpacing);
                const coords = getLineCoords(angle);
                const opacity = Math.round((0.92 - (i / TRAIL_COUNT) * 0.72) * 100) / 100;
                const width = Math.round((3.2 - (i / TRAIL_COUNT) * 1.8) * 10) / 10;

                return (
                    <Line
                        key={i}
                        x1={coords.x1}
                        y1={coords.y1}
                        x2={coords.x2}
                        y2={coords.y2}
                        stroke={colorAccent}
                        strokeWidth={width}
                        strokeLinecap="round"
                        opacity={opacity}
                    />
                );
            })}

            {/* Inner Lead Anchor Bead */}
            <Circle
                cx={leadCoords.x1}
                cy={leadCoords.y1}
                r={2.8}
                fill={colorAccent}
                opacity={0.85}
            />

            {/* Lead Wavefront Head (Multi-layer high-contrast beacon) */}
            <Circle
                cx={leadCoords.x2}
                cy={leadCoords.y2}
                r={8}
                fill={colorAccent}
                opacity={0.25}
            />
            <Circle
                cx={leadCoords.x2}
                cy={leadCoords.y2}
                r={4.5}
                fill={colorAccent}
                opacity={0.9}
            />
            <Circle
                cx={leadCoords.x2}
                cy={leadCoords.y2}
                r={2}
                fill="#ffffff"
                opacity={0.95}
            />
        </Svg>
    );
}

export function WaveformPulseBackground({
    isActive,
    colorAccent,
}: OrbBackgroundProps) {
    const primarySpin = useRef(new Animated.Value(0)).current;
    const secondarySpin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isActive) {
            primarySpin.setValue(0);
            secondarySpin.setValue(0);
            return;
        }

        const primaryLoop = Animated.loop(
            Animated.timing(primarySpin, {
                toValue: 1,
                duration: 10000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const secondaryLoop = Animated.loop(
            Animated.timing(secondarySpin, {
                toValue: 1,
                duration: 15000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        primaryLoop.start();
        secondaryLoop.start();

        return () => {
            primaryLoop.stop();
            secondaryLoop.stop();
        };
    }, [primarySpin, secondarySpin, isActive]);

    // Primary: In idle (0), rests at LEFT (270°); When active, rotates clockwise to 630°
    const primaryRotate = primarySpin.interpolate({
        inputRange: [0, 1],
        outputRange: ["270deg", "630deg"],
    });

    // Secondary: In idle (0), rests at RIGHT (90°); When active, rotates counter-clockwise to -270°
    const secondaryRotate = secondarySpin.interpolate({
        inputRange: [0, 1],
        outputRange: ["90deg", "-270deg"],
    });

    return (
        <View style={{ width: 340, height: 340 }}>
            {/* Guide Tracks (Rendered once, high visibility) */}
            <Svg width="340" height="340" viewBox="0 0 340 340" style={{ position: "absolute" }}>
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={OUTER_RADIUS}
                    stroke={colorAccent}
                    strokeWidth="1.2"
                    fill="none"
                    opacity={0.16}
                />
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={INNER_RADIUS}
                    stroke={colorAccent}
                    strokeWidth="1.2"
                    fill="none"
                    opacity={0.16}
                />
            </Svg>

            {/* Left Wave (Primary, Clockwise) */}
            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: primaryRotate }],
                }}
            >
                <SweepBeam colorAccent={colorAccent} trailSpacing={10} />
            </Animated.View>

            {/* Right Wave (Secondary, Counter-Clockwise) */}
            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: secondaryRotate }],
                }}
            >
                <SweepBeam colorAccent={colorAccent} trailSpacing={8} reverseTrail />
            </Animated.View>
        </View>
    );
}
