export interface OrbBackgroundProps {
    isActive: boolean;
    colorAccent: string;
    colorTrack: string;
    colorDotCenter: string;
    outerRadius: number;
    innerRadius: number;
    // For Classic theme backward compatibility
    sessionProgress?: number | null;
    minuteProgress?: number | null;
}
