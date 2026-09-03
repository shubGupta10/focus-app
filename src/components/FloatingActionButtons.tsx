import { Pressable, Text, View } from "react-native";

interface FloatingActionButtonsProps {
    onFocusPress: () => void;
    onAppsPress: () => void;
    selectedCount: number;
}

export function FloatingActionButtons({ onFocusPress, onAppsPress, selectedCount }: FloatingActionButtonsProps) {
    return (
        <View className="absolute bottom-12 w-full px-8 flex-row justify-between items-end">
            <View className="w-16" />

            <Pressable className="w-44 h-16 bg-green-500 rounded-3xl items-center justify-center border-b-4 border-green-700 active:bg-green-600"
                onPress={onFocusPress}
                style={{ elevation: 15, shadowColor: '#22c55e' }}
            >
                <Text className="text-white font-extrabold text-2xl tracking-wider">FOCUS!</Text>
            </Pressable>

            <Pressable className="w-16 h-16 bg-gray-800 rounded-2xl items-center justify-center border-b-4 border-gray-900 active:bg-gray-700"
                onPress={onAppsPress}
                style={{ elevation: 10 }}
            >
                <Text className="text-white text-xs font-bold text-center mt-1">APPS</Text>

                {selectedCount > 0 && (
                    <View className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center border-2 border-gray-950">
                        <Text className="text-white text-xs font-bold">{selectedCount}</Text>
                    </View>
                )}
            </Pressable>
        </View>
    )
}