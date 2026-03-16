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
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
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
        'rounded-t-2xl sm:rounded-lg',
        'max-h-[90vh] sm:max-h-[85vh]',
        'flex flex-col',
        'animate-slide-up sm:animate-fade-in',
        sizeClasses[size]
      )}>
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card z-10 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold pr-8">{title}</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 sm:top-6 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-lg active:scale-95"
            aria-label="Yopish"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default Modal;
