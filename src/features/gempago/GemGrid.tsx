import type { Gem } from './GemCard';
import { GemCard } from './GemCard';

interface GemGridProps {
  gems: Gem[];
}

export function GemGrid({ gems }: GemGridProps) {
  if (gems.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center rounded-md border border-border-default bg-bg-surface">
        <p className="text-sm text-text-muted">인식된 보석이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {gems.map((gem) => (
        <GemCard key={gem.slot} gem={gem} />
      ))}
    </div>
  );
}
