import { describe, it, expect } from 'vitest';
import { daysUntilRace, weekDatesFor, phaseForDate } from './dates';

describe('daysUntilRace', () => {
  it('returns positive integer when before race', () => {
    expect(daysUntilRace('2026-09-19')).toBe(1);
    expect(daysUntilRace('2026-05-15')).toBe(128);
  });
  it('returns 0 on race day', () => {
    expect(daysUntilRace('2026-09-20')).toBe(0);
  });
  it('returns negative when after race', () => {
    expect(daysUntilRace('2026-09-21')).toBe(-1);
  });
});

describe('weekDatesFor', () => {
  it('returns Mon-Sun for a Wednesday', () => {
    const dates = weekDatesFor('2026-05-20');
    expect(dates).toEqual([
      '2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21',
      '2026-05-22', '2026-05-23', '2026-05-24',
    ]);
  });
  it('handles a Sunday correctly', () => {
    const dates = weekDatesFor('2026-05-24');
    expect(dates[0]).toBe('2026-05-18');
    expect(dates[6]).toBe('2026-05-24');
  });
});

describe('phaseForDate', () => {
  it('returns baseline for 2026-05-15..17', () => {
    expect(phaseForDate('2026-05-15')).toBe('baseline');
    expect(phaseForDate('2026-05-17')).toBe('baseline');
  });
  it('returns phase-1 for the 4-week base phase', () => {
    expect(phaseForDate('2026-05-18')).toBe('phase-1');
    expect(phaseForDate('2026-06-14')).toBe('phase-1');
  });
  it('returns race-week for 2026-09-14..20', () => {
    expect(phaseForDate('2026-09-14')).toBe('race-week');
    expect(phaseForDate('2026-09-20')).toBe('race-week');
  });
  it('returns null for dates outside the plan', () => {
    expect(phaseForDate('2026-01-01')).toBeNull();
    expect(phaseForDate('2027-01-01')).toBeNull();
  });
});
