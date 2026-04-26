import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  color?: 'green' | 'yellow' | 'red' | 'gray' | 'blue';
  className?: string;
}

export type BadgeVariant = NonNullable<BadgeProps['variant']>;

export function Badge({ children, variant = 'default', color, className }: BadgeProps) {
  const variants = {
    default: 'ultra-badge neutral',
    primary: 'ultra-badge primary',
    success: 'ultra-badge success',
    warning: 'ultra-badge warning',
    danger: 'ultra-badge error',
    info: 'ultra-badge primary',
  };

  const colorVariants = {
    green: 'ultra-badge success',
    yellow: 'ultra-badge warning',
    red: 'ultra-badge error',
    gray: 'ultra-badge neutral',
    blue: 'ultra-badge primary',
  };

  const selectedVariant = color ? colorVariants[color] : variants[variant];

  return (
    <span
      className={cn(
        'ultra-badge',
        selectedVariant,
        className
      )}
    >
      {children}
    </span>
  );
}

// Default export for backward compatibility
export default Badge;
