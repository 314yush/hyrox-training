'use client';

import { useEffect, useState } from 'react';
import { daysUntilRace } from '@/lib/dates';
import { RACE_DATE, RACE_GOAL_TIME, RACE_NAME } from '@/lib/constants';

export function RaceCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntilRace());
  }, []);

  let countdownLabel = '—';
  if (days !== null) {
    if (days > 0) countdownLabel = `${days} d`;
    else if (days === 0) countdownLabel = 'TODAY';
    else countdownLabel = `+${-days} d`;
  }

  return (
    <header className="flex items-baseline justify-between border-b border-white/10 px-4 py-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400">Goal</div>
        <div className="text-lg font-bold">
          {RACE_GOAL_TIME} <span className="text-slate-400 font-normal">— {RACE_NAME}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">Race</div>
        <div className="text-lg font-bold tabular-nums">{countdownLabel}</div>
        <div className="text-[10px] text-slate-500">{RACE_DATE}</div>
      </div>
    </header>
  );
}
