import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns';
import { RACE_DATE } from './constants';
import type { PhaseId } from './types';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function daysUntilRace(fromDate: string = todayISO()): number {
  return differenceInCalendarDays(parseISO(RACE_DATE), parseISO(fromDate));
}

export function weekDatesFor(date: string): string[] {
  const start = startOfWeek(parseISO(date), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
}

const PHASE_RANGES: Array<[PhaseId, string, string]> = [
  ['baseline', '2026-05-15', '2026-05-17'],
  ['phase-1', '2026-05-18', '2026-06-14'],
  ['phase-2', '2026-06-15', '2026-07-12'],
  ['phase-3', '2026-07-13', '2026-08-09'],
  ['phase-4', '2026-08-10', '2026-09-13'],
  ['race-week', '2026-09-14', '2026-09-20'],
];

export function phaseForDate(date: string): PhaseId | null {
  for (const [id, start, end] of PHASE_RANGES) {
    if (date >= start && date <= end) return id;
  }
  return null;
}
