export type SessionType =
  | 'run'
  | 'station'
  | 'strength'
  | 'row-ski'
  | 'rest'
  | 'race'
  | 'baseline';

export type PhaseId =
  | 'baseline'
  | 'phase-1'
  | 'phase-2'
  | 'phase-3'
  | 'phase-4'
  | 'race-week';

export interface Phase {
  id: PhaseId;
  name: string;
  weeks: number;
  startDate: string;
  endDate: string;
  focus: string;
}

export type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface Session {
  date: string;
  dayName: DayName;
  phase: PhaseId;
  type: SessionType;
  title: string;
  details: string;
  coachingTip?: string;
}

export interface Override {
  date: string;
  customTitle?: string;
  customDetails?: string;
  note?: string;
}

export interface Baselines {
  km1Time?: string;
  km5Time?: string;
  wallBallMaxUnbroken?: number;
  row500mTime?: string;
  burpeeBroadJumpNotes?: string;
  updatedAt?: string;
}

export interface PaceTargets {
  easy?: string;
  tempo?: string;
  race?: string;
  long?: string;
}
