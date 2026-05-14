'use client';

import { Card } from '@/components/ui/card';
import { BaselineForm } from '@/components/baseline-form';
import { PaceTargetsCard } from '@/components/pace-targets';
import { RACE_DATE, RACE_GOAL_TIME, RACE_NAME } from '@/lib/constants';

export default function DashboardPage() {
  return (
    <div className="space-y-4 p-4">
      <Card className="border-red-900/40 bg-gradient-to-br from-red-900/30 to-slate-900 p-4">
        <div className="text-[10px] uppercase tracking-wider text-red-300">
          North Star
        </div>
        <div className="mt-1 text-3xl font-black tabular-nums">
          {RACE_GOAL_TIME}
        </div>
        <div className="mt-1 text-sm text-slate-300">
          {RACE_NAME} · {RACE_DATE}
        </div>
      </Card>

      <Card className="space-y-3 border-slate-800 bg-slate-900 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Baseline tests
        </h2>
        <BaselineForm />
      </Card>

      <Card className="space-y-3 border-slate-800 bg-slate-900 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Pace targets
        </h2>
        <PaceTargetsCard />
      </Card>

      <Card className="space-y-2 border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Race day strategy
        </h2>
        <ol className="list-inside list-decimal space-y-1">
          <li>Start the run slower than you want to.</li>
          <li>Pace each station — blowing up costs more than slowing down.</li>
          <li>Wall balls last — plan it (25+25+25+25).</li>
          <li>Eat 2–3 hrs before. Gel at km 4. Hydrate every water point.</li>
        </ol>
      </Card>
    </div>
  );
}
