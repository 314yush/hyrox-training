'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { SessionCard } from '@/components/session-card';
import { getSession } from '@/lib/plan-data';
import { todayISO } from '@/lib/dates';

export default function TodayPage() {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    setDate(todayISO());
  }, []);

  if (!date) {
    return (
      <div className="p-6 font-mono text-[10px] uppercase tracking-widest text-[var(--color-fg-dim)]">
        Loading today…
      </div>
    );
  }

  const session = getSession(date);
  const prev = format(addDays(parseISO(date), -1), 'yyyy-MM-dd');
  const next = format(addDays(parseISO(date), 1), 'yyyy-MM-dd');

  return (
    <div className="space-y-4 p-4">
      {session ? <SessionCard session={session} /> : <NoSession date={date} />}
      <nav className="grid grid-cols-2 gap-2">
        <Link
          href={`/day/${prev}`}
          className="border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-fg)]"
        >
          <div className="text-[9px] text-[var(--color-fg-dim)]">← Yesterday</div>
          <div className="font-display mt-0.5 text-sm font-bold uppercase text-[var(--color-fg)]">
            {format(parseISO(prev), 'EEE d MMM')}
          </div>
        </Link>
        <Link
          href={`/day/${next}`}
          className="border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-fg)]"
        >
          <div className="text-[9px] text-[var(--color-fg-dim)]">Tomorrow →</div>
          <div className="font-display mt-0.5 text-sm font-bold uppercase text-[var(--color-fg)]">
            {format(parseISO(next), 'EEE d MMM')}
          </div>
        </Link>
      </nav>
    </div>
  );
}

function NoSession({ date }: { date: string }) {
  return (
    <div className="border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface)] p-8 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
        {format(parseISO(date), 'EEEE · d MMM yyyy')}
      </div>
      <div className="font-display mt-3 text-2xl font-black uppercase text-[var(--color-fg)]">
        No session
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-fg-dim)]">
        Training window: 15 May → 20 Sep 2026
      </div>
    </div>
  );
}
