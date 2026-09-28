import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export function BarChartItem({
    day,
    focusSeconds,
    maxSeconds,
    isToday,
    primaryColor,
    onPress,
}: {
    day: string;
    focusSeconds: number;
    maxSeconds: number;
    isToday: boolean;
    primaryColor: string;
    onPress?: () => void;
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
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            className="items-center justify-end flex-1 mx-1 active:opacity-70"
            accessible={true}
            accessibilityLabel={`${day}: ${minutes} minutes of focus`}
            accessibilityRole={onPress ? "button" : "text"}
        >
            <View className="h-28 w-full items-center justify-end">

                <Animated.View
                    className="w-full max-w-[20px] rounded-full absolute bottom-0"
                    style={[
                        animatedStyle,
                        { opacity: isToday ? 1 : 0.55 }
                    ]}
                />

                {minutes > 0 && (
                    <Animated.Text
                        style={[textAnimatedStyle, { paddingBottom: 6 }]}
                        className={`absolute text-[11px] font-medium ${isToday ? "text-accent" : "text-textSecondary"}`}
                        numberOfLines={1}
                    >
                        {minutes >= 60 ? `${Math.floor(minutes / 60)}h` : `${minutes}m`}
                    </Animated.Text>
                )}
            </View>

            <Text
                className={`text-[11px] mt-2.5 font-medium ${isToday ? "text-text font-semibold" : "text-textSecondary"}`}
            >
                {day}
            </Text>
        </Pressable>
    );
}
