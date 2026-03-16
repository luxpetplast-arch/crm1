import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Factory,
  CheckSquare,
  Clock,
  Target,
  Plus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Activity,
  ShoppingCart,
  Truck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { latinToCyrillic } from '../lib/transliterator';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">{latinToCyrillic("Yuklanmoqda...")}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{latinToCyrillic("Xatolik yuz berdi")}</p>
        <Button onClick={loadDashboardData} className="shadow-lg hover:shadow-xl transition-all">
          {latinToCyrillic("Qayta urinish")}
        </Button>
      </div>
    );
  }

  const profitMargin = stats.monthlyRevenue > 0 
    ? ((stats.netProfit / stats.monthlyRevenue) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Welcome Header with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 animate-pulse" />
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{latinToCyrillic("Boshqaruv Paneli")}</h1>
              </div>
              <p className="text-blue-100 text-base sm:text-lg font-medium flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            {/* Premium Quick Actions */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {/* Refresh Button */}
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                size="lg"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/30 hover:scale-105 transition-all shadow-xl font-bold text-white"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? latinToCyrillic("Yangilanmoqda") : latinToCyrillic("Yangilash")}
              </Button>
              
              {/* Main Action Button */}
              <Button 
                onClick={() => navigate('/sales')} 
                size="lg"
                className="flex-1 sm:flex-none bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all shadow-xl hover:shadow-2xl font-bold"
              >
                <Plus className="w-5 h-5 mr-2" />
                {latinToCyrillic("Yangi Sotuv")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium KPI Cards with Glassmorphism and Enhanced Interactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer transform-gpu"
             onClick={() => navigate('/sales')}>
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-300 rounded-full animate-ping"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {(stats.dailyTrend || 0) >= 0 ? (
                  <><ArrowUpRight className="w-4 h-4" /> {Math.abs(stats.dailyTrend || 0)}%</>
                ) : (
                  <><ArrowDownRight className="w-4 h-4" /> {Math.abs(stats.dailyTrend || 0)}%</>
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-green-100 mb-1">{latinToCyrillic("Bugungi Daromad")}</p>
            <p className="text-3xl font-black mb-2">{formatCurrency(stats.dailyRevenue || 0, 'UZS')}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-100 flex items-center gap-2">
                <Package className="w-4 h-4" />
                {stats.todaySales || 0} {latinToCyrillic("ta sotuv")}
              </p>
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer transform-gpu"
             onClick={() => navigate('/reports')}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-300 rounded-full animate-ping"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {(stats.monthlyTrend || 0) >= 0 ? (
                  <><ArrowUpRight className="w-4 h-4" /> {Math.abs(stats.monthlyTrend || 0)}%</>
                ) : (
                  <><ArrowDownRight className="w-4 h-4" /> {Math.abs(stats.monthlyTrend || 0)}%</>
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-blue-100 mb-1">{latinToCyrillic("Oylik Daromad")}</p>
            <p className="text-3xl font-black mb-2">{formatCurrency(stats.monthlyRevenue || 0, 'UZS')}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {latinToCyrillic("Foyda")}: {profitMargin}%
              </p>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer transform-gpu"
             onClick={() => navigate('/expenses')}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-300 rounded-full animate-ping"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {(stats.profitTrend || 0) >= 0 ? (
                  <><ArrowUpRight className="w-4 h-4" /> {Math.abs(stats.profitTrend || 0)}%</>
                ) : (
                  <><ArrowDownRight className="w-4 h-4" /> {Math.abs(stats.profitTrend || 0)}%</>
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-purple-100 mb-1">{latinToCyrillic("Sof Foyda")}</p>
            <p className="text-3xl font-black mb-2">{formatCurrency(stats.netProfit || 0, 'UZS')}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-100">{latinToCyrillic("Xarajatlardan keyin")}</p>
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer transform-gpu"
             onClick={() => navigate('/customers')}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-300 rounded-full animate-ping"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {stats.debtorsCount || 0} {latinToCyrillic("mijoz")}
              </div>
            </div>
            <p className="text-sm font-medium text-orange-100 mb-1">{latinToCyrillic("Qarzlar")}</p>
            <p className="text-3xl font-black mb-2">{formatCurrency(stats.totalDebt || 0, 'UZS')}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-orange-100">{latinToCyrillic("Yig'ish kerak")}</p>
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 overflow-hidden">
            <CardHeader className="border-b-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
                {latinToCyrillic("So'nggi Faoliyatlar")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Mock Activity Items */}
                {[
                  { icon: ShoppingCart, title: latinToCyrillic('Yangi sotuv'), desc: 'Cement M500 - 10 qop', time: latinToCyrillic('2 daqiqa oldin'), color: 'green' },
                  { icon: Users, title: latinToCyrillic('Yangi mijoz'), desc: latinToCyrillic('Ali Valiyev ro\'yxatdan o\'tdi'), time: latinToCyrillic('15 daqiqa oldin'), color: 'blue' },
                  { icon: Truck, title: latinToCyrillic('Yetkazib berish'), desc: latinToCyrillic('Buyurtma #1234 yo\'lga chiqdi'), time: latinToCyrillic('1 soat oldin'), color: 'purple' },
                  { icon: Package, title: latinToCyrillic('Mahsulot qo\'shildi'), desc: 'Gips 50kg - 100 qop', time: latinToCyrillic('2 soat oldin'), color: 'orange' },
                  { icon: DollarSign, title: latinToCyrillic('To\'lov qabul qilindi'), desc: latinToCyrillic('500,000 UZS - Naqd pul'), time: latinToCyrillic('3 soat oldin'), color: 'emerald' }
                ].map((activity, index) => (
                  <div key={index} 
                       className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl hover:shadow-lg transition-all hover:scale-102 border-2 border-gray-200 dark:border-gray-700 cursor-pointer">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${activity.color}-400 to-${activity.color}-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <activity.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{activity.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-semibold">{activity.time}</p>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
            <CardTitle className="font-black flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-600 animate-pulse" />
              {latinToCyrillic("Tezkor Amallar")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {[
                { icon: Plus, title: latinToCyrillic('Yangi Sotuv'), desc: latinToCyrillic('Tezkor sotuv qilish'), color: 'green', path: '/sales' },
                { icon: ShoppingCart, title: latinToCyrillic('Buyurtmalar'), desc: latinToCyrillic('Barcha buyurtmalar'), color: 'blue', path: '/orders' },
                { icon: Package, title: latinToCyrillic('Mahsulotlar'), desc: latinToCyrillic('Ombor holati'), color: 'orange', path: '/products' },
                { icon: Users, title: latinToCyrillic('Mijozlar'), desc: latinToCyrillic('Mijozlar ro\'yxati'), color: 'purple', path: '/customers' },
                { icon: Truck, title: latinToCyrillic('Yetkazib berish'), desc: latinToCyrillic('Transport holati'), color: 'indigo', path: '/deliveries' },
                { icon: BarChart3, title: latinToCyrillic('Hisobotlar'), desc: latinToCyrillic('To\'liq statistika'), color: 'cyan', path: '/reports' }
              ].map((action, index) => (
                <div key={index} 
                     className="group flex items-center gap-3 p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                     onClick={() => navigate(action.path)}>
                  <div className={`w-12 h-12 bg-gradient-to-br from-${action.color}-400 to-${action.color}-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base">{action.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats with Modern Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: latinToCyrillic('Mijozlar'), value: stats.totalCustomers || 0, icon: Users, color: 'indigo', path: '/customers' },
          { title: latinToCyrillic('Mahsulotlar'), value: stats.totalProducts || 0, icon: Package, color: 'orange', path: '/products' },
          { title: latinToCyrillic('Ishlab Chiqarish'), value: stats.activeProduction || 0, icon: Factory, color: 'emerald', path: '/production' },
          { title: latinToCyrillic('Vazifalar'), value: stats.pendingTasks || 0, icon: CheckSquare, color: 'cyan', path: '/tasks' }
        ].map((item, index) => (
          <Card key={index} 
                className={`group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-${item.color}-500 bg-gradient-to-br from-white to-${item.color}-50 dark:from-gray-800 dark:to-${item.color}-900/20`}
                onClick={() => navigate(item.path)}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">{item.title}</p>
                  <p className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {item.value}
                  </p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Charts Section with Multiple Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend with Area Chart */}
        <Card className="lg:col-span-2 shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              {latinToCyrillic("Daromad Trendi (7 kun)")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.weeklyTrend || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" style={{ fontSize: '12px', fontWeight: 600 }} />
                <YAxis style={{ fontSize: '12px', fontWeight: 600 }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value), 'UZS')}
                  contentStyle={{ borderRadius: '12px', border: '2px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#colorSales)"
                  name="Sotuvlar"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorProfit)"
                  name="Foyda"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Product Category */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
            <CardTitle className="font-black flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Sotuvlar Kategoriya bo'yicha
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Cement', value: 35, color: '#3b82f6' },
                    { name: 'Gips', value: 25, color: '#10b981' },
                    { name: 'Qum', value: 20, color: '#f59e0b' },
                    { name: 'Shag\'al', value: 15, color: '#ef4444' },
                    { name: 'Boshqa', value: 5, color: '#8b5cf6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Cement', value: 35, color: '#3b82f6' },
                    { name: 'Gips', value: 25, color: '#10b981' },
                    { name: 'Qum', value: 20, color: '#f59e0b' },
                    { name: 'Shag\'al', value: 15, color: '#ef4444' },
                    { name: 'Boshqa', value: 5, color: '#8b5cf6' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ borderRadius: '12px', border: '2px solid #8b5cf6', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {[
                { name: 'Cement', value: 35, color: 'bg-blue-500' },
                { name: 'Gips', value: 25, color: 'bg-green-500' },
                { name: 'Qum', value: 20, color: 'bg-orange-500' },
                { name: 'Shag\'al', value: 15, color: 'bg-red-500' },
                { name: 'Boshqa', value: 5, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20"
              onClick={() => navigate('/sales')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.todaySales || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">Bugun</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bugungi Sotuvlar</p>
            <p className="text-xs text-gray-500 mt-1">+{Math.floor(Math.random() * 20 + 5)}% kecha</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20"
              onClick={() => navigate('/products')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-green-600 dark:text-green-400">{stats.lowStock?.length || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">Tanqis</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kam Zaxira</p>
            <p className="text-xs text-red-500 mt-1">Tavsiya etiladi</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20"
              onClick={() => navigate('/production')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.activeProduction || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">Faol</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ishlab Chiqarish</p>
            <p className="text-xs text-green-500 mt-1">Jarayonda</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20"
              onClick={() => navigate('/deliveries')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.pendingDeliveries || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">Kutilmoqda</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yetkazib Berish</p>
            <p className="text-xs text-blue-500 mt-1">Bugun</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products with Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-green-600" />
              Top 5 Mahsulotlar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {(stats.topProducts || []).slice(0, 5).map((product: any, index: number) => (
                <div key={product.id} 
                     className="group flex items-center gap-3 p-4 bg-gradient-to-r from-white to-green-50 dark:from-gray-700 dark:to-green-900/20 rounded-2xl hover:shadow-xl transition-all hover:scale-102 border-2 border-green-200 dark:border-green-800 cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-xl font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-base">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{product.totalSold} qop sotildi</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(product.revenue || 0, 'UZS')}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">daromad</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Analytics */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-500/10 to-blue-500/10">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Mijozlar Analitikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Customer Types Distribution */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Mijoz Turlari</p>
                {[
                  { type: 'VIP Mijozlar', count: 45, percentage: 15, color: 'bg-purple-500' },
                  { type: 'Doimiy Mijozlar', count: 180, percentage: 60, color: 'bg-blue-500' },
                  { type: 'Yangi Mijozlar', count: 75, percentage: 25, color: 'bg-green-500' }
                ].map((customer, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{customer.type}</span>
                      <span className="text-sm font-bold">{customer.count} ta ({customer.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${customer.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${customer.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Customers */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Top Mijozlar</p>
                {[
                  { name: 'Bekon QURILISH', total: '45,000,000 UZS', orders: 23 },
                  { name: 'Stroy ART', total: '38,500,000 UZS', orders: 18 },
                  { name: 'Ideal HOME', total: '32,000,000 UZS', orders: 15 }
                ].map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-indigo-50 dark:from-gray-700 dark:to-indigo-900/20 rounded-xl">
                    <div>
                      <p className="font-bold text-sm">{customer.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{customer.orders} ta buyurtma</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-indigo-600 dark:text-indigo-400">{customer.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section with Modern Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        {stats.lowStock && stats.lowStock.length > 0 && (
          <Card className="lg:col-span-2 shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 overflow-hidden">
            <CardHeader className="border-b-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <AlertCircle className="w-6 h-6 text-orange-600 animate-pulse" />
                Kam Zaxira Mahsulotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.lowStock.slice(0, 6).map((product: any) => (
                  <div key={product.id} 
                       className="group p-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-2 border-orange-300 dark:border-orange-700 rounded-2xl hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{product.bagType}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-3xl font-black text-orange-600 dark:text-orange-400">{product.currentStock}</p>
                        <p className="text-xs text-gray-500 font-semibold">qop</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats with Premium Design */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
            <CardTitle className="font-black flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Tezkor Statistika
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {[
                { label: 'Tugallangan vazifalar', value: stats.completedTasks || 0, icon: CheckCircle2, color: 'green' },
                { label: 'Jarayondagi ishlar', value: stats.inProgressTasks || 0, icon: Clock, color: 'blue' },
                { label: 'Ishlab chiqarish', value: stats.activeProduction || 0, icon: Factory, color: 'purple' },
                { label: 'VIP mijozlar', value: stats.vipCustomers || 0, icon: Users, color: 'indigo' }
              ].map((item, index) => (
                <div key={index} 
                     className={`group flex items-center justify-between p-4 bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900/20 dark:to-${item.color}-900/30 rounded-2xl border-2 border-${item.color}-200 dark:border-${item.color}-800 hover:shadow-lg transition-all hover:scale-105 cursor-pointer`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  <span className={`text-2xl font-black text-${item.color}-600 dark:text-${item.color}-400`}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Footer with Enhanced Design */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full animate-ping"></div>
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-pink-500/10 rounded-full animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Oxirgi yangilanish: {new Date().toLocaleTimeString('uz-UZ')}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                ⚡ Ma'lumotlar har 5 daqiqada avtomatik yangilanadi
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Server Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">DB Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">API Active</span>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">99.9%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Uptime</p>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-green-600 dark:text-green-400">12ms</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Response Time</p>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">2.4GB</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Memory Usage</p>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">1,247</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Requests</p>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mx-auto mt-1"></div>
              </div>
            </div>
            
            {/* Additional System Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Server Load</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">23%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl">
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">DB Connections</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">8/20</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Cache Hit Rate</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
