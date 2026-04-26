import { Clock, Calendar } from 'lucide-react';
import { formatDateTime, formatSmartDate, formatRelativeTime, formatFullDate } from '../lib/dateUtils';

interface TimeStampProps {
  date: Date | string;
  format?: 'full' | 'smart' | 'relative' | 'datetime' | 'detailed';
  showIcon?: boolean;
  className?: string;
}

export default function TimeStamp({ 
  date, 
  format = 'smart', 
  showIcon = true,
  className = '' 
}: TimeStampProps) {
  const getFormattedDate = () => {
    switch (format) {
      case 'full':
        return formatFullDate(date);
      case 'smart':
        return formatSmartDate(date);
      case 'relative':
        return formatRelativeTime(date);
      case 'datetime':
        return formatDateTime(date);
      case 'detailed':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>{formatFullDate(date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{formatDateTime(date)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatRelativeTime(date)}
            </div>
          </div>
        );
      default:
        return formatSmartDate(date);
    }
  };

  if (format === 'detailed') {
    return <div className={className}>{getFormattedDate()}</div>;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Clock className="w-4 h-4 text-muted-foreground" />}
      <span title={formatDateTime(date)}>{getFormattedDate()}</span>
    </div>
  );
}

// Qisqa variant - faqat vaqt
export function TimeOnly({ date, className = '' }: { date: Date | string; className?: string }) {
  return (
    <TimeStamp 
      date={date} 
      format="datetime" 
      showIcon={true}
      className={`text-sm text-muted-foreground ${className}`}
    />
  );
}

// Nisbiy vaqt - "5 daqiqa oldin"
export function RelativeTime({ date, className = '' }: { date: Date | string; className?: string }) {
  return (
    <TimeStamp 
      date={date} 
      format="relative" 
      showIcon={false}
      className={`text-xs text-muted-foreground ${className}`}
    />
  );
}

// To'liq ma'lumot
export function DetailedTime({ date, className = '' }: { date: Date | string; className?: string }) {
  return (
    <TimeStamp 
      date={date} 
      format="detailed" 
      showIcon={false}
      className={className}
    />
  );
}
