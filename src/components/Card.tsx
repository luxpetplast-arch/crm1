import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white dark:border-gray-800 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)]',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className
      )} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, onClick }: CardProps) {
  return (
    <div 
      className={cn(
        'p-10 border-b border-gray-100 dark:border-gray-800', 
        onClick && 'cursor-pointer', 
        className
      )} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, onClick }: CardProps) {
  return (
    <h3 
      className={cn(
        'text-2xl font-black tracking-tight uppercase text-gray-900 dark:text-white',
        onClick && 'cursor-pointer hover:text-blue-600 transition-colors', 
        className
      )} 
      onClick={onClick}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className, onClick }: CardProps) {
  return (
    <div 
      className={cn(
        'p-10',
        onClick && 'cursor-pointer', 
        className
      )} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}
