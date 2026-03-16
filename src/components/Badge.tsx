import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  color?: 'green' | 'yellow' | 'red' | 'gray' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'default', color, className }: BadgeProps) {
  const variants = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  const colorVariants = {
    green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    gray: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  const selectedVariant = color ? colorVariants[color] : variants[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1',
        'rounded-full text-xs font-medium border',
        'whitespace-nowrap',
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
