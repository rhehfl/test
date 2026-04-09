import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { StatsChart } from '../../components/StatsChart';
import { Skeleton } from '../../ui/Skeleton';

export const Route = createFileRoute('/stats/')({
  component: StatsPage,
});

const LEVEL_RANGES = [
  { label: '전체', min: 0, max: 9999 },
  { label: '1580~1600', min: 1580, max: 1600 },
  { label: '1600~1620', min: 1600, max: 1620 },
  { label: '1620~1640', min: 1620, max: 1640 },
  { label: '1640+', min: 1640, max: 9999 },
];

async function fetchStats(className: string | null, minLevel: number, maxLevel: number) {
  let query = supabase
    .from('character_stats')
    .select('*')
    .gte('avg_item_level', minLevel)
    .lte('avg_item_level', maxLevel)
    .order('count', { ascending: false });

  if (className) {
    query = query.eq('class_name', className);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function fetchClasses() {
  const { data } = await supabase
    .from('characters')
    .select('class_name')
    .not('class_name', 'is', null);
  const unique = [...new Set((data ?? []).map((r: { class_name: string }) => r.class_name))].sort();
  return unique;
}

function StatsPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton width="200px" height="28px" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} width="80px" height="32px" rounded="md" />)}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="24px" />)}
      </div>
    </div>
  );
}

function StatsPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [levelRangeIdx, setLevelRangeIdx] = useState(0);

  const range = LEVEL_RANGES[levelRangeIdx];

  const { data: classes = [] } = useQuery({
    queryKey: ['stats-classes'],
    queryFn: fetchClasses,
  });

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['stats', selectedClass, range.min, range.max],
    queryFn: () => fetchStats(selectedClass, range.min, range.max),
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">아크패시브 패턴 통계</h1>

      {/* 직업 필터 */}
      <section className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">직업</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedClass(null)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              selectedClass === null
                ? 'border-gold bg-gold-subtle font-semibold text-text-primary'
                : 'border-border-default text-text-secondary hover:border-border-strong'
            }`}
          >
            전체
          </button>
          {classes.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                selectedClass === cls
                  ? 'border-gold bg-gold-subtle font-semibold text-text-primary'
                  : 'border-border-default text-text-secondary hover:border-border-strong'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </section>

      {/* 아이템 레벨 구간 필터 */}
      <section className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">아이템 레벨</p>
        <div className="flex flex-wrap gap-2">
          {LEVEL_RANGES.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setLevelRangeIdx(i)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                levelRangeIdx === i
                  ? 'border-gold bg-gold-subtle font-semibold text-text-primary'
                  : 'border-border-default text-text-secondary hover:border-border-strong'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* 차트 */}
      {isLoading ? <StatsPageSkeleton /> : <StatsChart data={stats} />}
    </main>
  );
}
