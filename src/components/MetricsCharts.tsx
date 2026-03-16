
import { BarChart, Bar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  DollarSign, Users, Percent, TrendingUp, TrendingDown, Package, 
  ShoppingCart, Target, Award, Zap, Activity, Clock, AlertCircle,
  CheckCircle, CreditCard, Wallet, PiggyBank,
  ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react';
import { Card } from './Card';
import { formatCurrency } from '../lib/utils';

interface MetricsChartsProps {
  metrics: any;
}

// Individual Metric Card Component
function MetricCard({ 
  title, 
  value, 
  percentage, 
  icon: Icon, 
  color, 
  trend,
  chartData,
  chartType = 'line'
}: any) {
  const isPositive = trend >= 0;
  
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        {percentage !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(percentage).toFixed(1)}%
          </div>
        )}
      </div>
      
      {chartData && chartData.length > 0 && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={`var(--${color}-600)`} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <Bar dataKey="value" fill={`var(--${color}-600)`} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
      
      {trend !== undefined && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Trend: <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </p>
        </div>
      )}
    </Card>
  );
}

export default function MetricsCharts({ metrics }: MetricsChartsProps) {
  if (!metrics) return null;

  const { sales, product, profitability, marketing, debt, cashFlow, operational, growth } = metrics;

  // Generate mini chart data
  const generateMiniChartData = (value: number) => {
    return Array.from({ length: 7 }, () => ({
      value: value * (0.8 + Math.random() * 0.4)
    }));
  };

  return (
    <div className="space-y-8">
      {/* 1. SAVDO METRIKALARI (8 ta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          Savdo Metrikalari
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Savdo Hajmi"
            value={sales?.salesVolume?.toLocaleString() || 0}
            percentage={sales?.salesGrowthRate}
            icon={ShoppingCart}
            color="blue"
            trend={sales?.salesGrowthRate}
            chartData={generateMiniChartData(sales?.salesVolume || 0)}
          />
          <MetricCard
            title="Daromad"
            value={formatCurrency(sales?.revenue || 0, 'USD')}
            percentage={sales?.salesGrowthRate}
            icon={DollarSign}
            color="green"
            trend={sales?.salesGrowthRate}
            chartData={generateMiniChartData(sales?.revenue || 0)}
          />
          <MetricCard
            title="O'rtacha Buyurtma"
            value={formatCurrency(sales?.averageOrderValue || 0, 'USD')}
            icon={Target}
            color="purple"
            chartData={generateMiniChartData(sales?.averageOrderValue || 0)}
          />
          <MetricCard
            title="Savdo O'sishi"
            value={`${sales?.salesGrowthRate?.toFixed(1) || 0}%`}
            percentage={sales?.salesGrowthRate}
            icon={TrendingUp}
            color="emerald"
            trend={sales?.salesGrowthRate}
          />
          <MetricCard
            title="Mijoz Boshiga Sotuv"
            value={formatCurrency(sales?.salesPerCustomer || 0, 'USD')}
            icon={Users}
            color="indigo"
            chartData={generateMiniChartData(sales?.salesPerCustomer || 0)}
          />
          <MetricCard
            title="Kunlik Sotuv"
            value={formatCurrency(sales?.salesPerDay || 0, 'USD')}
            icon={Calendar}
            color="cyan"
            chartData={generateMiniChartData(sales?.salesPerDay || 0)}
            chartType="bar"
          />
          <MetricCard
            title="Konversiya"
            value={`${sales?.conversionRate?.toFixed(1) || 0}%`}
            icon={Zap}
            color="yellow"
            chartData={generateMiniChartData(sales?.conversionRate || 0)}
          />
          <MetricCard
            title="Qayta Xarid"
            value={`${sales?.repeatPurchaseRate?.toFixed(1) || 0}%`}
            icon={Activity}
            color="pink"
            chartData={generateMiniChartData(sales?.repeatPurchaseRate || 0)}
          />
        </div>
      </div>

      {/* 2. MAHSULOT METRIKALARI (8 ta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-purple-600" />
          Mahsulot Metrikalari
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Sotilgan Mahsulot Qiymati"
            value={formatCurrency(product?.costOfGoodsSold || 0, 'USD')}
            icon={Package}
            color="purple"
            chartData={generateMiniChartData(product?.costOfGoodsSold || 0)}
          />
          <MetricCard
            title="Birlik Narxi"
            value={formatCurrency(product?.unitCost || 0, 'USD')}
            icon={DollarSign}
            color="blue"
            chartData={generateMiniChartData(product?.unitCost || 0)}
          />
          <MetricCard
            title="Birlik Foydasi"
            value={formatCurrency(product?.unitProfit || 0, 'USD')}
            icon={TrendingUp}
            color="green"
            chartData={generateMiniChartData(product?.unitProfit || 0)}
          />
          <MetricCard
            title="Yalpi Foyda"
            value={formatCurrency(product?.grossProfit || 0, 'USD')}
            icon={Award}
            color="emerald"
            chartData={generateMiniChartData(product?.grossProfit || 0)}
          />
          <MetricCard
            title="Yalpi Marja"
            value={`${product?.grossMargin?.toFixed(1) || 0}%`}
            icon={Percent}
            color="indigo"
            chartData={generateMiniChartData(product?.grossMargin || 0)}
          />
          <MetricCard
            title="Hissa Marjasi"
            value={`${product?.contributionMargin?.toFixed(1) || 0}%`}
            icon={PieChart}
            color="cyan"
            chartData={generateMiniChartData(product?.contributionMargin || 0)}
          />
          <MetricCard
            title="Ombor Aylanishi"
            value={product?.inventoryTurnover?.toFixed(2) || 0}
            icon={Activity}
            color="yellow"
            chartData={generateMiniChartData(product?.inventoryTurnover || 0)}
          />
          <MetricCard
            title="Ombor Kunlari"
            value={`${product?.stockDays?.toFixed(0) || 0} kun`}
            icon={Clock}
            color="orange"
            chartData={generateMiniChartData(product?.stockDays || 0)}
          />
        </div>
      </div>

      {/* 3. FOYDA VA RENTABELLIK (7 ta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Foyda va Rentabellik
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Sof Foyda"
            value={formatCurrency(profitability?.netProfit || 0, 'USD')}
            percentage={profitability?.netProfitMargin}
            icon={DollarSign}
            color="green"
            trend={profitability?.netProfitMargin}
            chartData={generateMiniChartData(profitability?.netProfit || 0)}
          />
          <MetricCard
            title="Sof Foyda Marjasi"
            value={`${profitability?.netProfitMargin?.toFixed(1) || 0}%`}
            icon={Percent}
            color="emerald"
            chartData={generateMiniChartData(profitability?.netProfitMargin || 0)}
          />
          <MetricCard
            title="Operatsion Foyda"
            value={formatCurrency(profitability?.operatingProfit || 0, 'USD')}
            icon={BarChart}
            color="blue"
            chartData={generateMiniChartData(profitability?.operatingProfit || 0)}
          />
          <MetricCard
            title="Operatsion Marja"
            value={`${profitability?.operatingMargin?.toFixed(1) || 0}%`}
            icon={PieChart}
            color="indigo"
            chartData={generateMiniChartData(profitability?.operatingMargin || 0)}
          />
          <MetricCard
            title="ROI"
            value={`${profitability?.roi?.toFixed(1) || 0}%`}
            icon={Target}
            color="purple"
            chartData={generateMiniChartData(profitability?.roi || 0)}
          />
          <MetricCard
            title="Break-Even Nuqtasi"
            value={profitability?.breakEvenPoint?.toFixed(0) || 0}
            icon={AlertCircle}
            color="yellow"
            chartData={generateMiniChartData(profitability?.breakEvenPoint || 0)}
          />
          <MetricCard
            title="Birlik Hissasi"
            value={formatCurrency(profitability?.contributionPerUnit || 0, 'USD')}
            icon={Award}
            color="cyan"
            chartData={generateMiniChartData(profitability?.contributionPerUnit || 0)}
          />
        </div>
      </div>

      {/* 4. MARKETING VA MIJOZLAR (6 ta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-orange-600" />
          Marketing va Mijozlar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Mijoz Jalb Qilish Narxi (CAC)"
            value={formatCurrency(marketing?.customerAcquisitionCost || 0, 'USD')}
            icon={DollarSign}
            color="orange"
            chartData={generateMiniChartData(marketing?.customerAcquisitionCost || 0)}
          />
          <MetricCard
            title="Mijoz Umr Qiymati (LTV)"
            value={formatCurrency(marketing?.customerLifetimeValue || 0, 'USD')}
            icon={Award}
            color="green"
            chartData={generateMiniChartData(marketing?.customerLifetimeValue || 0)}
          />
          <MetricCard
            title="LTV/CAC Nisbati"
            value={marketing?.ltvCacRatio?.toFixed(2) || 0}
            icon={Target}
            color="blue"
            chartData={generateMiniChartData(marketing?.ltvCacRatio || 0)}
          />
          <MetricCard
            title="Mijozlarni Ushlab Qolish"
            value={`${marketing?.customerRetentionRate?.toFixed(1) || 0}%`}
            icon={CheckCircle}
            color="emerald"
            chartData={generateMiniChartData(marketing?.customerRetentionRate || 0)}
          />
          <MetricCard
            title="Churn Rate"
            value={`${marketing?.churnRate?.toFixed(1) || 0}%`}
            icon={TrendingDown}
            color="red"
            chartData={generateMiniChartData(marketing?.churnRate || 0)}
          />
          <MetricCard
            title="Marketing ROI"
            value={`${marketing?.marketingROI?.toFixed(1) || 0}%`}
            icon={Zap}
            color="purple"
            chartData={generateMiniChartData(marketing?.marketingROI || 0)}
          />
        </div>
      </div>

      {/* 5. QARZDORLIK (6 ta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-red-600" />
          Qarzdorlik Metrikalari
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Jami Qarz"
            value={formatCurrency(debt?.totalDebt || 0, 'USD')}
            icon={CreditCard}
            color="red"
            chartData={generateMiniChartData(debt?.totalDebt || 0)}
          />
          <MetricCard
            title="Qarz Nisbati"
            value={`${debt?.debtRatio?.toFixed(1) || 0}%`}
            icon={Percent}
            color="orange"
            chartData={generateMiniChartData(debt?.debtRatio || 0)}
          />
          <MetricCard
            title="Debitorlik Qarz"
            value={formatCurrency(debt?.accountsReceivable || 0, 'USD')}
            icon={Wallet}
            color="yellow"
            chartData={generateMiniChartData(debt?.accountsReceivable || 0)}
          />
          <MetricCard
            title="Qarz Aylanishi"
            value={debt?.receivableTurnover?.toFixed(2) || 0}
            icon={Activity}
            color="blue"
            chartData={generateMiniChartData(debt?.receivableTurnover || 0)}
          />
          <MetricCard
            title="DSO (Kunlar)"
            value={`${debt?.daysSalesOutstanding?.toFixed(0) || 0} kun`}
            icon={Clock}
            color="indigo"
            chartData={generateMiniChartData(debt?.daysSalesOutstanding || 0)}
          />
          <MetricCard
            title="Yomon Qarz Nisbati"
            value={`${debt?.badDebtRatio?.toFixed(1) || 0}%`}
            icon={AlertCircle}
            color="red"
            chartData={generateMiniChartData(debt?.badDebtRatio || 0)}
          />
        </div>
      </div>

      {/* 6. PUL OQIMI (3 ta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-cyan-600" />
          Pul Oqimi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Operatsion Pul Oqimi"
            value={formatCurrency(cashFlow?.operatingCashFlow || 0, 'USD')}
            icon={Wallet}
            color="cyan"
            chartData={generateMiniChartData(cashFlow?.operatingCashFlow || 0)}
          />
          <MetricCard
            title="Erkin Pul Oqimi"
            value={formatCurrency(cashFlow?.freeCashFlow || 0, 'USD')}
            icon={PiggyBank}
            color="green"
            chartData={generateMiniChartData(cashFlow?.freeCashFlow || 0)}
          />
          <MetricCard
            title="Pul Konversiya Sikli"
            value={`${cashFlow?.cashConversionCycle?.toFixed(0) || 0} kun`}
            icon={Activity}
            color="blue"
            chartData={generateMiniChartData(cashFlow?.cashConversionCycle || 0)}
          />
        </div>
      </div>

      {/* 7. OPERATSION SAMARADORLIK (4 ta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-600" />
          Operatsion Samaradorlik
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Xodim Samaradorligi"
            value={operational?.employeeProductivity?.toFixed(1) || 0}
            icon={Users}
            color="yellow"
            chartData={generateMiniChartData(operational?.employeeProductivity || 0)}
          />
          <MetricCard
            title="Xodim Boshiga Daromad"
            value={formatCurrency(operational?.revenuePerEmployee || 0, 'USD')}
            icon={DollarSign}
            color="green"
            chartData={generateMiniChartData(operational?.revenuePerEmployee || 0)}
          />
          <MetricCard
            title="Buyurtma Bajarish Vaqti"
            value={`${operational?.orderFulfillmentTime?.toFixed(1) || 0} soat`}
            icon={Clock}
            color="blue"
            chartData={generateMiniChartData(operational?.orderFulfillmentTime || 0)}
          />
          <MetricCard
            title="O'z Vaqtida Yetkazish"
            value={`${operational?.onTimeDeliveryRate?.toFixed(1) || 0}%`}
            icon={CheckCircle}
            color="emerald"
            chartData={generateMiniChartData(operational?.onTimeDeliveryRate || 0)}
          />
        </div>
      </div>

      {/* 8. STRATEGIK O'SISH (3 ta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Strategik O'sish
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Mijozlar O'sishi"
            value={`${growth?.customerGrowthRate?.toFixed(1) || 0}%`}
            percentage={growth?.customerGrowthRate}
            icon={Users}
            color="purple"
            trend={growth?.customerGrowthRate}
            chartData={generateMiniChartData(growth?.customerGrowthRate || 0)}
          />
          <MetricCard
            title="Mahsulotlar O'sishi"
            value={`${growth?.productGrowthRate?.toFixed(1) || 0}%`}
            percentage={growth?.productGrowthRate}
            icon={Package}
            color="blue"
            trend={growth?.productGrowthRate}
            chartData={generateMiniChartData(growth?.productGrowthRate || 0)}
          />
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Yangi vs Qaytgan Mijozlar</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Yangi', value: growth?.newVsReturningCustomers?.new || 0 },
                    { name: 'Qaytgan', value: growth?.newVsReturningCustomers?.returning || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* QISQACHA XULOSA */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <h2 className="text-2xl font-bold mb-4">📊 Umumiy Xulosa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(sales?.revenue || 0, 'USD')}</p>
            <p className="text-sm text-muted-foreground mt-1">Jami Daromad</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{formatCurrency(profitability?.netProfit || 0, 'USD')}</p>
            <p className="text-sm text-muted-foreground mt-1">Sof Foyda</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{profitability?.roi?.toFixed(1) || 0}%</p>
            <p className="text-sm text-muted-foreground mt-1">ROI</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">{sales?.conversionRate?.toFixed(1) || 0}%</p>
            <p className="text-sm text-muted-foreground mt-1">Konversiya</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
