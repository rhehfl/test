import { Badge } from '../../ui/Badge';
import { Skeleton } from '../../ui/Skeleton';
import type { EngravingsResponse } from '../../models/character';

const LEVEL_GRADE_MAP: Record<number, 'ancient' | 'relic' | 'rare' | 'uncommon'> = {
  3: 'ancient',
  2: 'rare',
  1: 'uncommon',
};

interface EngravingsTabProps {
  engravings: EngravingsResponse;
}

export function EngravingsTab({ engravings }: EngravingsTabProps) {
  const effects = engravings.Effects ?? [];

  if (effects.length === 0) {
    return <p className="text-sm text-text-muted">각인 정보가 없습니다.</p>;
  }

  const active = effects.filter((e) => e.IsHave);

  return (
    <div className="flex flex-col gap-2">
      {active.map((effect, i) => {
        const level = effect.Point >= 15 ? 3 : effect.Point >= 10 ? 2 : 1;
        const grade = LEVEL_GRADE_MAP[level];
        return (
          <div key={i} className="flex items-center gap-3 rounded-md border border-border-default bg-bg-surface p-3">
            <img src={effect.Icon} alt={effect.Name} className="h-9 w-9 shrink-0 rounded object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">{effect.Name}</span>
                <Badge grade={grade} label={`Lv.${level}`} />
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{effect.Description}</p>
            </div>
            <span className="text-xs text-text-muted">{effect.Point}pt</span>
          </div>
        );
      })}
    </div>
  );
}

export function EngravingsTabSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-border-default bg-bg-surface p-3">
          <Skeleton width="36px" height="36px" rounded="md" className="shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton width="120px" height="14px" />
            <Skeleton height="12px" />
          </div>
        </div>
      ))}
    </div>
  );
}
