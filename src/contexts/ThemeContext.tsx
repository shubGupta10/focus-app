import { Colors } from "@/constants/Colors";
import { SHOP_CATALOG } from "@/features/shop/data/shopCatalog";
import { useSettings } from "@/hooks/useSettings";
import { useColorScheme, vars } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";

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
    const { colorScheme, setColorScheme } = useColorScheme();
    const [orbTheme, setOrbTheme] = useState("theme_default");
    const [themeMode, setThemeModeState] = useState<"light" | "dark" | "system">("system");

    useEffect(() => {
        getSetting("equipped_orb_theme").then((val) => {
            if (val) setOrbTheme(val);
        });
        getSetting("colorScheme").then((val) => {
            if (val === "dark" || val === "light" || val === "system") {
                setThemeModeState(val as "light" | "dark" | "system");
                setColorScheme(val);
            }
        });
    }, [getSetting, setColorScheme]);

    const isDarkMode = colorScheme === "dark";

    const toggleDarkMode = async (val: boolean) => {
        const nextScheme = val ? "dark" : "light";
        setThemeModeState(nextScheme);
        setColorScheme(nextScheme);
        await setSetting("colorScheme", nextScheme);
    };

    const setThemeMode = async (mode: "light" | "dark" | "system") => {
        setThemeModeState(mode);
        setColorScheme(mode);
        await setSetting("colorScheme", mode);
    };

    const baseTheme = isDarkMode ? Colors.dark : Colors.light;
    let colors: ThemeColors = baseTheme;

    if (orbTheme !== "theme_default") {
        let customAccent = colors.accent;
        const shopTheme = SHOP_CATALOG.find(t => t.id === orbTheme);

        if (shopTheme?.hexColor) {
            customAccent = shopTheme.hexColor;
        }

        const accentLuminance = getWCAGRelativeLuminance(customAccent);
        const whiteLuminance = getWCAGRelativeLuminance('#FFFFFF');
        const darkLuminance = getWCAGRelativeLuminance('#1C1618');

        const contrastWithWhite = getContrastRatio(whiteLuminance, accentLuminance);
        const contrastWithDark = getContrastRatio(accentLuminance, darkLuminance);

        const bestForeground = contrastWithWhite >= contrastWithDark ? '#FFFFFF' : '#1C1618';

        colors = {
            ...colors,
            accent: customAccent,
            accentForeground: bestForeground,
            accentMuted: customAccent + "33",
        };
    }

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
                setColorScheme,
                colors,
                activeStyle,
                switchColors,
                setGlobalOrbTheme: setOrbTheme,
            }}
        >
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
