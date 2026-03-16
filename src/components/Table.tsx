import { ReactNode } from 'react';
import { cn } from '../lib/utils';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className={cn('w-full', className)}>{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-muted/50 border-b border-border">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr 
      className={cn(
        'hover:bg-muted/30 transition-colors active:bg-muted/50',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th 
      className={cn(
        'px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td 
      className={cn(
        'px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm',
        className
      )}
    >
      {children}
    </td>
  );
}
