import { useTheme } from "@/contexts/ThemeContext";
import { ShopAnimationCard } from "@/features/shop/components/ShopAnimationCard";
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

    const themes = catalog.filter(item => item.type === "theme");
    const animations = catalog.filter(item => item.type === "animation");

    return (
        <SafeAreaView className="flex-1 bg-background" style={activeStyle}>
            <StatusBar style={isDarkMode ? "light" : 'dark'} />


            <View className="flex-row items-center justify-between px-6 py-4">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-surface items-center justify-center active:opacity-70 border border-border"
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                </Pressable>
                <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-full border border-border">
                    <Text style={{ fontSize: 16, marginRight: 6 }}>🪙</Text>
                    <Text className="text-text font-bold text-base">{totalCoins}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                <View className="flex-1">

                    <View className="px-6 mt-2 mb-8">
                        <Text className="text-text font-black text-4xl tracking-tighter mb-2">SHOP</Text>
                        <Text className="text-textSecondary text-base leading-relaxed">
                            Spend your focus coins to personalise your experience.
                        </Text>
                    </View>

                    <View className="mb-10">
                        <View className="px-6 mb-4">
                            <Text className="text-text font-bold text-lg tracking-tight">Colour Palette</Text>
                        </View>

                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                            data={themes}
                            keyExtractor={item => item.id}
                            ItemSeparatorComponent={() => <View className="w-4" />}
                            renderItem={({ item }) => {
                                const isOwned = purchasedItems.has(item.id);
                                const isEquipped = equippedTheme === item.id;
                                const swatchColor = item.hexColor || colors.surfaceElevated;

                                return (
                                    <Pressable
                                        disabled={isProcessing}
                                        onPress={() => {
                                            if (!isOwned) handleBuyItem(item);
                                            else if (!isEquipped) handleEquipItem(item.id);
                                        }}
                                        className="items-center w-24"
                                    >
                                        <View
                                            className={`w-20 h-20 rounded-full items-center justify-center mb-3 ${isEquipped ? 'border-[4px]' : 'border border-border'}`}
                                            style={[{ backgroundColor: swatchColor, borderColor: isEquipped ? colors.accent : undefined }, !isOwned ? { opacity: 0.9 } : undefined]}
                                        >
                                            {!isOwned && (
                                                <View className="absolute -top-1 -right-2 bg-surface px-2 py-1 rounded-full border border-border flex-row items-center shadow-sm">
                                                    <Text style={{ fontSize: 10, marginRight: 4 }}>🪙</Text>
                                                    <Text className="text-text font-bold text-[10px]">{item.cost}</Text>
                                                </View>
                                            )}
                                            {isEquipped && <Ionicons name="checkmark" size={32} color="#ffffff" style={{ opacity: 0.9 }} />}
                                        </View>
                                        <Text className="text-textSecondary text-sm font-medium text-center leading-tight" numberOfLines={2}>
                                            {item.name}
                                        </Text>
                                    </Pressable>
                                )
                            }}
                        />
                    </View>

                    <View className="mb-4">
                        <View className="px-6 mb-4">
                            <Text className="text-text font-bold text-lg tracking-tight">Animation Style</Text>
                        </View>

                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                            data={animations}
                            keyExtractor={item => item.id}
                            ItemSeparatorComponent={() => <View className="w-6" />}
                            snapToInterval={324}
                            decelerationRate="fast"
                            renderItem={({ item }) => {
                                const isOwned = purchasedItems.has(item.id);
                                const isEquipped = equippedAnimation === item.id;

                                return (
                                    <ShopAnimationCard
                                        item={item}
                                        isOwned={isOwned}
                                        isEquipped={isEquipped}
                                        isProcessing={isProcessing}
                                        onAction={() => {
                                            if (!isOwned) handleBuyItem(item);
                                            else if (!isEquipped) handleEquipItem(item.id);
                                        }}
                                    />
                                );
                            }}
                        />
                    </View>

                    <View className="px-6 mt-auto pt-8">
                        <View className="bg-surfaceElevated rounded-3xl p-5 flex-row items-center border border-border">
                            <View className="w-12 h-12 rounded-full bg-surface items-center justify-center mr-4 border border-border shadow-sm">
                                <Text style={{ fontSize: 24 }}>🪙</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-text font-bold text-base mb-1">Earning Coins</Text>
                                <Text className="text-textSecondary text-sm leading-tight">
                                    Stay focused. You earn 1 coin for every minute of an active focus session.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}