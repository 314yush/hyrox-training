import Link from 'next/link';
import { addDays, format, isValid, parseISO } from 'date-fns';
import { SessionCard } from '@/components/session-card';
import { getSession } from '@/lib/plan-data';

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!isValid(parseISO(date))) {
    return <div className="p-4 text-slate-400">Invalid date.</div>;
  }

  const session = getSession(date);
  const prev = format(addDays(parseISO(date), -1), 'yyyy-MM-dd');
  const next = format(addDays(parseISO(date), 1), 'yyyy-MM-dd');

  return (
    <div className="space-y-4 p-4">
      {session ? (
        <SessionCard session={session} />
      ) : (
        <div className="rounded-md border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
          <div className="mb-1 text-xs uppercase tracking-wider">
            {format(parseISO(date), 'EEEE, d MMM yyyy')}
          </div>
          <div>No session scheduled.</div>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <Link href={`/day/${prev}`} className="text-slate-400 hover:text-slate-200">
          ← Previous
        </Link>
        <Link href={`/day/${next}`} className="text-slate-400 hover:text-slate-200">
          Next →
        </Link>
      </div>
    </div>
  );
}
