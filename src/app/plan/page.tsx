'use client';

import { useEffect, useState } from 'react';
import { PhaseSection } from '@/components/phase-section';
import { PHASES } from '@/lib/plan-data';
import { phaseForDate, todayISO } from '@/lib/dates';

export default function PlanPage() {
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPhase(phaseForDate(todayISO()));
  }, []);

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-baseline justify-between border-b border-[var(--color-line)] pb-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
            Programme
          </div>
          <div className="font-display text-2xl font-black uppercase tracking-tight text-[var(--color-fg)]">
            16 weeks
          </div>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
          Base → Build → Spec → Peak
        </div>
      </div>

      {PHASES.map((p) => (
        <PhaseSection key={p.id} phase={p} defaultOpen={p.id === currentPhase} />
      ))}
    </div>
  );
}
