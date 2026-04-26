import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-lg',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className={cn(
        'relative bg-card border border-border shadow-2xl w-full',
        'rounded-t-2xl sm:rounded-2xl',
        'max-h-[90vh] sm:max-h-[85vh]',
        'flex flex-col',
        'animate-slide-up sm:animate-fade-in',
        sizeClasses[size]
      )}>
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border sticky top-0 bg-card z-10 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold pr-8">{title}</h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-6 sm:top-8 text-muted-foreground hover:text-foreground transition-colors p-3 hover:bg-accent rounded-xl active:scale-95"
            aria-label="Yopish"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default Modal;
