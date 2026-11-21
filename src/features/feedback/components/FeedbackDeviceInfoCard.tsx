import { Material3Switch } from "@/components/Material3Switch";
import { Text, View } from "react-native";

interface FeedbackDeviceInfoCardProps {
    appVersion: string;
    osVersion: string;
    includeDeviceInfo: boolean;
    onToggleDeviceInfo: (val: boolean) => void;
}

export function FeedbackDeviceInfoCard({
    appVersion,
    osVersion,
    includeDeviceInfo,
    onToggleDeviceInfo,
}: FeedbackDeviceInfoCardProps) {
    return (
        <View
            className="bg-surfaceElevated border border-border rounded-3xl p-5 flex-row items-center justify-between mb-6 shadow-sm"
            style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
            }}
        >
            <View className="flex-1 mr-4">
                <Text className="text-text font-bold text-base mb-1">
                    Include device info
                </Text>
                <Text className="text-xs text-textMuted">
                    Lockout {appVersion}, {osVersion}
                </Text>
            </View>
            <Material3Switch
                value={includeDeviceInfo}
                onValueChange={onToggleDeviceInfo}
            />
        </View>
    );
}
