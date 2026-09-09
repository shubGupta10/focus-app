import { Colors } from "@/constants/Colors";
import { useSettings } from "@/hooks/useSettings";
import { useMaterialYouPalette } from "@assembless/react-native-material-you";
import { useColorScheme, vars } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeColors = typeof Colors.light;

interface ThemeContextType {
    isMaterialYou: boolean;
    setIsMaterialYou: (val: boolean) => void;
    isDarkMode: boolean;
    toggleDarkMode: (val: boolean) => void;
    colorScheme: "light" | "dark";
    setColorScheme: (scheme: "light" | "dark" | "system") => void;
    colors: ThemeColors;
    activeStyle: any;
    palette: any;
    switchColors: {
        trackActive: string;
        thumbActive: string;
        trackInactive: string;
        thumbInactive: string;
    };
}
const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isMaterialYou, setIsMaterialYouState] = useState(false);
    const palette = useMaterialYouPalette();
    const { getSetting, setSetting } = useSettings();
    const { colorScheme, setColorScheme } = useColorScheme();

    useEffect(() => {
        getSetting("isMaterialYou").then((val) => {
            if (val !== null) {
                setIsMaterialYouState(val === "true");
            }
        });
        getSetting("colorScheme").then((val) => {
            if (val === "dark" || val === "light") {
                setColorScheme(val);
            }
        });
    }, [getSetting, setColorScheme]);

    const setIsMaterialYou = async (val: boolean) => {
        setIsMaterialYouState(val);
        await setSetting("isMaterialYou", val.toString());
    };

    const isDarkMode = colorScheme === "dark";

    const toggleDarkMode = async (val: boolean) => {
        const nextScheme = val ? "dark" : "light";
        setColorScheme(nextScheme);
        await setSetting("colorScheme", nextScheme);
    };

    const isMaterialYouActive = isMaterialYou && !!palette?.system_neutral1;

    const baseTheme = isDarkMode ? Colors.dark : Colors.light;

    const colors: ThemeColors = isMaterialYouActive
        ? isDarkMode
            ? {
                ...Colors.dark,
                background: palette?.system_neutral1?.[11] ?? Colors.dark.background,
                surface: palette?.system_neutral1?.[10] ?? Colors.dark.surface,
                surfaceElevated: palette?.system_neutral1?.[9] ?? Colors.dark.surfaceElevated,
                border: palette?.system_neutral2?.[9] ?? Colors.dark.border,
                text: palette?.system_neutral1?.[1] ?? Colors.dark.text,
                textSecondary: palette?.system_neutral2?.[4] ?? Colors.dark.textSecondary,
                textMuted: palette?.system_neutral2?.[6] ?? Colors.dark.textMuted,
                accent: palette?.system_accent1?.[4] ?? Colors.dark.accent,
                accentMuted: palette?.system_accent1?.[10] ?? Colors.dark.accentMuted,
                icon: palette?.system_neutral1?.[2] ?? Colors.dark.icon,
            }
            : {
                ...Colors.light,
                background: palette?.system_neutral1?.[1] ?? Colors.light.background,
                surface: palette?.system_neutral1?.[2] ?? Colors.light.surface,
                surfaceElevated: palette?.system_neutral1?.[3] ?? Colors.light.surfaceElevated,
                border: palette?.system_neutral2?.[4] ?? Colors.light.border,
                text: palette?.system_neutral1?.[11] ?? Colors.light.text,
                textSecondary: palette?.system_neutral2?.[8] ?? Colors.light.textSecondary,
                textMuted: palette?.system_neutral2?.[6] ?? Colors.light.textMuted,
                accent: palette?.system_accent1?.[8] ?? Colors.light.accent,
                accentMuted: palette?.system_accent1?.[2] ?? Colors.light.accentMuted,
                icon: palette?.system_neutral1?.[10] ?? Colors.light.icon,
            }
        : baseTheme;

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

    const switchColors = isMaterialYouActive
        ? isDarkMode
            ? {
                trackActive: palette?.system_accent1?.[5] ?? colors.accent,
                thumbActive: palette?.system_accent1?.[1] ?? colors.accentForeground,
                trackInactive: palette?.system_neutral2?.[9] ?? colors.border,
                thumbInactive: palette?.system_neutral2?.[6] ?? colors.textSecondary,
            }
            : {
                trackActive: palette?.system_accent1?.[7] ?? colors.accent,
                thumbActive: palette?.system_neutral1?.[1] ?? colors.accentForeground,
                trackInactive: palette?.system_neutral2?.[4] ?? colors.border,
                thumbInactive: palette?.system_neutral2?.[7] ?? colors.textSecondary,
            }
        : {
            trackActive: colors.accent,
            thumbActive: colors.accentForeground,
            trackInactive: colors.border,
            thumbInactive: colors.textSecondary,
        };

    return (
        <ThemeContext.Provider
            value={{
                isMaterialYou,
                setIsMaterialYou,
                isDarkMode,
                toggleDarkMode,
                colorScheme: isDarkMode ? "dark" : "light",
                setColorScheme,
                colors,
                activeStyle,
                palette,
                switchColors,
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
