import { ReactNode, forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface ProfessionalBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
}

const ProfessionalBadge = forwardRef<HTMLDivElement, ProfessionalBadgeProps>(
  ({ className, children, variant = 'primary', size = 'md', dot = false, pulse = false, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center gap-2 font-bold uppercase tracking-wider border transition-all duration-300';
    
    const variantClasses = {
      primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-400 shadow-lg shadow-primary-500/30',
      secondary: 'bg-gradient-to-r from-neutral-500 to-neutral-600 text-white border-neutral-400 shadow-md shadow-neutral-500/30',
      success: 'bg-gradient-to-r from-success-500 to-success-600 text-white border-success-400 shadow-lg shadow-success-500/30',
      warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white border-warning-400 shadow-lg shadow-warning-500/30',
      error: 'bg-gradient-to-r from-error-500 to-error-600 text-white border-error-400 shadow-lg shadow-error-500/30',
      neutral: 'bg-gradient-to-r from-neutral-400 to-neutral-500 text-white border-neutral-300 shadow-md shadow-neutral-400/30',
      info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 shadow-lg shadow-blue-500/30'
    };
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs rounded-lg',
      md: 'px-3 py-1.5 text-sm rounded-xl',
      lg: 'px-4 py-2 text-base rounded-2xl'
    };
    
    const pulseClasses = pulse ? 'animate-pulse' : '';
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          pulseClasses,
          className
        )}
        {...props}
      >
        {dot && (
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
        <span className="relative z-10">{children}</span>
      </div>
    );
  }
);

ProfessionalBadge.displayName = 'ProfessionalBadge';

export default ProfessionalBadge;
