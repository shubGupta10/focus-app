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

function SweepBeam({ colorAccent, trailSpacing = 10 }: { colorAccent: string; trailSpacing?: number }) {
    const leadCoords = getLineCoords(0);

    return (
        <Svg width="340" height="340" viewBox="0 0 340 340">
            <Circle
                cx={CENTER}
                cy={CENTER}
                r={OUTER_RADIUS}
                stroke={colorAccent}
                strokeWidth="1"
                fill="none"
                opacity={0.08}
            />
            <Circle
                cx={CENTER}
                cy={CENTER}
                r={INNER_RADIUS}
                stroke={colorAccent}
                strokeWidth="1"
                fill="none"
                opacity={0.08}
            />

            {Array.from({ length: TRAIL_COUNT }, (_, i) => {
                const angle = -(i * trailSpacing);
                const coords = getLineCoords(angle);
                const opacity = 0.5 - (i / TRAIL_COUNT) * 0.45;
                const width = 2 - (i / TRAIL_COUNT) * 1.2;

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

            <Circle
                cx={leadCoords.x2}
                cy={leadCoords.y2}
                r={6}
                fill={colorAccent}
                opacity={0.15}
            />
            <Circle
                cx={leadCoords.x2}
                cy={leadCoords.y2}
                r={3.5}
                fill={colorAccent}
                opacity={0.7}
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
        if (!isActive) return;

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

    const primaryRotate = primarySpin.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const secondaryRotate = secondarySpin.interpolate({
        inputRange: [0, 1],
        outputRange: ["360deg", "0deg"],
    });

    return (
        <View style={{ width: 340, height: 340 }}>
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

            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: secondaryRotate }],
                }}
            >
                <SweepBeam colorAccent={colorAccent} trailSpacing={8} />
            </Animated.View>
        </View>
    );
}
