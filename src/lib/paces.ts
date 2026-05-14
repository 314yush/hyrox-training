import type { Baselines, PaceTargets } from './types';

export function paceStringToSeconds(s: string): number | null {
  const m = s.match(/^(\d+):(\d{2})$/);
  if (!m) return null;
  const min = Number(m[1]);
  const sec = Number(m[2]);
  if (sec >= 60) return null;
  return min * 60 + sec;
}

export function secondsToPaceString(total: number): string {
  const t = Math.round(total);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function derivePaceTargets(baselines: Baselines): PaceTargets {
  if (!baselines.km5Time) return {};
  const total = paceStringToSeconds(baselines.km5Time);
  if (total === null) return {};
  const km5PaceSec = total / 5;
  const easy = km5PaceSec + 60;
  const tempo = easy - 35;
  const race = km5PaceSec + 15;
  const long = race + 20;
  return {
    easy: secondsToPaceString(easy),
    tempo: secondsToPaceString(tempo),
    race: secondsToPaceString(race),
    long: secondsToPaceString(long),
  };
}
