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
        'ultra-button',
        // Variants mapping to ultra-modern classes
        variant === 'primary' && '',
        variant === 'secondary' && 'secondary',
        variant === 'destructive' && 'error',
        variant === 'outline' && 'outline',
        variant === 'ghost' && 'ghost',
        // Size adjustments
        size === 'sm' && 'text-xs px-3 py-2 min-h-[2.5rem]',
        size === 'md' && 'text-sm px-4 py-3 min-h-[3rem]',
        size === 'lg' && 'text-base px-6 py-4 min-h-[3.5rem]',
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
