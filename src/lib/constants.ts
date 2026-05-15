export const RACE_DATE = '2026-09-20' as const;
export const RACE_GOAL_TIME = '1:15' as const;
export const RACE_NAME = 'HYROX Mumbai' as const;
export const TRAINING_START = '2026-05-19' as const;
export const BASELINE_WINDOW = {
  start: '2026-05-15',
  end: '2026-05-17',
} as const;

export const TRAINING_TOTAL_DAYS = 129;

export type SessionColor = {
  label: string;
  color: string;
  short: string;
};

export const SESSION_COLORS: Record<string, SessionColor> = {
  run:       { label: 'Run',       color: '#38bdf8', short: 'RUN' },
  station:   { label: 'Station',   color: '#34d399', short: 'STN' },
  strength:  { label: 'Strength',  color: '#fbbf24', short: 'STR' },
  'row-ski': { label: 'Row/Ski',   color: '#c084fc', short: 'RS' },
  rest:      { label: 'Rest',      color: '#6b7280', short: 'REST' },
  race:      { label: 'Race',      color: '#ff3d00', short: 'RACE' },
  baseline:  { label: 'Baseline',  color: '#22d3ee', short: 'BASE' },
};
