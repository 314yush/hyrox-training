export const RACE_DATE = '2026-09-20' as const;
export const RACE_GOAL_TIME = '1:15' as const;
export const RACE_NAME = 'HYROX Mumbai' as const;
export const TRAINING_START = '2026-05-19' as const;
export const BASELINE_WINDOW = {
  start: '2026-05-15',
  end: '2026-05-17',
} as const;

export type SessionColor = {
  bg: string;
  text: string;
  border: string;
  label: string;
};

export const SESSION_COLORS: Record<string, SessionColor> = {
  run: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-l-blue-500', label: 'Run' },
  station: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-l-emerald-500', label: 'Station' },
  strength: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-l-amber-500', label: 'Strength' },
  'row-ski': { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-l-violet-500', label: 'Row/Ski' },
  rest: { bg: 'bg-slate-400', text: 'text-slate-400', border: 'border-l-slate-400', label: 'Rest' },
  race: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-l-red-500', label: 'RACE' },
  baseline: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-l-cyan-500', label: 'Baseline' },
};
