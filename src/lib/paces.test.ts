import { describe, it, expect } from 'vitest';
import { paceStringToSeconds, secondsToPaceString, derivePaceTargets } from './paces';

describe('paceStringToSeconds', () => {
  it('parses m:ss', () => {
    expect(paceStringToSeconds('5:30')).toBe(330);
  });
  it('parses mm:ss', () => {
    expect(paceStringToSeconds('22:30')).toBe(1350);
  });
  it('returns null on invalid', () => {
    expect(paceStringToSeconds('abc')).toBeNull();
    expect(paceStringToSeconds('')).toBeNull();
    expect(paceStringToSeconds('5:99')).toBeNull();
  });
});

describe('secondsToPaceString', () => {
  it('formats seconds to m:ss', () => {
    expect(secondsToPaceString(330)).toBe('5:30');
    expect(secondsToPaceString(305)).toBe('5:05');
  });
  it('rounds non-integer seconds', () => {
    expect(secondsToPaceString(330.4)).toBe('5:30');
    expect(secondsToPaceString(330.6)).toBe('5:31');
  });
});

describe('derivePaceTargets', () => {
  it('returns empty object when km5Time absent', () => {
    expect(derivePaceTargets({})).toEqual({});
  });
  it('returns empty object on invalid km5Time', () => {
    expect(derivePaceTargets({ km5Time: 'abc' })).toEqual({});
  });
  it('derives all 4 paces from km5Time=22:30', () => {
    const result = derivePaceTargets({ km5Time: '22:30' });
    expect(result.easy).toBe('5:30');
    expect(result.tempo).toBe('4:55');
    expect(result.race).toBe('4:45');
    expect(result.long).toBe('5:05');
  });
});
