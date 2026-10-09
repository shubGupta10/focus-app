import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppNotification } from '../hooks/useAutoUpdateCheck';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface NotificationSheetProps {
    visible: boolean;
    onClose: () => void;
    notifications: AppNotification[];
}

export function NotificationSheet({ visible, onClose, notifications }: NotificationSheetProps) {
    const slideAnim = useRef(new Animated.Value(width)).current;
    const [isRendered, setIsRendered] = useState(false);
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    useEffect(() => {
        if (visible) {
            setIsRendered(true);
            slideAnim.setValue(width);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 25,
                stiffness: 250
            }).start();
        } else if (isRendered) {
            Animated.timing(slideAnim, {
                toValue: width,
                duration: 250,
                useNativeDriver: true
            }).start(() => {
                setIsRendered(false);
            });
        }
    }, [visible]);

    if (!isRendered) return null;

    return (
        <Modal transparent visible={isRendered} animationType="none" onRequestClose={onClose}>
            <View className="flex-1 flex-row">
                <Pressable className="flex-1 bg-black/40" onPress={onClose} />

                <Animated.View
                    style={{ transform: [{ translateX: slideAnim }], paddingTop: insets.top }}
                    className="w-4/5 max-w-[320px] h-full bg-surface shadow-2xl absolute right-0"
                >
                    <View className="flex-row items-center justify-between p-5 border-b border-border">
                        <Text className="text-text font-black text-xl">Notifications</Text>
                        <Pressable onPress={onClose} className="p-1 active:opacity-50">
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                        {notifications.length === 0 ? (
                            <View className="items-center justify-center mt-10 opacity-50">
                                <Ionicons name="notifications-off-outline" size={40} color={colors.textSecondary} />
                                <Text className="text-textSecondary mt-4 font-medium">You're all caught up!</Text>
                            </View>
                        ) : (
                            notifications.map((note) => (
                                <View key={note.id} className="bg-surfaceElevated p-4 rounded-2xl mb-4 border border-border">
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons
                                            name={note.id === 'ota_celebrate' ? "sparkles" : "cloud-download"}
                                            size={20}
                                            color={note.id === 'ota_celebrate' ? "#10b981" : "#3b82f6"}
                                        />
                                        <Text className="text-text font-bold text-base ml-2 flex-1">{note.title}</Text>
                                    </View>
                                    <Text className="text-textSecondary text-sm mb-4 leading-relaxed">{note.description}</Text>

                                    {note.actionLabel && note.downloadUrl && (
                                        <Pressable
                                            className="bg-primary py-2.5 rounded-xl items-center active:opacity-75"
                                            onPress={() => Linking.openURL(note.downloadUrl!)}
                                        >
                                            <Text className="text-accent font-bold">{note.actionLabel}</Text>
                                        </Pressable>
                                    )}
                                </View>
                            ))
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}
