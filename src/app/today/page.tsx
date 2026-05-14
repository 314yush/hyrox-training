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
      <div className="p-4 text-sm text-slate-500">Loading today…</div>
    );
  }

  const session = getSession(date);
  const prev = format(addDays(parseISO(date), -1), 'yyyy-MM-dd');
  const next = format(addDays(parseISO(date), 1), 'yyyy-MM-dd');

  return (
    <div className="space-y-4 p-4">
      {session ? <SessionCard session={session} /> : <NoSession date={date} />}
      <div className="flex justify-between text-sm">
        <Link href={`/day/${prev}`} className="text-slate-400 hover:text-slate-200">
          ← Yesterday
        </Link>
        <Link href={`/day/${next}`} className="text-slate-400 hover:text-slate-200">
          Tomorrow →
        </Link>
      </div>
    </div>
  );
}

function NoSession({ date }: { date: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
      <div className="mb-1 text-xs uppercase tracking-wider">
        {format(parseISO(date), 'EEEE, d MMM yyyy')}
      </div>
      <div className="text-lg">No session scheduled.</div>
      <div className="mt-2 text-xs">Training runs 15 May – 20 Sep 2026.</div>
    </div>
  );
}
