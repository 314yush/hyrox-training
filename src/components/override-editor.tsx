'use client';

import { useEffect, useState } from 'react';
import { getOverride, setOverride } from '@/lib/storage';

export function OverrideEditor({
  date,
  defaultTitle,
  defaultDetails,
  onChange,
}: {
  date: string;
  defaultTitle: string;
  defaultDetails: string;
  onChange?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [hasOverride, setHasOverride] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOverride(date).then((o) => {
      if (cancelled) return;
      if (o?.customTitle || o?.customDetails) {
        setTitle(o.customTitle ?? '');
        setDetails(o.customDetails ?? '');
        setHasOverride(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function save() {
    const existing = (await getOverride(date)) ?? { date };
    await setOverride(date, {
      ...existing,
      customTitle: title || undefined,
      customDetails: details || undefined,
    });
    setHasOverride(Boolean(title || details));
    setOpen(false);
    onChange?.();
  }

  async function reset() {
    const existing = (await getOverride(date)) ?? { date };
    await setOverride(date, {
      ...existing,
      customTitle: undefined,
      customDetails: undefined,
    });
    setTitle('');
    setDetails('');
    setHasOverride(false);
    setOpen(false);
    onChange?.();
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          if (!title) setTitle(defaultTitle);
          if (!details) setDetails(defaultDetails);
        }}
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)] underline decoration-dotted underline-offset-4 hover:text-[var(--color-accent)]"
      >
        {hasOverride ? '◆ Edit override' : '+ Override session'}
      </button>
    );
  }

  return (
    <div className="space-y-3 border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-2)] p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
        // Override
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Session title"
        className="w-full border-b border-[var(--color-line-strong)] bg-transparent pb-1.5 font-display text-lg font-bold uppercase tracking-tight text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={6}
        placeholder="Session details"
        className="w-full resize-none bg-transparent font-mono text-[13px] leading-relaxed text-[var(--color-fg)] outline-none"
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={save}
          className="bib bg-[var(--color-accent)] text-white hover:opacity-90"
        >
          Save
        </button>
        <button
          onClick={() => setOpen(false)}
          className="bib bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          Cancel
        </button>
        {hasOverride && (
          <button
            onClick={reset}
            className="bib bg-transparent text-[var(--color-signal-warn)] underline decoration-dotted underline-offset-4 hover:opacity-90"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
