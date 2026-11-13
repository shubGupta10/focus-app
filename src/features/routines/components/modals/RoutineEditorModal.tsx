import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Material3Switch } from "@/components/Material3Switch";
import { useTheme } from "@/contexts/ThemeContext";
import { Routine, RoutineInput } from "@/types/routine";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FocusBlocker from "../../../../../modules/focus-blocker/src/FocusBlockerModule";
import { RoutineDaySelector } from "../RoutineDaySelector";
import { RoutineTimePickerCard } from "../RoutineTimePickerCard";
import { RoutineAppSelectionModal } from "./RoutineAppSelectionModal";

interface RoutineEditorModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (input: RoutineInput) => void;
    routineToEdit?: Routine | null;
}

const PRESET_NAMES = ["Workday Focus", "Deep Study", "Evening Wind-down"];

export function RoutineEditorModal({
    visible,
    onClose,
    onSave,
    routineToEdit
}: RoutineEditorModalProps) {
    const { colors, activeStyle } = useTheme();

    const [name, setName] = useState("");
    const [startHour, setStartHour] = useState("09");
    const [startMinute, setStartMinute] = useState("00");
    const [endHour, setEndHour] = useState("17");
    const [endMinute, setEndMinute] = useState("00");
    const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
    const [isStrict, setIsStrict] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [isAppSelectionVisible, setIsAppSelectionVisible] = useState(false);

    useEffect(() => {
        if (routineToEdit) {
            setName(routineToEdit.name);
            const [sH, sM] = routineToEdit.start_time.split(":");
            const [eH, eM] = routineToEdit.end_time.split(":");
            setStartHour(sH || "09");
            setStartMinute(sM || "00");
            setEndHour(eH || "17");
            setEndMinute(eM || "00");
            setSelectedDays(new Set(routineToEdit.days_of_week.split(",").map(Number)));
            setIsStrict(Boolean(routineToEdit.is_strict));
            setSelectedApps(routineToEdit.blocked_apps ? routineToEdit.blocked_apps.split(",") : []);
        } else {
            setName("");
            setStartHour("09");
            setStartMinute("00");
            setEndHour("17");
            setEndMinute("00");
            setSelectedDays(new Set([1, 2, 3, 4, 5]));
            setIsStrict(false);
            setSelectedApps([]);
        }
        setErrorText("");
    }, [routineToEdit, visible]);

    const toggleDay = (day: number) => {
        setSelectedDays((prev) => {
            const next = new Set(prev);
            if (next.has(day)) {
                if (next.size > 1) {
                    next.delete(day);
                }
            } else {
                next.add(day);
            }
            return next;
        });
    };

    const handlePickTime = async (type: "start" | "end") => {
        const curH = parseInt(type === "start" ? startHour : endHour, 10) || 0;
        const curM = parseInt(type === "start" ? startMinute : endMinute, 10) || 0;
        try {
            const res = await FocusBlocker.showTimePicker(curH, curM, false);
            if (res) {
                const hStr = res.hour.toString().padStart(2, "0");
                const mStr = res.minute.toString().padStart(2, "0");
                if (type === "start") {
                    setStartHour(hStr);
                    setStartMinute(mStr);
                } else {
                    setEndHour(hStr);
                    setEndMinute(mStr);
                }
            }
        } catch {
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            setErrorText("Please enter a routine name.");
            return;
        }

        const startTime = `${startHour.padStart(2, "0")}:${startMinute.padStart(2, "0")}`;
        const endTime = `${endHour.padStart(2, "0")}:${endMinute.padStart(2, "0")}`;

        if (startTime === endTime) {
            setErrorText("Start time and end time cannot be the same.");
            return;
        }

        if (selectedDays.size === 0) {
            setErrorText("Please select at least one active day.");
            return;
        }

        const daysOfWeek = Array.from(selectedDays).sort((a, b) => a - b).join(",");

        onSave({
            name: name.trim(),
            start_time: startTime,
            end_time: endTime,
            days_of_week: daysOfWeek,
            is_strict: isStrict,
            blocked_apps: selectedApps.join(","),
        });

        onClose();
    };

    const sH = parseInt(startHour, 10) || 0;
    const sM = parseInt(startMinute, 10) || 0;
    const eH = parseInt(endHour, 10) || 0;
    const eM = parseInt(endMinute, 10) || 0;
    const startTotal = sH * 60 + sM;
    const endTotal = eH * 60 + eM;
    const diffMins = endTotal > startTotal ? endTotal - startTotal : (24 * 60 - startTotal) + endTotal;
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    const durationLabel = diffHours > 0 && remainingMins > 0
        ? `${diffHours}h ${remainingMins}m`
        : (diffHours > 0 ? `${diffHours}h` : `${remainingMins}m`);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView className="flex-1 bg-surfaceElevated" style={activeStyle}>
                <View className="flex-row items-center justify-between px-6 pt-5 pb-4">
                    <AnimatedPressable
                        onPress={onClose}
                        hitSlop={10}
                        scaleTo={0.88}
                        hapticMode="light"
                        className="w-10 h-10 rounded-full bg-surface items-center justify-center"
                        accessibilityRole="button"
                        accessibilityLabel="Close routine editor"
                    >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </AnimatedPressable>
                    <Text className="text-text font-black text-lg">
                        {routineToEdit ? "Edit Routine" : "New Routine"}
                    </Text>
                    <AnimatedPressable
                        onPress={handleSave}
                        scaleTo={0.92}
                        hapticMode="light"
                        className="bg-accent px-5 py-2 rounded-full"
                        style={{ elevation: 1 }}
                        accessibilityRole="button"
                        accessibilityLabel="Save routine"
                    >
                        <Text className="text-accentForeground font-bold text-xs uppercase tracking-wider">
                            Save
                        </Text>
                    </AnimatedPressable>
                </View>

                <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {errorText ? (
                        <View className="bg-warningMuted rounded-2xl p-4 mb-5">
                            <Text className="text-warning text-xs font-bold">{errorText}</Text>
                        </View>
                    ) : null}

                    <View className="mb-7">
                        <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider mb-2.5 px-1">
                            Routine Name
                        </Text>
                        <TextInput
                            value={name}
                            onChangeText={(t) => {
                                setName(t);
                                setErrorText("");
                            }}
                            placeholder="e.g. Workday Focus"
                            placeholderTextColor={colors.textMuted}
                            className="bg-surface border border-border rounded-2xl px-5 py-4 text-text font-bold text-base mb-3"
                        />

                        {/* M3 Preset Filter Chips */}
                        <View className="flex-row flex-wrap gap-2 px-1">
                            {PRESET_NAMES.map((preset) => {
                                const isSelected = name.trim() === preset;
                                return (
                                    <AnimatedPressable
                                        key={preset}
                                        onPress={() => setName(preset)}
                                        scaleTo={0.94}
                                        hapticMode="light"
                                        className={`px-4 py-2 rounded-full ${isSelected
                                                ? "bg-accent"
                                                : "bg-surfaceElevated border border-border"
                                            }`}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Set preset name to ${preset}`}
                                    >
                                        <Text
                                            className={`text-xs ${isSelected
                                                    ? "text-accentForeground font-bold"
                                                    : "text-textSecondary font-semibold"
                                                }`}
                                        >
                                            {preset}
                                        </Text>
                                    </AnimatedPressable>
                                );
                            })}
                        </View>
                    </View>

                    <RoutineTimePickerCard
                        startTime={`${startHour}:${startMinute}`}
                        endTime={`${endHour}:${endMinute}`}
                        durationLabel={durationLabel}
                        onSelectStartTime={() => handlePickTime("start")}
                        onSelectEndTime={() => handlePickTime("end")}
                    />

                    <RoutineDaySelector
                        selectedDays={selectedDays}
                        onToggleDay={toggleDay}
                    />

                    <View
                        className="bg-surface border border-border rounded-3xl p-5 flex-row items-center justify-between mb-8"
                        style={{
                            elevation: 2,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.06,
                            shadowRadius: 10,
                        }}
                    >
                        <View className="flex-1 pr-4">
                            <View className="flex-row items-center mb-1">
                                <Text className="text-text font-bold text-base mr-2">Strict Mode</Text>
                                <View className="bg-accent px-2 py-0.5 rounded-md">
                                    <Text className="text-accentForeground text-[10px] font-bold uppercase">1.5x Coins</Text>
                                </View>
                            </View>
                            <Text className="text-textSecondary text-xs leading-4">
                                Requires weekly emergency skip to end early. System settings and app stores will be guarded.
                            </Text>
                        </View>
                        <Material3Switch value={isStrict} onValueChange={setIsStrict} />
                    </View>

                    <AnimatedPressable
                        onPress={() => setIsAppSelectionVisible(true)}
                        scaleTo={0.98}
                        hapticMode="light"
                        className="bg-surface border border-border rounded-3xl p-5 flex-row items-center justify-between mb-3"
                        style={{
                            elevation: 2,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.06,
                            shadowRadius: 10,
                        }}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-full bg-accentMuted items-center justify-center mr-3">
                                <Ionicons name="apps" size={20} color={colors.accent} />
                            </View>

                            <View>
                                <Text className="text-text font-bold text-base mb-0.5">
                                    Apps to Block
                                </Text>
                                <Text className="text-textSecondary text-xs">
                                    {selectedApps.length > 0 ?
                                        `${selectedApps.length} Custom Apps Selected` : "Using Global Blocklist"
                                    }
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </AnimatedPressable>
                </ScrollView>
            </SafeAreaView>
            <RoutineAppSelectionModal
                visible={isAppSelectionVisible}
                initialSelectedApps={selectedApps}
                onClose={() => setIsAppSelectionVisible(false)}
                onSave={(apps) => {
                    setSelectedApps(apps);
                    setIsAppSelectionVisible(false)
                }}
            />
        </Modal>
    );
}
