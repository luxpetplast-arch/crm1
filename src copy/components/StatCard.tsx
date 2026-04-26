import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon: Icon, iconColor = 'text-blue-500', description, trend }: StatCardProps) {
  // Determine gradient colors based on icon color
  const getGradientColors = () => {
    if (iconColor.includes('blue')) return 'from-blue-400 to-blue-600';
    if (iconColor.includes('emerald') || iconColor.includes('green')) return 'from-emerald-400 to-emerald-600';
    if (iconColor.includes('amber') || iconColor.includes('yellow')) return 'from-amber-400 to-amber-600';
    if (iconColor.includes('violet') || iconColor.includes('purple')) return 'from-violet-400 to-violet-600';
    if (iconColor.includes('rose') || iconColor.includes('red')) return 'from-rose-400 to-rose-600';
    return 'from-blue-400 to-blue-600';
  };

  const gradientColors = getGradientColors();

  return (
    <div className="glass-card hover-lift group">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{value}</p>

            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                  trend.isPositive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                )}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
              {description && (
                <span className="text-xs text-gray-500">{description}</span>
              )}
            </div>
          </div>

          <div className={cn(
            'p-4 rounded-xl bg-gradient-to-br shadow-lg group-hover:shadow-glow group-hover:scale-110 transition-all duration-300',
            gradientColors
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Bottom gradient border effect */}
      <div className={cn(
        'h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r',
        gradientColors
      )} />
    </div>
  );
}
