import { useMaterialYouPalette } from "@assembless/react-native-material-you";
import { useColorScheme, vars } from "nativewind";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

interface ThemeContextType {
    isMaterialYou: boolean;
    setIsMaterialYou: (val: boolean) => void;
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

    useEffect(() => {
        getSetting("isMaterialYou").then((val) => {
            if (val !== null) {
                setIsMaterialYouState(val === "true");
            }
        });
    }, [getSetting]);

    const setIsMaterialYou = async (val: boolean) => {
        setIsMaterialYouState(val);
        await setSetting("isMaterialYou", val.toString());
    };

    const { colorScheme } = useColorScheme();

    const materialTheme = colorScheme === "dark"
        ? vars({
            "--color-background": palette.system_neutral1[11], // 900
            "--color-surface": palette.system_neutral1[10],    // 800
            "--color-border": palette.system_neutral2[9],      // 700
            "--color-text": palette.system_neutral1[1],        // 10
            "--color-text-secondary": palette.system_neutral2[4], // 200
            "--color-accent": palette.system_accent1[4],       // 200
            "--color-icon": palette.system_neutral1[2],        // 50
        })
        : vars({
            "--color-background": palette.system_neutral1[1],  // 10
            "--color-surface": palette.system_neutral1[2],     // 50
            "--color-border": palette.system_neutral2[4],      // 200
            "--color-text": palette.system_neutral1[11],       // 900
            "--color-text-secondary": palette.system_neutral2[8], // 600
            "--color-accent": palette.system_accent1[8],       // 600 (Darker accent for light mode readability)
            "--color-icon": palette.system_neutral1[10],       // 800
        });

    const activeStyle = isMaterialYou ? materialTheme : vars({});

    const switchColors = isMaterialYou 
        ? colorScheme === "dark"
            ? {
                trackActive: palette.system_accent1[5],    // 300
                thumbActive: palette.system_accent1[1],    // 10
                trackInactive: palette.system_neutral2[9], // 700
                thumbInactive: palette.system_neutral2[6], // 400
            }
            : {
                trackActive: palette.system_accent1[7],    // 500
                thumbActive: palette.system_accent1[11],   // 900
                trackInactive: palette.system_neutral2[4], // 200
                thumbInactive: palette.system_neutral2[7], // 500
            }
        : {
            trackActive: "#D97A59",
            thumbActive: "#FFFFFF",
            trackInactive: "#374151",
            thumbInactive: "#9CA3AF",
        };

    return (
        <ThemeContext.Provider value={{ isMaterialYou, setIsMaterialYou, activeStyle, palette, switchColors }}>
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
