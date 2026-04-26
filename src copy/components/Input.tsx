import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  numeric?: boolean;
  decimal?: boolean;
}

export function Input({ label, icon, className, numeric, decimal, type, onChange, value, name, id, ...props }: InputProps) {
  // numeric yoki decimal bo'lsa, text type bilan ishlaydi
  const inputType = (numeric || decimal) ? 'text' : type;
  const inputMode = (numeric || decimal) ? 'decimal' : undefined;
  
  // 0 ni bo'sh ko'rsatish (faqat integer numeric uchun)
  const stringValue = value === undefined || value === null ? '' : String(value);
  const displayValue = numeric && !decimal && stringValue === "0" ? "" : stringValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      if (numeric && !decimal) {
        // Faqat butun raqamlarni qoldirish
        const newValue = e.target.value.replace(/\D/g, '');
        e.target.value = newValue;
      } else if (decimal) {
        // O'nli kasrlarni qo'llab-quvvatlash (faqat raqam va nuqta)
        const newValue = e.target.value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
        e.target.value = newValue;
      }
    }
    onChange?.(e);
  };

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
          type={inputType}
          inputMode={inputMode}
          value={displayValue}
          onChange={handleChange}
          name={name}
          id={id}
          placeholder={(numeric || decimal) ? "0" : props.placeholder}
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
