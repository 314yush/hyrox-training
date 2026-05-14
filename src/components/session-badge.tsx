import { SESSION_COLORS } from '@/lib/constants';
import type { SessionType } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SessionBadge({
  type,
  className,
}: {
  type: SessionType;
  className?: string;
}) {
  const c = SESSION_COLORS[type];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white',
        c.bg,
        className,
      )}
    >
      {c.label}
    </span>
  );
}
