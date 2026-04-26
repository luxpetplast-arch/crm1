import { ShoppingCart, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import type { SalesStats as SalesStatsType } from '../../hooks/useSales';

interface SalesStatsCardsProps {
  stats: SalesStatsType;
  latinToCyrillic: (text: string) => string;
}

export const SalesStatsCards = ({ stats, latinToCyrillic }: SalesStatsCardsProps) => {
  const cards = [
    {
      icon: ShoppingCart,
      label: 'Jami',
      value: stats.totalSales,
      sublabel: 'ta sotuv',
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25',
    },
    {
      icon: TrendingUp,
      label: 'USD',
      value: `$${stats.totalRevenue.toFixed(0)}`,
      sublabel: 'Daromad',
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
    },
    {
      icon: CreditCard,
      label: 'Naqt',
      value: `$${stats.totalPaid.toFixed(0)}`,
      sublabel: "To'langan",
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/25',
    },
    {
      icon: AlertCircle,
      label: 'Qarz',
      value: `$${stats.totalDebt.toFixed(0)}`,
      sublabel: 'Qarzdorlik',
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/25',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 shadow-lg ${card.shadow} hover:shadow-xl transition-all hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded-full">
              {card.label}
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{card.value}</p>
          <p className="text-sm text-white/80 mt-1">{latinToCyrillic(card.sublabel)}</p>
        </div>
      ))}
    </div>
  );
};

export default SalesStatsCards;
