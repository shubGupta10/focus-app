import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

export function SolarSystemBackground({
    isActive,
    colorAccent,
    colorTrack,
    colorDotCenter,
    outerRadius,
    innerRadius,
    sessionProgress,
    minuteProgress,
}: OrbBackgroundProps) {
    const outerAnim = useRef(new Animated.Value(0)).current;
    const innerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const outerLoop = Animated.loop(
            Animated.timing(outerAnim, {
                toValue: 1,
                duration: 40000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const innerLoop = Animated.loop(
            Animated.timing(innerAnim, {
                toValue: 1,
                duration: 30000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        outerLoop.start();
        innerLoop.start();

        return () => {
            outerLoop.stop();
            innerLoop.stop();
        };
    }, [outerAnim, innerAnim]);

    const outerRotate = outerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const innerRotate = innerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["360deg", "0deg"],
    });

    const getDotCoords = (radius: number, angleDeg: number) => {
        const angleRad = (angleDeg - 90) * (Math.PI / 180);
        return {
            x: 170 + radius * Math.cos(angleRad),
            y: 170 + radius * Math.sin(angleRad),
        };
    };

    const outerPlanets = [
        { angle: 0, size: 5, opacity: 0.85, hasGlow: true, hasMoon: true },
        { angle: 45, size: 5, opacity: 0.85, hasGlow: false, hasMoon: false },
        { angle: 90, size: 5, opacity: 0.85, hasGlow: true, hasMoon: false },
        { angle: 135, size: 5, opacity: 0.85, hasGlow: false, hasMoon: false },
        { angle: 180, size: 5, opacity: 0.85, hasGlow: true, hasMoon: true },
        { angle: 225, size: 5, opacity: 0.85, hasGlow: false, hasMoon: false },
        { angle: 270, size: 5, opacity: 0.85, hasGlow: true, hasMoon: false },
        { angle: 315, size: 5, opacity: 0.85, hasGlow: false, hasMoon: false },
    ];

    const innerPlanets = [
        { angle: 30, size: 4, opacity: 0.65, hasGlow: false },
        { angle: 90, size: 4, opacity: 0.65, hasGlow: false },
        { angle: 150, size: 4, opacity: 0.65, hasGlow: false },
        { angle: 210, size: 4, opacity: 0.65, hasGlow: false },
        { angle: 270, size: 4, opacity: 0.65, hasGlow: false },
        { angle: 330, size: 4, opacity: 0.65, hasGlow: false },
    ];

    const renderPlanet = (
        radius: number,
        planet: { angle: number; size: number; opacity: number; hasGlow?: boolean; hasMoon?: boolean },
        key: string
    ) => {
        const pos = getDotCoords(radius, planet.angle);
        const elements = [];

        if (planet.hasGlow) {
            elements.push(
                <Circle
                    key={`${key}-glow`}
                    cx={pos.x}
                    cy={pos.y}
                    r={planet.size + 5}
                    fill={colorAccent}
                    opacity={0.08}
                />
            );
        }

        elements.push(
            <Circle
                key={`${key}-body`}
                cx={pos.x}
                cy={pos.y}
                r={planet.size}
                fill={colorAccent}
                opacity={planet.opacity}
            />
        );

        elements.push(
            <Circle
                key={`${key}-core`}
                cx={pos.x}
                cy={pos.y}
                r={planet.size * 0.35}
                fill={colorDotCenter}
                opacity={0.4}
            />
        );

        if (planet.hasMoon) {
            const moonPos = getDotCoords(radius + 12, planet.angle + 8);
            elements.push(
                <Circle
                    key={`${key}-moon`}
                    cx={moonPos.x}
                    cy={moonPos.y}
                    r={1.5}
                    fill={colorAccent}
                    opacity={0.5}
                />
            );
        }

        return elements;
    };

    return (
        <View style={{ width: 340, height: 340 }}>
            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: outerRotate }],
                }}
            >
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    <Circle
                        cx="170"
                        cy="170"
                        r={outerRadius}
                        stroke={colorAccent}
                        strokeWidth="1"
                        fill="none"
                        opacity={0.2}
                    />
                    {outerPlanets.map((planet, i) =>
                        renderPlanet(outerRadius, planet, `outer-${i}`)
                    )}
                </Svg>
            </Animated.View>

            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: innerRotate }],
                }}
            >
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    <Circle
                        cx="170"
                        cy="170"
                        r={innerRadius}
                        stroke={colorAccent}
                        strokeWidth="1"
                        fill="none"
                        opacity={0.15}
                    />
                    {innerPlanets.map((planet, i) =>
                        renderPlanet(innerRadius, planet, `inner-${i}`)
                    )}
                </Svg>
            </Animated.View>
        </View>
    );
}
