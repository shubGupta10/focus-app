import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Modal, Switch, Text, TouchableOpacity, View } from "react-native";
import FocusBlocker from "../../../modules/focus-blocker/src/FocusBlockerModule";

interface PermissionModalProps {
    visible: boolean;
    onClose: () => void;
    hasUsage: boolean;
    hasOverlay: boolean;
    hasBattery: boolean;
}

export function PermissionModal({ visible, onClose, hasUsage, hasOverlay, hasBattery }: PermissionModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={20} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <View className="bg-gray-900 w-full max-w-sm rounded-3xl p-6 border border-gray-800">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-2xl font-bold">Permissions Required</Text>
                        <TouchableOpacity className="p-1" onPress={onClose}>
                            <Ionicons name="close" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-gray-400 mb-6">
                        Focus needs a few permissions to block distractions effectively.
                    </Text>


                    <View className="gap-4">
                        <TouchableOpacity
                            className={`p-4 rounded-xl border flex-row justify-between items-center ${hasUsage ? 'bg-gray-900/30 border-green-700' : 'bg-gray-800 border-gray-700'}`}
                            onPress={() => FocusBlocker.requestUsagePermission()}
                        >
                            <View className="flex-1 mr-4">
                                <Text className="text-white font-bold text-lg">1. Usage Access</Text>
                                <Text className="text-gray-400 text-sm">To know when you open a distracting app</Text>
                            </View>
                            <Switch
                                value={hasUsage}
                                onValueChange={() => FocusBlocker.requestUsagePermission()}
                                trackColor={{ false: "#374151", true: "#22c55e" }}
                                thumbColor="#ffffff"
                                disabled={hasUsage}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`p-4 rounded-xl border flex-row justify-between items-center ${hasOverlay ? 'bg-gray-900/30 border-green-700' : 'bg-gray-800 border-gray-700'}`}
                            onPress={() => FocusBlocker.requestOverlayPermission()}
                        >
                            <View className="flex-1 mr-4">
                                <Text className="text-white font-bold text-lg">2. Display Over Apps</Text>
                                <Text className="text-gray-400 text-sm">To show the block screen</Text>
                            </View>
                            <Switch
                                value={hasOverlay}
                                onValueChange={() => FocusBlocker.requestOverlayPermission()}
                                trackColor={{ false: "#374151", true: "#22c55e" }}
                                thumbColor="#ffffff"
                                disabled={hasOverlay}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`p-4 rounded-xl border flex-row justify-between items-center ${hasBattery ? 'bg-gray-900/30 border-green-700' : 'bg-gray-800 border-gray-700'}`}
                            onPress={() => FocusBlocker.requestBatteryPermission()}
                        >
                            <View className="flex-1 mr-4">
                                <Text className="text-white font-bold text-lg">3. Ignore Battery</Text>
                                <Text className="text-gray-400 text-sm">To keep the blocker running</Text>
                            </View>
                            <Switch
                                value={hasBattery}
                                onValueChange={() => FocusBlocker.requestBatteryPermission()}
                                trackColor={{ false: "#374151", true: "#22c55e" }}
                                thumbColor="#ffffff"
                                disabled={hasBattery}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="mt-6 bg-white py-4 rounded-xl items-center"
                        onPress={onClose}
                    >
                        <Text className="text-black font-bold text-lg">Done</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    )
}