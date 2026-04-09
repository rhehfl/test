import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { ProgressBar } from '../../ui/ProgressBar';
import { Skeleton } from '../../ui/Skeleton';
import type { Equipment } from '../../models/character';

const GRADE_MAP: Record<string, 'ancient' | 'relic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'normal'> = {
  '고대': 'ancient',
  '유물': 'relic',
  '전설': 'legendary',
  '영웅': 'epic',
  '희귀': 'rare',
  '고급': 'uncommon',
  '일반': 'normal',
};

function parseQuality(tooltip: string): number | null {
  try {
    const parsed = JSON.parse(tooltip);
    for (const key of Object.keys(parsed)) {
      const entry = parsed[key];
      if (entry?.type === 'ItemPartBox') {
        const element = entry?.value?.Element_001;
        if (typeof element?.topStr === 'string' && element.topStr.includes('품질')) {
          return parseInt(element.topStr.replace(/[^0-9]/g, ''), 10) || null;
        }
      }
    }
  } catch {
    // tooltip 파싱 실패 무시
  }
  return null;
}

interface EquipmentTabProps {
  equipment: Equipment[];
}

export function EquipmentTab({ equipment }: EquipmentTabProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {equipment.map((item, i) => {
        const grade = GRADE_MAP[item.Grade] ?? 'normal';
        const quality = parseQuality(item.Tooltip);
        return (
          <Card key={i} hoverable className="flex gap-3">
            <img src={item.Icon} alt={item.Name} className="h-10 w-10 shrink-0 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Badge grade={grade} />
                <span className="truncate text-sm font-medium text-text-primary">{item.Name}</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">{item.Type}</p>
              {quality !== null && (
                <div className="mt-1.5">
                  <div className="mb-0.5 flex justify-between text-xs text-text-secondary">
                    <span>품질</span>
                    <span>{quality}</span>
                  </div>
                  <ProgressBar value={quality} />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function EquipmentTabSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex gap-3">
          <Skeleton width="40px" height="40px" rounded="md" className="shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton height="14px" />
            <Skeleton width="60%" height="12px" />
            <Skeleton height="6px" rounded="full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
