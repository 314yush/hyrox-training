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
      <div className="mb-2 text-sm text-slate-400">
        16 weeks · baseline through race week
      </div>
      {PHASES.map((p) => (
        <PhaseSection key={p.id} phase={p} defaultOpen={p.id === currentPhase} />
      ))}
    </div>
  );
}
