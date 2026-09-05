import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { cssInterop } from "nativewind";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Material3Switch } from "../Material3Switch";
import FocusBlocker from "../../../modules/focus-blocker/src/FocusBlockerModule";
import { useTheme } from "../../contexts/ThemeContext";

cssInterop(Ionicons, {
    className: {
        target: "style",
        nativeStyleToProp: {
            color: true,
        },
    },
});

interface PermissionModalProps {
    visible: boolean;
    onClose: () => void;
    hasUsage: boolean;
    hasOverlay: boolean;
    hasBattery: boolean;
}

export function PermissionModal({ visible, onClose, hasUsage, hasOverlay, hasBattery }: PermissionModalProps) {
    const { isMaterialYou, switchColors, activeStyle, palette } = useTheme();
    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={20} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <View className="bg-surface w-full max-w-sm rounded-3xl p-6 border border-border">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-text text-2xl font-bold">Permissions Required</Text>
                        <TouchableOpacity className="p-1" onPress={onClose}>
                            <Ionicons name="close" size={24} className="text-icon" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-textSecondary mb-6">
                        Focus needs a few permissions to block distractions effectively.
                    </Text>


                    <View className="gap-4">
                        <TouchableOpacity
                            className={`p-4 rounded-xl flex-row justify-between items-center ${hasUsage ? 'bg-background border-accent' : 'bg-background border-border'}`}
                            onPress={() => FocusBlocker.requestUsagePermission()}
                        >
                            <View className="flex-1 mr-4">
                                <Text className="text-text font-bold text-lg">1. Usage Access</Text>
                                <Text className="text-textSecondary text-sm">To know when you open a distracting app</Text>
                            </View>
                            <Material3Switch
                                value={hasUsage}
                                onValueChange={() => FocusBlocker.requestUsagePermission()}
                                disabled={hasUsage}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`p-4 rounded-xl flex-row justify-between items-center ${hasOverlay ? 'bg-background border-accent' : 'bg-background border-border'}`}
                            onPress={() => FocusBlocker.requestOverlayPermission()}
                        >
                            <View className="flex-1 mr-4">
                                <Text className="text-text font-bold text-lg">2. Display Over Apps</Text>
                                <Text className="text-textSecondary text-sm">To show the block screen</Text>
                            </View>
                            <Material3Switch
                                value={hasOverlay}
                                onValueChange={() => FocusBlocker.requestOverlayPermission()}
                                disabled={hasOverlay}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`p-4 rounded-xl flex-row justify-between items-center ${hasBattery ? 'bg-background border-accent' : 'bg-background border-border'}`}
                            onPress={() => FocusBlocker.requestBatteryPermission()}
                        >
                            <View className="flex-1 mr-4">
                                <Text className="text-text font-bold text-lg">3. Ignore Battery</Text>
                                <Text className="text-textSecondary text-sm">To keep the blocker running</Text>
                            </View>
                            <Material3Switch
                                value={hasBattery}
                                onValueChange={() => FocusBlocker.requestBatteryPermission()}
                                disabled={hasBattery}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="mt-6 bg-accent py-4 rounded-xl items-center border border-border"
                        onPress={onClose}
                    >
                        <Text className="text-background font-bold text-lg">Done</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    )
}