# HYROX Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a mobile-first PWA that displays the user's 16-week HYROX training plan day-by-day, with editable baselines, derived pace targets, and per-day notes/overrides — all offline-capable via IndexedDB.

**Architecture:** Next.js 16 App Router on Vercel. UI with shadcn/ui + Tailwind. State is fully client-side: the training plan is a seeded TypeScript constant baked into the bundle; user-mutable data (notes, overrides, baselines, paces) lives in IndexedDB via `idb-keyval`. PWA install + offline via manifest + minimal service worker.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, idb-keyval, date-fns, Vercel.

---

## File Structure

```
package.json
tsconfig.json
next.config.ts
postcss.config.mjs
.gitignore
components.json                # shadcn config

app/
  layout.tsx                    # PWA shell, bottom nav, header, theme
  globals.css                   # Tailwind + design tokens
  page.tsx                      # Redirect to /today
  today/page.tsx                # Today view
  week/page.tsx                 # Week view
  plan/page.tsx                 # Phase/week timeline
  dashboard/page.tsx            # Goal, baselines, paces
  day/[date]/page.tsx           # Specific-date detail
  manifest.ts                   # PWA manifest (Next.js metadata API)

components/
  app-shell.tsx                 # Wraps children: header + bottom nav
  bottom-nav.tsx                # Today/Week/Plan/Dashboard tabs
  race-countdown.tsx            # "128 days to 1:15" header
  session-card.tsx              # Big colored card with session details
  session-badge.tsx             # Small colored type badge
  notes-editor.tsx              # Autosaved per-day notes textarea
  override-editor.tsx           # "Customize this session" form
  baseline-form.tsx             # Editable baseline inputs
  pace-targets.tsx              # Pace display + override
  phase-section.tsx             # Collapsible phase block on plan page
  ui/                           # shadcn primitives (button, card, input, etc.)

lib/
  types.ts                      # Shared types
  plan-data.ts                  # Seeded 16-week plan + phases + race-day
  storage.ts                    # idb-keyval typed wrappers + hooks
  dates.ts                      # Phase detection, day lookup, countdown
  paces.ts                      # Pace derivation from baseline 5k
  constants.ts                  # Race date, goal time, etc.

public/
  icon-192.png
  icon-512.png
  apple-touch-icon.png
```

---

## Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `postcss.config.mjs`

- [ ] **Step 1: Scaffold Next.js with create-next-app**

Run from `/Users/piyush/hyrox`:
```bash
npx --yes create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --eslint \
  --turbopack \
  --import-alias "@/*" \
  --use-npm \
  --no-git \
  --yes
```

Expected: project scaffolded in current directory. If prompts appear, accept defaults.

- [ ] **Step 2: Verify it builds and runs**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 3: Commit scaffold**

```bash
git add .
git commit -m "feat: initial Next.js scaffold"
```

---

## Task 2: Install shadcn/ui + project deps

**Files:**
- Create: `components.json`, `components/ui/*.tsx` (auto-generated)
- Modify: `package.json`, `app/globals.css`

- [ ] **Step 1: Init shadcn**

```bash
npx --yes shadcn@latest init --yes --defaults
```

If a prompt asks for base color, use `slate`. For style, accept default. For CSS variables, accept yes.

- [ ] **Step 2: Add the components we need**

```bash
npx --yes shadcn@latest add button card input label textarea badge tabs separator collapsible
```

- [ ] **Step 3: Install runtime deps**

```bash
npm install idb-keyval date-fns
```

- [ ] **Step 4: Verify build still passes**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui + idb-keyval + date-fns"
```

---

## Task 3: Add shared types and constants

**Files:**
- Create: `lib/types.ts`
- Create: `lib/constants.ts`

- [ ] **Step 1: Create lib/constants.ts**

```ts
// lib/constants.ts
export const RACE_DATE = '2026-09-20' as const;
export const RACE_GOAL_TIME = '1:15' as const;
export const RACE_NAME = 'HYROX Mumbai' as const;
export const TRAINING_START = '2026-05-19' as const;
export const BASELINE_WINDOW = {
  start: '2026-05-15',
  end: '2026-05-17',
} as const;

export const SESSION_COLORS = {
  run: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', label: 'Run' },
  station: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', label: 'Station' },
  strength: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', label: 'Strength' },
  'row-ski': { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500', label: 'Row/Ski' },
  rest: { bg: 'bg-slate-400', text: 'text-slate-400', border: 'border-slate-400', label: 'Rest' },
  race: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', label: 'RACE' },
  baseline: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', label: 'Baseline' },
} as const;
```

- [ ] **Step 2: Create lib/types.ts**

```ts
// lib/types.ts
export type SessionType =
  | 'run' | 'station' | 'strength' | 'row-ski' | 'rest' | 'race' | 'baseline';

export type PhaseId = 'baseline' | 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4' | 'race-week';

export interface Phase {
  id: PhaseId;
  name: string;
  weeks: number;
  startDate: string;   // ISO YYYY-MM-DD
  endDate: string;     // ISO YYYY-MM-DD
  focus: string;
}

export interface Session {
  date: string;        // ISO YYYY-MM-DD
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  phase: PhaseId;
  type: SessionType;
  title: string;
  details: string;     // multiline
  coachingTip?: string;
}

export interface Override {
  date: string;
  customTitle?: string;
  customDetails?: string;
  note?: string;
}

export interface Baselines {
  km1Time?: string;       // "mm:ss"
  km5Time?: string;       // "mm:ss"
  wallBallMaxUnbroken?: number;
  row500mTime?: string;   // "mm:ss"
  burpeeBroadJumpNotes?: string;
  updatedAt?: string;     // ISO
}

export interface PaceTargets {
  easy?: string;          // "m:ss/km"
  tempo?: string;
  race?: string;
  long?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: shared types and constants"
```

---

## Task 4: Pace derivation logic (TDD)

**Files:**
- Create: `lib/paces.ts`
- Create: `lib/paces.test.ts`
- Modify: `package.json` (add vitest)

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest @vitest/ui
```

Then add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write failing tests**

Create `lib/paces.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { paceStringToSeconds, secondsToPaceString, derivePaceTargets } from './paces';

describe('paceStringToSeconds', () => {
  it('parses m:ss', () => {
    expect(paceStringToSeconds('5:30')).toBe(330);
  });
  it('returns null on invalid', () => {
    expect(paceStringToSeconds('abc')).toBeNull();
    expect(paceStringToSeconds('')).toBeNull();
  });
});

describe('secondsToPaceString', () => {
  it('formats seconds to m:ss', () => {
    expect(secondsToPaceString(330)).toBe('5:30');
    expect(secondsToPaceString(305)).toBe('5:05');
  });
});

describe('derivePaceTargets', () => {
  it('returns empty object when km5Time absent', () => {
    expect(derivePaceTargets({})).toEqual({});
  });
  it('derives all 4 paces from km5Time=22:30', () => {
    // 5k pace = 22:30 / 5 = 4:30/km = 270s
    const result = derivePaceTargets({ km5Time: '22:30' });
    expect(result.easy).toBe('5:30');   // 270 + 60
    expect(result.tempo).toBe('4:55');  // easy(330) - 35 = 295s
    expect(result.race).toBe('4:45');   // 270 + 15
    expect(result.long).toBe('5:05');   // race(285) + 20 = 305s
  });
});
```

- [ ] **Step 3: Run tests to confirm failure**

```bash
npm test
```
Expected: FAIL (paces.ts doesn't exist).

- [ ] **Step 4: Implement lib/paces.ts**

```ts
// lib/paces.ts
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
  // km5Time is total time for 5km, so per-km pace = total / 5
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
```

Wait — the test says `km5Time: '22:30'` should give easy = `5:30`. That implies km5Time is the *per-km* pace, not total. Let me re-check the test math:

- km5Time '22:30' → 1350s total OR 22:30/km pace?
- Test expects easy = 5:30 = 330s
- If km5Time is total 1350s, per-km = 270s. Easy = 270 + 60 = 330s = 5:30 ✓
- So km5Time is *total time for 5km* and derivation divides by 5.

The implementation above does this correctly: `const km5PaceSec = total / 5;`

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: PASS (all 6 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/paces.ts lib/paces.test.ts package.json package-lock.json
git commit -m "feat: pace derivation logic with tests"
```

---

## Task 5: Date helpers (TDD)

**Files:**
- Create: `lib/dates.ts`
- Create: `lib/dates.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// lib/dates.test.ts
import { describe, it, expect } from 'vitest';
import { daysUntilRace, todayISO, weekDatesFor, phaseForDate } from './dates';

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
  it('returns Mon-Sun for a given date (Monday week start)', () => {
    // 2026-05-20 is a Wednesday
    const dates = weekDatesFor('2026-05-20');
    expect(dates).toEqual([
      '2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21',
      '2026-05-22', '2026-05-23', '2026-05-24',
    ]);
  });
  it('handles a Sunday correctly', () => {
    // 2026-05-24 is a Sunday
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
  it('returns phase-1 for 2026-05-19..2026-06-15', () => {
    expect(phaseForDate('2026-05-19')).toBe('phase-1');
    expect(phaseForDate('2026-06-15')).toBe('phase-1');
  });
  it('returns race-week for 2026-09-14..20', () => {
    expect(phaseForDate('2026-09-14')).toBe('race-week');
    expect(phaseForDate('2026-09-20')).toBe('race-week');
  });
});
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
npm test
```
Expected: FAIL.

- [ ] **Step 3: Implement lib/dates.ts**

```ts
// lib/dates.ts
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
  // weekStartsOn: 1 = Monday
  const start = startOfWeek(parseISO(date), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
}

const PHASE_RANGES: Array<[PhaseId, string, string]> = [
  ['baseline',  '2026-05-15', '2026-05-17'],
  ['phase-1',   '2026-05-18', '2026-06-15'],
  ['phase-2',   '2026-06-16', '2026-07-13'],
  ['phase-3',   '2026-07-14', '2026-08-10'],
  ['phase-4',   '2026-08-11', '2026-09-13'],
  ['race-week', '2026-09-14', '2026-09-20'],
];

export function phaseForDate(date: string): PhaseId | null {
  for (const [id, start, end] of PHASE_RANGES) {
    if (date >= start && date <= end) return id;
  }
  return null;
}
```

Note: `phase-1` starts on 2026-05-18 (Mon) not 2026-05-19. Updated to align with weekly schedule.

- [ ] **Step 4: Run tests**

```bash
npm test
```
Expected: PASS. If the phase-1 test fails because it expected 2026-05-19, update test to use 2026-05-18.

- [ ] **Step 5: Commit**

```bash
git add lib/dates.ts lib/dates.test.ts
git commit -m "feat: date helpers with tests"
```

---

## Task 6: Storage layer (idb-keyval wrappers)

**Files:**
- Create: `lib/storage.ts`

- [ ] **Step 1: Implement lib/storage.ts**

```ts
// lib/storage.ts
'use client';
import { get, set, del } from 'idb-keyval';
import type { Override, Baselines, PaceTargets } from './types';

const KEY_OVERRIDES = 'hyrox.overrides';
const KEY_BASELINES = 'hyrox.baselines';
const KEY_PACES = 'hyrox.paces';

type OverrideMap = Record<string, Override>;

export async function getOverrides(): Promise<OverrideMap> {
  return (await get<OverrideMap>(KEY_OVERRIDES)) ?? {};
}

export async function setOverride(date: string, override: Override): Promise<void> {
  const all = await getOverrides();
  if (!override.customTitle && !override.customDetails && !override.note) {
    delete all[date];
  } else {
    all[date] = { ...override, date };
  }
  await set(KEY_OVERRIDES, all);
}

export async function getOverride(date: string): Promise<Override | null> {
  const all = await getOverrides();
  return all[date] ?? null;
}

export async function getBaselines(): Promise<Baselines> {
  return (await get<Baselines>(KEY_BASELINES)) ?? {};
}

export async function setBaselines(b: Baselines): Promise<void> {
  await set(KEY_BASELINES, { ...b, updatedAt: new Date().toISOString() });
}

export async function getPaceOverrides(): Promise<PaceTargets> {
  return (await get<PaceTargets>(KEY_PACES)) ?? {};
}

export async function setPaceOverrides(p: PaceTargets): Promise<void> {
  await set(KEY_PACES, p);
}

export async function clearAll(): Promise<void> {
  await del(KEY_OVERRIDES);
  await del(KEY_BASELINES);
  await del(KEY_PACES);
}
```

- [ ] **Step 2: Build to verify TypeScript**

```bash
npm run build
```
Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add lib/storage.ts
git commit -m "feat: idb-keyval storage layer"
```

---

## Task 7: Seed the plan data (the big one)

**Files:**
- Create: `lib/plan-data.ts`

This is mechanical but long. The plan covers 2026-05-15 through 2026-09-20 (129 days). We generate sessions per day based on the user's training plan.

- [ ] **Step 1: Create phases array**

```ts
// lib/plan-data.ts
import type { Phase, Session, PhaseId } from './types';

export const PHASES: Phase[] = [
  { id: 'baseline', name: 'Baseline Testing', weeks: 1, startDate: '2026-05-15', endDate: '2026-05-17', focus: 'Establish baselines for paces and station capacity' },
  { id: 'phase-1', name: 'Phase 1 — Base Building', weeks: 4, startDate: '2026-05-18', endDate: '2026-06-15', focus: 'Walk/run intervals, sled technique, station intro' },
  { id: 'phase-2', name: 'Phase 2 — Build', weeks: 4, startDate: '2026-06-16', endDate: '2026-07-13', focus: 'Tempo runs, 80% race-effort stations, drop walk breaks' },
  { id: 'phase-3', name: 'Phase 3 — Specificity', weeks: 4, startDate: '2026-07-14', endDate: '2026-08-10', focus: 'HYROX simulations, 8 km at pace, race-weight sled' },
  { id: 'phase-4', name: 'Phase 4 — Peak + Taper', weeks: 4, startDate: '2026-08-11', endDate: '2026-09-13', focus: 'Race pace efforts, deload, sleep is training' },
  { id: 'race-week', name: 'Race Week', weeks: 1, startDate: '2026-09-14', endDate: '2026-09-20', focus: 'Minimal sessions, rest, race day' },
];
```

- [ ] **Step 2: Add helpers and baseline-week sessions**

Continue `lib/plan-data.ts`:
```ts
import { addDays, format, parseISO, getDay } from 'date-fns';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const;

function s(date: string, phase: PhaseId, type: Session['type'], title: string, details: string, coachingTip?: string): Session {
  const dayName = DAY_NAMES[getDay(parseISO(date))] as Session['dayName'];
  return { date, dayName, phase, type, title, details, coachingTip };
}

// Baseline window 2026-05-15 (Fri) to 2026-05-17 (Sun)
const BASELINE_SESSIONS: Session[] = [
  s('2026-05-15', 'baseline', 'baseline', '1 km all-out time trial',
`Warm up 10 min easy.
Run 1 km as hard as you can sustain.
Note your time and the distance at which it started to hurt (200 m? 600 m?).
Cool down 5 min walk.`,
    'This is data, not training. Empty the tank.'),
  s('2026-05-16', 'baseline', 'baseline', '5 km steady-state run',
`Warm up 5 min easy.
Run 5 km at a pace you can sustain.
Note total time + what stopped you (legs, lungs, mental) and which km.`,
    'Honesty matters more than speed. We need a true baseline.'),
  s('2026-05-17', 'baseline', 'baseline', 'Station baselines',
`Wall ball — max unbroken reps at controlled pace (full squat, chin height catch).
500 m row — best effort, note split.
Burpee broad jumps — 5 reps, note how the movement feels.`,
    'You\'re measuring capacity, not exhaustion. Rest fully between movements.'),
];
```

- [ ] **Step 3: Add Phase 1 weekly template generator**

Continue `lib/plan-data.ts`:
```ts
// Phase 1 weeks: Mon..Sun template — vary long run by week
function phase1Week(weekStart: string, longMins: number): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(d(0), 'phase-1', 'strength', 'Upper Body + Easy Run',
`Upper body strength session (push/pull, 3-4 exercises).
30 min easy run: walk 2 min / run 3 min intervals.`,
      'Never breathing hard. This is zone 2.'),
    s(d(1), 'phase-1', 'strength', 'Lower Body + Sled',
`Lower body strength session.
Sled push/pull — light load, learn stance and foot drive.`,
      'Weight is irrelevant this phase. Technique is everything.'),
    s(d(2), 'phase-1', 'row-ski', 'Row/Ski + Easy Run',
`Ski erg or row: 3×3 min at 70% effort, 90 sec rest between.
5 km easy steady-state run.`,
      'Run at a pace you could sustain for an hour.'),
    s(d(3), 'phase-1', 'station', 'Station Practice',
`Wall ball: 3×10 reps at controlled pace (full squat depth, catch at chin).
Burpee broad jump intro: 3×5 reps (chest fully down, explosive push-up, soft landing).`,
      'Quality reps. Don\'t practice sloppy form.'),
    s(d(4), 'phase-1', 'row-ski', 'Row + Sandbag Lunges',
`Row: 5–10 min easy.
Sandbag lunge intro: bodyweight or 10 kg (upright torso, full knee extension, 10 m per set).`,
      'Lunge depth and posture before adding weight.'),
    s(d(5), 'phase-1', 'run', `Long Run — ${longMins} min`,
`Easy continuous run for ${longMins} minutes.
Pace: comfortable, conversational.`,
      'Add 5 min each week. If it feels hard, slow down.'),
    s(d(6), 'phase-1', 'rest', 'Rest + Mobility',
`Full rest.
Mobility: hip flexors, calves, thoracic spine (10 min foam roll minimum).`,
      'Recovery is when adaptation happens.'),
  ];
}

const PHASE_1_SESSIONS: Session[] = [
  ...phase1Week('2026-05-18', 30),
  ...phase1Week('2026-05-25', 35),
  ...phase1Week('2026-06-01', 40),
  ...phase1Week('2026-06-08', 45),
];
```

- [ ] **Step 4: Add Phase 2 (Build) week generator**

Continue `lib/plan-data.ts`:
```ts
function phase2Week(weekStart: string, longMins: number): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(d(0), 'phase-2', 'run', 'Upper Body + Tempo Run',
`Upper body strength session.
3 km continuous tempo run (~30–45 sec/km faster than easy pace).`,
      'Tempo = comfortably hard. Short sentences, not paragraphs.'),
    s(d(1), 'phase-2', 'station', 'Sled + Burpee Broad Jumps',
`Sled push/pull at 60–70% race weight.
Burpee broad jumps: 3×8 reps.`,
      'Add load to the sled. Keep technique from Phase 1.'),
    s(d(2), 'phase-2', 'row-ski', 'Tempo + Ski Erg',
`20 min tempo run.
Ski erg: 4×2 min at race effort, 90 sec rest.`,
      'Sustainable pace, not all-out.'),
    s(d(3), 'phase-2', 'station', 'Station Volume',
`Wall ball: 3×20 reps at 80% effort. Break into 10+10 if needed (15 sec rest).
Sandbag lunges: 3×10/leg.`,
      'If you break, rest 15 sec and continue — don\'t start a new set.'),
    s(d(4), 'phase-2', 'row-ski', 'Row 2 km Time Trial',
`Row: 2 km time trial — go.
Light mobility after.`,
      'Track your split every week. This is your cardio benchmark.'),
    s(d(5), 'phase-2', 'run', `Long Run — ${longMins} min`,
`${longMins} min continuous easy run — no walk breaks.`,
      'You\'re running the full time now. Slow down if you need to, but keep running.'),
    s(d(6), 'phase-2', 'rest', 'Rest',
`Full rest or 20 min walk.
Optional yoga.`,
      'Sleep is training.'),
  ];
}

const PHASE_2_SESSIONS: Session[] = [
  ...phase2Week('2026-06-16', 50),
  ...phase2Week('2026-06-23', 55),
  ...phase2Week('2026-06-30', 60),
  ...phase2Week('2026-07-07', 65),
];
```

- [ ] **Step 5: Add Phase 3 (Specificity) sessions**

Continue `lib/plan-data.ts`:
```ts
function phase3Week(weekStart: string, satSim: string): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(d(0), 'phase-3', 'run', 'Race Pace Combo',
`4 km run at target race pace.
Wall ball: 50 reps + Sled push at race weight.
Max 90 sec rest between run and stations.`,
      'Run km 1–2 slower than you want to. Bank energy.'),
    s(d(1), 'phase-3', 'station', 'Sled + Burpees',
`Sled push + pull at race weight: 3×20 m each.
Burpee broad jumps: 3×10 reps.`,
      'Race weight: M ~102/78 kg, W ~68/48 kg push/pull.'),
    s(d(2), 'phase-3', 'run', '8 km Key Run',
`8 km steady at 5:00–5:15/km target pace.
Pace is more important than effort. Don\'t go faster.`,
      'This is the bedrock workout. Trust the pace.'),
    s(d(3), 'phase-3', 'station', 'Station Volume',
`Sandbag lunge: 10 m practice sets.
Wall ball: 4×25 reps unbroken (90 sec rest). If you break, 10 sec pause and continue.`,
      '25 reps unbroken is the goal.'),
    s(d(4), 'phase-3', 'station', 'Partial HYROX Sim',
`4 km run at race effort.
4 stations in order: Ski erg → Sled push → Sled pull → Burpee broad jumps.`,
      'Practice transitions. They cost time.'),
    s(d(5), 'phase-3', 'race', `Full Sim — ${satSim}`,
`${satSim}
Warm up, fuel, treat it like a race. Track total time.`,
      'Pace each station. Blowing up ruins your finish more than slowing down.'),
    s(d(6), 'phase-3', 'rest', 'Full Rest',
`No active recovery this phase.
Prioritise sleep and nutrition.`,
      'Recovery loads the next stress.'),
  ];
}

const PHASE_3_SESSIONS: Session[] = [
  ...phase3Week('2026-07-14', '6 km run + 6 stations in race order'),
  ...phase3Week('2026-07-21', '6 km run + 6 stations in race order'),
  ...phase3Week('2026-07-28', 'Full sim — 8 km + all 8 stations in race order'),
  ...phase3Week('2026-08-04', 'Full sim — 8 km + all 8 stations in race order'),
];
```

- [ ] **Step 6: Add Phase 4 (Peak + Taper)**

Continue `lib/plan-data.ts`:
```ts
function phase4PeakWeek(weekStart: string): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(d(0), 'phase-4', 'run', '3 km Goal Race Pace', '3 km at goal race pace.', 'Sharpening, not building.'),
    s(d(1), 'phase-4', 'station', '2 Key Stations',  'Pick 2 stations at race weight — perfect reps, full rest between sets.', 'Quality over quantity.'),
    s(d(2), 'phase-4', 'run', '6 km Run',           '6 km at 5:00/km target pace.', 'Smooth, sustainable.'),
    s(d(3), 'phase-4', 'station', 'Wall Ball + Easy Row', 'Wall ball 2×15 + row 10 min easy.', 'Keep things short.'),
    s(d(4), 'phase-4', 'rest', 'Rest / Walk',       'Rest or 20 min easy walk.', 'Legs should feel fresh.'),
    s(d(5), 'phase-4', 'run', '2 km + Strides',     '2 km with 4×100 m strides at the end.', 'Activation, not exhaustion.'),
    s(d(6), 'phase-4', 'rest', 'Rest + Mobility',   'Full rest, foam roll, nutrition prep.', 'Almost there.'),
  ];
}

function phase4DeloadWeek(weekStart: string, isFinal: boolean): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(d(0), 'phase-4', 'run', '2 km Easy', '2 km easy run.', 'Cut volume. Legs need freshness.'),
    s(d(1), 'phase-4', 'station', 'Walk-through Stations', 'Walk-through 2 stations — technique only, no effort.', 'Refresh the movements.'),
    s(d(2), 'phase-4', 'run', isFinal ? '20 min Walk' : '4 km Easy',
      isFinal ? '20 min easy walk only.' : '4 km easy run.',
      'Movement, not work.'),
    s(d(3), 'phase-4', 'station', 'Wall Ball + Easy Row', 'Wall ball 2×15 + row 10 min easy.', 'Light touch.'),
    s(d(4), 'phase-4', 'rest', isFinal ? 'Complete Rest — Race Tomorrow' : 'Rest', isFinal ? 'Lay out kit, prep nutrition, sleep early.' : 'Rest day.', isFinal ? 'Tomorrow you race.' : ''),
    s(d(5), 'phase-4', 'run', isFinal ? 'RACE DAY' : '2 km + Strides',
      isFinal ? '🏁 HYROX Mumbai — Race Day' : '2 km with 4×100 m strides.', isFinal ? 'Trust the work.' : 'Sharp legs.'),
    s(d(6), 'phase-4', 'rest', 'Rest + Mobility', 'Rest, foam roll, nutrition prep.', ''),
  ];
}

const PHASE_4_SESSIONS: Session[] = [
  ...phase4PeakWeek('2026-08-11'),
  ...phase4PeakWeek('2026-08-18'),
  ...phase4DeloadWeek('2026-08-25', false),
  ...phase4DeloadWeek('2026-09-01', false),
];
```

- [ ] **Step 7: Add Race Week sessions explicitly**

Continue `lib/plan-data.ts`:
```ts
const RACE_WEEK_SESSIONS: Session[] = [
  s('2026-09-14', 'race-week', 'rest', 'Rest + Foam Roll', 'Rest day. 10 min foam roll.', ''),
  s('2026-09-15', 'race-week', 'rest', '20 min Easy Walk', '20 min easy walk only.', 'Movement, not effort.'),
  s('2026-09-16', 'race-week', 'station', 'Walk-through Stations', 'Walk-through 2 stations — no effort, technique only.', 'Refresh the movements.'),
  s('2026-09-17', 'race-week', 'rest', '20 min Easy Walk', '20 min easy walk.', ''),
  s('2026-09-18', 'race-week', 'rest', 'Full Rest', 'Full rest.', ''),
  s('2026-09-19', 'race-week', 'rest', 'Rest — Race Tomorrow', 'Lay out kit, prep nutrition, sleep early.', 'Sleep is your last training session.'),
  s('2026-09-20', 'race-week', 'race', '🏁 RACE DAY — HYROX Mumbai',
`Goal: 1:15 finish.
1. Start the run slower than you want to.
2. Pace each station.
3. Wall balls last — plan 25+25+25+25.
4. Fuel: eat 2-3 hrs before. Gel at km 4. Hydrate every water point.`,
    'Trust the work. Execute the plan.'),
];
```

- [ ] **Step 8: Export the full plan as a date-indexed map**

Continue `lib/plan-data.ts`:
```ts
const ALL_SESSIONS: Session[] = [
  ...BASELINE_SESSIONS,
  ...PHASE_1_SESSIONS,
  ...PHASE_2_SESSIONS,
  ...PHASE_3_SESSIONS,
  ...PHASE_4_SESSIONS,
  ...RACE_WEEK_SESSIONS,
];

export const SESSIONS_BY_DATE: Record<string, Session> = Object.fromEntries(
  ALL_SESSIONS.map(s => [s.date, s])
);

export function getSession(date: string): Session | null {
  return SESSIONS_BY_DATE[date] ?? null;
}

export function getPhase(id: PhaseId): Phase | null {
  return PHASES.find(p => p.id === id) ?? null;
}

export const ALL_DATES: string[] = ALL_SESSIONS.map(s => s.date).sort();
```

- [ ] **Step 9: Verify build**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add lib/plan-data.ts
git commit -m "feat: seed full 16-week HYROX training plan"
```

---

## Task 8: App shell — layout, header, bottom nav

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/app-shell.tsx`, `components/bottom-nav.tsx`, `components/race-countdown.tsx`
- Modify: `app/globals.css` (force dark, theme colors)

- [ ] **Step 1: Update app/globals.css to force dark mode**

Append to `app/globals.css`:
```css
html {
  color-scheme: dark;
}
html, body {
  background: hsl(222 47% 6%);
  color: hsl(210 40% 96%);
}
```

- [ ] **Step 2: Create components/race-countdown.tsx**

```tsx
// components/race-countdown.tsx
'use client';
import { useEffect, useState } from 'react';
import { daysUntilRace } from '@/lib/dates';
import { RACE_GOAL_TIME, RACE_NAME, RACE_DATE } from '@/lib/constants';

export function RaceCountdown() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => { setDays(daysUntilRace()); }, []);
  return (
    <div className="flex items-baseline justify-between px-4 py-3 border-b border-white/10">
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-400">Goal</div>
        <div className="text-lg font-bold">{RACE_GOAL_TIME} — {RACE_NAME}</div>
      </div>
      <div className="text-right">
        <div className="text-xs uppercase tracking-wider text-slate-400">Race</div>
        <div className="text-lg font-bold tabular-nums">
          {days === null ? '—' : days > 0 ? `${days} d` : days === 0 ? 'TODAY' : `+${-days} d`}
        </div>
        <div className="text-[10px] text-slate-500">{RACE_DATE}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create components/bottom-nav.tsx**

```tsx
// components/bottom-nav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/today', label: 'Today' },
  { href: '/week', label: 'Week' },
  { href: '/plan', label: 'Plan' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 grid grid-cols-4 border-t border-white/10 bg-slate-950/95 backdrop-blur z-50">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href === '/today' && pathname === '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'py-3 text-center text-xs font-medium transition-colors',
              active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Create components/app-shell.tsx**

```tsx
// components/app-shell.tsx
import { RaceCountdown } from './race-countdown';
import { BottomNav } from './bottom-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <RaceCountdown />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 5: Update app/layout.tsx**

Replace existing content with:
```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { AppShell } from '@/components/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'HYROX Tracker',
  description: 'Day-by-day training for HYROX Mumbai 2026',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'HYROX' },
};

export const viewport: Viewport = {
  themeColor: '#0a0f1c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Update app/page.tsx to redirect**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation';
export default function Home() { redirect('/today'); }
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```
Expected: PASS. (Pages /today etc. don't exist yet — they'll be added in next tasks.)

If `/today` doesn't exist yet, the redirect will 404 on visit. That's OK — we add it next.

- [ ] **Step 8: Commit**

```bash
git add app/ components/
git commit -m "feat: app shell with header and bottom nav"
```

---

## Task 9: Today view

**Files:**
- Create: `app/today/page.tsx`
- Create: `components/session-card.tsx`, `components/session-badge.tsx`, `components/notes-editor.tsx`, `components/override-editor.tsx`

- [ ] **Step 1: Create components/session-badge.tsx**

```tsx
// components/session-badge.tsx
import { SESSION_COLORS } from '@/lib/constants';
import type { SessionType } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SessionBadge({ type, className }: { type: SessionType; className?: string }) {
  const c = SESSION_COLORS[type];
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
      c.bg, 'text-white', className
    )}>
      {c.label}
    </span>
  );
}
```

- [ ] **Step 2: Create components/notes-editor.tsx**

```tsx
// components/notes-editor.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { getOverride, setOverride } from '@/lib/storage';

export function NotesEditor({ date }: { date: string }) {
  const [value, setValue] = useState('');
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getOverride(date).then((o) => {
      setValue(o?.note ?? '');
      setLoaded(true);
    });
  }, [date]);

  function onChange(v: string) {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const existing = (await getOverride(date)) ?? { date };
      await setOverride(date, { ...existing, note: v });
    }, 600);
  }

  if (!loaded) return <div className="text-xs text-slate-500">Loading notes…</div>;
  return (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-wider text-slate-400">Notes</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="How did it feel? Anything to remember…"
        rows={4}
        className="resize-none bg-slate-900 border-slate-800"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create components/override-editor.tsx**

```tsx
// components/override-editor.tsx
'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getOverride, setOverride } from '@/lib/storage';

export function OverrideEditor({ date, defaultTitle, defaultDetails }: { date: string; defaultTitle: string; defaultDetails: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [hasOverride, setHasOverride] = useState(false);

  useEffect(() => {
    getOverride(date).then((o) => {
      if (o?.customTitle || o?.customDetails) {
        setTitle(o.customTitle ?? '');
        setDetails(o.customDetails ?? '');
        setHasOverride(true);
      }
    });
  }, [date]);

  async function save() {
    const existing = (await getOverride(date)) ?? { date };
    await setOverride(date, { ...existing, customTitle: title || undefined, customDetails: details || undefined });
    setHasOverride(Boolean(title || details));
    setOpen(false);
  }

  async function reset() {
    const existing = (await getOverride(date)) ?? { date };
    await setOverride(date, { ...existing, customTitle: undefined, customDetails: undefined });
    setTitle(''); setDetails(''); setHasOverride(false); setOpen(false);
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => { setOpen(true); if (!title) setTitle(defaultTitle); if (!details) setDetails(defaultDetails); }}>
        {hasOverride ? 'Edit custom session' : 'Customise this session'}
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-white/10 p-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Session title" className="bg-slate-900 border-slate-800" />
      <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={6} placeholder="Session details" className="bg-slate-900 border-slate-800" />
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>Save</Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        {hasOverride && <Button variant="destructive" size="sm" onClick={reset}>Reset to plan default</Button>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create components/session-card.tsx**

```tsx
// components/session-card.tsx
'use client';
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { SessionBadge } from './session-badge';
import { NotesEditor } from './notes-editor';
import { OverrideEditor } from './override-editor';
import { getOverride } from '@/lib/storage';
import { SESSION_COLORS } from '@/lib/constants';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SessionCard({ session }: { session: Session }) {
  const [title, setTitle] = useState(session.title);
  const [details, setDetails] = useState(session.details);
  const [customized, setCustomized] = useState(false);

  useEffect(() => {
    getOverride(session.date).then((o) => {
      if (o?.customTitle) { setTitle(o.customTitle); setCustomized(true); }
      if (o?.customDetails) { setDetails(o.customDetails); setCustomized(true); }
    });
  }, [session.date]);

  const c = SESSION_COLORS[session.type];
  return (
    <Card className={cn('overflow-hidden bg-slate-900 border-slate-800', `border-l-4`, c.border)}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400">
              {session.dayName} · {format(parseISO(session.date), 'd MMM yyyy')}
            </div>
            <h1 className="text-xl font-bold mt-1">{title}{customized && <span className="ml-2 text-xs text-amber-400">(custom)</span>}</h1>
          </div>
          <SessionBadge type={session.type} />
        </div>

        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-200">{details}</pre>

        {session.coachingTip && (
          <div className="rounded-md bg-slate-950/60 p-3 text-sm italic text-slate-300 border-l-2 border-slate-700">
            💡 {session.coachingTip}
          </div>
        )}

        <OverrideEditor date={session.date} defaultTitle={session.title} defaultDetails={session.details} />
        <NotesEditor date={session.date} />
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: Create app/today/page.tsx**

```tsx
// app/today/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, addDays, parseISO } from 'date-fns';
import { todayISO } from '@/lib/dates';
import { getSession } from '@/lib/plan-data';
import { SessionCard } from '@/components/session-card';

export default function TodayPage() {
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => { setDate(todayISO()); }, []);

  if (!date) return null;
  const session = getSession(date);
  const prev = format(addDays(parseISO(date), -1), 'yyyy-MM-dd');
  const next = format(addDays(parseISO(date), 1), 'yyyy-MM-dd');

  return (
    <div className="p-4 space-y-4">
      {session ? <SessionCard session={session} /> : <NoSessionToday date={date} />}
      <div className="flex justify-between text-sm">
        <Link href={`/day/${prev}`} className="text-slate-400">← Yesterday</Link>
        <Link href={`/day/${next}`} className="text-slate-400">Tomorrow →</Link>
      </div>
    </div>
  );
}

function NoSessionToday({ date }: { date: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
      <div className="text-sm uppercase tracking-wider mb-1">{format(parseISO(date), 'EEEE, d MMM yyyy')}</div>
      <div className="text-lg">No session scheduled for this date.</div>
      <div className="text-xs mt-2">Training runs 15 May – 20 Sep 2026.</div>
    </div>
  );
}
```

- [ ] **Step 6: Verify by running dev server briefly**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/today | head -50
kill %1 2>/dev/null
```
Expected: HTML output with no errors. (Some hydration warnings OK.)

- [ ] **Step 7: Commit**

```bash
git add app/ components/
git commit -m "feat: today view with session card, notes, override"
```

---

## Task 10: Day detail page [date]

**Files:**
- Create: `app/day/[date]/page.tsx`

- [ ] **Step 1: Create app/day/[date]/page.tsx**

```tsx
// app/day/[date]/page.tsx
import Link from 'next/link';
import { format, addDays, parseISO, isValid } from 'date-fns';
import { getSession } from '@/lib/plan-data';
import { SessionCard } from '@/components/session-card';

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!isValid(parseISO(date))) {
    return <div className="p-4 text-slate-400">Invalid date.</div>;
  }
  const session = getSession(date);
  const prev = format(addDays(parseISO(date), -1), 'yyyy-MM-dd');
  const next = format(addDays(parseISO(date), 1), 'yyyy-MM-dd');

  return (
    <div className="p-4 space-y-4">
      {session ? (
        <SessionCard session={session} />
      ) : (
        <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
          <div className="text-sm uppercase tracking-wider mb-1">{format(parseISO(date), 'EEEE, d MMM yyyy')}</div>
          <div>No session scheduled.</div>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <Link href={`/day/${prev}`} className="text-slate-400">← Previous</Link>
        <Link href={`/day/${next}`} className="text-slate-400">Next →</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/day/
git commit -m "feat: day detail route"
```

---

## Task 11: Week view

**Files:**
- Create: `app/week/page.tsx`

- [ ] **Step 1: Create app/week/page.tsx**

```tsx
// app/week/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO, addDays } from 'date-fns';
import { todayISO, weekDatesFor } from '@/lib/dates';
import { getSession } from '@/lib/plan-data';
import { SessionBadge } from '@/components/session-badge';

export default function WeekPage() {
  const [today, setToday] = useState<string | null>(null);
  const [offsetWeek, setOffsetWeek] = useState(0); // 0 = current week, -1 prev, +1 next

  useEffect(() => { setToday(todayISO()); }, []);
  if (!today) return null;

  const anchor = format(addDays(parseISO(today), offsetWeek * 7), 'yyyy-MM-dd');
  const dates = weekDatesFor(anchor);
  const start = parseISO(dates[0]);
  const end = parseISO(dates[6]);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setOffsetWeek(o => o - 1)} className="text-slate-400 text-sm">← Prev week</button>
        <div className="text-sm text-slate-300 font-medium">{format(start, 'd MMM')} – {format(end, 'd MMM yyyy')}</div>
        <button onClick={() => setOffsetWeek(o => o + 1)} className="text-slate-400 text-sm">Next week →</button>
      </div>

      <div className="space-y-2">
        {dates.map(date => {
          const sess = getSession(date);
          const isToday = date === today;
          return (
            <Link
              key={date}
              href={`/day/${date}`}
              className={`block rounded-md border p-3 transition-colors ${
                isToday ? 'border-white bg-slate-900' : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    {format(parseISO(date), 'EEE')} · {format(parseISO(date), 'd MMM')}
                    {isToday && <span className="ml-2 text-white font-bold">TODAY</span>}
                  </div>
                  <div className="font-semibold mt-0.5">{sess?.title ?? 'No session'}</div>
                </div>
                {sess && <SessionBadge type={sess.type} />}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/week/
git commit -m "feat: week view"
```

---

## Task 12: Plan timeline view

**Files:**
- Create: `app/plan/page.tsx`
- Create: `components/phase-section.tsx`

- [ ] **Step 1: Create components/phase-section.tsx**

```tsx
// components/phase-section.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { format, parseISO, addDays } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SessionBadge } from './session-badge';
import { getSession } from '@/lib/plan-data';
import type { Phase } from '@/lib/types';

function weekStartsInPhase(phase: Phase): string[] {
  // Monday-anchored weeks that overlap the phase
  const starts: string[] = [];
  let cur = parseISO(phase.startDate);
  // align to Monday
  while (cur.getDay() !== 1) cur = addDays(cur, -1);
  while (format(cur, 'yyyy-MM-dd') <= phase.endDate) {
    starts.push(format(cur, 'yyyy-MM-dd'));
    cur = addDays(cur, 7);
  }
  return starts;
}

export function PhaseSection({ phase, defaultOpen }: { phase: Phase; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const weeks = weekStartsInPhase(phase);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full text-left rounded-md border border-slate-800 bg-slate-900 p-3 hover:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold">{phase.name}</div>
            <div className="text-xs text-slate-400">{format(parseISO(phase.startDate), 'd MMM')} – {format(parseISO(phase.endDate), 'd MMM yyyy')} · {phase.weeks} week{phase.weeks > 1 ? 's' : ''}</div>
            <div className="text-xs text-slate-500 mt-1">{phase.focus}</div>
          </div>
          <span className="text-slate-400 text-sm">{open ? '−' : '+'}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {weeks.map((wkStart, idx) => (
          <div key={wkStart} className="rounded-md border border-slate-800 bg-slate-900/40 p-2">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Week {idx + 1} · {format(parseISO(wkStart), 'd MMM')}</div>
            <div className="grid grid-cols-1 gap-1">
              {Array.from({ length: 7 }, (_, i) => format(addDays(parseISO(wkStart), i), 'yyyy-MM-dd')).map(date => {
                const sess = getSession(date);
                if (!sess) return null;
                return (
                  <Link key={date} href={`/day/${date}`} className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-800/60">
                    <span className="text-slate-300"><span className="text-slate-500">{format(parseISO(date), 'EEE d')}</span> · {sess.title}</span>
                    <SessionBadge type={sess.type} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

- [ ] **Step 2: Create app/plan/page.tsx**

```tsx
// app/plan/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { PhaseSection } from '@/components/phase-section';
import { PHASES } from '@/lib/plan-data';
import { todayISO, phaseForDate } from '@/lib/dates';

export default function PlanPage() {
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  useEffect(() => { setCurrentPhase(phaseForDate(todayISO())); }, []);
  return (
    <div className="p-4 space-y-3">
      <div className="text-sm text-slate-400 mb-2">16 weeks · baseline through race week</div>
      {PHASES.map(p => (
        <PhaseSection key={p.id} phase={p} defaultOpen={p.id === currentPhase} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/plan/ components/phase-section.tsx
git commit -m "feat: plan timeline view with phases"
```

---

## Task 13: Dashboard with baselines + paces

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `components/baseline-form.tsx`
- Create: `components/pace-targets.tsx`

- [ ] **Step 1: Create components/baseline-form.tsx**

```tsx
// components/baseline-form.tsx
'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getBaselines, setBaselines } from '@/lib/storage';
import type { Baselines } from '@/lib/types';

export function BaselineForm({ onChange }: { onChange?: (b: Baselines) => void }) {
  const [b, setB] = useState<Baselines>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBaselines().then((x) => { setB(x); setLoaded(true); onChange?.(x); });
  }, [onChange]);

  function update<K extends keyof Baselines>(key: K, value: Baselines[K]) {
    setB((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await setBaselines(b);
    setSaving(false);
    onChange?.(b);
  }

  if (!loaded) return <div className="text-xs text-slate-500">Loading…</div>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="1 km time" placeholder="4:15" value={b.km1Time ?? ''} onChange={(v) => update('km1Time', v)} />
        <Field label="5 km time" placeholder="22:30" value={b.km5Time ?? ''} onChange={(v) => update('km5Time', v)} />
        <Field label="Wall ball max unbroken" placeholder="20" value={String(b.wallBallMaxUnbroken ?? '')} onChange={(v) => update('wallBallMaxUnbroken', v ? Number(v) : undefined)} />
        <Field label="500 m row time" placeholder="1:45" value={b.row500mTime ?? ''} onChange={(v) => update('row500mTime', v)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-wider text-slate-400">Burpee broad jump notes</Label>
        <Textarea value={b.burpeeBroadJumpNotes ?? ''} onChange={(e) => update('burpeeBroadJumpNotes', e.target.value)} rows={2} className="bg-slate-900 border-slate-800" placeholder="How did the movement feel?" />
      </div>
      <Button onClick={save} disabled={saving} size="sm">{saving ? 'Saving…' : 'Save baselines'}</Button>
      {b.updatedAt && <div className="text-xs text-slate-500">Last updated {new Date(b.updatedAt).toLocaleString()}</div>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-slate-400">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-slate-900 border-slate-800" />
    </div>
  );
}
```

- [ ] **Step 2: Create components/pace-targets.tsx**

```tsx
// components/pace-targets.tsx
'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getBaselines, getPaceOverrides, setPaceOverrides } from '@/lib/storage';
import { derivePaceTargets } from '@/lib/paces';
import type { PaceTargets } from '@/lib/types';

const FIELDS: Array<{ key: keyof PaceTargets; label: string }> = [
  { key: 'easy', label: 'Easy / Zone 2' },
  { key: 'tempo', label: 'Tempo' },
  { key: 'race', label: 'Race' },
  { key: 'long', label: 'Long run' },
];

export function PaceTargetsCard() {
  const [derived, setDerived] = useState<PaceTargets>({});
  const [overrides, setOverrides] = useState<PaceTargets>({});
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const [b, o] = await Promise.all([getBaselines(), getPaceOverrides()]);
    setDerived(derivePaceTargets(b));
    setOverrides(o);
    setLoaded(true);
  }
  useEffect(() => { load(); }, []);

  async function saveOverride<K extends keyof PaceTargets>(key: K, value: string) {
    const next = { ...overrides, [key]: value || undefined };
    setOverrides(next);
    await setPaceOverrides(next);
  }

  if (!loaded) return <div className="text-xs text-slate-500">Loading…</div>;
  const hasBase = Object.keys(derived).length > 0;

  return (
    <div className="space-y-3">
      {!hasBase && <div className="text-xs text-amber-400">Enter your 5 km baseline to see suggested paces.</div>}
      <div className="grid grid-cols-1 gap-2">
        {FIELDS.map(({ key, label }) => {
          const suggested = derived[key];
          const override = overrides[key];
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label className="text-sm">{label}</Label>
              <div className="flex items-center gap-2">
                {suggested && <span className="text-xs text-slate-500">≈ {suggested}/km</span>}
                <Input
                  value={override ?? ''}
                  onChange={(e) => saveOverride(key, e.target.value)}
                  placeholder={suggested ? `${suggested}` : 'm:ss'}
                  className="w-24 bg-slate-900 border-slate-800 h-8 text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>
      <Button size="sm" variant="ghost" onClick={load}>Recompute from baselines</Button>
    </div>
  );
}
```

- [ ] **Step 3: Create app/dashboard/page.tsx**

```tsx
// app/dashboard/page.tsx
'use client';
import { Card } from '@/components/ui/card';
import { BaselineForm } from '@/components/baseline-form';
import { PaceTargetsCard } from '@/components/pace-targets';
import { RACE_DATE, RACE_GOAL_TIME, RACE_NAME } from '@/lib/constants';

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      <Card className="bg-gradient-to-br from-red-900/30 to-slate-900 border-red-900/40 p-4">
        <div className="text-xs uppercase tracking-wider text-red-300">North Star</div>
        <div className="text-2xl font-black mt-1">{RACE_GOAL_TIME}</div>
        <div className="text-sm text-slate-300 mt-1">{RACE_NAME} · {RACE_DATE}</div>
      </Card>

      <Card className="bg-slate-900 border-slate-800 p-4 space-y-2">
        <h2 className="font-bold text-sm uppercase tracking-wider text-slate-300">Baseline tests</h2>
        <BaselineForm />
      </Card>

      <Card className="bg-slate-900 border-slate-800 p-4 space-y-2">
        <h2 className="font-bold text-sm uppercase tracking-wider text-slate-300">Pace targets</h2>
        <PaceTargetsCard />
      </Card>

      <Card className="bg-slate-900 border-slate-800 p-4 space-y-1 text-sm text-slate-300">
        <h2 className="font-bold uppercase tracking-wider text-slate-200">Race day strategy</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Start the run slower than you want to.</li>
          <li>Pace each station — blowing up costs more than slowing down.</li>
          <li>Wall balls last — plan it (25+25+25+25).</li>
          <li>Eat 2–3 hrs before. Gel at km 4. Hydrate every water point.</li>
        </ol>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/ components/baseline-form.tsx components/pace-targets.tsx
git commit -m "feat: dashboard with baselines and paces"
```

---

## Task 14: PWA manifest + iOS install support

**Files:**
- Create: `app/manifest.ts` (using Next.js metadata API)
- Create: `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` (placeholder SVG-rendered PNGs)

- [ ] **Step 1: Create simple PNG icons via a Node script (one-off)**

Since we have no design tooling, we'll embed inline-SVG PNGs. Create `scripts/make-icons.mjs`:

```js
// scripts/make-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

// Smallest valid 1x1 red PNG, base64 — used as placeholder until real icons exist.
// (Better: use a proper icon generator. For now this unblocks PWA install.)
const RED_1PX_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
const buf = Buffer.from(RED_1PX_PNG_B64, 'base64');

mkdirSync('public', { recursive: true });
writeFileSync('public/icon-192.png', buf);
writeFileSync('public/icon-512.png', buf);
writeFileSync('public/apple-touch-icon.png', buf);
console.log('Placeholder icons written.');
```

Run:
```bash
node scripts/make-icons.mjs
```

Note for the engineer: these are 1×1 px placeholders. Replace with real 192/512/180 icons before shipping publicly. For personal use it's fine.

- [ ] **Step 2: Create app/manifest.ts**

```ts
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HYROX Tracker',
    short_name: 'HYROX',
    description: 'Day-by-day training for HYROX Mumbai 2026',
    start_url: '/today',
    display: 'standalone',
    background_color: '#0a0f1c',
    theme_color: '#0a0f1c',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

- [ ] **Step 3: Verify build and that manifest is served**

```bash
npm run build
npm run start &
sleep 4
curl -s http://localhost:3000/manifest.webmanifest | head -20
kill %1 2>/dev/null
```
Expected: JSON manifest output.

- [ ] **Step 4: Commit**

```bash
git add app/manifest.ts public/icon-192.png public/icon-512.png public/apple-touch-icon.png scripts/
git commit -m "feat: PWA manifest and placeholder icons"
```

---

## Task 15: Manual smoke test + UX polish

**Files:**
- May modify any UI file based on findings

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open http://localhost:3000 in a browser at mobile width (~390 px)**

Use Chrome DevTools device mode (iPhone 14). Walk through:
- `/today` — does the session card render? Does today's date match? Does the badge color match the session type?
- Tap "Customise this session" — does the inline editor open? Save a custom title — does it persist on refresh?
- Type in Notes — does it persist on refresh (wait 1 sec)?
- `/week` — current week visible? Prev/Next buttons work?
- `/plan` — phases listed? Current phase open? Tap a day → goes to /day/[date]?
- `/dashboard` — banner shows 1:15? Baselines save? Pace targets compute when 5k entered?
- Bottom nav: tapping each tab navigates correctly. Active tab visually distinct.

- [ ] **Step 3: Fix any UI issues found**

Common issues to expect and fix inline:
- Text too small / too large at mobile width — adjust Tailwind sizes
- Pre-formatted `details` text wraps awkwardly — verify `whitespace-pre-wrap` class is applied
- Bottom nav overlaps content — verify `pb-20` is on `<main>`

- [ ] **Step 4: Run final build to confirm production-readiness**

```bash
npm run build
```
Expected: PASS, no warnings about missing pages.

- [ ] **Step 5: Commit any fixes**

```bash
git add .
git commit -m "fix: polish from manual smoke test" || echo "No fixes needed"
```

---

## Task 16: Deploy to Vercel

**Files:**
- May create: `vercel.json` (only if needed — usually not)

- [ ] **Step 1: Deploy via Vercel CLI**

```bash
npx --yes vercel@latest --yes
```

Follow prompts. Accept defaults. This creates a preview deployment.

- [ ] **Step 2: Promote to production**

```bash
npx --yes vercel@latest --prod --yes
```

- [ ] **Step 3: Note the production URL**

Vercel CLI outputs the URL. Visit on phone, "Add to Home Screen" via Safari/Chrome.

- [ ] **Step 4: Test on phone**

- Add to home screen works
- Launches fullscreen (no browser chrome)
- Bottom nav doesn't conflict with home-indicator
- Notes persist across launches

- [ ] **Step 5: Commit any deploy fixes**

```bash
git add .
git commit -m "chore: production deploy fixes" || echo "Nothing to commit"
```

---

## Acceptance Criteria

- App opens to /today showing today's session in a colored card
- Race countdown header shows `1:15 — HYROX Mumbai` and days-to-race
- Notes persist per day in IndexedDB
- Sessions can be overridden and reset
- Week view shows Mon–Sun with Today highlighted, with prev/next-week nav
- Plan view shows 4 phases (collapsible), current phase auto-open, tapping a day opens /day/[date]
- Dashboard shows goal banner + baselines form + pace targets (auto-derived + overridable) + race day strategy
- PWA manifest installable on iOS/Android
- All `lib/paces.ts` and `lib/dates.ts` tests pass (`npm test`)
- `npm run build` passes cleanly
- Deployed to Vercel and accessible on mobile

---

## Self-Review

**Spec coverage check:**
- ✅ Today view → Task 9
- ✅ Week view → Task 11
- ✅ Plan view → Task 12
- ✅ Dashboard with baselines + paces → Task 13
- ✅ Notes per day → NotesEditor (Task 9)
- ✅ Override sessions + reset → OverrideEditor (Task 9)
- ✅ Pace derivation with override → Task 4 + Task 13
- ✅ Color system per session type → Task 3 + Task 9
- ✅ Race countdown header → Task 8
- ✅ Bottom nav (Today/Week/Plan/Dashboard) → Task 8
- ✅ IndexedDB storage → Task 6
- ✅ Full plan seeded for all 16 weeks → Task 7
- ✅ PWA installable → Task 14
- ✅ Vercel deploy → Task 16
- ✅ Dark mode default → Task 8

**Placeholder scan:** No TBDs left in tasks. The icon PNGs are intentional placeholders (1×1 px) with a documented note — acceptable for v1 personal use.

**Type consistency:** `Session`, `Override`, `Baselines`, `PaceTargets`, `Phase`, `SessionType`, `PhaseId` are defined once in `lib/types.ts` and reused throughout. Storage keys are constants. `derivePaceTargets`, `paceStringToSeconds`, `secondsToPaceString` signatures are consistent between paces.ts and paces.test.ts.

**Known minor risks:**
- Phase 1 starts 2026-05-18 (Mon) per dates.ts but original plan says 19 May. Adjusted in `plan-data.ts` and `dates.ts` to keep Mon–Sun week alignment. This is a one-day shift; user can manually note in Day 1.
- 1×1 px PWA icons are placeholders. Replace before sharing publicly.
- Service worker not implemented in v1 — PWA install works (manifest), but full offline is browser-cache only. If offline matters more, add Workbox in a follow-up.
