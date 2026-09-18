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
                duration: 60000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const innerLoop = Animated.loop(
            Animated.timing(innerAnim, {
                toValue: 1,
                duration: 45000,
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

    const generateUniformDots = (radius: number, count: number, size: number, opacity: number, startAngle: number = 0) => {
        const dots = [];
        const step = 360 / count;
        for (let i = 0; i < count; i++) {
            const angle = startAngle + i * step;
            dots.push({ radius, angle, size, opacity });
        }
        return dots;
    };

    const outerDots = generateUniformDots(outerRadius, 10, 4, 0.8, 0);
    const innerDots = generateUniformDots(innerRadius, 8, 3, 0.6, 12);

    return (
        <View style={{ width: 340, height: 340 }}>
            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: outerRotate }]
                }}
            >
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    {/* Faint track line */}
                    <Circle cx="170" cy="170" r={outerRadius} stroke={colorAccent} strokeWidth="1" fill="none" opacity={0.2} />
                    {outerDots.map((dot, index) => {
                        const pos = getDotCoords(dot.radius, dot.angle);
                        return (
                            <Circle
                                key={`outer-${index}`}
                                cx={pos.x}
                                cy={pos.y}
                                r={dot.size}
                                fill={colorAccent}
                                opacity={dot.opacity}
                            />
                        );
                    })}
                </Svg>
            </Animated.View>

            <Animated.View
                style={{
                    position: "absolute",
                    width: 340,
                    height: 340,
                    transform: [{ rotate: innerRotate }]
                }}
            >
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    {/* Faint track line */}
                    <Circle cx="170" cy="170" r={innerRadius} stroke={colorAccent} strokeWidth="1" fill="none" opacity={0.15} />
                    {innerDots.map((dot, index) => {
                        const pos = getDotCoords(dot.radius, dot.angle);
                        return (
                            <Circle
                                key={`inner-${index}`}
                                cx={pos.x}
                                cy={pos.y}
                                r={dot.size}
                                fill={colorAccent}
                                opacity={dot.opacity}
                            />
                        );
                    })}
                </Svg>
            </Animated.View>
        </View>
    );
}
