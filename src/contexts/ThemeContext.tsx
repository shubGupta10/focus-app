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

    const colors: ThemeColors = isMaterialYouActive
        ? isDarkMode
            ? {
                background: palette?.system_neutral1?.[11] ?? Colors.dark.background,
                surface: palette?.system_neutral1?.[10] ?? Colors.dark.surface,
                border: palette?.system_neutral2?.[9] ?? Colors.dark.border,
                text: palette?.system_neutral1?.[1] ?? Colors.dark.text,
                textSecondary: palette?.system_neutral2?.[4] ?? Colors.dark.textSecondary,
                accent: palette?.system_accent1?.[4] ?? Colors.dark.accent,
                icon: palette?.system_neutral1?.[2] ?? Colors.dark.icon,
            }
            : {
                background: palette?.system_neutral1?.[1] ?? Colors.light.background,
                surface: palette?.system_neutral1?.[2] ?? Colors.light.surface,
                border: palette?.system_neutral2?.[4] ?? Colors.light.border,
                text: palette?.system_neutral1?.[11] ?? Colors.light.text,
                textSecondary: palette?.system_neutral2?.[8] ?? Colors.light.textSecondary,
                accent: palette?.system_accent1?.[8] ?? Colors.light.accent,
                icon: palette?.system_neutral1?.[10] ?? Colors.light.icon,
            }
        : isDarkMode
            ? Colors.dark
            : Colors.light;

    const activeStyle = vars({
        "--color-background": colors.background,
        "--color-surface": colors.surface,
        "--color-border": colors.border,
        "--color-text": colors.text,
        "--color-text-secondary": colors.textSecondary,
        "--color-accent": colors.accent,
        "--color-icon": colors.icon,
    });

    const switchColors = isMaterialYouActive
        ? isDarkMode
            ? {
                trackActive: palette?.system_accent1?.[5] ?? colors.accent,
                thumbActive: palette?.system_accent1?.[1] ?? "#FFFFFF",
                trackInactive: palette?.system_neutral2?.[9] ?? colors.border,
                thumbInactive: palette?.system_neutral2?.[6] ?? colors.textSecondary,
            }
            : {
                trackActive: palette?.system_accent1?.[7] ?? colors.accent,
                thumbActive: palette?.system_neutral1?.[1] ?? "#FFFFFF",
                trackInactive: palette?.system_neutral2?.[4] ?? colors.border,
                thumbInactive: palette?.system_neutral2?.[7] ?? colors.textSecondary,
            }
        : isDarkMode
            ? {
                trackActive: colors.accent,
                thumbActive: "#FFFFFF",
                trackInactive: colors.border,
                thumbInactive: colors.textSecondary,
            }
            : {
                trackActive: colors.accent,
                thumbActive: "#FFFFFF",
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
