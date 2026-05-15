'use client';

import { useEffect, useState } from 'react';
import { getBaselines, setBaselines } from '@/lib/storage';
import type { Baselines } from '@/lib/types';

export function BaselineForm({
  onChange,
}: {
  onChange?: (b: Baselines) => void;
}) {
  const [b, setB] = useState<Baselines>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getBaselines().then((x) => {
      if (cancelled) return;
      setB(x);
      setLoaded(true);
      onChange?.(x);
    });
    return () => {
      cancelled = true;
    };
  }, [onChange]);

  function update<K extends keyof Baselines>(key: K, value: Baselines[K]) {
    setB((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await setBaselines(b);
    const updated = await getBaselines();
    setB(updated);
    setSaving(false);
    onChange?.(updated);
  }

  if (!loaded)
    return (
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-fg-dim)]">
        Loading…
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <NumField
          label="1 KM"
          unit="m:ss"
          value={b.km1Time ?? ''}
          onChange={(v) => update('km1Time', v || undefined)}
        />
        <NumField
          label="5 KM"
          unit="mm:ss"
          value={b.km5Time ?? ''}
          onChange={(v) => update('km5Time', v || undefined)}
        />
        <NumField
          label="WALL BALL"
          unit="reps unbroken"
          value={String(b.wallBallMaxUnbroken ?? '')}
          onChange={(v) => update('wallBallMaxUnbroken', v ? Number(v) : undefined)}
        />
        <NumField
          label="500 M ROW"
          unit="m:ss"
          value={b.row500mTime ?? ''}
          onChange={(v) => update('row500mTime', v || undefined)}
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
          // Burpee broad jump notes
        </label>
        <textarea
          value={b.burpeeBroadJumpNotes ?? ''}
          onChange={(e) =>
            update('burpeeBroadJumpNotes', e.target.value || undefined)
          }
          rows={2}
          placeholder="How did the movement feel?"
          className="mt-1 w-full resize-none border-l-2 border-[var(--color-line-strong)] bg-[var(--color-surface-2)] px-2.5 py-2 font-mono text-[13px] text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-dim)] focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={save}
          disabled={saving}
          className="bib bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Lock in baselines'}
        </button>
        {b.updatedAt && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-fg-dim)]">
            {new Date(b.updatedAt).toLocaleDateString([], {
              day: '2-digit',
              month: 'short',
            })}
          </span>
        )}
      </div>
    </div>
  );
}

function NumField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="border-l-2 border-[var(--color-line-strong)] pl-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className="font-display num mt-1 w-full bg-transparent text-3xl font-black leading-none tracking-tight text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-dim)] focus:text-[var(--color-accent)]"
      />
      {unit && (
        <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[var(--color-fg-dim)]">
          {unit}
        </div>
      )}
    </div>
  );
}
