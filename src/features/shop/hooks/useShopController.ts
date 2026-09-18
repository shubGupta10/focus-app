import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/hooks/useSettings";
import { useUserStats } from "@/hooks/useUserStats";
import { getPurchasedItems, purchasedItem } from "@/store/shopRepository";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { SHOP_CATALOG, ShopItem } from "../data/shopCatalog";

export function useShopController() {
    const db = useSQLiteContext();
    const { stats, refreshStats } = useUserStats();
    const { getSetting, setSetting } = useSettings();
    const { setGlobalOrbTheme } = useTheme();

    const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set(["theme_default"]));
    const [equippedTheme, setEquippedTheme] = useState<string>("theme_default");
    const [isProcessing, setIsProcessing] = useState(false);


    const loadShopData = useCallback(async () => {
        const items = await getPurchasedItems(db);
        setPurchasedItems(new Set(["theme_default", ...items]));
        const currentTheme = await getSetting("equipped_orb_theme");
        if (currentTheme) {
            setEquippedTheme(currentTheme);
        }
    }, [db, getSetting]);


    useFocusEffect(
        useCallback(() => {
            db.runAsync("UPDATE user_stats SET total_coins = 1000 WHERE id = 1");
            loadShopData();
            refreshStats();
        }, [loadShopData, refreshStats, db])
    )


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
        await setSetting("equipped_orb_theme", itemId);
        setEquippedTheme(itemId);
        setGlobalOrbTheme(itemId);
    }


    return {
        catalog: SHOP_CATALOG,
        purchasedItems,
        equippedTheme,
        totalCoins: stats.total_coins,
        isProcessing,
        handleBuyItem,
        handleEquipItem
    }
}