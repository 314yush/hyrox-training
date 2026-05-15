'use client';

import { useEffect, useRef, useState } from 'react';
import { getOverride, setOverride } from '@/lib/storage';

export function NotesEditor({ date }: { date: string }) {
  const [value, setValue] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOverride(date).then((o) => {
      if (cancelled) return;
      setValue(o?.note ?? '');
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  function onChange(v: string) {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const existing = (await getOverride(date)) ?? { date };
      await setOverride(date, { ...existing, note: v });
      setSavedAt(Date.now());
    }, 600);
  }

  if (!loaded) {
    return <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-fg-dim)]">Loading…</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
          // Log entry
        </label>
        {savedAt && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-signal-go)]">
            ✓ {new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="How did it feel? What broke? What worked?"
        rows={4}
        className="w-full resize-none border-l-2 border-[var(--color-line-strong)] bg-[var(--color-surface-2)] px-3 py-2.5 font-mono text-[13px] leading-relaxed text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-dim)] focus:border-[var(--color-accent)]"
      />
    </div>
  );
}
