import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
}

export function Input({ label, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      {label && <label className="text-xs sm:text-sm font-medium block">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{icon}</div>}
        <input
          className={cn(
            'w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-background border-2 border-border rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'transition-all min-h-[44px] sm:min-h-[40px]',
            'placeholder:text-muted-foreground/60',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default Input;
