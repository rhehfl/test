interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const color =
    pct >= 90
      ? 'bg-grade-ancient'
      : pct >= 70
        ? 'bg-grade-rare'
        : pct >= 40
          ? 'bg-grade-uncommon'
          : 'bg-grade-normal';

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-bg-overlay ${className}`}>
      <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
