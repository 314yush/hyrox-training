import { addDays, format, getDay, parseISO } from 'date-fns';
import type { DayName, Phase, PhaseId, Session, SessionType } from './types';

export const PHASES: Phase[] = [
  {
    id: 'baseline',
    name: 'Baseline Testing',
    weeks: 1,
    startDate: '2026-05-15',
    endDate: '2026-05-17',
    focus: 'Establish baselines for paces and station capacity',
  },
  {
    id: 'phase-1',
    name: 'Phase 1 — Base Building',
    weeks: 4,
    startDate: '2026-05-18',
    endDate: '2026-06-14',
    focus: 'Walk/run intervals, sled technique, station intro',
  },
  {
    id: 'phase-2',
    name: 'Phase 2 — Build',
    weeks: 4,
    startDate: '2026-06-15',
    endDate: '2026-07-12',
    focus: 'Tempo runs, 80% race-effort stations, drop walk breaks',
  },
  {
    id: 'phase-3',
    name: 'Phase 3 — Specificity',
    weeks: 4,
    startDate: '2026-07-13',
    endDate: '2026-08-09',
    focus: 'HYROX simulations, 8 km at pace, race-weight sled',
  },
  {
    id: 'phase-4',
    name: 'Phase 4 — Peak + Taper',
    weeks: 4,
    startDate: '2026-08-10',
    endDate: '2026-09-13',
    focus: 'Race pace efforts, deload, sleep is training',
  },
  {
    id: 'race-week',
    name: 'Race Week',
    weeks: 1,
    startDate: '2026-09-14',
    endDate: '2026-09-20',
    focus: 'Minimal sessions, rest, race day',
  },
];

const DAY_NAMES: DayName[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function s(
  date: string,
  phase: PhaseId,
  type: SessionType,
  title: string,
  details: string,
  coachingTip?: string,
): Session {
  const dayName = DAY_NAMES[getDay(parseISO(date))];
  return { date, dayName, phase, type, title, details, coachingTip };
}

const BASELINE_SESSIONS: Session[] = [
  s(
    '2026-05-15',
    'baseline',
    'baseline',
    '1 km all-out time trial',
    `Warm up 10 min easy.
Run 1 km as hard as you can sustain.
Note your time and the distance at which it started to hurt (200 m? 600 m?).
Cool down 5 min walk.`,
    'This is data, not training. Empty the tank.',
  ),
  s(
    '2026-05-16',
    'baseline',
    'baseline',
    '5 km steady-state run',
    `Warm up 5 min easy.
Run 5 km at a pace you can sustain.
Note total time + what stopped you (legs, lungs, mental) and which km.`,
    'Honesty matters more than speed. We need a true baseline.',
  ),
  s(
    '2026-05-17',
    'baseline',
    'baseline',
    'Station baselines',
    `Wall ball — max unbroken reps at controlled pace (full squat, chin height catch).
500 m row — best effort, note split.
Burpee broad jumps — 5 reps, note how the movement feels.`,
    "You're measuring capacity, not exhaustion. Rest fully between movements.",
  ),
];

// Week 1: easing into the work — keep walk/run intervals, light loads.
function phase1IntroWeek(weekStart: string): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(
      d(0),
      'phase-1',
      'strength',
      'Upper Body + Easy Run',
      `Upper body strength session (push/pull, 3–4 exercises).
30 min easy run: walk 2 min / run 3 min intervals.`,
      'Never breathing hard. This is zone 2.',
    ),
    s(
      d(1),
      'phase-1',
      'strength',
      'Lower Body + Sled',
      `Lower body strength session.
Sled push/pull — light load, learn stance and foot drive.`,
      'Weight is irrelevant this week. Technique is everything.',
    ),
    s(
      d(2),
      'phase-1',
      'station',
      'Jumps Day — Intro',
      `Box jumps: 3×5 (knee height, soft quiet landings).
Broad jumps: 3×5 (max distance, stick the landing).
Pogo hops: 2×10 (stiff ankles, fast contact).`,
      'Power, not exhaustion. Rest fully between sets.',
    ),
    s(
      d(3),
      'phase-1',
      'station',
      'Station Practice',
      `Wall ball: 3×10 reps at controlled pace (full squat depth, catch at chin).
Burpee broad jump intro: 3×5 reps (chest fully down, explosive push-up, soft landing).`,
      "Quality reps. Don't practice sloppy form.",
    ),
    s(
      d(4),
      'phase-1',
      'row-ski',
      'Row + Sandbag Lunges',
      `Row: 5–10 min easy.
Sandbag lunge intro: bodyweight or 10 kg (upright torso, full knee extension, 10 m per set).`,
      'Lunge depth and posture before adding weight.',
    ),
    s(
      d(5),
      'phase-1',
      'run',
      'Long Run — 30 min',
      `Easy continuous run for 30 minutes.
Pace: comfortable, conversational.`,
      'If it feels hard, slow down. We are building, not racing.',
    ),
    s(
      d(6),
      'phase-1',
      'rest',
      'Rest + Mobility',
      `Full rest.
Mobility: hip flexors, calves, thoracic spine (10 min foam roll minimum).`,
      'Recovery is when adaptation happens.',
    ),
  ];
}

// Weeks 2–4: HYROX-flavoured base building, progressively heavier.
// Runs are intentionally flat across weeks (Mon 20 min, Sat 30 min);
// progressive overload sits in lunges, wall balls, carries, rounds, and sleds.
type Phase1BuildParams = {
  weekIndex: 2 | 3 | 4;
  tueLungeSets: number;
  tueLungeSteps: number;
  wedWallBallSets: number;
  wedWallBallReps: number;
  wedCarrySets: number;
  wedCarryMeters: number;
  thuRounds: number;
  thuBurpees: number;
  friSledSets: number;
  friSledMeters: number;
};

function phase1BuildWeek(weekStart: string, p: Phase1BuildParams): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(
      d(0),
      'phase-1',
      'strength',
      'Upper + Short Run',
      `Upper strength: pull, push, shoulders, arms, core (3–4 sets each).
Run: 20 min — first 13–15 min easy, last 5–7 min push the pace.`,
      'Hard but controlled. Form holds, breath stays.',
    ),
    s(
      d(1),
      'phase-1',
      'strength',
      'Legs + Sandbag Lunges',
      `Squat or leg press, RDL, lunges/step-ups, leg machine finisher.
Sandbag lunges: ${p.tueLungeSets}×${p.tueLungeSteps} steps (upright torso, full knee extension).`,
      'Train the legs hard now. Race day lunges will thank you.',
    ),
    s(
      d(2),
      'phase-1',
      'station',
      `Jumps + Wall Balls + Carry + Core`,
      `Squat jumps: 3×5.
Broad jumps: 3×5.
Wall balls: ${p.wedWallBallSets}×${p.wedWallBallReps}.
Farmer's carry: ${p.wedCarrySets}×${p.wedCarryMeters} m.
Core: 3–4×30–45 sec (plank, hollow hold, dead bug — pick two).`,
      'HYROX in one session. Rest enough to keep form sharp.',
    ),
    s(
      d(3),
      'phase-1',
      'row-ski',
      `SkiErg + Row + Burpees — ${p.thuRounds} rounds`,
      `${p.thuRounds} rounds, 2–3 min rest between:
  • 250 m SkiErg
  • 250 m Row
  • ${p.thuBurpees} burpee broad jumps`,
      'Moderate effort — finish each round strong, not destroyed.',
    ),
    s(
      d(4),
      'phase-1',
      'strength',
      'Upper/Arms + Sleds',
      `Upper / arms strength (curls, tricep work, accessory push/pull).
Sled push: ${p.friSledSets}×${p.friSledMeters} m.
Sled pull: ${p.friSledSets}×${p.friSledMeters} m.`,
      'Moderate. Drive low on the push, walk back as recovery.',
    ),
    s(
      d(5),
      'phase-1',
      'run',
      'Run — 30 min',
      `30 min easy continuous run at a conversational pace.
Distance is incidental — could be 3 km, could be 4.5 km. Both fine.
Safe shoes only.
Optional: 20–30 min badminton after if legs feel good.`,
      'Time-on-feet beats hitting a distance. If you cannot talk, slow down.',
    ),
    s(
      d(6),
      'phase-1',
      'rest',
      'Rest / Active Recovery',
      `Full rest — or 20–30 min very easy walk + light mobility (hips, calves, T-spine).
No real training today.`,
      'Sleep is your highest-leverage session this week.',
    ),
  ];
}

const PHASE_1_SESSIONS: Session[] = [
  ...phase1IntroWeek('2026-05-18'),
  ...phase1BuildWeek('2026-05-25', {
    weekIndex: 2,
    tueLungeSets: 3,
    tueLungeSteps: 20,
    wedWallBallSets: 3,
    wedWallBallReps: 10,
    wedCarrySets: 3,
    wedCarryMeters: 40,
    thuRounds: 3,
    thuBurpees: 8,
    friSledSets: 3,
    friSledMeters: 15,
  }),
  ...phase1BuildWeek('2026-06-01', {
    weekIndex: 3,
    tueLungeSets: 4,
    tueLungeSteps: 25,
    wedWallBallSets: 3,
    wedWallBallReps: 12,
    wedCarrySets: 3,
    wedCarryMeters: 50,
    thuRounds: 3,
    thuBurpees: 9,
    friSledSets: 3,
    friSledMeters: 18,
  }),
  ...phase1BuildWeek('2026-06-08', {
    weekIndex: 4,
    tueLungeSets: 4,
    tueLungeSteps: 30,
    wedWallBallSets: 4,
    wedWallBallReps: 15,
    wedCarrySets: 4,
    wedCarryMeters: 60,
    thuRounds: 4,
    thuBurpees: 10,
    friSledSets: 4,
    friSledMeters: 20,
  }),
];

function phase2Week(weekStart: string, longMins: number): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(
      d(0),
      'phase-2',
      'run',
      'Upper Body + Tempo Run',
      `Upper body strength session.
3 km continuous tempo run (~30–45 sec/km faster than easy pace).`,
      'Tempo = comfortably hard. Short sentences, not paragraphs.',
    ),
    s(
      d(1),
      'phase-2',
      'station',
      'Sled + Burpee Broad Jumps',
      `Sled push/pull at 60–70% race weight.
Burpee broad jumps: 3×8 reps.`,
      'Add load to the sled. Keep technique from Phase 1.',
    ),
    s(
      d(2),
      'phase-2',
      'station',
      'Jumps Day — Build',
      `Box jumps: 4×8 (raise the box if last week felt easy).
Broad jumps: 3×6 (explode horizontally).
Burpee broad jumps: 3×8 (full chest down, explosive push-up).`,
      'Add volume. Keep landings clean.',
    ),
    s(
      d(3),
      'phase-2',
      'station',
      'Station Volume',
      `Wall ball: 3×20 reps at 80% effort. Break into 10+10 if needed (15 sec rest).
Sandbag lunges: 3×10/leg.`,
      "If you break, rest 15 sec and continue — don't start a new set.",
    ),
    s(
      d(4),
      'phase-2',
      'row-ski',
      'Row 2 km Time Trial',
      `Row: 2 km time trial — go.
Light mobility after.`,
      'Track your split every week. This is your cardio benchmark.',
    ),
    s(
      d(5),
      'phase-2',
      'run',
      `Long Run — ${longMins} min`,
      `${longMins} min continuous easy run — no walk breaks.`,
      "You're running the full time now. Slow down if you need to, but keep running.",
    ),
    s(
      d(6),
      'phase-2',
      'rest',
      'Rest',
      `Full rest or 20 min walk.
Optional yoga.`,
      'Sleep is training.',
    ),
  ];
}

const PHASE_2_SESSIONS: Session[] = [
  ...phase2Week('2026-06-15', 50),
  ...phase2Week('2026-06-22', 55),
  ...phase2Week('2026-06-29', 60),
  ...phase2Week('2026-07-06', 65),
];

function phase3Week(weekStart: string, satSim: string): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(
      d(0),
      'phase-3',
      'run',
      'Race Pace Combo',
      `4 km run at target race pace.
Wall ball: 50 reps + Sled push at race weight.
Max 90 sec rest between run and stations.`,
      'Run km 1–2 slower than you want to. Bank energy.',
    ),
    s(
      d(1),
      'phase-3',
      'station',
      'Sled + Burpees',
      `Sled push + pull at race weight: 3×20 m each.
Burpee broad jumps: 3×10 reps.`,
      'Race weight: M ~102/78 kg, W ~68/48 kg push/pull.',
    ),
    s(
      d(2),
      'phase-3',
      'station',
      'Jumps Day — Race Distance',
      `Burpee broad jumps: 80 m × 2 (race distance), 2 min rest between.
Box jumps: 3×10 (explosive, full hip extension).
Depth jumps: 3×5 (step off box, rebound vertical — advanced only).`,
      'These reps mirror race-day fatigue. Practice form under stress.',
    ),
    s(
      d(3),
      'phase-3',
      'station',
      'Station Volume',
      `Sandbag lunge: 10 m practice sets.
Wall ball: 4×25 reps unbroken (90 sec rest). If you break, 10 sec pause and continue.`,
      '25 reps unbroken is the goal.',
    ),
    s(
      d(4),
      'phase-3',
      'station',
      'Partial HYROX Sim',
      `4 km run at race effort.
4 stations in order: Ski erg → Sled push → Sled pull → Burpee broad jumps.`,
      'Practice transitions. They cost time.',
    ),
    s(
      d(5),
      'phase-3',
      'race',
      `Full Sim — ${satSim}`,
      `${satSim}
Warm up, fuel, treat it like a race. Track total time.`,
      'Pace each station. Blowing up ruins your finish more than slowing down.',
    ),
    s(
      d(6),
      'phase-3',
      'rest',
      'Full Rest',
      `No active recovery this phase.
Prioritise sleep and nutrition.`,
      'Recovery loads the next stress.',
    ),
  ];
}

const PHASE_3_SESSIONS: Session[] = [
  ...phase3Week('2026-07-13', '6 km run + 6 stations in race order'),
  ...phase3Week('2026-07-20', '6 km run + 6 stations in race order'),
  ...phase3Week('2026-07-27', 'Full sim — 8 km + all 8 stations in race order'),
  ...phase3Week('2026-08-03', 'Full sim — 8 km + all 8 stations in race order'),
];

function phase4PeakWeek(weekStart: string): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(d(0), 'phase-4', 'run', '3 km Goal Race Pace', '3 km at goal race pace.', 'Sharpening, not building.'),
    s(d(1), 'phase-4', 'station', '2 Key Stations', 'Pick 2 stations at race weight — perfect reps, full rest between sets.', 'Quality over quantity.'),
    s(d(2), 'phase-4', 'station', 'Jumps Day — Sharp', 'Box jumps: 3×5 (max height, full reset between).\nBurpee broad jumps: 3×5 race-quality reps.\nKeep total volume low — sharpening, not building.', 'Explosive intent. Recover fully between sets.'),
    s(d(3), 'phase-4', 'station', 'Wall Ball + Easy Row', 'Wall ball 2×15 + row 10 min easy.', 'Keep things short.'),
    s(d(4), 'phase-4', 'rest', 'Rest / Walk', 'Rest or 20 min easy walk.', 'Legs should feel fresh.'),
    s(d(5), 'phase-4', 'run', '2 km + Strides', '2 km with 4×100 m strides at the end.', 'Activation, not exhaustion.'),
    s(d(6), 'phase-4', 'rest', 'Rest + Mobility', 'Full rest, foam roll, nutrition prep.', 'Almost there.'),
  ];
}

function phase4DeloadWeek(weekStart: string): Session[] {
  const d = (offset: number) => format(addDays(parseISO(weekStart), offset), 'yyyy-MM-dd');
  return [
    s(d(0), 'phase-4', 'run', '2 km Easy', '2 km easy run.', 'Cut volume. Legs need freshness.'),
    s(d(1), 'phase-4', 'station', 'Walk-through Stations', 'Walk-through 2 stations — technique only, no effort.', 'Refresh the movements.'),
    s(d(2), 'phase-4', 'station', 'Jumps Day — Light', 'Box jumps: 2×5 easy (no max height).\nNo burpee broad jumps this week — let the legs recover.', 'Movement, not work.'),
    s(d(3), 'phase-4', 'station', 'Wall Ball + Easy Row', 'Wall ball 2×15 + row 10 min easy.', 'Light touch.'),
    s(d(4), 'phase-4', 'rest', 'Rest', 'Rest day.', ''),
    s(d(5), 'phase-4', 'run', '2 km + Strides', '2 km with 4×100 m strides.', 'Sharp legs.'),
    s(d(6), 'phase-4', 'rest', 'Rest + Mobility', 'Rest, foam roll, nutrition prep.', ''),
  ];
}

const PHASE_4_SESSIONS: Session[] = [
  ...phase4PeakWeek('2026-08-10'),
  ...phase4PeakWeek('2026-08-17'),
  ...phase4DeloadWeek('2026-08-24'),
  ...phase4DeloadWeek('2026-08-31'),
  // Week ending 2026-09-13 (phase-4 ends here, race-week starts 2026-09-14)
  ...phase4DeloadWeek('2026-09-07'),
];

const RACE_WEEK_SESSIONS: Session[] = [
  s('2026-09-14', 'race-week', 'rest', 'Rest + Foam Roll', 'Rest day. 10 min foam roll.', ''),
  s('2026-09-15', 'race-week', 'rest', '20 min Easy Walk', '20 min easy walk only.', 'Movement, not effort.'),
  s(
    '2026-09-16',
    'race-week',
    'station',
    'Walk-through Stations',
    'Walk-through 2 stations — no effort, technique only.',
    'Refresh the movements.',
  ),
  s('2026-09-17', 'race-week', 'rest', '20 min Easy Walk', '20 min easy walk.', ''),
  s('2026-09-18', 'race-week', 'rest', 'Full Rest', 'Full rest.', ''),
  s(
    '2026-09-19',
    'race-week',
    'rest',
    'Rest — Race Tomorrow',
    'Lay out kit, prep nutrition, sleep early.',
    'Sleep is your last training session.',
  ),
  s(
    '2026-09-20',
    'race-week',
    'race',
    '🏁 RACE DAY — HYROX Mumbai',
    `Goal: 1:15 finish.
1. Start the run slower than you want to.
2. Pace each station.
3. Wall balls last — plan 25+25+25+25.
4. Fuel: eat 2-3 hrs before. Gel at km 4. Hydrate every water point.`,
    'Trust the work. Execute the plan.',
  ),
];

const ALL_SESSIONS: Session[] = [
  ...BASELINE_SESSIONS,
  ...PHASE_1_SESSIONS,
  ...PHASE_2_SESSIONS,
  ...PHASE_3_SESSIONS,
  ...PHASE_4_SESSIONS,
  ...RACE_WEEK_SESSIONS,
];

export const SESSIONS_BY_DATE: Record<string, Session> = Object.fromEntries(
  ALL_SESSIONS.map((session) => [session.date, session]),
);

export function getSession(date: string): Session | null {
  return SESSIONS_BY_DATE[date] ?? null;
}

export function getPhase(id: PhaseId): Phase | null {
  return PHASES.find((p) => p.id === id) ?? null;
}

export const ALL_DATES: string[] = ALL_SESSIONS.map((session) => session.date).sort();
