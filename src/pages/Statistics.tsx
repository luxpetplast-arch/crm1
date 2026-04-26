import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import MetricsCharts from '../components/MetricsCharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Statistics() {
  const [stats, setStats] = useState<any>(null);
  const [businessMetrics, setBusinessMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStatistics();
    loadBusinessMetrics();
  }, [timeRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/statistics/comprehensive?days=${timeRange}`);
      setStats(data);
    } catch (error) {
      console.error('Statistika yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessMetrics = async () => {
    try {
      const { data } = await api.get(`/statistics/business-metrics?days=${timeRange}`);
      setBusinessMetrics(data);
    } catch (error) {
      console.error('Biznes metrikalari yuklashda xatolik');
    }
  };

  const exportReport = async () => {
    try {
      const { data } = await api.get(`/statistics/export?days=${timeRange}&format=pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statistika-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export xatolik');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold">Statistika yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">Ma'lumotlarni yuklashda xatolik</p>
          <Button onClick={loadStatistics} className="mt-4">
            Qayta urinish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Statistika va Hisobotlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            To'liq biznes statistikasi va tahlil
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <label htmlFor="time-range" className="sr-only">Vaqt oralig'i</label>
          <select
            id="time-range"
            className="px-4 py-2 bg-background border border-border rounded-lg"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Oxirgi 7 kun</option>
            <option value="30">Oxirgi 30 kun</option>
            <option value="90">Oxirgi 90 kun</option>
            <option value="180">Oxirgi 6 oy</option>
            <option value="365">Oxirgi 1 yil</option>
          </select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadStatistics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { id: 'overview', label: 'Umumiy', icon: Eye },
          { id: 'metrics', label: '65 Metrika', icon: BarChart3 },
          { id: 'sales', label: 'Sotuvlar', icon: ShoppingCart },
          { id: 'products', label: 'Mahsulotlar', icon: Package },
          { id: 'customers', label: 'Mijozlar', icon: Users },
          { id: 'financial', label: 'Moliyaviy', icon: DollarSign },
        ].map(tab => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 65 METRIKA TAB */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {businessMetrics ? (
            <MetricsCharts metrics={businessMetrics} />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-semibold">65 ta metrika yuklanmoqda...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UMUMIY TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Asosiy Metrikalar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stats.overview?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.overview?.revenueGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stats.overview?.revenueGrowth || 0).toFixed(1)}%
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Jami Daromad</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(stats.overview?.totalRevenue || 0, 'USD')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Kunlik o'rtacha: {formatCurrency(stats.overview?.avgDailyRevenue || 0, 'USD')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stats.overview?.profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.overview?.profitGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stats.overview?.profitGrowth || 0).toFixed(1)}%
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Sof Foyda</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(stats.overview?.netProfit || 0, 'USD')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Foyda marjasi: {stats.overview?.profitMargin?.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">
                    {stats.overview?.totalOrders || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Jami Sotuvlar</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.overview?.totalQuantity || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  O'rtacha: {stats.overview?.avgOrderValue?.toFixed(0)} dona
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-600">
                    +{stats.overview?.newCustomers || 0}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Jami Mijozlar</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.overview?.totalCustomers || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Faol: {stats.overview?.activeCustomers || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daromad va Foyda Trendi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Daromad va Foyda Trendi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.trends?.daily || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Daromad"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    name="Foyda"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Qo'shimcha Metrikalar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">O'rtacha Sotuv</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.overview?.avgSaleAmount || 0, 'USD')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Eng Yaxshi Kun</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.overview?.bestDayRevenue || 0, 'USD')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Konversiya</p>
                    <p className="text-2xl font-bold">
                      {stats.overview?.conversionRate?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* SOTUVLAR TAB */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Sotuvlar Statistikasi */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">Yakunlangan</p>
                <p className="text-2xl font-bold">{stats.sales?.completed || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">Kutilmoqda</p>
                <p className="text-2xl font-bold">{stats.sales?.pending || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-sm text-muted-foreground">Bekor qilingan</p>
                <p className="text-2xl font-bold">{stats.sales?.cancelled || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">Muvaffaqiyat %</p>
                <p className="text-2xl font-bold">{stats.sales?.successRate?.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Soatlik Sotuvlar */}
          <Card>
            <CardHeader>
              <CardTitle>Soatlik Sotuvlar Taqsimoti</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.sales?.hourlyDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Sotuvlar" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Haftalik Sotuvlar */}
          <Card>
            <CardHeader>
              <CardTitle>Haftalik Sotuvlar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.sales?.weeklyDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Daromad" />
                  <Bar dataKey="count" fill="#3b82f6" name="Soni" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MAHSULOTLAR TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Top Mahsulotlar */}
          <Card>
            <CardHeader>
              <CardTitle>Eng Ko'p Sotiladigan Mahsulotlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.products?.topSelling?.map((product: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(product.revenue, 'USD')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Sotildi: {product.quantity} dona</span>
                        <span>Sotuvlar: {product.salesCount}</span>
                        <span className={product.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {product.growth >= 0 ? '↑' : '↓'} {Math.abs(product.growth).toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${product.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mahsulot Kategoriyalari */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mahsulotlar Bo'yicha Daromad</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.products?.revenueByProduct || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(stats.products?.revenueByProduct || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tez Ketayotgan Mahsulotlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.products?.fastMoving?.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.velocity} dona/kun
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{product.quantity}</p>
                        <p className="text-xs text-muted-foreground">sotildi</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sekin Ketayotgan Mahsulotlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Sekin Ketayotgan Mahsulotlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.products?.slowMoving?.map((product: any, index: number) => (
                  <div key={index} className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="font-semibold mb-2">{product.name}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Omborda: {product.stock} dona</p>
                      <p>Sotildi: {product.sold} dona</p>
                      <p>Tezlik: {product.velocity} dona/kun</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MIJOZLAR TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Mijozlar Statistikasi */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <Users className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">Jami Mijozlar</p>
                <p className="text-2xl font-bold">{stats.customers?.total || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Faol Mijozlar</p>
                <p className="text-2xl font-bold">{stats.customers?.active || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TrendingUp className="w-6 h-6 text-purple-500 mb-2" />
                <p className="text-sm text-muted-foreground">Yangi Mijozlar</p>
                <p className="text-2xl font-bold">{stats.customers?.new || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Award className="w-6 h-6 text-orange-500 mb-2" />
                <p className="text-sm text-muted-foreground">VIP Mijozlar</p>
                <p className="text-2xl font-bold">{stats.customers?.vip || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Mijozlar */}
          <Card>
            <CardHeader>
              <CardTitle>Top Mijozlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.customers?.topCustomers?.map((customer: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{customer.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>📞 {customer.phone}</span>
                        <span>🛒 {customer.purchases} xarid</span>
                        <span className={customer.debt > 0 ? 'text-red-600' : 'text-green-600'}>
                          {customer.debt > 0 ? '💳 Qarz: ' : '✅ Qarz yo\'q'}
                          {customer.debt > 0 && formatCurrency(customer.debt, 'USD')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(customer.totalSpent, 'USD')}
                      </p>
                      <p className="text-xs text-muted-foreground">jami xarid</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mijozlar Segmentatsiyasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mijozlar Segmentlari</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.customers?.segments || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(stats.customers?.segments || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mijozlar Faolligi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.customers?.activityDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" name="Mijozlar" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MOLIYAVIY TAB */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Moliyaviy Metrikalar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-muted-foreground">Jami Daromad</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(stats.financial?.totalRevenue || 0, 'USD')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900">
              <CardContent className="p-6">
                <TrendingDown className="w-8 h-8 text-red-600 mb-2" />
                <p className="text-sm text-muted-foreground">Jami Xarajatlar</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(stats.financial?.totalExpenses || 0, 'USD')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm text-muted-foreground">Sof Foyda</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(stats.financial?.netProfit || 0, 'USD')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Moliyaviy Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Moliyaviy Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stats.financial?.trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Daromad" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Xarajatlar" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Foyda" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Xarajatlar Kategoriyalari */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Xarajatlar Kategoriyalari</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.financial?.expensesByCategory || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(stats.financial?.expensesByCategory || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moliyaviy Ko'rsatkichlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm font-medium">Foyda Marjasi</span>
                    <span className="text-lg font-bold text-blue-600">
                      {stats.financial?.profitMargin?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="text-sm font-medium">ROI</span>
                    <span className="text-lg font-bold text-green-600">
                      {stats.financial?.roi?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <span className="text-sm font-medium">O'sish Sur'ati</span>
                    <span className="text-lg font-bold text-purple-600">
                      {stats.financial?.growthRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <span className="text-sm font-medium">Qarzlar</span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(stats.financial?.totalDebt || 0, 'USD')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
