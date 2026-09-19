import Svg, { Circle } from "react-native-svg";
import { OrbBackgroundProps } from "./OrbBackgroundProps";

export function ClassicProgressBackground({
    isActive,
    colorAccent,
    colorTrack,
    colorDotCenter,
    outerRadius,
    innerRadius,
    sessionProgress,
    minuteProgress,
}: OrbBackgroundProps) {
    const outerCircumference = 2 * Math.PI * outerRadius;
    const clampedSession = sessionProgress !== null && sessionProgress !== undefined ? Math.max(0, Math.min(1, sessionProgress)) : 1;
    const outerOffset = outerCircumference * (1 - clampedSession);

    const innerCircumference = 2 * Math.PI * innerRadius;
    const clampedMinute = minuteProgress !== null && minuteProgress !== undefined ? Math.max(0, Math.min(1, minuteProgress)) : 1;
    const innerOffset = innerCircumference * (1 - clampedMinute);

    const minuteAngle = -Math.PI / 2 + clampedMinute * 2 * Math.PI;
    const dotX = 170 + innerRadius * Math.cos(minuteAngle);
    const dotY = 170 + innerRadius * Math.sin(minuteAngle);

    return (
        <Svg width="340" height="340" viewBox="0 0 340 340">
            {/* Outer Track & Session Progress */}
            <Circle
                cx="170"
                cy="170"
                r={outerRadius}
                stroke={colorTrack}
                strokeWidth="2.5"
                fill="none"
                opacity={0.35}
            />
            {isActive && clampedSession > 0 && (
                <Circle
                    cx="170"
                    cy="170"
                    r={outerRadius}
                    stroke={colorAccent}
                    strokeWidth="3.5"
                    fill="none"
                    strokeDasharray={outerCircumference}
                    strokeDashoffset={outerOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 170 170)"
                />
            )}

            {/* Inner Track & Minute Orbit */}
            <Circle
                cx="170"
                cy="170"
                r={innerRadius}
                stroke={colorTrack}
                strokeWidth="1.5"
                fill="none"
                opacity={0.35}
            />
            {isActive && clampedMinute > 0 && (
                <>
                    <Circle
                        cx="170"
                        cy="170"
                        r={innerRadius}
                        stroke={colorAccent}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={innerCircumference}
                        strokeDashoffset={innerOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 170 170)"
                        opacity={0.65}
                    />
                    {/* Glowing Orbiting Second Dot */}
                    <Circle
                        cx={dotX}
                        cy={dotY}
                        r="8"
                        fill={colorAccent}
                        opacity={0.25}
                    />
                    <Circle
                        cx={dotX}
                        cy={dotY}
                        r="4.5"
                        fill={colorAccent}
                    />
                    <Circle
                        cx={dotX}
                        cy={dotY}
                        r="2"
                        fill={colorDotCenter}
                    />
                </>
            )}
        </Svg>
    );
}
