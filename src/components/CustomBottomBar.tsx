import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
    onAppsPress: () => void;
    onFocusPress: () => void;
    onSettingsPress: () => void;
    selectedCount: number;
    isSessionActive?: boolean;
}

export function CustomBottomBar({ onAppsPress, onFocusPress, selectedCount, onSettingsPress, isSessionActive = false }: Props) {
    return (
        <View className="absolute bottom-0 w-full px-4 pb-8 pt-4">
            <View className="flex-row justify-between items-center bg-surface rounded-[40px] px-8 py-4 border border-border shadow-lg">
                <TouchableOpacity className="items-center justify-center w-20" onPress={onAppsPress}>
                    <View className="relative">
                        <Ionicons name="grid" size={24} className="text-icon" />
                        {selectedCount > 0 && (
                            <View className="absolute -top-2 -right-3 bg-accent w-5 h-5 rounded-full items-center justify-center border-2 border-surface">
                                <Text className="text-background text-[10px] font-bold">{selectedCount}</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-textSecondary text-[9px] mt-1 font-medium tracking-wider uppercase text-center">Block List</Text>
                </TouchableOpacity>

                <View className="relative w-20 items-center">
                    <TouchableOpacity
                        className="absolute -top-12 bg-accent w-20 h-20 rounded-full items-center justify-center border-8 border-background shadow-xl"
                        onPress={onFocusPress}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isSessionActive ? "pause" : "play"}
                            size={isSessionActive ? 28 : 32}
                            className="text-background"
                            style={isSessionActive ? undefined : { marginLeft: 3 }}
                        />
                    </TouchableOpacity>
                    <Text className="text-accent font-black text-[10px] tracking-widest uppercase mt-6">
                        {isSessionActive ? "STOP" : "FOCUS"}
                    </Text>
                </View>

                <TouchableOpacity className="items-center justify-center w-20" onPress={onSettingsPress}>
                    <Ionicons name="settings-sharp" size={24} className="text-icon" />
                    <Text className="text-textSecondary text-[9px] mt-1 font-medium tracking-wider uppercase text-center">Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

