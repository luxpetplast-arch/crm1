import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        // Mobile-first sizing with touch-friendly targets
        size === 'sm' && 'px-3 py-2 text-sm min-h-[40px] sm:min-h-[36px]',
        size === 'md' && 'px-4 py-2.5 text-sm sm:text-base min-h-[44px] sm:min-h-[40px]',
        size === 'lg' && 'px-6 py-3 text-base sm:text-lg min-h-[48px] sm:min-h-[44px]',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        variant === 'outline' && 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Default export for backward compatibility
export default Button;
