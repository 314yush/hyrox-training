'use client';

import { useEffect, useState } from 'react';
import { hydrateFromRemote, type HydrateResult } from '@/lib/storage';

type Status = 'idle' | 'syncing' | HydrateResult;

export function SyncBootstrap() {
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    let cancelled = false;
    setStatus('syncing');

    void hydrateFromRemote().then((result) => {
      if (cancelled) return;
      setStatus(result);
      // hide the "synced" pill after a brief moment; keep no-db / offline visible
      if (result === 'synced') {
        window.setTimeout(() => {
          if (!cancelled) setStatus('idle');
        }, 1500);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'idle') return null;

  const cfg: Record<Exclude<Status, 'idle'>, { label: string; color: string }> = {
    syncing: { label: 'syncing', color: 'var(--color-fg-muted)' },
    synced: { label: '◆ synced', color: 'var(--color-signal-go)' },
    'no-db': { label: '◆ local-only', color: 'var(--color-fg-dim)' },
    offline: { label: '◆ offline', color: 'var(--color-signal-warn)' },
  };
  const c = cfg[status];

  return (
    <div
      className="fixed left-4 top-[6.5rem] z-40 font-mono text-[9px] uppercase tracking-[0.22em]"
      style={{ color: c.color }}
    >
      {c.label}
    </div>
  );
}
