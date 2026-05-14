'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addDays, format, parseISO } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SessionBadge } from './session-badge';
import { getSession } from '@/lib/plan-data';
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

export function PhaseSection({
  phase,
  defaultOpen,
}: {
  phase: Phase;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const weeks = weekStartsInPhase(phase);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-left hover:bg-slate-900/80">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-bold">{phase.name}</div>
            <div className="text-xs text-slate-400">
              {format(parseISO(phase.startDate), 'd MMM')} –{' '}
              {format(parseISO(phase.endDate), 'd MMM yyyy')} · {phase.weeks} week
              {phase.weeks > 1 ? 's' : ''}
            </div>
            <div className="mt-1 text-xs text-slate-500">{phase.focus}</div>
          </div>
          <span className="text-sm text-slate-400">{open ? '−' : '+'}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {weeks.map((wkStart, idx) => (
          <div
            key={wkStart}
            className="rounded-md border border-slate-800 bg-slate-900/40 p-2"
          >
            <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-400">
              Week {idx + 1} · {format(parseISO(wkStart), 'd MMM')}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {Array.from({ length: 7 }, (_, i) =>
                format(addDays(parseISO(wkStart), i), 'yyyy-MM-dd'),
              ).map((date) => {
                const sess = getSession(date);
                if (!sess) return null;
                return (
                  <Link
                    key={date}
                    href={`/day/${date}`}
                    className="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs hover:bg-slate-800/60"
                  >
                    <span className="min-w-0 truncate text-slate-300">
                      <span className="text-slate-500">
                        {format(parseISO(date), 'EEE d')}
                      </span>{' '}
                      · {sess.title}
                    </span>
                    <SessionBadge type={sess.type} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
