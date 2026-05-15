import { BottomNav } from './bottom-nav';
import { RaceCountdown } from './race-countdown';
import { SyncBootstrap } from './sync-bootstrap';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <RaceCountdown />
      <SyncBootstrap />
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
