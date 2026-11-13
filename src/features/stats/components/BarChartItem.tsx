import { useTheme } from "@/contexts/ThemeContext";
import * as Haptics from "expo-haptics";
import { memo, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export const BarChartItem = memo(function BarChartItem({
    day,
    focusSeconds,
    maxSeconds,
    isToday,
    isSelected = false,
    primaryColor,
    onPress,
}: {
    day: string;
    focusSeconds: number;
    maxSeconds: number;
    isToday: boolean;
    isSelected?: boolean;
    primaryColor: string;
    onPress?: () => void;
}) {
    const { colors } = useTheme();
    const heightAnim = useSharedValue(0);

    useEffect(() => {
        let targetHeight = 0;
        if (maxSeconds > 0 && focusSeconds > 0) {
            const ratio = Math.min(focusSeconds / maxSeconds, 1);
            targetHeight = Math.max(Math.sqrt(ratio) * 100, 10);
        }
        heightAnim.value = withSpring(targetHeight, { damping: 16, stiffness: 120 });
    }, [focusSeconds, maxSeconds]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: `${heightAnim.value}%`,
    }));

    const minutes = Math.round(focusSeconds / 60);

    const handlePress = () => {
        if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onPress();
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={!onPress}
            className="items-center flex-1 mx-0.5 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel={`${day}: ${minutes} minutes of focus`}
            accessibilityHint="Tap to view details for this day"
        >
            <View className="h-5 items-center justify-center mb-2">
                {minutes > 0 ? (
                    <Text
                        className="text-[11px] font-bold text-textSecondary"
                        numberOfLines={1}
                    >
                        {minutes >= 60 ? `${Math.floor(minutes / 60)}h` : `${minutes}m`}
                    </Text>
                ) : null}
            </View>

            <View
                style={{
                    width: 30,
                    height: 124,
                    borderRadius: 9999,
                    backgroundColor: colors.surface,
                    overflow: "hidden",
                    position: "relative",
                    justifyContent: "flex-end",
                }}
            >
                <Animated.View
                    style={[
                        {
                            width: "100%",
                            position: "absolute",
                            bottom: 0,
                            borderRadius: 9999,
                            backgroundColor: primaryColor,
                        },
                        animatedStyle,
                    ]}
                />
            </View>

            <Text
                className={`text-xs mt-3 ${isToday
                    ? "text-accent font-black"
                    : "text-textSecondary font-medium"
                    }`}
            >
                {day}
            </Text>
        </Pressable>
    );
});
