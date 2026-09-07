import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, Vibration, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface TimerSelectionModalProps {
    visible: boolean
    onClose: () => void;
    onStartSession: (durationMinutes: number) => void;
}


const PRESET_TIMES = [15, 30, 45, 60, 90, 120];

export default function TimerSelectionModal({ visible, onClose, onStartSession }: TimerSelectionModalProps) {
    const { colors, isDarkMode } = useTheme();
    const [selectedMinutes, setSelectedMinutes] = useState<number>(30);

    if (!visible) return null;

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <BlurView
                intensity={isDarkMode ? 25 : 45}
                tint={isDarkMode ? "dark" : "light"}
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
                }}
            >
                <View className="bg-surface rounded-t-3xl p-6 border-t border-border">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-text text-xl font-black tracking-tight">New Focus Session</Text>

                        <Pressable
                            className="w-10 h-10 rounded-full bg-background items-center justify-center active:opacity-70"
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close modal"
                        >
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>


                    <View className="mb-6 pb-6 border-b border-border">
                        <Text className="text-textSecondary font-bold mb-2.5 tracking-wider text-xs uppercase">No Timer</Text>
                        <Pressable
                            onPress={() => {
                                try { Vibration.vibrate(12); } catch { }
                                onStartSession(-1);
                            }}
                            className="bg-background rounded-2xl p-4 active:opacity-80 flex-row items-center justify-between border border-border/60"
                            accessibilityRole="button"
                            accessibilityLabel="Start infinite mode — counts up until you stop"
                        >
                            <View className="flex-1 mr-3">
                                <Text className="text-text font-black text-lg mb-0.5">Infinite Mode</Text>
                                <Text className="text-textSecondary text-sm font-medium">Counts up until you stop</Text>
                            </View>
                            <Ionicons name="infinite" size={30} color={colors.accent} />
                        </Pressable>
                    </View>


                    <Text className="text-textSecondary font-bold mb-2.5 tracking-wider text-xs uppercase">Timed Focus</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-6"
                        contentContainerStyle={{ paddingRight: 20 }}
                    >
                        {PRESET_TIMES.map((mins) => {
                            const isSelected = selectedMinutes === mins;
                            return (
                                <Pressable
                                    key={mins}
                                    onPress={() => {
                                        try { Vibration.vibrate(8); } catch { }
                                        setSelectedMinutes(mins);
                                    }}
                                    className={`mr-3 rounded-2xl px-5 py-3.5 border ${isSelected
                                        ? "bg-accent border-accent"
                                        : "bg-background border-border/80 active:opacity-80"
                                        }`}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${mins} minutes`}
                                    accessibilityState={{ selected: isSelected }}
                                >
                                    <Text className={`font-black text-lg ${isSelected ? "text-background" : "text-textSecondary"}`}>
                                        {mins}m
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    <Pressable
                        onPress={() => {
                            try { Vibration.vibrate(12); } catch { }
                            onStartSession(selectedMinutes);
                        }}
                        className="w-full bg-accent rounded-2xl p-4 items-center justify-center active:opacity-80"
                        accessibilityRole="button"
                        accessibilityLabel={`Start ${selectedMinutes} minute focus session`}
                    >
                        <Text className="text-background font-black text-base uppercase">
                            Start {selectedMinutes}m Session
                        </Text>
                    </Pressable>
                </View>
            </BlurView>
        </Modal>
    );
}