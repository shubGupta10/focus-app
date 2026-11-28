import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/hooks/useSettings";
import { useUserStats } from "@/hooks/useUserStats";
import { getPurchasedItems, purchasedItem } from "@/features/shop/db/shopRepository";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import { SHOP_CATALOG, ShopItem } from "../data/shopCatalog";
import { analytics } from "@/utils/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppStore } from "@/store/useAppStore";
import * as Haptics from "expo-haptics";

export function useShopController() {
    const db = useSQLiteContext();
    const { stats, refreshStats } = useUserStats();
    const { getSetting, setSetting } = useSettings();
    const { setGlobalOrbTheme } = useTheme();

    const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set(["theme_default", "animation_solar"]));
    const [equippedTheme, setEquippedTheme] = useState<string>("theme_default");
    const [equippedAnimation, setEquippedAnimation] = useState<string>("animation_solar");
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);


    const loadShopData = useCallback(async () => {
        try {
            const items = await getPurchasedItems(db);
            setPurchasedItems(new Set(["theme_default", "animation_solar", ...items]));
            const currentTheme = await getSetting("equipped_orb_theme");
            if (currentTheme) {
                setEquippedTheme(currentTheme);
            }
            const currentAnimation = await getSetting("equipped_orb_animation");
            if (currentAnimation) {
                setEquippedAnimation(currentAnimation);
            }
        } finally {
            setIsLoading(false);
        }
    }, [db, getSetting]);


    useFocusEffect(
        useCallback(() => {
            loadShopData();
            refreshStats();
        }, [loadShopData, refreshStats])
    );


    const handleBuyItem = async (item: ShopItem) => {
        if (stats.total_coins < item.cost) {
            Alert.alert("Not enough coins", `You need ${item.cost - stats.total_coins} more coins to unlock ${item.name}`);
            return;
        }


        Alert.alert(
            "Unlock Theme",
            `Buy ${item.name} for ${item.cost} coins?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unlock",
                    onPress: async () => {
                        setIsProcessing(true);
                        const success = await purchasedItem(db, item.id, item.cost);
                        if (success) {
                            await loadShopData();
                            await refreshStats();
                            await handleEquipItem(item.id);

                            analytics.track("theme_purchased", {
                                item_id: item.id,
                                item_type: item.type,
                                cost: item.cost,
                            })
                        } else {
                            Alert.alert("Error", "Transaction failed, Please try again");
                        }
                        setIsProcessing(false);
                    }
                }
            ]
        )
    };

    const handleEquipItem = async (itemId: string) => {
        const item = SHOP_CATALOG.find(i => i.id === itemId);
        if (!item) return;
        if (item.type === "theme") {
            await setSetting("equipped_orb_theme", itemId);
            setEquippedTheme(itemId);
            setGlobalOrbTheme(itemId);
        } else if (item.type === "animation") {
            await setSetting("equipped_orb_animation", itemId);
            setEquippedAnimation(itemId);
        }
        analytics.track("theme_equipped", {
            item_id: item.id,
            item_type: item.type,
        });
    };

    const handleSecretBoost = async () => {
        try {
            const hasClaimed = await AsyncStorage.getItem("userSecret");
            if (hasClaimed) {
                if (Platform.OS === "android") {
                    ToastAndroid.show("Secret bonus already claimed!", ToastAndroid.SHORT);
                } else {
                    Alert.alert("Secret Bonus", "Secret bonus already claimed!");
                }
                return;
            }

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            await db.runAsync("UPDATE user_stats SET total_coins = total_coins + 10000 WHERE id = 1");
            useAppStore.getState().updateStatsLocally(10000, 0, 0);
            await refreshStats();
            await AsyncStorage.setItem("userSecret", "true");
            if (Platform.OS === "android") {
                ToastAndroid.show("10,000 Coins Added!", ToastAndroid.SHORT);
            } else {
                Alert.alert("Secret Unlocked", "10,000 Coins Added!");
            }
        } catch (e) {
            console.error("Failed to add coins:", e);
        }
    };

    return {
        catalog: SHOP_CATALOG,
        purchasedItems,
        equippedTheme,
        equippedAnimation,
        totalCoins: stats.total_coins,
        isLoading,
        isProcessing,
        handleBuyItem,
        handleEquipItem,
        handleSecretBoost,
    };
}