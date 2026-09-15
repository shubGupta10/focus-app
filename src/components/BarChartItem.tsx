import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export function BarChartItem({
    day,
    focusSeconds,
    maxSeconds,
    isToday,
    primaryColor,
}: {
    day: string;
    focusSeconds: number;
    maxSeconds: number;
    isToday: boolean;
    primaryColor: string;
}) {
    const heightAnim = useSharedValue(0);

    useEffect(() => {
        const targetHeight = maxSeconds > 0 ? (focusSeconds / maxSeconds) * 100 : 0;
        // Even if 0, we can keep it 0 or a tiny bit (like 4) so there is a small dot if desired, but 0 is fine since we have a track now.
        heightAnim.value = withSpring(targetHeight, { damping: 16, stiffness: 120 });
    }, [focusSeconds, maxSeconds]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: `${heightAnim.value}%`,
        backgroundColor: primaryColor,
    }));

    const minutes = Math.round(focusSeconds / 60);

    return (
        <View
            className="items-center justify-end flex-1 mx-1"
            accessible={true}
            accessibilityLabel={`${day}: ${minutes} minutes of focus`}
            accessibilityRole="text"
        >
            <View className="h-28 w-full max-w-[20px] bg-surfaceElevated rounded-full overflow-hidden flex-col justify-end">
                <Animated.View
                    className="w-full rounded-full"
                    style={[
                        animatedStyle,
                        { opacity: isToday ? 1 : 0.45 }
                    ]}
                />
            </View>
            <Text
                className={`text-[10px] mt-2.5 font-semibold ${isToday ? 'text-text font-bold' : 'text-textSecondary'}`}
            >
                {day}
            </Text>
        </View>
    );
}
