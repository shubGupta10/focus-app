export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Routine {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    days_of_week: string;
    is_enabled: number;
    is_strict: number;
    created_at: string;
}

export interface RoutineInput {
    name: string;
    start_time: string;
    end_time: string;
    days_of_week: string;
    is_strict?: boolean;
}
