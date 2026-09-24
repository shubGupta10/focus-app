import { Colors } from "@/constants/Colors";
import { SHOP_CATALOG } from "@/features/shop/data/shopCatalog";
import { useSettings } from "@/hooks/useSettings";
import { useColorScheme, vars } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeColors = typeof Colors.light;

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: (val: boolean) => void;
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

    useEffect(() => {
        getSetting("equipped_orb_theme").then((val) => {
            if (val) setOrbTheme(val);
        });
        getSetting("colorScheme").then((val) => {
            if (val === "dark" || val === "light") {
                setColorScheme(val);
            }
        });
    }, [getSetting, setColorScheme]);

    const isDarkMode = colorScheme === "dark";

    const toggleDarkMode = async (val: boolean) => {
        const nextScheme = val ? "dark" : "light";
        setColorScheme(nextScheme);
        await setSetting("colorScheme", nextScheme);
    };

    const baseTheme = isDarkMode ? Colors.dark : Colors.light;
    let colors: ThemeColors = baseTheme;

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
