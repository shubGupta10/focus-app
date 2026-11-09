import { Colors } from "@/constants/Colors";
import { SHOP_CATALOG } from "@/features/shop/data/shopCatalog";
import { useSettings } from "@/hooks/useSettings";
import { vars } from "nativewind";
import { AppState, useColorScheme as useRNColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { createContext, useContext, useEffect, useState } from "react";
import FocusBlocker, { DynamicPalette } from "../../modules/focus-blocker/src/FocusBlockerModule";

function getWCAGRelativeLuminance(hex: string) {
    const c = hex.startsWith('#') ? hex.substring(1) : hex;
    const rgb = parseInt(c, 16);
    let r = ((rgb >> 16) & 0xff) / 255.0;
    let g = ((rgb >> 8) & 0xff) / 255.0;
    let b = ((rgb >> 0) & 0xff) / 255.0;

    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(l1: number, l2: number) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

export type ThemeColors = typeof Colors.light;

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: (val: boolean) => void;
    themeMode: "light" | "dark" | "system";
    setThemeMode: (mode: "light" | "dark" | "system") => void;
    colorScheme: "light" | "dark";
    setColorScheme: (scheme: "light" | "dark" | "system") => void;
    colors: ThemeColors;
    activeStyle: any;
    setGlobalOrbTheme: (val: string) => void;
    useDynamicTheme: boolean;
    setUseDynamicTheme: (val: boolean) => void;
    isDynamicColorSupported: boolean;
    dynamicPalette: DynamicPalette | null;
    switchColors: {
        trackActive: string;
        thumbActive: string;
        trackInactive: string;
        thumbInactive: string;
    };
}
const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { getSetting, setSetting } = useSettings();
    const systemColorScheme = useRNColorScheme() ?? "light";
    const [orbTheme, setOrbTheme] = useState("theme_default");
    const [themeMode, setThemeModeState] = useState<"light" | "dark" | "system">("system");
    const [useDynamicTheme, setUseDynamicThemeState] = useState(false);

    const isDynamicColorSupported = typeof FocusBlocker?.isDynamicColorSupported === "function"
        ? FocusBlocker.isDynamicColorSupported()
        : false;

    const [dynamicPalette, setDynamicPalette] = useState<DynamicPalette | null>(() => {
        try {
            return FocusBlocker?.getDynamicColors?.() ?? null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                try {
                    const latest = FocusBlocker?.getDynamicColors?.();
                    if (latest) setDynamicPalette(latest);
                } catch { }
            }
        });
        return () => sub.remove();
    }, []);

    useEffect(() => {
        getSetting("equipped_orb_theme").then((val) => {
            if (val) setOrbTheme(val);
        });
        getSetting("colorScheme").then((val) => {
            if (val === "dark" || val === "light" || val === "system") {
                setThemeModeState(val as "light" | "dark" | "system");
            }
        });
        getSetting("use_dynamic_theme").then((val) => {
            if (val !== null) {
                setUseDynamicThemeState(val === "true");
            }
        });
    }, [getSetting]);

    const toggleDarkMode = (val: boolean) => {
        const nextScheme = val ? "dark" : "light";
        setThemeModeState(nextScheme);
        setSetting("colorScheme", nextScheme);
    };

    const setThemeMode = (mode: "light" | "dark" | "system") => {
        setThemeModeState(mode);
        setSetting("colorScheme", mode);
    };

    const setUseDynamicTheme = (val: boolean) => {
        setUseDynamicThemeState(val);
        setSetting("use_dynamic_theme", val ? "true" : "false");
    };

    const isDarkMode = themeMode === "system"
        ? systemColorScheme === "dark"
        : themeMode === "dark";

    const baseTheme = isDarkMode ? Colors.dark : Colors.light;
    let colors: ThemeColors = baseTheme;

    if (useDynamicTheme && dynamicPalette) {
        const dynamicBg = isDarkMode ? dynamicPalette.darkBackground : dynamicPalette.lightBackground;
        const dynamicSurface = isDarkMode
            ? dynamicPalette.darkSurface
            : (dynamicPalette.lightSurface ?? Colors.light.surface);
        const dynamicElevated = isDarkMode
            ? (dynamicPalette.darkSurfaceElevated ?? Colors.dark.surfaceElevated)
            : (dynamicPalette.lightSurfaceElevated ?? Colors.light.surfaceElevated);
        const dynamicBorder = isDarkMode ? dynamicPalette.darkBorder : dynamicPalette.lightBorder;
        const dynamicAccent = isDarkMode
            ? (dynamicPalette.darkAccent ?? dynamicPalette.accent)
            : (dynamicPalette.lightAccent ?? dynamicPalette.accent);
        const dynamicAccentMuted = isDarkMode
            ? (dynamicPalette.darkAccentMuted ?? dynamicPalette.accentMuted ?? Colors.dark.accentMuted)
            : (dynamicPalette.lightAccentMuted ?? dynamicPalette.accentMuted ?? Colors.light.accentMuted);

        colors = {
            ...colors,
            background: dynamicBg,
            surface: dynamicSurface,
            surfaceElevated: dynamicElevated,
            border: dynamicBorder,
            accent: dynamicAccent,
            accentMuted: dynamicAccentMuted,
        };
    }

    if (orbTheme !== "theme_default") {
        let customAccent = colors.accent;
        const shopTheme = SHOP_CATALOG.find(t => t.id === orbTheme);

        if (shopTheme?.hexColor) {
            customAccent = shopTheme.hexColor;
        }

        colors = {
            ...colors,
            accent: customAccent,
            accentMuted: customAccent + "33",
        };
    }

    const accentLuminance = getWCAGRelativeLuminance(colors.accent);
    const whiteLuminance = getWCAGRelativeLuminance('#FFFFFF');
    const darkLuminance = getWCAGRelativeLuminance('#1C1618');

    const contrastWithWhite = getContrastRatio(whiteLuminance, accentLuminance);
    const contrastWithDark = getContrastRatio(accentLuminance, darkLuminance);

    const bestForeground = contrastWithWhite >= contrastWithDark ? '#FFFFFF' : '#1C1618';

    colors = {
        ...colors,
        accentForeground: bestForeground,
    };

    const activeStyle = vars({
        "--color-background": colors.background,
        "--color-surface": colors.surface,
        "--color-surface-elevated": colors.surfaceElevated,
        "--color-text": colors.text,
        "--color-text-secondary": colors.textSecondary,
        "--color-text-muted": colors.textMuted,
        "--color-border": colors.border,
        "--color-icon": colors.icon,
        "--color-accent": colors.accent,
        "--color-accent-foreground": colors.accentForeground,
        "--color-accent-muted": colors.accentMuted,
        "--color-success": colors.success,
        "--color-success-muted": colors.successMuted,
        "--color-warning": colors.warning,
        "--color-warning-muted": colors.warningMuted,
        "--color-destructive": colors.destructive,
        "--color-destructive-muted": colors.destructiveMuted,
        "--color-scrim": colors.scrim,
    });

    const switchColors = {
        trackActive: colors.accent,
        thumbActive: colors.accentForeground,
        trackInactive: colors.border,
        thumbInactive: colors.textSecondary,
    };

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleDarkMode,
                themeMode,
                setThemeMode,
                colorScheme: isDarkMode ? "dark" : "light",
                setColorScheme: () => { },
                colors,
                activeStyle,
                switchColors,
                setGlobalOrbTheme: setOrbTheme,
                useDynamicTheme,
                setUseDynamicTheme,
                isDynamicColorSupported,
                dynamicPalette,
            }}
        >
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
