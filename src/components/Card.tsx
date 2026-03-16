import { ReactNode } from 'react';
import { cn } from '../lib/utils';

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div 
      className={cn(
        'bg-card border border-border rounded-lg p-4 sm:p-6',
        'transition-all duration-200',
        onClick && 'cursor-pointer active:scale-[0.98] hover:shadow-md',
        className
      )} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div 
      className={cn(
        'mb-3 sm:mb-4', 
        onClick && 'cursor-pointer', 
        className
      )} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <h3 
      className={cn(
        'text-base sm:text-lg font-semibold leading-tight',
        onClick && 'cursor-pointer hover:text-primary transition-colors', 
        className
      )} 
      onClick={onClick}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div 
      className={cn(
        'text-sm sm:text-base',
        onClick && 'cursor-pointer', 
        className
      )} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}
