import { ReactNode, forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface ProfessionalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'minimal';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const ProfessionalCard = forwardRef<HTMLDivElement, ProfessionalCardProps>(
  ({ className, children, variant = 'default', hover = true, padding = 'md', shadow = 'lg', ...props }, ref) => {
    const baseClasses = 'rounded-2xl border transition-all duration-300';
    
    const variantClasses = {
      default: 'bg-white border-neutral-200',
      glass: 'professional-glass border-white/20',
      gradient: 'bg-gradient-to-br from-white via-neutral-50 to-neutral-100 border-neutral-200',
      minimal: 'bg-neutral-50 border-neutral-100'
    };
    
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };
    
    const shadowClasses = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl'
    };
    
    const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 hover:border-primary-200' : '';
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          shadowClasses[shadow],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ProfessionalCard.displayName = 'ProfessionalCard';

export default ProfessionalCard;
