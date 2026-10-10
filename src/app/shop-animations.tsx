import { useTheme } from "@/contexts/ThemeContext";
import { ShopAnimationCard } from "@/features/shop/components/ShopAnimationCard";
import { useShopController } from "@/features/shop/hooks/useShopController";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

export default function ShopAnimationsScreen() {
    const { activeStyle, colors, isDarkMode } = useTheme();

    const {
        catalog,
        purchasedItems,
        equippedAnimation,
        totalCoins,
        isProcessing,
        handleBuyItem,
        handleEquipItem
    } = useShopController();

    const allAnimations = catalog.filter(item => item.type === "animation");

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

            <View className="px-6 mt-2 mb-6">
                <Text className="text-text font-black text-3xl tracking-tighter mb-2">All Animations</Text>
                <Text className="text-textSecondary text-base leading-relaxed">
                    Customise your focus orb with premium animations.
                </Text>
            </View>

            <FlashList
                data={allAnimations}
                keyExtractor={item => item.id}
                numColumns={1}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
                ItemSeparatorComponent={() => <View className="h-8" />}
                renderItem={({ item }) => {
                    const isOwned = purchasedItems.has(item.id);
                    const isEquipped = equippedAnimation === item.id;

                    return (

                        <ShopAnimationCard
                            item={item}
                            isOwned={isOwned}
                            isEquipped={isEquipped}
                            isProcessing={isProcessing}
                            fullWidth={true}
                            isActive={true}
                            onAction={() => {
                                if (!isOwned) handleBuyItem(item);
                                else if (!isEquipped) handleEquipItem(item.id);
                            }}
                        />
                    );
                }}
            />
        </SafeAreaView>
    );
}
