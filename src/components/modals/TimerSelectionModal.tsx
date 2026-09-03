import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

interface TimerSelectionModalProps {
    visible: boolean
    onClose: () => void;
    onStartSession: (durationMinutes: number) => void;
}

const PRESET_TIMES = [15, 30, 45, 60, 90, 120];

export default function TimerSelectionModal({ visible, onClose, onStartSession }: TimerSelectionModalProps) {
    const [selectedMinutes, setSelectedMinutes] = useState<number>(30)

    if (!visible) return null;

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <BlurView intensity={20} tint="dark" style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View className="bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-2xl font-black tracking-wider">NEW SESSION</Text>

                        <Pressable className="p-2" onPress={onClose}>
                            <Ionicons name="close" size={24} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    {/* Mode 1: Infinite Focus */}
                    <Text className="text-gray-400 font-bold mb-3 tracking-widest text-xs uppercase">Casual Focus</Text>

                    <Pressable
                        onPress={() => onStartSession(-1)}
                        className="bg-gray-800 rounded-2xl p-5 mb-8 border-b-4 border-gray-950 active:bg-gray-700 flex-row items-center justify-between"
                    >
                        <View>
                            <Text className="text-white font-black text-xl mb-1">Infinite Mode</Text>
                            <Text className="text-gray-400 font-medium">Stopwatch counts up until you quit</Text>
                        </View>
                        <Ionicons name="infinite" size={32} color="#8B5CF6" />
                    </Pressable>

                    {/* Mode 2: Timed Focus */}
                    <Text className="text-gray-400 font-bold mb-3 tracking-widest text-xs uppercase">Deep Work (Countdown)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        {PRESET_TIMES.map((mins) => {
                            const isSelected = selectedMinutes === mins
                            return (
                                <Pressable
                                    key={mins}
                                    onPress={() => setSelectedMinutes(mins)}
                                    className={`mr-3 rounded-2xl px-6 py-4 border-b-4 ${isSelected ? "bg-indigo-600 border-indigo-800" : "bg-gray-800 border-gray-950 active:bg-gray-700"
                                        }`}
                                >
                                    <Text className={`font-black text-xl ${isSelected ? "text-white" : "text-gray-400"}`}>
                                        {mins}m
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>

                    <Pressable
                        onPress={() => onStartSession(selectedMinutes)}
                        className="w-full bg-white rounded-2xl p-5 items-center justify-center border-b-4 border-gray-300 active:bg-gray-200"
                    >
                        <Text className="text-black font-black text-xl tracking-widest">START {selectedMinutes}m</Text>
                    </Pressable>
                </View>
            </BlurView >
        </Modal >
    )
}