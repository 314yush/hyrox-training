'use client';

import { useCallback, useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { SessionBadge } from './session-badge';
import { NotesEditor } from './notes-editor';
import { OverrideEditor } from './override-editor';
import { getOverride } from '@/lib/storage';
import { SESSION_COLORS } from '@/lib/constants';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SessionCard({ session }: { session: Session }) {
  const [title, setTitle] = useState(session.title);
  const [details, setDetails] = useState(session.details);
  const [customized, setCustomized] = useState(false);

  const reload = useCallback(() => {
    getOverride(session.date).then((o) => {
      setTitle(o?.customTitle ?? session.title);
      setDetails(o?.customDetails ?? session.details);
      setCustomized(Boolean(o?.customTitle || o?.customDetails));
    });
  }, [session.date, session.title, session.details]);

  useEffect(() => {
    reload();
  }, [reload]);

  const c = SESSION_COLORS[session.type];

  return (
    <Card className={cn('overflow-hidden border-slate-800 bg-slate-900 border-l-4 p-0', c.border)}>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {session.dayName} · {format(parseISO(session.date), 'd MMM yyyy')}
            </div>
            <h1 className="mt-1 text-xl font-bold leading-tight">
              {title}
              {customized && (
                <span className="ml-2 align-middle text-[10px] font-normal uppercase tracking-wider text-amber-400">
                  custom
                </span>
              )}
            </h1>
          </div>
          <SessionBadge type={session.type} />
        </div>

        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-200">
          {details}
        </pre>

        {session.coachingTip && (
          <div className="rounded-md border-l-2 border-slate-700 bg-slate-950/60 p-3 text-sm italic text-slate-300">
            💡 {session.coachingTip}
          </div>
        )}

        <OverrideEditor
          date={session.date}
          defaultTitle={session.title}
          defaultDetails={session.details}
          onChange={reload}
        />
        <NotesEditor date={session.date} />
      </div>
    </Card>
  );
}
