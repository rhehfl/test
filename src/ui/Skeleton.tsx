interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({ width, height, className = '', rounded = 'md' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-bg-overlay ${roundedMap[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
}
