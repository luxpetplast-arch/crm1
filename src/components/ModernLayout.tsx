import { ReactNode } from 'react';

interface ModernLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function ModernLayout({ children, title, subtitle }: ModernLayoutProps) {
  return (
    <div className="modern-bg page-container">
      <div className="content-wrapper">
        {(title || subtitle) && (
          <div className="glass-card p-6 mb-8 fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <div>
                {title && <h1 className="text-2xl font-bold text-primary">{title}</h1>}
                {subtitle && <p className="text-secondary">{subtitle}</p>}
              </div>
            </div>
          </div>
        )}
        
        <div className="glass-card p-8 slide-up">
          {children}
        </div>
      </div>
    </div>
  );
}
