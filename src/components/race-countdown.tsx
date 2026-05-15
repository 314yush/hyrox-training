'use client';

import { useEffect, useState } from 'react';
import { daysUntilRace } from '@/lib/dates';
import { RACE_DATE, RACE_GOAL_TIME, RACE_NAME } from '@/lib/constants';

export function RaceCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntilRace());
  }, []);

  const isRaceDay = days === 0;
  const display =
    days === null ? '---' : days > 0 ? String(days).padStart(3, '0') : `+${String(-days).padStart(2, '0')}`;

  return (
    <header className="relative border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="grid grid-cols-[1fr_auto] items-end gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="bib bg-[var(--color-accent)]">HYROX</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
              {RACE_NAME.replace('HYROX ', '')}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-fg-muted)]">
              Target
            </span>
            <span className="font-display num text-3xl font-black leading-none text-[var(--color-fg)]">
              {RACE_GOAL_TIME}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-fg-muted)]">
            Days out
          </div>
          <div
            className={`font-display num text-5xl font-black leading-none ${
              isRaceDay
                ? 'text-[var(--color-accent)] animate-pulse'
                : 'text-[var(--color-fg)]'
            }`}
            style={{
              textShadow: isRaceDay
                ? '0 0 24px rgba(255, 61, 0, 0.6)'
                : undefined,
            }}
          >
            {isRaceDay ? '00' : display}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-fg-dim)]">
            {RACE_DATE.replaceAll('-', '·')}
          </div>
        </div>
      </div>

      {/* race tape stripe */}
      <div className="h-1 stripes" />
    </header>
  );
}
