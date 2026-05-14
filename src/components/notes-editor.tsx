'use client';

import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { getOverride, setOverride } from '@/lib/storage';

export function NotesEditor({ date }: { date: string }) {
  const [value, setValue] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOverride(date).then((o) => {
      if (!cancelled) {
        setValue(o?.note ?? '');
        setLoaded(true);
      }
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
    return <div className="text-xs text-slate-500">Loading notes…</div>;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-wider text-slate-400">Notes</label>
        {savedAt && (
          <span className="text-[10px] text-slate-500">
            Saved {new Date(savedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="How did it feel? Anything to remember…"
        rows={4}
        className="resize-none border-slate-800 bg-slate-900"
      />
    </div>
  );
}
