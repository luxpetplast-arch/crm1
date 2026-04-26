import { SelectHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-bold text-foreground/80 ml-1 block">{label}</label>}
      <div className="relative group">
        <select
          className={cn(
            'w-full px-4 py-3 text-sm font-medium bg-background border-2 border-border/50 rounded-xl appearance-none cursor-pointer',
            'focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary',
            'transition-all duration-300 min-h-[48px]',
            'hover:border-border group-hover:border-primary/30',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="py-2">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
