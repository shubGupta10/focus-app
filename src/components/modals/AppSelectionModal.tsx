import { Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { AppInfo } from "../../../modules/focus-blocker/src/FocusBlockerModule";

interface AppApplicationModalProps {
    visible: boolean;
    onClose: () => void;
    installedApps: AppInfo[];
    selectedApps: string[];
    onToggleApp: (packageName: string) => void;
}

export function AppApplicationModal({
    visible,
    onClose,
    installedApps,
    selectedApps,
    onToggleApp
}: AppApplicationModalProps) {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <BlurView intensity={20} tint="dark" style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View className="h-5/6 bg-gray-900 rounded-t-3xl border-t border-gray-800 shadow-2xl">
                    <View className="flex-row justify-between items-center mb-6 p-6 pb-0">
                        <Text className="text-white font-bold text-3xl">Block List</Text>
                        <Pressable onPress={onClose} className="bg-green-500 px-6 py-3 rounded-full active:bg-green-600">
                            <Text className="text-white font-bold tracking-wider">DONE</Text>
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1">
                        {installedApps.map((app) => {
                            const isSelected = selectedApps.includes(app.packageName);
                            return (
                                <Pressable
                                    key={app.packageName}
                                    onPress={() => onToggleApp(app.packageName)}
                                    className={`flex-row justify-between items-center py-5 px-4 mb-2 rounded-2xl border ${isSelected ? 'bg-gray-800 border-green-500' : 'border-transparent'}`}
                                >
                                    <Text className={`font-bold text-lg flex-1 mr-4 ${isSelected ? 'text-green-400' : 'text-gray-400'}`} numberOfLines={1}>
                                        {app.name}
                                    </Text>
                                    <Switch
                                        value={isSelected}
                                        onValueChange={() => onToggleApp(app.packageName)}
                                        trackColor={{ false: "#374151", true: "#22c55e" }}
                                        thumbColor="#ffffff"
                                    />
                                </Pressable>
                            )
                        })}
                    </ScrollView>
                </View>

            </BlurView>
        </Modal>
    )
}