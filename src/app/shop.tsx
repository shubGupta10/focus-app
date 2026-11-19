import { GlobalLoader } from "@/components/GlobalLoader";
import { useTheme } from "@/contexts/ThemeContext";
import { ShopActionBar } from "@/features/shop/components/ShopActionBar";
import { ShopHeroPreview } from "@/features/shop/components/ShopHeroPreview";
import { ShopStyleTile } from "@/features/shop/components/ShopStyleTile";
import { useShopController } from "@/features/shop/hooks/useShopController";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function ShopScreen() {
    const { activeStyle, colors, isDarkMode } = useTheme();
    const [isFocused, setIsFocused] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const initialScrolledRef = useRef(false);

    useFocusEffect(
        useCallback(() => {
            setIsFocused(true);
            return () => setIsFocused(false);
        }, [])
    );

    const {
        catalog,
        purchasedItems,
        equippedAnimation,
        totalCoins,
        isProcessing,
        handleBuyItem,
        handleEquipItem,
        handleSecretBoost,
    } = useShopController();

    const allAnimations = useMemo(
        () => catalog.filter((item) => item.type === "animation"),
        [catalog]
    );

    const [selectedId, setSelectedId] = useState<string>(equippedAnimation);

    useEffect(() => {
        if (equippedAnimation) {
            setSelectedId(equippedAnimation);
        }
    }, [equippedAnimation]);

    useEffect(() => {
        if (initialScrolledRef.current || !equippedAnimation) return;
        const index = allAnimations.findIndex((item) => item.id === equippedAnimation);
        if (index >= 6 && flatListRef.current) {
            initialScrolledRef.current = true;
            const timer = setTimeout(() => {
                try {
                    flatListRef.current?.scrollToOffset({
                        offset: Math.floor(index / 3) * 140,
                        animated: true,
                    });
                } catch { }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [equippedAnimation, allAnimations]);

    const selectedStyle = useMemo(
        () => allAnimations.find((item) => item.id === selectedId) || allAnimations[0],
        [allAnimations, selectedId]
    );

    const isSelectedEquipped = equippedAnimation === selectedStyle?.id;
    const isSelectedOwned = selectedStyle ? purchasedItems.has(selectedStyle.id) : false;
    const canAffordSelected = selectedStyle ? totalCoins >= selectedStyle.cost : false;

    if (allAnimations.length === 0) {
        return (
            <View
                className="flex-1 bg-background items-center justify-center"
                style={activeStyle}
            >
                <GlobalLoader size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background" style={activeStyle}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            <ShopHeroPreview
                selectedStyle={selectedStyle}
                totalCoins={totalCoins}
                isFocused={isFocused}
                onBack={() => router.back()}
                onSecretBoost={handleSecretBoost}
            />

            <View
                className="flex-1 rounded-t-[28px] border-t border-border overflow-hidden"
                style={{ backgroundColor: colors.surface }}
            >
                <View className="flex-row items-center justify-between px-6 pt-3.5 pb-2">
                    <Text className="text-textMuted text-[11px] font-bold uppercase tracking-[0.08em]">
                        ANIMATION STYLES
                    </Text>
                    <Text className="text-textMuted text-[12px] font-medium">
                        {allAnimations.length} styles
                    </Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={allAnimations}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 4,
                        paddingBottom: 20,
                        gap: 10,
                    }}
                    columnWrapperStyle={{ gap: 10 }}
                    onScrollToIndexFailed={(info) => {
                        flatListRef.current?.scrollToOffset({
                            offset: Math.floor(info.index / 3) * 140,
                            animated: true,
                        });
                    }}
                    renderItem={({ item }) => (
                        <ShopStyleTile
                            item={item}
                            isSelected={selectedId === item.id}
                            isEquipped={equippedAnimation === item.id}
                            isOwned={purchasedItems.has(item.id)}
                            canAfford={totalCoins >= item.cost}
                            onSelect={(selected) => setSelectedId(selected.id)}
                        />
                    )}
                />
            </View>

            <ShopActionBar
                selectedStyle={selectedStyle}
                totalCoins={totalCoins}
                isSelectedEquipped={isSelectedEquipped}
                isSelectedOwned={isSelectedOwned}
                canAffordSelected={canAffordSelected}
                isProcessing={isProcessing}
                onEquip={handleEquipItem}
                onBuy={handleBuyItem}
            />
        </View>
    );
}
