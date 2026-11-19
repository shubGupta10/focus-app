import { AnimatedPressable } from "@/components/AnimatedPressable";
import { CoinIcon } from "@/components/CoinIcon";
import { useTheme } from "@/contexts/ThemeContext";
import { getOrbBackground } from "@/features/session/components/orb-themes";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopItem } from "../data/shopCatalog";
import { formatCoinBalance } from "@/features/stats/utils/stats_utils";

interface ShopHeroPreviewProps {
    selectedStyle: ShopItem;
    totalCoins: number;
    isFocused: boolean;
    onBack: () => void;
    onSecretBoost?: () => void;
}

export function ShopHeroPreview({
    selectedStyle,
    totalCoins,
    isFocused,
    onBack,
    onSecretBoost,
}: ShopHeroPreviewProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    const PreviewComponent = getOrbBackground(selectedStyle?.themeValue || "solar");
    const topLayoutHeight = Math.round(height * 0.49);
    const previewSize = Math.min(235, Math.round(width * 0.60));
    const previewScale = previewSize / 340;

    return (
        <View
            style={{
                height: topLayoutHeight,
                paddingTop: insets.top > 0 ? insets.top + 8 : 16,
            }}
            className="justify-between items-center"
        >
            <View className="w-full flex-row items-center justify-between px-6">
                <AnimatedPressable
                    onPress={onBack}
                    hapticMode="light"
                    scaleTo={0.88}
                    className="w-11 h-11 rounded-full items-center justify-center border border-border"
                    style={{ backgroundColor: colors.surfaceElevated, elevation: 1 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="chevron-back" size={20} color={colors.text} />
                </AnimatedPressable>

                <Pressable
                    onLongPress={onSecretBoost}
                    delayLongPress={600}
                    className="h-11 px-4 rounded-full flex-row items-center border border-border active:opacity-85"
                    style={{ backgroundColor: colors.surfaceElevated, elevation: 1 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Coin balance: ${totalCoins}`}
                >
                    <CoinIcon size={18} />
                    <Text className="text-text font-bold text-base ml-2">
                        {formatCoinBalance(totalCoins)}
                    </Text>
                </Pressable>
            </View>

            <View className="flex-1 items-center justify-center my-1">
                <View
                    style={{
                        width: previewSize,
                        height: previewSize,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <View
                        style={{
                            width: 340,
                            height: 340,
                            transform: [{ scale: previewScale }],
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <PreviewComponent
                            isActive={isFocused}
                            colorAccent={colors.accent}
                            colorTrack={colors.textSecondary}
                            colorDotCenter={colors.accent}
                            outerRadius={156}
                            innerRadius={126}
                            sessionProgress={null}
                            minuteProgress={null}
                        />
                    </View>
                </View>
            </View>

            <View className="items-center px-6 pb-3">
                <Text
                    className="text-text font-black text-2xl text-center tracking-tight"
                    numberOfLines={1}
                >
                    {selectedStyle?.name}
                </Text>
                <View style={{ height: 38 }} className="justify-center px-6 mt-1">
                    <Text
                        className="text-textSecondary text-[13px] font-normal text-center leading-[18px]"
                        numberOfLines={2}
                    >
                        {selectedStyle?.description}
                    </Text>
                </View>
            </View>
        </View>
    );
}
