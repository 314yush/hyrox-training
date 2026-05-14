# HYROX Tracker — Design Spec

**Date:** 2026-05-15
**Race Date:** 2026-09-20 (HYROX Mumbai)
**Goal:** 1:15 finish time
**Athlete:** Single user (the owner)

---

## Purpose

A mobile-first PWA that displays a 16-week HYROX training plan day-by-day so the athlete walks into the gym knowing exactly what to do — no decision-making required at the workout. The race finish-time goal (1:15) is always visible to keep motivation aligned.

This is a **display + light customization** app, not a workout logger. The user does not want to record reps, weights, times, or check off completed sessions. They want the plan in their pocket.

---

## Users

One user. The owner of the device. No auth, no sharing, no coach access.

---

## Core Views

### 1. Today (default home)

- Header: race countdown ("128 days to 1:15"), current phase badge
- Big card for today: date, day-of-week, session type with color, full session details, coaching tip
- Notes textarea (autosaved, per-day)
- Prev/Next day arrows
- Bottom nav: Today / Week / Plan / Dashboard

### 2. Week

- Mon–Sun horizontal/vertical grid (mobile: vertical list)
- Today highlighted
- Each row: date, session-type badge, one-line summary
- Tap → opens that day's detail (Today view scoped to that date)

### 3. Plan (full timeline)

- 4 phases as collapsible sections
- Phase header: name, dates, focus, weeks count
- Inside each phase: weeks listed with date ranges
- Inside each week: 7 days
- "Jump to today" button always visible

### 4. Dashboard

- Goal banner: "1:15 — HYROX Mumbai — 20 Sep 2026 — X days to go"
- **Baseline tests** card (editable):
  - 1 km time trial
  - 5 km steady-state time
  - Station baselines (wall ball max unbroken, 500m row time, burpee broad jump notes)
  - "Last updated" timestamp
- **Pace targets** card:
  - Easy / Zone 2 pace
  - Tempo pace
  - Race pace
  - Long run pace
  - Default-computed from baselines once entered; user can override each
- "Race day strategy" reference card (collapsible) with the 4-point race-day strategy

---

## Customization

- **Notes per day** — free-text, autosaved on blur or every 1s of inactivity
- **Override session** — replace a day's session content with custom text; original is preserved and restorable
- **Reset to plan default** — per-day button to remove overrides
- **Edit baselines and paces** — anytime, in Dashboard

---

## Data Model

All data lives in IndexedDB on the device (via `idb-keyval`). No backend.

```ts
// Seeded read-only (baked into the bundle)
type Plan = {
  phases: Phase[];           // 4 phases
  raceDate: '2026-09-20';
  trainingStart: '2026-05-19';
  baselineTestingWindow: { start: '2026-05-15'; end: '2026-05-17' };
};

type Phase = {
  id: 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4';
  name: string;
  weeks: number;
  startDate: string;        // ISO
  endDate: string;          // ISO
  focus: string;
};

type Session = {
  date: string;              // ISO YYYY-MM-DD
  dayName: string;           // Monday..Sunday
  phase: Phase['id'];
  type: 'run' | 'station' | 'strength' | 'row-ski' | 'rest' | 'race' | 'baseline';
  title: string;
  details: string;           // markdown-ish multiline
  coachingTip?: string;
};

// User-mutable, stored in IndexedDB
type Override = {
  date: string;              // ISO YYYY-MM-DD
  customDetails?: string;    // replaces Session.details
  note?: string;             // free notes
};

type Baselines = {
  km1Time?: string;          // mm:ss
  km5Time?: string;          // mm:ss
  stations?: {
    wallBallMaxUnbroken?: number;
    row500mTime?: string;    // mm:ss
    burpeeBroadJumpNotes?: string;
  };
  updatedAt?: string;        // ISO
};

type PaceTargets = {
  easy?: string;             // mm:ss/km
  tempo?: string;
  race?: string;
  long?: string;
  // each can be user-overridden; computed defaults derive from baselines.km5Time
};
```

**Storage keys (idb-keyval):**
- `overrides` → `Record<dateISO, Override>`
- `baselines` → `Baselines`
- `paceTargets` → `PaceTargets`
- `prefs` → `{ theme?: 'dark' | 'light' }`

The seeded `Plan` lives in `lib/plan-data.ts` and is the read-only source of truth for the schedule.

---

## Pace-Derivation Logic

Pace defaults (only suggested — user can override anything):
- **Easy**: `km5Pace + 1:00/km` (conversational, zone 2)
- **Tempo**: `easy - 0:35/km` (≈ 30–45 sec/km faster than easy, per plan)
- **Race**: `km5Pace + 0:15/km` (target HYROX pace, ~5:00–5:15 if 5km is around 22:30)
- **Long**: `race + 0:20/km` (15–20 sec/km slower than race pace, per plan)

These are heuristics, not science. The athlete can override any value.

If `km5Time` is not yet entered, paces show "—" with a note: "Run baseline 5 km test to compute pace targets."

---

## Tech Stack

- **Next.js 16** (App Router) on Vercel
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui** components
- **idb-keyval** for IndexedDB
- **date-fns** for date handling
- **PWA**: manifest + minimal service worker (Workbox or hand-rolled) for offline + add-to-home-screen
- **No backend, no auth, no database**
- **Hosting**: Vercel

---

## Color System

Each session type has a color used for badges, accents, and the today-card stripe:

| Type | Color | Tailwind base |
|---|---|---|
| Run | Blue | `blue-500` |
| Station | Green | `emerald-500` |
| Strength | Amber | `amber-500` |
| Row / Ski | Purple | `violet-500` |
| Rest | Gray | `slate-400` |
| Race | Red | `red-500` |
| Baseline | Cyan | `cyan-500` |

Dark mode is the default (gym lighting, mobile use).

---

## File / Component Structure

```
app/
  layout.tsx              # PWA shell, bottom nav, race-countdown header
  page.tsx                # /today (redirect or alias)
  today/page.tsx          # Today view
  week/page.tsx           # Week view
  plan/page.tsx           # Plan timeline
  dashboard/page.tsx      # Dashboard
  day/[date]/page.tsx     # Specific-date detail (used by Week + Plan tap-through)
  manifest.ts             # PWA manifest

components/
  bottom-nav.tsx
  race-countdown.tsx
  session-card.tsx
  session-badge.tsx
  notes-editor.tsx
  baseline-form.tsx
  pace-targets.tsx
  phase-section.tsx

lib/
  plan-data.ts            # the full seeded plan (4 phases, all days)
  storage.ts              # idb-keyval wrappers (typed get/set)
  dates.ts                # date helpers, phase detection
  paces.ts                # pace-derivation logic

public/
  icons/                  # PWA icons
  sw.js                   # service worker (or generated)
```

---

## Out of Scope (YAGNI)

- Workout logging (sets/reps/times/RPE)
- Completion checkboxes / streak tracking
- Multi-user, accounts, auth, coach access
- Cloud sync, multi-device sync
- Charts, analytics, "trends over time"
- Integrations (Strava, Garmin, etc.)
- Notifications / reminders
- Backups / export-import (not for v1)

If the user later wants any of these, layer in. Don't pre-build.

---

## Success Criteria

The athlete can:
1. Open the app on their phone and immediately see what today's session is
2. Read full session details and coaching tip without scrolling forever
3. Add a free-text note to any day and have it persist
4. Override a session if they want to change what they're doing
5. Enter baseline test results and see derived pace targets
6. Navigate to any week or phase to see what's coming
7. Use it offline at the gym (no signal needed)
8. "Add to home screen" on iOS/Android so it launches like a native app

---

## Timeline Pressure

- **Today is 2026-05-15** — baseline testing window starts today
- **Training starts 2026-05-19** (4 days)
- v1 needs to be deployable in 1–2 days
- v1 = Today view + Week view + Plan view + Dashboard with editable baselines, plus PWA install
