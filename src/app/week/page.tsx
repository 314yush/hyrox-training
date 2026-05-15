'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { SessionBadge } from '@/components/session-badge';
import { getSession } from '@/lib/plan-data';
import { todayISO, weekDatesFor } from '@/lib/dates';
import { SESSION_COLORS } from '@/lib/constants';

export default function WeekPage() {
  const [today, setToday] = useState<string | null>(null);
  const [offsetWeek, setOffsetWeek] = useState(0);

  useEffect(() => {
    setToday(todayISO());
  }, []);

  if (!today)
    return (
      <div className="p-6 font-mono text-[10px] uppercase tracking-widest text-[var(--color-fg-dim)]">
        Loading…
      </div>
    );

  const anchor = format(addDays(parseISO(today), offsetWeek * 7), 'yyyy-MM-dd');
  const dates = weekDatesFor(anchor);
  const start = parseISO(dates[0]);
  const end = parseISO(dates[6]);

  return (
    <div className="space-y-4 p-4">
      <div className="border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setOffsetWeek((o) => o - 1)}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
          >
            ← Prev
          </button>
          <div className="text-center">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
              Week
            </div>
            <div className="font-display text-base font-extrabold uppercase tracking-tight text-[var(--color-fg)]">
              {format(start, 'd MMM')} – {format(end, 'd MMM')}
            </div>
          </div>
          <button
            onClick={() => setOffsetWeek((o) => o + 1)}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
          >
            Next →
          </button>
        </div>
        {offsetWeek !== 0 && (
          <button
            onClick={() => setOffsetWeek(0)}
            className="mt-2 w-full border-t border-dashed border-[var(--color-line-strong)] pt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-accent)]"
          >
            ◀ Jump to current week
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {dates.map((date, i) => {
          const sess = getSession(date);
          const isToday = date === today;
          const c = sess ? SESSION_COLORS[sess.type].color : '#3a3a3a';
          return (
            <Link
              key={date}
              href={`/day/${date}`}
              className={`relative grid grid-cols-[auto_1fr_auto] items-center gap-3 border-l-[3px] bg-[var(--color-surface)] px-3 py-3 transition-all hover:translate-x-0.5 hover:bg-[var(--color-surface-2)] ${
                isToday ? 'ring-1 ring-[var(--color-accent)]' : ''
              }`}
              style={{ borderLeftColor: c }}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-fg-dim)]">
                  {format(parseISO(date), 'EEE').toUpperCase()}
                </div>
                <div className="font-display num text-2xl font-black leading-none text-[var(--color-fg)]">
                  {format(parseISO(date), 'd')}
                </div>
                <div className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-fg-dim)]">
                  {format(parseISO(date), 'MMM').toUpperCase()}
                </div>
              </div>

              <div className="min-w-0">
                {isToday && (
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                    ▸ Today
                  </div>
                )}
                <div className="font-display truncate text-base font-extrabold uppercase leading-tight tracking-tight text-[var(--color-fg)]">
                  {sess?.title ?? '— No session —'}
                </div>
                {sess?.coachingTip && (
                  <div className="mt-0.5 truncate font-sans text-xs italic text-[var(--color-fg-muted)]">
                    {sess.coachingTip}
                  </div>
                )}
              </div>

              {sess && <SessionBadge type={sess.type} />}

              {i < 6 && (
                <div className="absolute -bottom-0.5 left-[3px] right-0 border-b border-dashed border-[var(--color-line)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
