import { Ionicons } from "@expo/vector-icons";

export type ShopItem = {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'theme' | 'animation';
    themeValue: string;
    icon: keyof typeof Ionicons.glyphMap;
    hexColor?: string;
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
        hexColor: "#A35265",
    },
    {
        id: "theme_ocean",
        name: "Deep Ocean",
        description: "A serene, deep blue gradient for intense focus",
        cost: 50,
        type: "theme",
        themeValue: "ocean",
        icon: "water-outline",
        hexColor: "#0ea5e9",
    },
    {
        id: "theme_forest",
        name: "Forest Zen",
        description: "Earthy green tones to ground your mind.",
        cost: 50,
        type: "theme",
        themeValue: "forest",
        icon: "leaf-outline",
        hexColor: "#22c55e",
    },
    {
        id: "theme_sunset",
        name: "Golden Sunset",
        description: "Warm, energetic colors for productive evenings.",
        cost: 150,
        type: "theme",
        themeValue: "sunset",
        icon: "sunny-outline",
        hexColor: "#f97316",
    },
    {
        id: "theme_crimson",
        name: "Crimson Focus",
        description: "An intense, high-energy crimson for deep work.",
        cost: 100,
        type: "theme",
        themeValue: "crimson",
        icon: "flame-outline",
        hexColor: "#e11d48",
    },
    {
        id: "theme_monochrome",
        name: "Monochrome Minimal",
        description: "A sleek, distraction-free grayscale aesthetic.",
        cost: 300,
        type: "theme",
        themeValue: "monochrome",
        icon: "contrast-outline",
        hexColor: "#64748b",
    },
    {
        id: "theme_cyberpunk",
        name: "Neon Cyberpunk",
        description: "A vibrant, high-contrast neon magenta.",
        cost: 300,
        type: "theme",
        themeValue: "cyberpunk",
        icon: "flash-outline",
        hexColor: "#d946ef",
    },
    {
        id: "animation_solar",
        name: "Solar System",
        description: "The default orbiting planetary rings.",
        cost: 0,
        type: "animation",
        themeValue: "solar",
        icon: "planet-outline",
    },
    {
        id: "animation_classic",
        name: "Classic Progress",
        description: "A clean, minimalist circular progress ring.",
        cost: 200,
        type: "animation",
        themeValue: "classic",
        icon: "radio-button-on-outline",
    },
    {
        id: "animation_particle_drift",
        name: "Particle Drift",
        description: "Ambient floating particles for a calm, meditative atmosphere.",
        cost: 250,
        type: "animation",
        themeValue: "particle_drift",
        icon: "sparkles-outline",
    },
    {
        id: "animation_waveform_pulse",
        name: "Waveform Pulse",
        description: "Rhythmic bars that pulse like a calm heartbeat.",
        cost: 450,
        type: "animation",
        themeValue: "waveform_pulse",
        icon: "pulse-outline",
    },
    {
        id: "animation_helix_orbit",
        name: "Helix Orbit",
        description: "A double-helix DNA strand weaving around your focus orb.",
        cost: 750,
        type: "animation",
        themeValue: "helix_orbit",
        icon: "git-compare-outline",
    },
    {
        id: "animation_constellation",
        name: "Constellation",
        description: "A starfield that shimmers quietly around your focus orb.",
        cost: 250,
        type: "animation",
        themeValue: "constellation",
        icon: "star-outline",
    },
]