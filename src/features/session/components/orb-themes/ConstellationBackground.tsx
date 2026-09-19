import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STAR_COUNT = 22;
const MIN_RADIUS = 108;
const MAX_RADIUS = 160;
const CENTER = 170;
const CONNECTION_DISTANCE = 55;
const TWINKLE_GROUPS = 4;

function seededRandom(seed: number) {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
}

function generateStars() {
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        const angle = seededRandom(i * 7 + 1) * 360;
        const radius = MIN_RADIUS + seededRandom(i * 13 + 3) * (MAX_RADIUS - MIN_RADIUS);
        const angleRad = (angle - 90) * (Math.PI / 180);

        stars.push({
            x: CENTER + radius * Math.cos(angleRad),
            y: CENTER + radius * Math.sin(angleRad),
            size: 1.5 + seededRandom(i * 19 + 5) * 2.5,
            baseOpacity: 0.3 + seededRandom(i * 23 + 7) * 0.4,
            group: i % TWINKLE_GROUPS,
        });
    }
    return stars;
}

function generateConnections(stars: ReturnType<typeof generateStars>) {
    const connections: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
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
    return connections;
}

export function ConstellationBackground({
    isActive,
    colorAccent,
}: OrbBackgroundProps) {
    const stars = useMemo(() => generateStars(), []);
    const connections = useMemo(() => generateConnections(stars), [stars]);

    const drift = useRef(new Animated.Value(0)).current;
    const groupAnims = useRef(
        Array.from({ length: TWINKLE_GROUPS }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const driftLoop = Animated.loop(
            Animated.timing(drift, {
                toValue: 1,
                duration: 60000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        driftLoop.start();

        const twinkleLoops = groupAnims.map((anim, i) => {
            anim.setValue(0);
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 2500 + i * 600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: false,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 2500 + i * 600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: false,
                    }),
                ])
            );
        });

        twinkleLoops.forEach((l, i) => {
            setTimeout(() => l.start(), i * 800);
        });

        return () => {
            driftLoop.stop();
            twinkleLoops.forEach(l => l.stop());
        };
    }, [drift, groupAnims]);

    const rotation = drift.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
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
                <Svg width="340" height="340" viewBox="0 0 340 340">
                    <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={MIN_RADIUS}
                        stroke={colorAccent}
                        strokeWidth="0.5"
                        fill="none"
                        opacity={0.05}
                    />
                    <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={MAX_RADIUS}
                        stroke={colorAccent}
                        strokeWidth="0.5"
                        fill="none"
                        opacity={0.05}
                    />

                    {connections.map((conn, i) => (
                        <Line
                            key={`c-${i}`}
                            x1={conn.x1}
                            y1={conn.y1}
                            x2={conn.x2}
                            y2={conn.y2}
                            stroke={colorAccent}
                            strokeWidth="0.6"
                            opacity={0.12}
                        />
                    ))}

                    {stars.map((star, i) => {
                        const twinkleOpacity = groupAnims[star.group].interpolate({
                            inputRange: [0, 1],
                            outputRange: [star.baseOpacity * 0.5, star.baseOpacity],
                        });

                        return (
                            <AnimatedCircle
                                key={`s-${i}`}
                                cx={star.x}
                                cy={star.y}
                                r={star.size}
                                fill={colorAccent}
                                opacity={twinkleOpacity}
                            />
                        );
                    })}
                </Svg>
            </Animated.View>
        </View>
    );
}
