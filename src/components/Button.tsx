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
        'rounded-[1.5rem] font-black tracking-widest uppercase transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:grayscale inline-flex items-center justify-center gap-3 whitespace-nowrap',
        // Sizing
        size === 'sm' && 'px-5 py-2.5 text-[10px] min-h-[44px]',
        size === 'md' && 'px-8 py-4 text-xs min-h-[52px]',
        size === 'lg' && 'px-12 py-6 text-sm min-h-[64px]',
        
        // Variants
        variant === 'primary' && 'bg-blue-600 text-white shadow-[0_15px_40px_rgba(37,99,235,0.25)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.35)] hover:bg-blue-700',
        variant === 'secondary' && 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
        variant === 'destructive' && 'bg-rose-500 text-white shadow-[0_15px_40px_rgba(244,63,94,0.25)] hover:bg-rose-600',
        variant === 'outline' && 'border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent',
        variant === 'ghost' && 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800',
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
