import { useSettings } from "@/hooks/useSettings";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const TIMER_OPTIONS = [15, 25, 60];

export function SettingsSessionCard() {
    const { getSetting, setSetting } = useSettings();
    const [defaultTimer, setDefaultTimer] = useState(25);

    useEffect(() => {
        getSetting("default_timer").then(val => {
            if (val !== null) setDefaultTimer(parseInt(val, 10));
        });
    }, [getSetting]);

    const handleTimerSelect = (mins: number) => {
        setDefaultTimer(mins);
        setSetting("default_timer", mins.toString());
    };

    return (
        <View className= "px-6 py-5" >
        <Text className="text-textSecondary font-bold text-xs tracking-wider uppercase mb-3" >
            Session Preferences
                </Text>

                < View className = "bg-surfaceElevated rounded-2xl p-5 flex-col justify-between" >
                    <View className="mb-4" >
                        <Text className="text-text font-bold text-lg mb-1" > Default Timer </Text>
                            < Text className = "text-textSecondary text-sm leading-5" >
                                Choose the default duration when starting a new session.
                    </Text>
                                    </View>

                                    < View className = "flex-row items-center justify-between bg-surface rounded-xl p-1 border border-border" >
                                    {
                                        TIMER_OPTIONS.map((mins) => {
                                            const isSelected = defaultTimer === mins;
                                            return (
                                                <Pressable
                                key= { mins }
                                            onPress = {() => handleTimerSelect(mins)
                                        }
                                className = {`flex-1 items-center justify-center py-2.5 rounded-lg ${isSelected ? 'bg-accent' : 'bg-transparent'}`}
                                        >
                                        <Text className={ `font-bold ${isSelected ? 'text-white' : 'text-textSecondary'}` }>
                                            { mins } min
                                                </Text>
                                                </Pressable>
                        );
})}
</View>
    </View>
    </View>
    );
}
