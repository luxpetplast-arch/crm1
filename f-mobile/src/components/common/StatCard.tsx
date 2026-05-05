import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const colorClasses = {
  blue: 'border-l-[var(--accent-primary)]',
  green: 'border-l-[var(--accent-success)]',
  purple: 'border-l-purple-500',
  orange: 'border-l-[var(--accent-warning)]',
  red: 'border-l-red-500',
}

const iconColorClasses = {
  blue: 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10',
  green: 'text-[var(--accent-success)] bg-[var(--accent-success)]/10',
  purple: 'text-purple-500 bg-purple-500/10',
  orange: 'text-[var(--accent-warning)] bg-[var(--accent-warning)]/10',
  red: 'text-red-500 bg-red-500/10',
}

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color = 'blue',
}: StatCardProps) {
  const [textColor, bgColor] = iconColorClasses[color].split(' ')
  
  return (
    <div className={`card-glass rounded-lg p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-secondary)] text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{String(value)}</p>
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </div>
  )
}
