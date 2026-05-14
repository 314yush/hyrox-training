import { BottomNav } from './bottom-nav';
import { RaceCountdown } from './race-countdown';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <RaceCountdown />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
