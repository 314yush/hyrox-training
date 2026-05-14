'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { SessionBadge } from '@/components/session-badge';
import { getSession } from '@/lib/plan-data';
import { todayISO, weekDatesFor } from '@/lib/dates';

export default function WeekPage() {
  const [today, setToday] = useState<string | null>(null);
  const [offsetWeek, setOffsetWeek] = useState(0);

  useEffect(() => {
    setToday(todayISO());
  }, []);

  if (!today) return <div className="p-4 text-sm text-slate-500">Loading…</div>;

  const anchor = format(addDays(parseISO(today), offsetWeek * 7), 'yyyy-MM-dd');
  const dates = weekDatesFor(anchor);
  const start = parseISO(dates[0]);
  const end = parseISO(dates[6]);

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOffsetWeek((o) => o - 1)}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← Prev week
        </button>
        <div className="text-sm font-medium text-slate-300">
          {format(start, 'd MMM')} – {format(end, 'd MMM yyyy')}
        </div>
        <button
          onClick={() => setOffsetWeek((o) => o + 1)}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Next week →
        </button>
      </div>

      <div className="space-y-2">
        {dates.map((date) => {
          const sess = getSession(date);
          const isToday = date === today;
          return (
            <Link
              key={date}
              href={`/day/${date}`}
              className={`block rounded-md border p-3 transition-colors ${
                isToday
                  ? 'border-white bg-slate-900'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    {format(parseISO(date), 'EEE')} · {format(parseISO(date), 'd MMM')}
                    {isToday && (
                      <span className="ml-2 font-bold text-white">TODAY</span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-semibold">
                    {sess?.title ?? 'No session'}
                  </div>
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
