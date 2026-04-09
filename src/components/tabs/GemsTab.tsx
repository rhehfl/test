import { Badge } from '../../ui/Badge';
import { Skeleton } from '../../ui/Skeleton';
import type { GemsResponse } from '../../models/character';

const GRADE_MAP: Record<string, 'ancient' | 'relic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'normal'> = {
  '고대': 'ancient',
  '유물': 'relic',
  '전설': 'legendary',
  '영웅': 'epic',
  '희귀': 'rare',
  '고급': 'uncommon',
  '일반': 'normal',
};

interface GemsTabProps {
  gems: GemsResponse;
}

export function GemsTab({ gems }: GemsTabProps) {
  const gemList = gems.Gems ?? [];
  const effectMap = new Map(
    (gems.Effects ?? []).map((e) => [e.GemSlot, e])
  );

  if (gemList.length === 0) {
    return <p className="text-sm text-text-muted">보석 정보가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {gemList.map((gem) => {
        const effect = effectMap.get(gem.Slot);
        const grade = GRADE_MAP[gem.Grade] ?? 'normal';
        return (
          <div key={gem.Slot} className="flex items-center gap-3 rounded-md border border-border-default bg-bg-surface p-3">
            <img src={gem.Icon} alt={gem.Name} className="h-9 w-9 shrink-0 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Badge grade={grade} label={`Lv.${gem.Level}`} />
                <span className="truncate text-sm font-medium text-text-primary">{gem.Name}</span>
              </div>
              {effect && (
                <p className="mt-0.5 truncate text-xs text-text-secondary">{effect.Description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GemsTabSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-border-default bg-bg-surface p-3">
          <Skeleton width="36px" height="36px" rounded="md" className="shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton width="80px" height="14px" />
            <Skeleton height="12px" />
          </div>
        </div>
      ))}
    </div>
  );
}
