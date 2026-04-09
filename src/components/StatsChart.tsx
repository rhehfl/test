interface StatRow {
  ark_passive_pattern: string;
  count: number;
  avg_item_level: number;
}

interface StatsChartProps {
  data: StatRow[];
  className?: string;
}

export function StatsChart({ data, className = '' }: StatsChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-text-muted">데이터가 없습니다.</p>;
  }

  const total = data.reduce((sum, r) => sum + r.count, 0);
  const maxCount = Math.max(...data.map((r) => r.count));

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {data.map((row) => {
        const pct = Math.round((row.count / total) * 100);
        const barWidth = Math.round((row.count / maxCount) * 100);
        return (
          <div key={row.ark_passive_pattern} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-right text-sm font-mono font-medium text-text-primary">
              {row.ark_passive_pattern}
            </span>
            <div className="flex-1">
              <div className="h-6 overflow-hidden rounded bg-bg-overlay">
                <div
                  className="flex h-full items-center justify-end pr-2 bg-gold/70 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                >
                  <span className="text-xs font-semibold text-bg-base">{pct}%</span>
                </div>
              </div>
            </div>
            <span className="w-14 shrink-0 text-xs text-text-muted">{row.count.toLocaleString()}명</span>
          </div>
        );
      })}
    </div>
  );
}
