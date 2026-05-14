'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { derivePaceTargets } from '@/lib/paces';
import { getBaselines, getPaceOverrides, setPaceOverrides } from '@/lib/storage';
import type { PaceTargets } from '@/lib/types';

const FIELDS: Array<{ key: keyof PaceTargets; label: string }> = [
  { key: 'easy', label: 'Easy / Zone 2' },
  { key: 'tempo', label: 'Tempo' },
  { key: 'race', label: 'Race' },
  { key: 'long', label: 'Long run' },
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

  if (!loaded) return <div className="text-xs text-slate-500">Loading…</div>;

  const hasBase = Object.keys(derived).length > 0;

  return (
    <div className="space-y-3">
      {!hasBase && (
        <div className="text-xs text-amber-400">
          Enter your 5 km baseline to see suggested paces.
        </div>
      )}
      <div className="grid grid-cols-1 gap-2">
        {FIELDS.map(({ key, label }) => {
          const suggested = derived[key];
          const override = overrides[key];
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label className="text-sm">{label}</Label>
              <div className="flex items-center gap-2">
                {suggested && (
                  <span className="text-xs text-slate-500">≈ {suggested}/km</span>
                )}
                <Input
                  value={override ?? ''}
                  onChange={(e) => saveOverride(key, e.target.value)}
                  placeholder={suggested ?? 'm:ss'}
                  className="h-8 w-24 border-slate-800 bg-slate-900 text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>
      <Button size="sm" variant="ghost" onClick={load}>
        Recompute from baselines
      </Button>
    </div>
  );
}
