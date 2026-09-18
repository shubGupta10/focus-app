import { useTheme } from "@/contexts/ThemeContext";
import { ShopItemCard } from "@/features/shop/components/ShopItemCard";
import { useShopController } from "@/features/shop/hooks/useShopController";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShopScreen() {
    const { activeStyle, colors, isDarkMode } = useTheme();
    const {
        catalog,
        purchasedItems,
        equippedTheme,
        totalCoins,
        isProcessing,
        handleBuyItem,
        handleEquipItem
    } = useShopController();


    return (
        <SafeAreaView className="flex-1 bg-surface" style={activeStyle}>
            <StatusBar style={isDarkMode ? "light" : 'dark'} />

            <View className='flex-row items-center justify-between px-6 py-4'>
                <View className='flex-row items-center'>
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-surfaceElevated items-center justify-center mr-3 active:opacity-70"
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                    </Pressable>
                    <Text className="text-text font-bold text-2xl tracking-tight">Coin Shop</Text>
                </View>

                <View className='flex-row items-center bg-surfaceElevated px-3 py-1.5 rounded-full border border-border'>
                    <Ionicons name="flame" size={16} color='#f59e0b' style={{ marginRight: 6 }} />
                    <Text className="text-text font-extrabold text-base">{totalCoins}</Text>
                </View>
            </View>

            <FlatList
                data={catalog}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: 40,
                    paddingTop: 8
                }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <ShopItemCard
                        item={item}
                        isOwned={purchasedItems.has(item.id)}
                        isEquipped={equippedTheme === item.id}
                        isProcessing={isProcessing}
                        onBuy={() => handleBuyItem(item)}
                        onEquip={() => handleEquipItem(item.id)}
                    />
                )}
            />
        </SafeAreaView>
    )
}