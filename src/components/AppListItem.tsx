import { Material3Switch } from "@/components/Material3Switch";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { AppInfo } from "../../modules/focus-blocker/src/FocusBlockerModule";

interface AppListItemProps {
    app: AppInfo;
    isSelected: boolean;
    onToggle: (packageName: string) => void;
    disabled?: boolean;
}

export function AppListItemInner({ app, isSelected, onToggle, disabled }: AppListItemProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={() => onToggle(app.packageName)}
            disabled={disabled}
            className={`flex-row justify-between items-center p-3.5 mb-2.5 rounded-2xl bg-surface border border-border ${disabled ? "opacity-50" : "active:opacity-80"
                }`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`${app.name}, ${isSelected ? "selected to block" : "not blocked"}`}
            accessibilityHint="Double tap to toggle blocking"
        >
            <View className="flex-row items-center flex-1 mr-3">
                {app.icon ? (
                    <Image
                        source={{ uri: `data:image/png;base64,${app.icon}` }}
                        className="w-11 h-11 rounded-xl mr-3.5 bg-surface"
                    />
                ) : (
                    <View className="w-11 h-11 rounded-xl bg-surfaceElevated border border-border items-center justify-center mr-3.5">
                        <Ionicons name="help" size={20} color={colors.textMuted} />
                    </View>
                )}

                <View className="flex-1">
                    <Text className="font-bold text-base text-text" numberOfLines={1}>
                        {app.name}
                    </Text>
                </View>
            </View>

            <View pointerEvents="none">
                <Material3Switch
                    value={isSelected}
                    onValueChange={() => { }}
                />
            </View>
        </Pressable>
    );
}

export const AppListItem = memo(AppListItemInner, (prev, next) => {
    return (
        prev.isSelected === next.isSelected && prev.disabled === next.disabled && prev.app.packageName === next.app.packageName
    )
})
