import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { GlobalLoader } from "@/components/GlobalLoader";
import { ShopItem } from "../data/shopCatalog";
import { AnimatedPressable } from "@/components/AnimatedPressable";

interface ShopItemCardProps {
    item: ShopItem;
    isOwned: boolean;
    isEquipped: boolean;
    isProcessing: boolean;
    onBuy: () => void;
    onEquip: () => void;
}

export function ShopItemCard({ item, isOwned, isEquipped, isProcessing, onBuy, onEquip }: ShopItemCardProps) {
    const { colors } = useTheme();

    return (
        <View className='bg-surfaceElevated rounded-2xl p-4 mb-4 border border-border'>
            <View className='flex-row items-center justify-between mb-3'>
                <View className='flex-row items-center flex-1'>
                    <View className='w-12 h-12 rounded-full items-center justify-center mr-3'
                        style={{ backgroundColor: `${colors.accent}15` }}
                    >
                        <Ionicons name={item.icon} size={24} color={colors.accent} />
                    </View>
                    <View className='flex-1'>
                        <Text className="text-text font-bold text-lg">{item.name}</Text>
                        <Text className="text-textSecondary text-xs font-semibold uppercase tracking-wider mt-0.5">
                            {item.type}
                        </Text>
                    </View>
                </View>

                {!isOwned && (
                    <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-full">
                        <Ionicons name="flame" size={14} color="#f59e0b" style={{ marginRight: 4 }} />
                        <Text className="text-text font-bold">{item.cost}</Text>
                    </View>
                )}
            </View>

            <Text className="text-textSecondary text-sm mb-4 leading-relaxed">
                {item.description}
            </Text>
            {isEquipped ? (
                <View className="bg-surface py-3 rounded-xl items-center border border-accent/30">
                    <Text className="text-accent font-bold text-sm">Equipped</Text>
                </View>
            ) : isOwned ? (
                <AnimatedPressable
                    onPress={onEquip}
                    hapticMode="light"
                    disabled={isProcessing}
                    className="bg-surface py-3 rounded-xl items-center border border-border"
                >
                    <Text className="text-text font-bold text-sm">Equip</Text>
                </AnimatedPressable>
            ) : (
                <AnimatedPressable
                    onPress={onBuy}
                    hapticMode="light"
                    disabled={isProcessing}
                    className="py-3 rounded-xl items-center flex-row justify-center"
                    style={{ backgroundColor: colors.accent }}
                >
                    {isProcessing ? (
                        <GlobalLoader color="#fff" size="small" />
                    ) : (
                        <Text className="text-accentForeground font-bold text-sm">Unlock Theme</Text>
                    )}
                </AnimatedPressable>
            )}
        </View>
    );
}