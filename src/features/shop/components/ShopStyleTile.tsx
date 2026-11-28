import { CoinIcon } from "@/components/CoinIcon";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { getOrbBackground } from "@/features/session/components/orb-themes";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { ShopItem } from "../data/shopCatalog";
import { formatCoinBalance } from "@/features/stats/utils/stats_utils";

interface ShopStyleTileProps {
    item: ShopItem;
    isSelected: boolean;
    isEquipped: boolean;
    isOwned: boolean;
    canAfford: boolean;
    onSelect: (item: ShopItem) => void;
}

export const ShopStyleTile = memo(function ShopStyleTile({
    item,
    isSelected,
    isEquipped,
    isOwned,
    canAfford,
    onSelect,
}: ShopStyleTileProps) {
    const { colors, isDarkMode } = useTheme();

    const OrbBg = getOrbBackground(item.themeValue);
    const swatchColor =
        item.type === "theme"
            ? item.id === "theme_default"
                ? (isDarkMode ? Colors.dark.accent : Colors.light.accent)
                : (item.hexColor ?? colors.accent)
            : colors.accent;

    const accessibilityStatus = isEquipped
        ? "Equipped"
        : isOwned
            ? "Owned"
            : canAfford
                ? `${item.cost} coins`
                : `Locked, costs ${item.cost} coins`;

    return (
        <Pressable
            onPress={() => onSelect(item)}
            className="flex-1 p-2 rounded-[16px] active:opacity-85"
            style={{
                backgroundColor: isEquipped ? colors.accent : colors.surfaceElevated,
                borderWidth: isSelected ? 2 : 1.5,
                borderColor: isSelected
                    ? (isEquipped ? colors.accentForeground : colors.accent)
                    : (isEquipped ? colors.accent : colors.border),
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${item.name}, ${accessibilityStatus}`}
        >
            <View
                className="w-full h-[74px] rounded-[10px] items-center justify-center overflow-hidden border border-border"
                style={{ backgroundColor: colors.background }}
            >
                {item.type === "theme" ? (
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: swatchColor + "2E" }}
                    >
                        <View
                            className="w-7 h-7 rounded-full"
                            style={{
                                backgroundColor: swatchColor,
                                borderWidth: 1.5,
                                borderColor: colors.border,
                            }}
                        />
                    </View>
                ) : (
                    <View
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            width: 340,
                            height: 340,
                            alignItems: "center",
                            justifyContent: "center",
                            transform: [{ scale: 0.22 }],
                        }}
                    >
                        <OrbBg
                            isActive={false}
                            colorAccent={colors.accent}
                            colorTrack={colors.accent}
                            colorDotCenter={colors.accent}
                            outerRadius={156}
                            innerRadius={126}
                            sessionProgress={null}
                            minuteProgress={null}
                        />
                    </View>
                )}
            </View>

            <Text
                className="font-bold text-[12px] text-center mt-1.5 tracking-tight px-0.5"
                style={{ color: isEquipped ? colors.accentForeground : colors.text }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
            >
                {item.name}
            </Text>

            <View className="flex-row items-center justify-center mt-1 h-4">
                {isEquipped ? (
                    <View className="flex-row items-center justify-center">
                        <Ionicons
                            name="checkmark"
                            size={11}
                            color={colors.accentForeground}
                            style={{ marginRight: 2 }}
                        />
                        <Text
                            style={{ color: colors.accentForeground }}
                            className="text-[11px] font-bold"
                        >
                            Equipped
                        </Text>
                    </View>
                ) : isOwned ? (
                    <Text className="text-textSecondary text-[11px] font-semibold">
                        Owned
                    </Text>
                ) : canAfford ? (
                    <>
                        <CoinIcon size={11.5} />
                        <Text className="text-text text-[11px] font-bold ml-1">
                            {formatCoinBalance(item.cost)}
                        </Text>
                    </>
                ) : (
                    <>
                        <Ionicons
                            name="lock-closed"
                            size={10.5}
                            color={colors.textMuted}
                            style={{ marginRight: 3 }}
                        />
                        <Text className="text-textMuted text-[11px] font-semibold">
                            {formatCoinBalance(item.cost)}
                        </Text>
                    </>
                )}
            </View>
        </Pressable>
    );
});
