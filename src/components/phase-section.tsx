'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addDays, format, parseISO } from 'date-fns';
import { SessionBadge } from './session-badge';
import { getSession } from '@/lib/plan-data';
import { SESSION_COLORS } from '@/lib/constants';
import type { Phase } from '@/lib/types';

function weekStartsInPhase(phase: Phase): string[] {
  const starts: string[] = [];
  let cur = parseISO(phase.startDate);
  while (cur.getDay() !== 1) {
    cur = addDays(cur, -1);
  }
  while (format(cur, 'yyyy-MM-dd') <= phase.endDate) {
    starts.push(format(cur, 'yyyy-MM-dd'));
    cur = addDays(cur, 7);
  }
  return starts;
}

const PHASE_NUMBER: Record<string, string> = {
  baseline: '00',
  'phase-1': '01',
  'phase-2': '02',
  'phase-3': '03',
  'phase-4': '04',
  'race-week': '05',
};

export function PhaseSection({
  phase,
  defaultOpen,
}: {
  phase: Phase;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const weeks = weekStartsInPhase(phase);
  const n = PHASE_NUMBER[phase.id] ?? '--';

  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-surface)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 p-4 text-left hover:bg-[var(--color-surface-2)]"
      >
        <div className="font-display num text-3xl font-black leading-none text-[var(--color-accent)]">
          {n}
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
            {format(parseISO(phase.startDate), 'd MMM').toUpperCase()} →{' '}
            {format(parseISO(phase.endDate), 'd MMM').toUpperCase()} · {phase.weeks}w
          </div>
          <div className="font-display mt-0.5 text-base font-extrabold uppercase tracking-tight leading-tight text-[var(--color-fg)]">
            {phase.name.replace(/^Phase \d+ — /, '').replace(/^Phase \d+/, '')}
          </div>
          <div className="mt-1 truncate font-sans text-xs italic text-[var(--color-fg-muted)]">
            {phase.focus}
          </div>
        </div>
        <div className="font-display text-2xl font-black leading-none text-[var(--color-fg-muted)]">
          {open ? '−' : '+'}
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t border-dashed border-[var(--color-line-strong)] p-3">
          {weeks.map((wkStart, idx) => (
            <div key={wkStart}>
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  W{idx + 1}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
                  {format(parseISO(wkStart), 'd MMM').toUpperCase()}
                </span>
              </div>
              <div className="space-y-0.5">
                {Array.from({ length: 7 }, (_, i) =>
                  format(addDays(parseISO(wkStart), i), 'yyyy-MM-dd'),
                ).map((date) => {
                  const sess = getSession(date);
                  if (!sess) return null;
                  const c = SESSION_COLORS[sess.type].color;
                  return (
                    <Link
                      key={date}
                      href={`/day/${date}`}
                      className="group flex items-center gap-2.5 border-l-[2px] py-1 pl-2.5 pr-2 text-xs hover:bg-[var(--color-surface-2)]"
                      style={{ borderLeftColor: c }}
                    >
                      <span className="font-mono w-7 text-[10px] uppercase tracking-widest text-[var(--color-fg-dim)]">
                        {format(parseISO(date), 'EEE').toUpperCase()}
                      </span>
                      <span className="num w-5 text-[10px] text-[var(--color-fg-dim)]">
                        {format(parseISO(date), 'dd')}
                      </span>
                      <span className="font-sans flex-1 truncate text-[13px] text-[var(--color-fg)] group-hover:text-[var(--color-accent-2)]">
                        {sess.title}
                      </span>
                      <SessionBadge type={sess.type} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
