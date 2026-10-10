import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/contexts/ThemeContext";
import { ShopAnimationCard } from "@/features/shop/components/ShopAnimationCard";
import { useShopController } from "@/features/shop/hooks/useShopController";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { GlobalLoader } from "@/components/GlobalLoader";
import { SafeAreaView } from "react-native-safe-area-context";
import { InfoSheet } from "@/components/InfoSheet";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ShopScreen() {
    const { activeStyle, colors, isDarkMode } = useTheme();
    const [isReady, setIsReady] = useState(false);
    const [visibleAnimationId, setVisibleAnimationId] = useState<string | null>(null);

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setVisibleAnimationId(viewableItems[0].item.id);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

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

    useEffect(() => {
        const handle = requestIdleCallback(() => {
            setIsReady(true);
        });
        return () => cancelIdleCallback(handle);
    }, []);

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
                <View className="flex-row items-center gap-5">
                    <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-full border border-border">

                        <Text style={{ fontSize: 16, marginRight: 6 }}>🪙</Text>
                        <Text className="text-text font-bold text-base">{totalCoins}</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                <View className="flex-1">

                    <View className="px-6 mt-2 mb-8">
                        <View className="flex-row items-center justify-between mb-2">
                            <Pressable onLongPress={__DEV__ ? () => useAppStore.getState().updateStatsLocally(100000, 0, 0) : undefined}>
                                <Text className="text-text font-black text-4xl tracking-tighter">SHOP</Text>
                            </Pressable>
                            <InfoSheet
                                title="Welcome to the Shop"
                                description={"This is where you are rewarded for staying off your phone.\n\nHow it works:\n1. You get 1 coin for every minute you stay focused.\n2. You can spend your coins here to buy new colors and styles.\n3. If you quit a session early, you do not get any coins!"}
                            />
                        </View>
                        <Text className="text-textSecondary text-base leading-relaxed">
                            Spend your focus coins to personalise your experience.
                        </Text>
                    </View>

                    <View className="mb-10">
                        <View className="px-6 mb-3">
                            <Text className="text-accent font-bold text-sm tracking-widest uppercase ml-2">Colour Palette</Text>
                        </View>

                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                            data={themes}
                            keyExtractor={item => item.id}
                            ItemSeparatorComponent={() => <View className="w-4" />}
                            renderItem={({ item, index }) => {
                                const isOwned = purchasedItems.has(item.id);
                                const isEquipped = equippedTheme === item.id;
                                const swatchColor = item.hexColor || colors.surfaceElevated;

                                return (
                                    <Animated.View
                                        entering={FadeInDown.delay(index * 100).duration(400)}
                                    >
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
                                    </Animated.View>
                                )
                            }}
                        />
                    </View>

                    <View className="mb-4">
                        <View className="px-6 mb-3 flex-row items-center justify-between">
                            <Text className="text-accent font-bold text-sm tracking-widest uppercase ml-2">Animation Style</Text>
                            <Pressable onPress={() => router.push("/shop-animations")} className="active:opacity-70">
                                <Text className="text-accent font-medium text-sm">View All</Text>
                            </Pressable>
                        </View>

                        {!isReady ? (
                            <View className="h-[340px] items-center justify-center">
                                <GlobalLoader size="large" color={colors.accent} />
                            </View>
                        ) : (
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 24 }}
                                data={animations.slice(0, 5)}
                                keyExtractor={item => item.id}
                                ItemSeparatorComponent={() => <View className="w-6" />}
                                snapToInterval={324}
                                decelerationRate="fast"
                                onViewableItemsChanged={onViewableItemsChanged}
                                viewabilityConfig={viewabilityConfig}
                                renderItem={({ item, index }) => {
                                    const isOwned = purchasedItems.has(item.id);
                                    const isEquipped = equippedAnimation === item.id;

                                    return (
                                        <Animated.View
                                            entering={FadeInDown.delay(index * 100).duration(400)}
                                        >
                                            <ShopAnimationCard
                                                item={item}
                                                isOwned={isOwned}
                                                isEquipped={isEquipped}
                                                isProcessing={isProcessing}
                                                isActive={visibleAnimationId ? visibleAnimationId === item.id : index === 0}
                                                onAction={() => {
                                                    if (!isOwned) handleBuyItem(item);
                                                    else if (!isEquipped) handleEquipItem(item.id);
                                                }}
                                            />
                                        </Animated.View>
                                    );
                                }}
                            />
                        )}
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}