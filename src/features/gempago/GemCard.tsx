import { Badge } from '../../ui/Badge';

export type GemEffectType = 'damage' | 'cooldown';
export type GemGrade = 'ancient' | 'relic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'normal';

export interface Gem {
  slot: number;
  level: number;
  name: string;
  effectType: GemEffectType;
  grade: GemGrade;
  effect?: string;
  icon?: string;
}

const effectTypeStyle: Record<GemEffectType, string> = {
  damage: 'bg-red-500/15 text-red-400',
  cooldown: 'bg-blue-500/15 text-blue-400',
};

const effectTypeLabel: Record<GemEffectType, string> = {
  damage: '공격',
  cooldown: '기대',
};

interface GemCardProps {
  gem: Gem;
}

export function GemCard({ gem }: GemCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border-default bg-bg-surface p-3">
      {gem.icon ? (
        <img src={gem.icon} alt={gem.name} className="h-10 w-10 shrink-0 rounded object-cover" />
      ) : (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded text-base font-bold ${effectTypeStyle[gem.effectType]}`}
        >
          {gem.level}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Badge grade={gem.grade} label={`Lv.${gem.level}`} />
          <span className={`rounded px-1 py-0.5 text-xs font-medium ${effectTypeStyle[gem.effectType]}`}>
            {effectTypeLabel[gem.effectType]}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-text-primary">{gem.name}</p>
        {gem.effect && (
          <p className="truncate text-xs text-text-secondary">{gem.effect}</p>
        )}
      </div>
    </div>
  );
}
