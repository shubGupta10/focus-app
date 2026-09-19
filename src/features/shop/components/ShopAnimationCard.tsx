import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ClassicProgressBackground } from "../../session/components/orb-themes/ClassicProgressBackground";
import { SolarSystemBackground } from "../../session/components/orb-themes/SolarSystemBackground";
import { ShopItem } from "../data/shopCatalog";

interface ShopAnimationCardProps {
    item: ShopItem;
    isOwned: boolean;
    isEquipped: boolean;
    isProcessing: boolean;
    onAction: () => void;
}

export function ShopAnimationCard({ item, isOwned, isEquipped, isProcessing, onAction }: ShopAnimationCardProps) {
    const { colors } = useTheme();

    const previewProps = {
        isActive: true,
        colorAccent: colors.accent,
        colorTrack: colors.border,
        colorDotCenter: colors.text,
        outerRadius: 156,
        innerRadius: 126,
        sessionProgress: null,
        minuteProgress: null,
    };

    return (
        <View
            className="w-[300px] bg-surface rounded-[32px] overflow-hidden"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}
        >
            <View className="w-full aspect-square bg-background items-center justify-center overflow-hidden">
                <View style={{ transform: [{ scale: 0.85 }] }}>
                    {item.themeValue === 'solar' ? (
                        <SolarSystemBackground {...previewProps} />
                    ) : (
                        <ClassicProgressBackground {...previewProps} />
                    )}
                </View>
            </View>

            <View className="p-6">
                <View className="mb-6">
                    <Text className="text-text font-black text-2xl tracking-tight mb-1">{item.name}</Text>
                    <Text className="text-textSecondary text-sm leading-relaxed">{item.description}</Text>
                </View>

                <View className="flex-row items-center justify-between">
                    {!isOwned ? (
                        <View className="flex-row items-center">
                            <Text style={{ fontSize: 18, marginRight: 6 }}>🪙</Text>
                            <Text className="text-text font-bold text-xl">{item.cost}</Text>
                        </View>
                    ) : isEquipped ? (
                        <Text className="text-accent font-bold tracking-tight">Equipped</Text>
                    ) : (
                        <Text className="text-textSecondary font-medium tracking-tight">Available</Text>
                    )}

                    <Pressable
                        onPress={onAction}
                        disabled={isProcessing || isEquipped}
                        className={`px-6 py-3 rounded-full items-center justify-center flex-row ${isEquipped ? 'bg-accent/10 opacity-50' : isOwned ? 'bg-surfaceElevated border border-border' : ''}`}
                        style={!isOwned && !isEquipped ? { backgroundColor: colors.accent } : undefined}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color={isOwned ? colors.text : "#fff"} size="small" />
                        ) : (
                            <Text className={`font-bold ${!isOwned && !isEquipped ? 'text-white' : isEquipped ? 'text-accent' : 'text-text'}`}>
                                {isOwned ? (isEquipped ? 'Active' : 'Equip') : 'Unlock'}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
