import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, onClick, style }: CardProps) {
  return (
    <div 
      className={cn(
        'ultra-card',
        onClick && 'cursor-pointer interactive',
        className
      )} 
      onClick={onClick}
      style={style}
    >
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ children, className, onClick }: CardProps) {
  return (
    <div 
      className={cn(
        'px-6 py-4 border-b border-gray-100', 
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
        'text-lg font-semibold text-gray-900',
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
        'px-6 py-4',
        onClick && 'cursor-pointer', 
        className
      )} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}
