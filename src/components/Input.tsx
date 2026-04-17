import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
}

export function Input({ label, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-3">
      {label && <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-accent-600 transition-colors duration-500 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'ultra-input',
            icon ? 'pl-14 pr-5' : 'px-5',
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
