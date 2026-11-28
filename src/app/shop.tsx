import { AnimatedPressable } from "@/components/AnimatedPressable";
import { GlobalLoader } from "@/components/GlobalLoader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { ShopActionBar } from "@/features/shop/components/ShopActionBar";
import { ShopHeroPreview } from "@/features/shop/components/ShopHeroPreview";
import { ShopStyleTile } from "@/features/shop/components/ShopStyleTile";
import { ShopItem } from "@/features/shop/data/shopCatalog";
import { useShopController } from "@/features/shop/hooks/useShopController";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";

type ShopTab = "animation" | "theme";
type ShopGridCell = ShopItem | { id: string; isSpacer: true };

function padGridRows(items: ShopItem[], columns = 3): ShopGridCell[] {
    const remainder = items.length % columns;
    if (remainder === 0) return items;
    const spacerCount = columns - remainder;
    return [
        ...items,
        ...Array.from({ length: spacerCount }, (_, idx) => ({
            id: `__spacer_${idx}`,
            isSpacer: true as const,
        })),
    ];
}

export default function ShopScreen() {
    const { activeStyle, colors, isDarkMode } = useTheme();
    const [isFocused, setIsFocused] = useState(true);
    const [activeTab, setActiveTab] = useState<ShopTab>("animation");
    const [animationsReady, setAnimationsReady] = useState(false);
    const [themesMounted, setThemesMounted] = useState(false);
    const animationListRef = useRef<FlatList<ShopGridCell>>(null);
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
        equippedTheme,
        equippedAnimation,
        totalCoins,
        isLoading,
        isProcessing,
        handleBuyItem,
        handleEquipItem,
        handleSecretBoost,
    } = useShopController();

    const allAnimations = useMemo(
        () => catalog.filter((item) => item.type === "animation"),
        [catalog]
    );
    const allThemes = useMemo(
        () => catalog.filter((item) => item.type === "theme"),
        [catalog]
    );

    const animationGridData = useMemo(() => padGridRows(allAnimations, 3), [allAnimations]);
    const themeGridData = useMemo(() => padGridRows(allThemes, 3), [allThemes]);

    const [selectedAnimationId, setSelectedAnimationId] = useState<string>(equippedAnimation);
    const [selectedThemeId, setSelectedThemeId] = useState<string>(equippedTheme);

    useEffect(() => {
        if (equippedAnimation) {
            setSelectedAnimationId(equippedAnimation);
        }
    }, [equippedAnimation]);

    useEffect(() => {
        if (equippedTheme) {
            setSelectedThemeId(equippedTheme);
        }
    }, [equippedTheme]);

    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            setAnimationsReady(true);
        });
        return () => cancelAnimationFrame(frameId);
    }, []);

    useEffect(() => {
        if (activeTab === "theme" && !themesMounted) {
            const frameId = requestAnimationFrame(() => {
                setThemesMounted(true);
            });
            return () => cancelAnimationFrame(frameId);
        }
    }, [activeTab, themesMounted]);

    useEffect(() => {
        if (initialScrolledRef.current || !animationsReady || isLoading || !equippedAnimation) return;
        const index = allAnimations.findIndex((item) => item.id === equippedAnimation);
        if (index >= 6 && animationListRef.current) {
            initialScrolledRef.current = true;
            const timer = setTimeout(() => {
                try {
                    animationListRef.current?.scrollToOffset({
                        offset: Math.floor(index / 3) * 140,
                        animated: true,
                    });
                } catch { }
            }, 120);
            return () => clearTimeout(timer);
        }
    }, [animationsReady, isLoading, equippedAnimation, allAnimations]);

    const equippedAnimationItem = useMemo(
        () => allAnimations.find((item) => item.id === equippedAnimation) || allAnimations[0],
        [allAnimations, equippedAnimation]
    );
    const selectedAnimation = useMemo(
        () => allAnimations.find((item) => item.id === selectedAnimationId) || allAnimations[0],
        [allAnimations, selectedAnimationId]
    );
    const selectedTheme = useMemo(
        () => allThemes.find((item) => item.id === selectedThemeId) || allThemes[0],
        [allThemes, selectedThemeId]
    );

    const selectedItem = activeTab === "animation" ? selectedAnimation : selectedTheme;
    const activeEquippedId = activeTab === "animation" ? equippedAnimation : equippedTheme;

    const isSelectedEquipped = activeEquippedId === selectedItem?.id;
    const isSelectedOwned = selectedItem ? purchasedItems.has(selectedItem.id) : false;
    const canAffordSelected = selectedItem ? totalCoins >= selectedItem.cost : false;

    const themePreviewAccent = useMemo(() => {
        if (activeTab !== "theme" || !selectedTheme) return undefined;
        return selectedTheme.id === "theme_default"
            ? (isDarkMode ? Colors.dark.accent : Colors.light.accent)
            : selectedTheme.hexColor;
    }, [activeTab, selectedTheme, isDarkMode]);

    const renderAnimationCell = useCallback(
        ({ item }: { item: ShopGridCell }) => {
            if ("isSpacer" in item) {
                return <View className="flex-1 p-2" pointerEvents="none" />;
            }
            return (
                <ShopStyleTile
                    item={item}
                    isSelected={selectedAnimationId === item.id}
                    isEquipped={equippedAnimation === item.id}
                    isOwned={purchasedItems.has(item.id)}
                    canAfford={totalCoins >= item.cost}
                    onSelect={(selected) => setSelectedAnimationId(selected.id)}
                />
            );
        },
        [selectedAnimationId, equippedAnimation, purchasedItems, totalCoins]
    );

    const renderThemeCell = useCallback(
        ({ item }: { item: ShopGridCell }) => {
            if ("isSpacer" in item) {
                return <View className="flex-1 p-2" pointerEvents="none" />;
            }
            return (
                <ShopStyleTile
                    item={item}
                    isSelected={selectedThemeId === item.id}
                    isEquipped={equippedTheme === item.id}
                    isOwned={purchasedItems.has(item.id)}
                    canAfford={totalCoins >= item.cost}
                    onSelect={(selected) => setSelectedThemeId(selected.id)}
                />
            );
        },
        [selectedThemeId, equippedTheme, purchasedItems, totalCoins]
    );

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

    const isActiveTabReady =
        !isLoading && (activeTab === "animation" ? animationsReady : themesMounted);

    return (
        <View className="flex-1 bg-background" style={activeStyle}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            <ShopHeroPreview
                selectedStyle={selectedItem}
                animationThemeValue={
                    activeTab === "animation"
                        ? selectedAnimation?.themeValue
                        : equippedAnimationItem?.themeValue
                }
                accentColorOverride={themePreviewAccent}
                totalCoins={totalCoins}
                isFocused={isFocused}
                onBack={() => router.back()}
                onSecretBoost={handleSecretBoost}
            />

            <View
                className="flex-1 rounded-t-[28px] border-t border-border overflow-hidden"
                style={{ backgroundColor: colors.surface }}
            >
                <View className="px-4 pt-3.5 pb-2.5">
                    <View
                        className="w-full flex-row rounded-2xl p-1 border border-border"
                        style={{ backgroundColor: colors.surfaceElevated }}
                    >
                        {(
                            [
                                { key: "animation", label: "Animation Styles", icon: "sparkles-outline" as const },
                                { key: "theme", label: "Colors", icon: "color-palette-outline" as const },
                            ] as const
                        ).map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <AnimatedPressable
                                    key={tab.key}
                                    onPress={() => setActiveTab(tab.key)}
                                    hapticMode="light"
                                    scaleTo={0.98}
                                    className="flex-1 py-2.5 px-3 rounded-xl flex-row items-center justify-center"
                                    style={{
                                        backgroundColor: isActive ? colors.accent : "transparent",
                                    }}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: isActive }}
                                    accessibilityLabel={tab.label}
                                >
                                    <Ionicons
                                        name={tab.icon}
                                        size={15}
                                        color={isActive ? colors.accentForeground : colors.textSecondary}
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text
                                        className={`text-[13.5px] ${isActive ? "font-bold" : "font-medium"}`}
                                        style={{
                                            color: isActive ? colors.accentForeground : colors.textSecondary,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {tab.label}
                                    </Text>
                                </AnimatedPressable>
                            );
                        })}
                    </View>
                </View>

                <View className="flex-1">
                    {!isActiveTabReady && (
                        <View className="flex-1 items-center justify-center pb-6">
                            <GlobalLoader size="small" color={colors.accent} />
                        </View>
                    )}

                    {!isLoading && animationsReady && (
                        <View
                            style={{
                                flex: 1,
                                display: activeTab === "animation" ? "flex" : "none",
                            }}
                        >
                            <FlatList
                                ref={animationListRef}
                                data={animationGridData}
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
                                    animationListRef.current?.scrollToOffset({
                                        offset: Math.floor(info.index / 3) * 140,
                                        animated: true,
                                    });
                                }}
                                renderItem={renderAnimationCell}
                            />
                        </View>
                    )}

                    {!isLoading && themesMounted && (
                        <View
                            style={{
                                flex: 1,
                                display: activeTab === "theme" ? "flex" : "none",
                            }}
                        >
                            <FlatList
                                data={themeGridData}
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
                                renderItem={renderThemeCell}
                            />
                        </View>
                    )}
                </View>
            </View>

            <ShopActionBar
                selectedStyle={selectedItem}
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
