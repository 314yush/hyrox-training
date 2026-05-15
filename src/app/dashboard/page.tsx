'use client';

import { useEffect, useState } from 'react';
import { BaselineForm } from '@/components/baseline-form';
import { PaceTargetsCard } from '@/components/pace-targets';
import {
  RACE_DATE,
  RACE_GOAL_TIME,
  RACE_NAME,
  TRAINING_TOTAL_DAYS,
} from '@/lib/constants';
import { daysUntilRace } from '@/lib/dates';

export default function DashboardPage() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntilRace());
  }, []);

  const progress =
    days !== null
      ? Math.max(0, Math.min(1, (TRAINING_TOTAL_DAYS - days) / TRAINING_TOTAL_DAYS))
      : 0;

  return (
    <div className="space-y-4 p-4">
      {/* North Star — race brief hero */}
      <section className="relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="stripes h-1" />
        <div className="p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--color-fg-muted)]">
              ◆ North Star
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--color-accent)]">
              {RACE_NAME} · {RACE_DATE}
            </span>
          </div>
          <div className="mt-3 flex items-end gap-4">
            <div className="font-display text-[12px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-fg-muted)]">
              Sub
            </div>
            <div
              className="font-display num text-7xl font-black leading-[0.85] tracking-tight text-[var(--color-fg)]"
              style={{ textShadow: '0 0 32px rgba(255, 61, 0, 0.25)' }}
            >
              {RACE_GOAL_TIME}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-3">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
                Programme progress
              </div>
              <div className="relative mt-1 h-2 bg-[var(--color-surface-2)]">
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--color-accent)]"
                  style={{ width: `${progress * 100}%` }}
                />
                <div className="absolute inset-0 stripes opacity-30" />
              </div>
            </div>
            <div className="text-right">
              <div className="font-display num text-2xl font-black leading-none text-[var(--color-fg)]">
                {days !== null
                  ? Math.max(0, TRAINING_TOTAL_DAYS - days).toString().padStart(3, '0')
                  : '—'}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-fg-dim)]">
                / {TRAINING_TOTAL_DAYS} days
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Baselines */}
      <section className="border border-[var(--color-line)] bg-[var(--color-surface)]">
        <header className="flex items-center justify-between border-b border-dashed border-[var(--color-line-strong)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display num text-2xl font-black leading-none text-[var(--color-accent)]">
              01
            </span>
            <div>
              <div className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--color-fg)]">
                Baselines
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                Test 15–17 May
              </div>
            </div>
          </div>
        </header>
        <div className="p-4">
          <BaselineForm />
        </div>
      </section>

      {/* Pace Targets */}
      <section className="border border-[var(--color-line)] bg-[var(--color-surface)]">
        <header className="flex items-center justify-between border-b border-dashed border-[var(--color-line-strong)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display num text-2xl font-black leading-none text-[var(--color-accent)]">
              02
            </span>
            <div>
              <div className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--color-fg)]">
                Pace targets
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                Auto from 5 km · override anytime
              </div>
            </div>
          </div>
        </header>
        <div className="p-4">
          <PaceTargetsCard />
        </div>
      </section>

      {/* Race Day */}
      <section className="border border-[var(--color-line)] bg-[var(--color-surface)]">
        <header className="flex items-center justify-between border-b border-dashed border-[var(--color-line-strong)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display num text-2xl font-black leading-none text-[var(--color-accent)]">
              03
            </span>
            <div>
              <div className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--color-fg)]">
                Race day
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                Execute the plan
              </div>
            </div>
          </div>
        </header>
        <ol className="divide-y divide-dashed divide-[var(--color-line)] p-2">
          {[
            'Start the run slower than you want to.',
            'Pace each station — blowing up costs more than slowing down.',
            'Wall balls last. Plan 25 + 25 + 25 + 25.',
            'Eat 2–3 hrs before. Gel at km 4. Hydrate every water point.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-3 px-2 py-2.5">
              <span className="font-display num pt-0.5 text-base font-black text-[var(--color-accent)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-sans text-sm leading-snug text-[var(--color-fg)]">
                {tip}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
