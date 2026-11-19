import { AnimatedPressable } from "@/components/AnimatedPressable";
import { CoinIcon } from "@/components/CoinIcon";
import { GlobalLoader } from "@/components/GlobalLoader";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShopItem } from "../data/shopCatalog";

interface ShopActionBarProps {
    selectedStyle: ShopItem;
    totalCoins: number;
    isSelectedEquipped: boolean;
    isSelectedOwned: boolean;
    canAffordSelected: boolean;
    isProcessing: boolean;
    onEquip: (id: string) => void;
    onBuy: (item: ShopItem) => void;
}

export function ShopActionBar({
    selectedStyle,
    totalCoins,
    isSelectedEquipped,
    isSelectedOwned,
    canAffordSelected,
    isProcessing,
    onEquip,
    onBuy,
}: ShopActionBarProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            className="border-t border-border px-6 pt-2"
            style={{
                backgroundColor: colors.surface,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            }}
        >
            {!isSelectedOwned && selectedStyle ? (
                <Text className="text-textSecondary text-[12.5px] font-medium text-center mb-1.5">
                    {canAffordSelected
                        ? `You will have ${(totalCoins - selectedStyle.cost).toLocaleString()} coins left`
                        : `${selectedStyle.name} costs ${selectedStyle.cost.toLocaleString()} coins`}
                </Text>
            ) : null}

            {isSelectedEquipped ? (
                <View
                    className="w-full h-12 rounded-full items-center justify-center border border-border"
                    style={{ backgroundColor: colors.surfaceElevated }}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: true }}
                    accessibilityLabel="Equipped"
                >
                    <Text style={{ color: colors.textSecondary }} className="font-bold text-[15px]">
                        Equipped
                    </Text>
                </View>
            ) : isSelectedOwned ? (
                <AnimatedPressable
                    disabled={isProcessing}
                    onPress={() => onEquip(selectedStyle.id)}
                    hapticMode="light"
                    scaleTo={0.97}
                    className="w-full h-12 rounded-full items-center justify-center active:opacity-90"
                    style={{ backgroundColor: colors.accent }}
                    accessibilityRole="button"
                    accessibilityLabel={`Equip ${selectedStyle.name}`}
                >
                    {isProcessing ? (
                        <GlobalLoader size="small" color={colors.accentForeground} />
                    ) : (
                        <Text className="text-accentForeground font-bold text-[15px]">
                            Equip
                        </Text>
                    )}
                </AnimatedPressable>
            ) : canAffordSelected ? (
                <AnimatedPressable
                    disabled={isProcessing}
                    onPress={() => onBuy(selectedStyle)}
                    hapticMode="light"
                    scaleTo={0.97}
                    className="w-full h-12 rounded-full flex-row items-center justify-center active:opacity-90"
                    style={{ backgroundColor: colors.accent }}
                    accessibilityRole="button"
                    accessibilityLabel={`Buy ${selectedStyle.name} for ${selectedStyle.cost} coins`}
                >
                    {isProcessing ? (
                        <GlobalLoader size="small" color={colors.accentForeground} />
                    ) : (
                        <>
                            <CoinIcon size={17} />
                            <Text className="text-accentForeground font-bold text-[15px] ml-2">
                                Buy for {selectedStyle.cost.toLocaleString()}
                            </Text>
                        </>
                    )}
                </AnimatedPressable>
            ) : (
                <View
                    className="w-full h-12 rounded-full items-center justify-center border border-border"
                    style={{ backgroundColor: colors.surfaceElevated }}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: true }}
                    accessibilityLabel={`Need ${selectedStyle ? selectedStyle.cost - totalCoins : 0} more coins`}
                >
                    <Text style={{ color: colors.textSecondary }} className="font-bold text-[15px]">
                        Need {(selectedStyle ? selectedStyle.cost - totalCoins : 0).toLocaleString()} more coins
                    </Text>
                </View>
            )}
        </View>
    );
}
