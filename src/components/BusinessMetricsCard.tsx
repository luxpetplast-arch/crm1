import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { formatCurrency } from '../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Target,
  Activity,
  Percent
} from 'lucide-react';

interface MetricItemProps {
  label: string;
  value: number | string;
  format?: 'currency' | 'number' | 'percent';
  icon?: any;
  trend?: number;
  color?: string;
}

function MetricItem({ label, value, format = 'number', icon: Icon, trend, color = 'blue' }: MetricItemProps) {
  const formatValue = () => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return formatCurrency(value, 'USD');
      case 'percent':
        return `${value.toFixed(2)}%`;
      default:
        return value.toLocaleString('uz-UZ', { maximumFractionDigits: 2 });
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 bg-${color}-100 dark:bg-${color}-900 rounded-lg`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{formatValue()}</p>
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

interface BusinessMetricsCardProps {
  metrics: any;
}

export default function BusinessMetricsCard({ metrics }: BusinessMetricsCardProps) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* 1. SAVDO METRIKALARI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Savdo Metrikalari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricItem
              label="Sotilgan Mahsulot"
              value={metrics.sales?.salesVolume || 0}
              format="number"
              icon={Package}
              color="blue"
            />
            <MetricItem
              label="Daromad"
              value={metrics.sales?.revenue || 0}
              format="currency"
              icon={DollarSign}
              trend={metrics.sales?.salesGrowthRate}
              color="green"
            />
            <MetricItem
              label="O'rtacha Buyurtma"
              value={metrics.sales?.averageOrderValue || 0}
              format="currency"
              icon={Target}
              color="purple"
            />
            <MetricItem
              label="Kunlik Sotuv"
              value={metrics.sales?.salesPerDay || 0}
              format="currency"
              icon={Activity}
              color="orange"
            />
            <MetricItem
              label="Mijoz boshiga"
              value={metrics.sales?.salesPerCustomer || 0}
              format="currency"
              icon={Users}
              color="pink"
            />
            <MetricItem
              label="Konversiya"
              value={metrics.sales?.conversionRate || 0}
              format="percent"
              icon={Percent}
              color="indigo"
            />
            <MetricItem
              label="Qayta Xarid"
              value={metrics.sales?.repeatPurchaseRate || 0}
              format="percent"
              icon={TrendingUp}
              color="teal"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. MAHSULOT METRIKALARI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Mahsulot Metrikalari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricItem
              label="Sotilgan Tovar Narxi (COGS)"
              value={metrics.product?.costOfGoodsSold || 0}
              format="currency"
              icon={DollarSign}
              color="red"
            />
            <MetricItem
              label="Birlik Narxi"
              value={metrics.product?.unitCost || 0}
              format="currency"
              icon={Package}
              color="orange"
            />
            <MetricItem
              label="Birlik Foydasi"
              value={metrics.product?.unitProfit || 0}
              format="currency"
              icon={TrendingUp}
              color="green"
            />
            <MetricItem
              label="Yalpi Foyda"
              value={metrics.product?.grossProfit || 0}
              format="currency"
              icon={DollarSign}
              color="emerald"
            />
            <MetricItem
              label="Yalpi Marja"
              value={metrics.product?.grossMargin || 0}
              format="percent"
              icon={Percent}
              color="blue"
            />
            <MetricItem
              label="Ombor Aylanishi"
              value={metrics.product?.inventoryTurnover || 0}
              format="number"
              icon={Activity}
              color="purple"
            />
            <MetricItem
              label="Omborda Turish (kun)"
              value={metrics.product?.stockDays || 0}
              format="number"
              icon={Package}
              color="yellow"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. FOYDA VA RENTABELLIK */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Foyda va Rentabellik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricItem
              label="Sof Foyda"
              value={metrics.profitability?.netProfit || 0}
              format="currency"
              icon={DollarSign}
              color="green"
            />
            <MetricItem
              label="Sof Foyda Marjasi"
              value={metrics.profitability?.netProfitMargin || 0}
              format="percent"
              icon={Percent}
              color="emerald"
            />
            <MetricItem
              label="Operatsion Foyda"
              value={metrics.profitability?.operatingProfit || 0}
              format="currency"
              icon={Activity}
              color="blue"
            />
            <MetricItem
              label="Operatsion Marja"
              value={metrics.profitability?.operatingMargin || 0}
              format="percent"
              icon={Percent}
              color="indigo"
            />
            <MetricItem
              label="ROI (Investitsiya Qaytimi)"
              value={metrics.profitability?.roi || 0}
              format="percent"
              icon={TrendingUp}
              color="purple"
            />
            <MetricItem
              label="Break-even Nuqtasi"
              value={metrics.profitability?.breakEvenPoint || 0}
              format="number"
              icon={Target}
              color="orange"
            />
            <MetricItem
              label="Birlik Hissasi"
              value={metrics.profitability?.contributionPerUnit || 0}
              format="currency"
              icon={Package}
              color="pink"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. MARKETING VA MIJOZLAR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Marketing va Mijozlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricItem
              label="Mijoz Jalb Qilish Narxi (CAC)"
              value={metrics.marketing?.customerAcquisitionCost || 0}
              format="currency"
              icon={DollarSign}
              color="red"
            />
            <MetricItem
              label="Mijoz Umr Qiymati (LTV)"
              value={metrics.marketing?.customerLifetimeValue || 0}
              format="currency"
              icon={TrendingUp}
              color="green"
            />
            <MetricItem
              label="LTV/CAC Nisbati"
              value={metrics.marketing?.ltvCacRatio || 0}
              format="number"
              icon={Activity}
              color="blue"
            />
            <MetricItem
              label="Mijoz Saqlanishi"
              value={metrics.marketing?.customerRetentionRate || 0}
              format="percent"
              icon={Users}
              color="emerald"
            />
            <MetricItem
              label="Churn Rate (Ketish)"
              value={metrics.marketing?.churnRate || 0}
              format="percent"
              icon={TrendingDown}
              color="red"
            />
            <MetricItem
              label="Marketing ROI"
              value={metrics.marketing?.marketingROI || 0}
              format="percent"
              icon={Target}
              color="purple"
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. QARZDORLIK */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            Qarzdorlik Metrikalari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricItem
              label="Jami Qarz"
              value={metrics.debt?.totalDebt || 0}
              format="currency"
              icon={DollarSign}
              color="red"
            />
            <MetricItem
              label="Qarz Nisbati"
              value={metrics.debt?.debtRatio || 0}
              format="percent"
              icon={Percent}
              color="orange"
            />
            <MetricItem
              label="Debitorlik Qarzi"
              value={metrics.debt?.accountsReceivable || 0}
              format="currency"
              icon={Users}
              color="yellow"
            />
            <MetricItem
              label="Qarz Aylanishi"
              value={metrics.debt?.receivableTurnover || 0}
              format="number"
              icon={Activity}
              color="blue"
            />
            <MetricItem
              label="DSO (Kunlar)"
              value={metrics.debt?.daysSalesOutstanding || 0}
              format="number"
              icon={Target}
              color="purple"
            />
            <MetricItem
              label="Yomon Qarz %"
              value={metrics.debt?.badDebtRatio || 0}
              format="percent"
              icon={TrendingDown}
              color="red"
            />
          </div>
        </CardContent>
      </Card>

      {/* 6. PUL OQIMI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Pul Oqimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricItem
              label="Operatsion Pul Oqimi"
              value={metrics.cashFlow?.operatingCashFlow || 0}
              format="currency"
              icon={DollarSign}
              color="blue"
            />
            <MetricItem
              label="Erkin Pul Oqimi"
              value={metrics.cashFlow?.freeCashFlow || 0}
              format="currency"
              icon={TrendingUp}
              color="green"
            />
            <MetricItem
              label="Pul Konversiya Sikli"
              value={metrics.cashFlow?.cashConversionCycle || 0}
              format="number"
              icon={Activity}
              color="purple"
            />
          </div>
        </CardContent>
      </Card>

      {/* 7. OPERATSION SAMARADORLIK */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Operatsion Samaradorlik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricItem
              label="Xodim Samaradorligi"
              value={metrics.operational?.employeeProductivity || 0}
              format="number"
              icon={Users}
              color="blue"
            />
            <MetricItem
              label="Xodim boshiga Daromad"
              value={metrics.operational?.revenuePerEmployee || 0}
              format="currency"
              icon={DollarSign}
              color="green"
            />
            <MetricItem
              label="Buyurtma Bajarish Vaqti (soat)"
              value={metrics.operational?.orderFulfillmentTime || 0}
              format="number"
              icon={Activity}
              color="orange"
            />
            <MetricItem
              label="O'z Vaqtida Yetkazish"
              value={metrics.operational?.onTimeDeliveryRate || 0}
              format="percent"
              icon={Target}
              color="emerald"
            />
          </div>
        </CardContent>
      </Card>

      {/* 8. STRATEGIK O'SISH */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Strategik O'sish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricItem
              label="Mijozlar O'sishi"
              value={metrics.growth?.customerGrowthRate || 0}
              format="percent"
              icon={Users}
              trend={metrics.growth?.customerGrowthRate}
              color="blue"
            />
            <MetricItem
              label="Mahsulotlar O'sishi"
              value={metrics.growth?.productGrowthRate || 0}
              format="percent"
              icon={Package}
              trend={metrics.growth?.productGrowthRate}
              color="purple"
            />
            <MetricItem
              label="Yangi Mijozlar"
              value={metrics.growth?.newVsReturningCustomers?.new || 0}
              format="number"
              icon={TrendingUp}
              color="green"
            />
            <MetricItem
              label="Qaytgan Mijozlar"
              value={metrics.growth?.newVsReturningCustomers?.returning || 0}
              format="number"
              icon={Users}
              color="orange"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
