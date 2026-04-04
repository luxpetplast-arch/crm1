import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
}

export function Input({ label, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-3">
      {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-500 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full h-16 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl font-black text-sm transition-all outline-none',
            'placeholder:text-gray-400 placeholder:font-bold',
            'hover:bg-gray-100 dark:hover:bg-gray-700/50 shadow-sm focus:shadow-xl focus:shadow-blue-500/10',
            icon ? 'pl-16 pr-6' : 'px-6',
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
