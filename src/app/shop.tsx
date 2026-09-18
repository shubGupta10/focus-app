import { useTheme } from "@/contexts/ThemeContext";
import { ShopItemCard } from "@/features/shop/components/ShopItemCard";
import { useShopController } from "@/features/shop/hooks/useShopController";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShopScreen() {
    const { activeStyle, colors, isDarkMode } = useTheme();
    const {
        catalog,
        purchasedItems,
        equippedTheme,
        equippedAnimation,
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
                    <Text className="text-text font-bold text-2xl tracking-tight">Shop</Text>
                </View>

                <View className='flex-row items-center bg-surfaceElevated px-3 py-1.5 rounded-full border border-border'>
                    <Ionicons name="flame" size={16} color='#f59e0b' style={{ marginRight: 6 }} />
                    <Text className="text-text font-extrabold text-base">{totalCoins}</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 mb-3 mt-4">
                    <Text className="text-text font-black text-xl tracking-tight">Color Palettes</Text>
                    <Text className="text-textSecondary text-sm mt-1">Change the glow and accent color of your app.</Text>
                </View>

                <FlatList
                    horizontal
                    data={catalog.filter(item => item.type === "theme")}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
                    ItemSeparatorComponent={() => <View className="w-4" />}
                    renderItem={({ item }) => (
                        <View className="w-[280px]">
                            <ShopItemCard
                                item={item}
                                isOwned={purchasedItems.has(item.id)}
                                isEquipped={equippedTheme === item.id}
                                isProcessing={isProcessing}
                                onBuy={() => handleBuyItem(item)}
                                onEquip={() => handleEquipItem(item.id)}
                            />
                        </View>
                    )}
                />

                <View className="px-6 mb-3 mt-8">
                    <Text className="text-text font-black text-xl tracking-tight">Focus Animations</Text>
                    <Text className="text-textSecondary text-sm mt-1">Change how your timer moves and breathes.</Text>
                </View>

                <FlatList
                    horizontal
                    data={catalog.filter(item => item.type === "animation")}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    ItemSeparatorComponent={() => <View className="w-4" />}
                    renderItem={({ item }) => (
                        <View className="w-[280px]">
                            <ShopItemCard
                                item={item}
                                isOwned={purchasedItems.has(item.id)}
                                isEquipped={equippedAnimation === item.id}
                                isProcessing={isProcessing}
                                onBuy={() => handleBuyItem(item)}
                                onEquip={() => handleEquipItem(item.id)}
                            />
                        </View>
                    )}
                />
            </ScrollView>
        </SafeAreaView>
    )
}