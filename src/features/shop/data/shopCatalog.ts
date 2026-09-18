import { Ionicons } from "@expo/vector-icons";

export type ShopItem = {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'theme'
    themeValue: string;
    icon: keyof typeof Ionicons.glyphMap;
}


export const SHOP_CATALOG: ShopItem[] = [
    {
        id: "theme_default",
        name: "Classic Calm",
        description: "The original Lockout aesthetic.",
        cost: 0,
        type: "theme",
        themeValue: "default",
        icon: "color-palette-outline",
    },
    {
        id: "theme_ocean",
        name: "Deep Ocean",
        description: "A serene, deep blue gradient for intense focus",
        cost: 50,
        type: "theme",
        themeValue: "ocean",
        icon: "water-outline"
    },
    {
        id: "theme_forest",
        name: "Forest Zen",
        description: "Earthy green tones to ground your mind.",
        cost: 50,
        type: "theme",
        themeValue: "forest",
        icon: "leaf-outline",
    },
    {
        id: "theme_sunset",
        name: "Golden Sunset",
        description: "Warm, energetic colors for productive evenings.",
        cost: 100,
        type: "theme",
        themeValue: "sunset",
        icon: "sunny-outline",
    }
]