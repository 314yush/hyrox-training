'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/today', label: 'Today' },
  { href: '/week', label: 'Week' },
  { href: '/plan', label: 'Plan' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-white/10 bg-slate-950/95 backdrop-blur">
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
              'py-3 text-center text-xs font-medium transition-colors',
              active ? 'text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
