import { Colors } from "@/constants/Colors";
import { SHOP_CATALOG } from "@/features/shop/data/shopCatalog";
import { useSettings } from "@/hooks/useSettings";
import { vars } from "nativewind";
import { Appearance, AppState, View, useColorScheme as useRNColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import FocusBlocker, { DynamicPalette } from "../../modules/focus-blocker/src/FocusBlockerModule";
import { useAppStore, setWidgetTheme, syncWidget } from "@/store/useAppStore";

import {
    argbFromHex,
    hexFromArgb,
    themeFromSourceColor,
} from "@material/material-color-utilities";

function buildLayersFromScheme(seedHex: string, isDark: boolean) {
    const theme = themeFromSourceColor(argbFromHex(seedHex));
    const scheme = isDark ? theme.schemes.dark : theme.schemes.light;

    return isDark
        ? {
            background: hexFromArgb(theme.palettes.neutralVariant.tone(10)),
            surface: hexFromArgb(theme.palettes.neutralVariant.tone(14)),
            surfaceElevated: hexFromArgb(theme.palettes.neutralVariant.tone(20)),
            border: hexFromArgb(scheme.outlineVariant),
        }
        : {
            background: hexFromArgb(theme.palettes.neutralVariant.tone(94)),
            surface: hexFromArgb(theme.palettes.neutralVariant.tone(90)),
            surfaceElevated: hexFromArgb(theme.palettes.neutralVariant.tone(98)),
            border: hexFromArgb(scheme.outlineVariant),
        };
}

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

function resolveThemeColors(
    isDark: boolean,
    useDynamicTheme: boolean,
    dynamicPalette: DynamicPalette | null,
    orbTheme: string
): ThemeColors {
    let resolved: ThemeColors = isDark ? Colors.dark : Colors.light;

    if (useDynamicTheme && dynamicPalette) {
        const dynamicAccent = isDark
            ? (dynamicPalette.darkAccent ?? dynamicPalette.accent)
            : (dynamicPalette.lightAccent ?? dynamicPalette.accent);
        const dynamicAccentMuted = isDark
            ? (dynamicPalette.darkAccentMuted ?? dynamicPalette.accentMuted ?? Colors.dark.accentMuted)
            : (dynamicPalette.lightAccentMuted ?? dynamicPalette.accentMuted ?? Colors.light.accentMuted);

        resolved = {
            ...resolved,
            ...buildLayersFromScheme(dynamicAccent, isDark),
            accent: dynamicAccent,
            accentMuted: dynamicAccentMuted,
        };
    }

    if (orbTheme !== "theme_default") {
        let customAccent = resolved.accent;
        const shopTheme = SHOP_CATALOG.find(t => t.id === orbTheme);

        if (shopTheme?.hexColor) {
            customAccent = shopTheme.hexColor;
        }

        resolved = {
            ...resolved,
            accent: customAccent,
            accentMuted: customAccent + "33",
        };
    }

    const accentLuminance = getWCAGRelativeLuminance(resolved.accent);
    const whiteLuminance = getWCAGRelativeLuminance('#FFFFFF');
    const darkLuminance = getWCAGRelativeLuminance('#0E141B');

    const contrastWithWhite = getContrastRatio(whiteLuminance, accentLuminance);
    const contrastWithDark = getContrastRatio(accentLuminance, darkLuminance);

    const bestForeground = contrastWithWhite >= contrastWithDark ? '#FFFFFF' : '#0E141B';

    return {
        ...resolved,
        accentForeground: bestForeground,
    };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { getSetting, setSetting } = useSettings();
    const rnColorScheme = useRNColorScheme();
    const [osColorScheme, setOsColorScheme] = useState<"light" | "dark">(() =>
        Appearance.getColorScheme() === "dark" ? "dark" : "light"
    );
    const [orbTheme, setOrbTheme] = useState("theme_default");
    const [themeMode, setThemeModeState] = useState<"light" | "dark" | "system">("system");
    const themeModeRef = useRef<"light" | "dark" | "system">("system");
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
        themeModeRef.current = themeMode;
        const targetOverride = themeMode === "system" ? "unspecified" : themeMode;
        try {
            Appearance.setColorScheme(targetOverride);
        } catch { }
        if (themeMode === "system") {
            const liveScheme = Appearance.getColorScheme();
            if (liveScheme === "dark" || liveScheme === "light") {
                setOsColorScheme(liveScheme);
            }
        }
    }, [themeMode]);

    useEffect(() => {
        if (themeMode === "system" && (rnColorScheme === "dark" || rnColorScheme === "light")) {
            setOsColorScheme(rnColorScheme);
        }
    }, [rnColorScheme, themeMode]);

    useEffect(() => {
        const refreshFromSystem = () => {
            if (themeModeRef.current === "system") {
                const live = Appearance.getColorScheme();
                if (live === "dark" || live === "light") {
                    setOsColorScheme(live);
                }
            }
            try {
                const latest = FocusBlocker?.getDynamicColors?.();
                if (latest) setDynamicPalette(latest);
            } catch { }
        };

        const appearanceSub = Appearance.addChangeListener(({ colorScheme }) => {
            if (themeModeRef.current === "system" && (colorScheme === "dark" || colorScheme === "light")) {
                setOsColorScheme(colorScheme);
            }
            try {
                const latest = FocusBlocker?.getDynamicColors?.();
                if (latest) setDynamicPalette(latest);
            } catch { }
        });

        const appStateSub = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                refreshFromSystem();
            }
        });

        return () => {
            appearanceSub.remove();
            appStateSub.remove();
        };
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
        ? osColorScheme === "dark"
        : themeMode === "dark";

    const lightColors = resolveThemeColors(false, useDynamicTheme, dynamicPalette, orbTheme);
    const darkColors = resolveThemeColors(true, useDynamicTheme, dynamicPalette, orbTheme);
    const colors = isDarkMode ? darkColors : lightColors;

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

    useEffect(() => {
        SystemUI.setBackgroundColorAsync(colors.background).catch(() => { });
    }, [colors.background]);

    useEffect(() => {
        try {
            setWidgetTheme(colors, {
                themeMode,
                useDynamicTheme,
                hasCustomOrbTheme: orbTheme !== "theme_default",
                lightColors,
                darkColors,
            });
            const store = useAppStore.getState();
            syncWidget(
                store.isSessionActive,
                store.stats.current_streak,
                store.todayStats.today_focus_seconds,
                store.sessionEndTime,
                store.sessionStartTime
            );
        } catch { }
    }, [colors, lightColors, darkColors, themeMode, useDynamicTheme, orbTheme, isDarkMode]);

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleDarkMode,
                themeMode,
                setThemeMode,
                colorScheme: isDarkMode ? "dark" : "light",
                setColorScheme: setThemeMode,
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
            <View className="flex-1" style={[{ backgroundColor: colors.background }, activeStyle]}>
                <StatusBar style={isDarkMode ? "light" : "dark"} />
                {children}
            </View>
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