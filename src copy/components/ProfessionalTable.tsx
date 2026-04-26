import { ReactNode, forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface ProfessionalTableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  variant?: 'default' | 'bordered' | 'striped' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export interface ProfessionalTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export interface ProfessionalTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export interface ProfessionalTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  hover?: boolean;
  selected?: boolean;
}

export interface ProfessionalTableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  variant?: 'default' | 'header' | 'data';
  align?: 'left' | 'center' | 'right';
  width?: string;
}

const ProfessionalTable = forwardRef<HTMLTableElement, ProfessionalTableProps>(
  ({ className, children, variant = 'default', size = 'md', hover = true, ...props }, ref) => {
    const baseClasses = 'w-full rounded-2xl overflow-hidden transition-all duration-300';
    
    const variantClasses = {
      default: 'professional-glass border border-white/20 shadow-lg',
      bordered: 'bg-white border-2 border-neutral-200 shadow-lg',
      striped: 'bg-white border border-neutral-200 shadow-md',
      minimal: 'bg-transparent border border-neutral-100'
    };
    
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };
    
    return (
      <div className="overflow-hidden rounded-2xl">
        <table
          ref={ref}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

const ProfessionalTableHeader = forwardRef<HTMLTableSectionElement, ProfessionalTableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          'bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200',
          className
        )}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

const ProfessionalTableBody = forwardRef<HTMLTableSectionElement, ProfessionalTableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn(
          'divide-y divide-neutral-100',
          className
        )}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

const ProfessionalTableRow = forwardRef<HTMLTableRowElement, ProfessionalTableRowProps>(
  ({ className, children, hover = true, selected = false, ...props }, ref) => {
    const baseClasses = 'transition-all duration-200';
    
    const hoverClasses = hover ? 'hover:bg-primary-50 hover:scale-[1.01]' : '';
    const selectedClasses = selected ? 'bg-primary-100 border-l-4 border-primary-500' : '';
    
    return (
      <tr
        ref={ref}
        className={cn(
          baseClasses,
          hoverClasses,
          selectedClasses,
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

const ProfessionalTableCell = forwardRef<HTMLTableCellElement, ProfessionalTableCellProps>(
  ({ className, children, variant = 'data', align = 'left', width, ...props }, ref) => {
    const baseClasses = 'px-6 py-4 transition-colors duration-200';
    
    const variantClasses = {
      header: 'font-bold text-xs uppercase tracking-wider text-primary-900',
      data: 'text-neutral-700',
      default: 'text-neutral-700'
    };
    
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    
    return (
      <td
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          alignClasses[align],
          width && `w-[${width}]`,
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);

ProfessionalTable.displayName = 'ProfessionalTable';
ProfessionalTableHeader.displayName = 'ProfessionalTableHeader';
ProfessionalTableBody.displayName = 'ProfessionalTableBody';
ProfessionalTableRow.displayName = 'ProfessionalTableRow';
ProfessionalTableCell.displayName = 'ProfessionalTableCell';

export {
  ProfessionalTable,
  ProfessionalTableHeader,
  ProfessionalTableBody,
  ProfessionalTableRow,
  ProfessionalTableCell
};
