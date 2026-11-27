import React from "react";
import { Platform, StyleProp, Text, TextInput, TextInputProps, TextProps, TextStyle } from "react-native";
import { cssInterop } from "nativewind";

const DEFAULT_TEXT_STYLE: TextStyle = {
    includeFontPadding: false,
    fontFamily: "Inter_400Regular",
};

function createDefaultTextComponent<
    P extends { allowFontScaling?: boolean; style?: StyleProp<TextStyle> }
>(Component: React.ComponentType<P>, displayName: string) {
    const Wrapped = React.forwardRef<unknown, P>(function DefaultTextComponent(
        rawProps,
        ref
    ) {
        const { allowFontScaling = false, style } = rawProps;
        return React.createElement(Component as React.ComponentType<Record<string, unknown>>, {
            ...rawProps,
            ref,
            allowFontScaling,
            style: [DEFAULT_TEXT_STYLE, style],
        });
    });
    Wrapped.displayName = displayName;
    return Wrapped;
}

let isConfigured = false;

/**
 * Restores global Text/TextInput defaults (`allowFontScaling: false`,
 * `includeFontPadding: false`, and default `Inter_400Regular` font family)
 * under React 19, where `Component.defaultProps` on function components is ignored.
 */
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
