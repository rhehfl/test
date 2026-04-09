import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ hoverable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-md border border-border-default bg-bg-surface p-3 ${hoverable ? 'transition-colors duration-150 hover:border-border-strong hover:bg-bg-raised' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
