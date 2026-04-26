import { ReactNode, forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface ProfessionalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'default' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

const ProfessionalInput = forwardRef<HTMLInputElement, ProfessionalInputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default', 
    size = 'md', 
    ...props 
  }, ref) => {
    const baseInputClasses = 'w-full rounded-xl border font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const variantClasses = {
      default: 'bg-white border-neutral-200 focus:border-primary-500',
      glass: 'professional-glass border-white/20 focus:border-primary-400 bg-white/80',
      minimal: 'bg-neutral-50 border-neutral-200 focus:border-primary-500'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-3 text-sm',
      lg: 'px-5 py-4 text-base'
    };
    
    const errorClasses = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : '';
    
    const iconPaddingClasses = {
      left: leftIcon ? 'pl-12' : '',
      right: rightIcon ? 'pr-12' : ''
    };
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-bold text-neutral-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              baseInputClasses,
              variantClasses[variant],
              sizeClasses[size],
              errorClasses,
              iconPaddingClasses.left,
              iconPaddingClasses.right,
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm font-medium text-error-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-error-600 rounded-full"></span>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ProfessionalInput.displayName = 'ProfessionalInput';

export default ProfessionalInput;
