'use client';

import { useCallback, useEffect, useState } from 'react';
import { derivePaceTargets } from '@/lib/paces';
import { getBaselines, getPaceOverrides, setPaceOverrides } from '@/lib/storage';
import type { PaceTargets } from '@/lib/types';

const FIELDS: Array<{ key: keyof PaceTargets; label: string; n: string }> = [
  { key: 'easy', n: 'Z2', label: 'Easy' },
  { key: 'tempo', n: 'TM', label: 'Tempo' },
  { key: 'race', n: 'RC', label: 'Race' },
  { key: 'long', n: 'LG', label: 'Long' },
];

export function PaceTargetsCard() {
  const [derived, setDerived] = useState<PaceTargets>({});
  const [overrides, setOverridesState] = useState<PaceTargets>({});
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [b, o] = await Promise.all([getBaselines(), getPaceOverrides()]);
    setDerived(derivePaceTargets(b));
    setOverridesState(o);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveOverride<K extends keyof PaceTargets>(
    key: K,
    value: string,
  ) {
    const next = { ...overrides, [key]: value || undefined };
    setOverridesState(next);
    await setPaceOverrides(next);
  }

  if (!loaded)
    return (
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-fg-dim)]">
        Loading…
      </div>
    );

  const hasBase = Object.keys(derived).length > 0;

  return (
    <div className="space-y-3">
      {!hasBase && (
        <div className="border-l-2 border-[var(--color-signal-warn)] bg-[var(--color-surface-2)] px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-[var(--color-signal-warn)]">
          ⚠ Enter 5 KM baseline to compute paces
        </div>
      )}
      <div className="space-y-1">
        {FIELDS.map(({ key, label, n }) => {
          const suggested = derived[key];
          const override = overrides[key];
          const shown = override || suggested || '';
          return (
            <div
              key={key}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-dashed border-[var(--color-line)] py-2.5 last:border-0"
            >
              <div className="font-display num w-8 text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)]">
                {n}
              </div>
              <div>
                <div className="font-display text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--color-fg)]">
                  {label}
                </div>
                {suggested && override && override !== suggested && (
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-fg-dim)]">
                    auto ≈ {suggested}
                  </div>
                )}
              </div>
              <input
                value={shown}
                onChange={(e) => saveOverride(key, e.target.value)}
                placeholder="—"
                className="font-display num w-24 bg-transparent text-right text-xl font-black tabular-nums text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-dim)] focus:text-[var(--color-accent)]"
              />
              <span className="font-mono col-start-3 -mt-1 text-right text-[9px] uppercase tracking-widest text-[var(--color-fg-dim)]">
                /km
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
