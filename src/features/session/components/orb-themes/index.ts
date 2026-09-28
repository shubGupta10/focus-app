import { ComponentType } from "react";
import { ClassicProgressBackground } from "./ClassicProgressBackground";
import { ConstellationBackground } from "./ConstellationBackground";
import { HelixOrbitBackground } from "./HelixOrbitBackground";
import { OrbBackgroundProps } from "./OrbBackgroundProps";
import { ParticleDriftBackground } from "./ParticleDriftBackground";
import { SolarSystemBackground } from "./SolarSystemBackground";
import { WaveformPulseBackground } from "./WaveformPulseBackground";
import { PrismaticCoreBackground } from "./PrismaticCoreBackground";
import { ZenRipplesBackground } from "./ZenRipplesBackground";
import { EclipseBackground } from "./EclipseBackground";

const ORB_REGISTRY: Record<string, ComponentType<OrbBackgroundProps>> = {
    solar: SolarSystemBackground,
    classic: ClassicProgressBackground,
    particle_drift: ParticleDriftBackground,
    waveform_pulse: WaveformPulseBackground,
    helix_orbit: HelixOrbitBackground,
    constellation: ConstellationBackground,
    prismatic_core: PrismaticCoreBackground,
    zen_ripples: ZenRipplesBackground,
    eclipse: EclipseBackground,
};

export function getOrbBackground(themeValue: string): ComponentType<OrbBackgroundProps> {
    return ORB_REGISTRY[themeValue] ?? SolarSystemBackground;
}