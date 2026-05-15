import { SESSION_COLORS } from '@/lib/constants';
import type { SessionType } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SessionBadge({
  type,
  className,
  size = 'sm',
}: {
  type: SessionType;
  className?: string;
  size?: 'sm' | 'lg';
}) {
  const c = SESSION_COLORS[type];
  return (
    <span
      className={cn(
        'bib',
        size === 'lg' ? 'text-[12px] py-1.5 px-2.5' : 'text-[10px]',
        className,
      )}
      style={{ background: c.color, color: c.color === '#fbbf24' || c.color === '#22d3ee' ? '#0a0a0a' : '#ffffff' }}
    >
      {c.label}
    </span>
  );
}
