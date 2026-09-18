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
        heightAnim.value = withSpring(targetHeight, { damping: 16, stiffness: 120 });
    }, [focusSeconds, maxSeconds]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: `${heightAnim.value}%`,
        backgroundColor: primaryColor,
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        bottom: `${heightAnim.value}%`,
    }));

    const minutes = Math.round(focusSeconds / 60);

    return (
        <View
            className="items-center justify-end flex-1 mx-1"
            accessible={true}
            accessibilityLabel={`${day}: ${minutes} minutes of focus`}
            accessibilityRole="text"
        >
            <View className="h-28 w-full items-center justify-end">
                <View className="absolute inset-y-0 w-full max-w-[20px] bg-surfaceElevated rounded-full" />
                
                <Animated.View
                    className="w-full max-w-[20px] rounded-full absolute bottom-0"
                    style={[
                        animatedStyle,
                        { opacity: isToday ? 1 : 0.45 }
                    ]}
                />

                {minutes > 0 && (
                    <Animated.Text
                        style={[textAnimatedStyle, { paddingBottom: 6 }]}
                        className={`absolute text-[12px] font-bold ${isToday ? 'text-accent' : 'text-textSecondary'}`}
                        numberOfLines={1}
                    >
                        {minutes > 60 ? `${Math.floor(minutes / 60)}h` : `${minutes}m`}
                    </Animated.Text>
                )}
            </View>

            <Text
                className={`text-[10px] mt-2.5 font-semibold ${isToday ? 'text-text font-bold' : 'text-textSecondary'}`}
            >
                {day}
            </Text>
        </View>
    );
}
