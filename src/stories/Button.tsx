// src/components/ui/Button/Button.tsx

import { type ButtonHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-gold text-bg-base hover:bg-gold-bright',
  ghost:
    'bg-transparent text-text-secondary border border-border-default hover:border-border-strong hover:text-text-primary',
  surface: 'bg-bg-raised text-text-primary border border-border-default hover:bg-bg-hover',
  danger: 'bg-transparent text-red-400 border border-red-400/30 hover:border-red-400/60',
  link: 'bg-transparent text-gold hover:text-gold-bright hover:underline underline-offset-4 px-0',
} as const;

const sizes = {
  sm: 'h-7 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-11 px-6 text-sm rounded-lg',
  icon: 'h-9 w-9 rounded-md',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 스타일 종류 */
  variant?: keyof typeof variants;
  /** 버튼 크기 */
  size?: keyof typeof sizes;
  /** 로딩 상태 — 비활성화 + 스피너 */
  loading?: boolean;
}

export function Button({
  variant = 'ghost',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`font-display inline-flex cursor-pointer items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className} `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
          <path
            d="M7 2a5 5 0 0 1 5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
