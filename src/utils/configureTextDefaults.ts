import React from "react";
import { Platform, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle } from "react-native";
import { cssInterop } from "nativewind";

const DEFAULT_TEXT_STYLE: TextStyle = {
    includeFontPadding: false,
    fontFamily: "Inter_400Regular",
};

function resolveInterFontFamily(fontWeight: TextStyle["fontWeight"]): string | undefined {
    if (fontWeight == null) return undefined;
    switch (String(fontWeight)) {
        case "500":
        case "600":
            return "Inter_500Medium";
        case "700":
        case "bold":
            return "Inter_600SemiBold";
        case "800":
        case "900":
            return "Inter_700Bold";
        default:
            return undefined;
    }
}

function createDefaultTextComponent<
    P extends { allowFontScaling?: boolean; style?: StyleProp<TextStyle> }
>(Component: React.ComponentType<P>, displayName: string) {
    const Wrapped = React.forwardRef<unknown, P>(function DefaultTextComponent(
        rawProps,
        ref
    ) {
        const { allowFontScaling = false, style } = rawProps;
        const flatStyle = style ? StyleSheet.flatten(style) : undefined;
        const mappedFamily = !flatStyle?.fontFamily
            ? resolveInterFontFamily(flatStyle?.fontWeight)
            : undefined;
        const effectiveFamily = mappedFamily ?? flatStyle?.fontFamily;
        const weightStr = flatStyle?.fontWeight != null ? String(flatStyle.fontWeight) : undefined;
        const needsWeightReset = Boolean(
            (!effectiveFamily || effectiveFamily.startsWith("Inter_")) &&
            weightStr &&
            weightStr !== "400" &&
            weightStr !== "normal"
        );

        const normalizedStyle: TextStyle | undefined =
            mappedFamily && needsWeightReset
                ? { fontFamily: mappedFamily, fontWeight: "400" }
                : mappedFamily
                    ? { fontFamily: mappedFamily }
                    : needsWeightReset
                        ? { fontWeight: "400" }
                        : undefined;

        const finalStyle = normalizedStyle
            ? [DEFAULT_TEXT_STYLE, style, normalizedStyle]
            : [DEFAULT_TEXT_STYLE, style];

        return React.createElement(Component as React.ComponentType<Record<string, unknown>>, {
            ...rawProps,
            ref,
            allowFontScaling,
            style: finalStyle,
        });
    });
    Wrapped.displayName = displayName;
    return Wrapped;
}

let isConfigured = false;


export function configureTextDefaults(): void {
    if (isConfigured || Platform.OS === "web" || process.env.NODE_ENV === "test") {
        return;
    }
    isConfigured = true;

    // Ensure NativeWind's built-in interop map is initialized before replacing Text/TextInput.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("react-native-css-interop/dist/runtime/components");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { interopComponents } = require("react-native-css-interop/dist/runtime/native/api") as {
        interopComponents: Map<unknown, unknown>;
    };

    const DefaultText = createDefaultTextComponent<TextProps>(Text, "DefaultText");
    const DefaultTextInput = createDefaultTextComponent<TextInputProps>(TextInput, "DefaultTextInput");

    interopComponents.set(Text, cssInterop(DefaultText, { className: "style" }));
    interopComponents.set(
        TextInput,
        cssInterop(DefaultTextInput, {
            className: { target: "style", nativeStyleToProp: { textAlign: true } },
        })
    );
}
