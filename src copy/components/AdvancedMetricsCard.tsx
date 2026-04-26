import { Card, CardContent } from './Card';
import { 
  Users, 
  Package, 
  Clock,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface AdvancedMetricsCardProps {
  metrics: any;
}

export default function AdvancedMetricsCard({ metrics }: AdvancedMetricsCardProps) {
  if (!metrics) return null;

  const getRiskColor = (score: number) => {
    if (score > 60) return 'text-red-600';
    if (score > 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getGrowthColor = (score: number) => {
    if (score > 70) return 'text-green-600';
    if (score > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Customer Lifetime Value */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Mijoz Hayotiy Qiymati
            </span>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(metrics.customerLifetimeValue, 'USD')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            O'rtacha har bir mijozdan
          </p>
        </CardContent>
      </Card>

      {/* Retention Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Mijozlarni Saqlab Qolish
            </span>
          </div>
          <p className="text-2xl font-bold">
            {metrics.customerRetentionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-red-600 mt-1">
            Churn: {metrics.churnRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Inventory Turnover */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Inventar Aylanishi
            </span>
          </div>
          <p className="text-2xl font-bold">
            {metrics.inventoryTurnoverRatio.toFixed(1)}x
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Yiliga
          </p>
        </CardContent>
      </Card>

      {/* Cash Conversion Cycle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Naqd Pul Aylanishi
            </span>
          </div>
          <p className="text-2xl font-bold">
            {metrics.cashConversionCycle.toFixed(0)} kun
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pul qaytish davri
          </p>
        </CardContent>
      </Card>

      {/* ROI */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Investitsiya Rentabelligi
            </span>
          </div>
          <p className="text-2xl font-bold">
            {metrics.returnOnInvestment.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ROI
          </p>
        </CardContent>
      </Card>

      {/* Risk & Growth */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Xavf va O'sish
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg font-bold ${getRiskColor(metrics.riskScore)}`}>
                Xavf: {metrics.riskScore.toFixed(0)}
              </p>
            </div>
            <div>
              <p className={`text-lg font-bold ${getGrowthColor(metrics.growthPotential)}`}>
                O'sish: {metrics.growthPotential.toFixed(0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            0-100 shkala
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
