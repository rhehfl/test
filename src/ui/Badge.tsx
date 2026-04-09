type Grade = 'ancient' | 'relic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'normal';

const gradeStyles: Record<Grade, string> = {
  ancient: 'bg-grade-ancient/10 text-grade-ancient border-grade-ancient/30',
  relic: 'bg-grade-relic/10 text-grade-relic border-grade-relic/30',
  legendary: 'bg-grade-legendary/10 text-grade-legendary border-grade-legendary/30',
  epic: 'bg-grade-epic/10 text-grade-epic border-grade-epic/30',
  rare: 'bg-grade-rare/10 text-grade-rare border-grade-rare/30',
  uncommon: 'bg-grade-uncommon/10 text-grade-uncommon border-grade-uncommon/30',
  normal: 'bg-grade-normal/10 text-grade-normal border-grade-normal/30',
};

const gradeLabels: Record<Grade, string> = {
  ancient: '고대',
  relic: '유물',
  legendary: '전설',
  epic: '영웅',
  rare: '희귀',
  uncommon: '고급',
  normal: '일반',
};

interface BadgeProps {
  grade?: Grade;
  label?: string;
  className?: string;
}

export function Badge({ grade, label, className = '' }: BadgeProps) {
  const style = grade ? gradeStyles[grade] : 'bg-bg-raised text-text-secondary border-border-default';
  const text = label ?? (grade ? gradeLabels[grade] : '');

  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold ${style} ${className}`}
    >
      {text}
    </span>
  );
}
