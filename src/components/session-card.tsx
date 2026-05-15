'use client';

import { useCallback, useEffect, useState } from 'react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { SessionBadge } from './session-badge';
import { NotesEditor } from './notes-editor';
import { OverrideEditor } from './override-editor';
import { getOverride } from '@/lib/storage';
import { SESSION_COLORS, TRAINING_TOTAL_DAYS } from '@/lib/constants';
import type { Session } from '@/lib/types';

const TRAINING_START_ISO = '2026-05-15';

function dayNumber(dateISO: string): number {
  return differenceInCalendarDays(parseISO(dateISO), parseISO(TRAINING_START_ISO)) + 1;
}

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
  const n = dayNumber(session.date);
  const dayN = Math.max(1, n).toString().padStart(3, '0');
  const totalN = TRAINING_TOTAL_DAYS.toString().padStart(3, '0');

  return (
    <article className="relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]">
      {/* race-tape header */}
      <div
        className="flex items-center justify-between px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{ background: c.color, color: c.color === '#fbbf24' || c.color === '#22d3ee' ? '#0a0a0a' : '#ffffff' }}
      >
        <span className="font-bold">{c.label} / brief</span>
        <span className="num font-bold">
          {dayN} / {totalN}
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
            {session.dayName} · {format(parseISO(session.date), 'd MMM yyyy')}
          </div>
          <h1 className="font-display mt-2 text-3xl font-black uppercase leading-[0.95] tracking-tight text-[var(--color-fg)]">
            {title}
          </h1>
          {customized && (
            <span className="mt-2 inline-block bib bg-[var(--color-signal-warn)] text-[var(--color-bg)]">
              Custom
            </span>
          )}
        </div>

        <div className="border-t border-dashed border-[var(--color-line-strong)]" />

        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-[1.55] text-[var(--color-fg)]">
          {details}
        </pre>

        {session.coachingTip && (
          <div className="relative border-l-2 border-[var(--color-accent)] bg-[var(--color-surface-2)] px-4 py-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--color-accent)]">
              Coach
            </div>
            <p className="mt-1 font-sans text-sm italic text-[var(--color-fg)]">
              {session.coachingTip}
            </p>
          </div>
        )}

        <OverrideEditor
          date={session.date}
          defaultTitle={session.title}
          defaultDetails={session.details}
          onChange={reload}
        />

        <div className="border-t border-dashed border-[var(--color-line)] pt-4">
          <NotesEditor date={session.date} />
        </div>
      </div>
    </article>
  );
}
