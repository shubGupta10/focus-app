import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CoinIconProps {
    size?: number;
}

export function CoinIcon({ size = 16 }: CoinIconProps) {
    const strokeWidth = Math.max(1, size * 0.08);
    const centerRadius = size * 0.28;

    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - strokeWidth / 2}
                    fill="#F3C443"
                    stroke="#D9A826"
                    strokeWidth={strokeWidth}
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={centerRadius}
                    fill="none"
                    stroke="#D9A826"
                    strokeWidth={strokeWidth * 0.9}
                />
            </Svg>
        </View>
    );
}
