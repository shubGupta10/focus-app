import { ComponentType } from "react";
import { ClassicProgressBackground } from "./ClassicProgressBackground";
import { ConstellationBackground } from "./ConstellationBackground";
import { HelixOrbitBackground } from "./HelixOrbitBackground";
import { OrbBackgroundProps } from "./OrbBackgroundProps";
import { ParticleDriftBackground } from "./ParticleDriftBackground";
import { SolarSystemBackground } from "./SolarSystemBackground";
import { WaveformPulseBackground } from "./WaveformPulseBackground";

const ORB_REGISTRY: Record<string, ComponentType<OrbBackgroundProps>> = {
    solar: SolarSystemBackground,
    classic: ClassicProgressBackground,
    particle_drift: ParticleDriftBackground,
    waveform_pulse: WaveformPulseBackground,
    helix_orbit: HelixOrbitBackground,
    constellation: ConstellationBackground,
};

export function getOrbBackground(themeValue: string): ComponentType<OrbBackgroundProps> {
    return ORB_REGISTRY[themeValue] ?? SolarSystemBackground;
}