import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { useReducedMotion as useReanimatedReducedMotion } from "react-native-reanimated";

export function useDynamicReducedMotion(): boolean {
    const initialReducedMotion = useReanimatedReducedMotion();
    const [isReducedMotion, setIsReducedMotion] = useState<boolean>(initialReducedMotion);

    useEffect(() => {
        let mounted = true;
        let eventFired = false;

        const subscription = AccessibilityInfo.addEventListener(
            "reduceMotionChanged",
            (reducedMotionEnabled) => {
                eventFired = true;
                if (mounted) {
                    setIsReducedMotion(reducedMotionEnabled);
                }
            }
        );

        AccessibilityInfo.isReduceMotionEnabled()
            .then((reducedMotionEnabled) => {
                if (mounted && !eventFired) {
                    setIsReducedMotion(reducedMotionEnabled);
                }
            })
            .catch(() => {
                // Ignore native bridge errors; fallback to Reanimated's initial value
            });

        return () => {
            mounted = false;
            subscription.remove();
        };
    }, []);

    return isReducedMotion;
}
