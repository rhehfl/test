import { Badge } from '../../ui/Badge';
import { Skeleton } from '../../ui/Skeleton';
import type { Skill } from '../../models/character';

const RUNE_GRADE_MAP: Record<string, 'ancient' | 'relic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'normal'> = {
  '고대': 'ancient',
  '유물': 'relic',
  '전설': 'legendary',
  '영웅': 'epic',
  '희귀': 'rare',
  '고급': 'uncommon',
  '일반': 'normal',
};

interface SkillsTabProps {
  skills: Skill[];
}

export function SkillsTab({ skills }: SkillsTabProps) {
  const activeSkills = skills.filter((s) => s.Level > 1 || s.IsAwakening);

  if (activeSkills.length === 0) {
    return <p className="text-sm text-text-muted">스킬 정보가 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {activeSkills.map((skill, i) => {
        const activeTripods = skill.Tripods.filter((t) => t.IsSelected);
        return (
          <div key={i} className="rounded-md border border-border-default bg-bg-surface p-3">
            <div className="flex items-center gap-3">
              <img src={skill.Icon} alt={skill.Name} className="h-10 w-10 shrink-0 rounded object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{skill.Name}</span>
                  {skill.IsAwakening && <Badge label="각성" grade="ancient" />}
                  <span className="text-xs text-text-muted">Lv.{skill.Level}</span>
                </div>
                {activeTripods.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {activeTripods.map((t, j) => (
                      <span key={j} className="rounded bg-bg-raised px-1.5 py-0.5 text-xs text-text-secondary">
                        {t.Name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {skill.Rune && (
                <div className="flex flex-col items-center gap-0.5">
                  <img src={skill.Rune.Icon} alt={skill.Rune.Name} className="h-7 w-7 rounded" />
                  <Badge grade={RUNE_GRADE_MAP[skill.Rune.Grade] ?? 'normal'} label={skill.Rune.Name} className="max-w-16 truncate" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SkillsTabSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-border-default bg-bg-surface p-3">
          <Skeleton width="40px" height="40px" rounded="md" className="shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton width="100px" height="14px" />
            <div className="flex gap-1">
              <Skeleton width="60px" height="20px" rounded="sm" />
              <Skeleton width="60px" height="20px" rounded="sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
