'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/today', label: 'Today', n: '01' },
  { href: '/week', label: 'Week', n: '02' },
  { href: '/plan', label: 'Plan', n: '03' },
  { href: '/dashboard', label: 'HQ', n: '04' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[var(--color-line-strong)] bg-[var(--color-bg)]/95 backdrop-blur-md">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href === '/today' && pathname === '/') ||
          (item.href === '/today' && pathname.startsWith('/day/'));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5 py-3 transition-colors',
              active
                ? 'text-[var(--color-fg)]'
                : 'text-[var(--color-fg-dim)] hover:text-[var(--color-fg-muted)]',
            )}
          >
            {active && (
              <span className="absolute bottom-0 left-1/2 h-[3px] w-10 -translate-x-1/2 bg-[var(--color-accent)]" />
            )}
            <span className={cn(
              'font-mono text-[9px] tracking-widest',
              active ? 'text-[var(--color-accent)]' : 'opacity-60',
            )}>
              {item.n}
            </span>
            <span className="font-display text-xs font-extrabold uppercase tracking-[0.18em]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
