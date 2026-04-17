import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Package, 
  Target,
  AlertCircle,
  BarChart3,
  ShoppingCart,
  Truck,
  RefreshCw,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import { useProfessionalApi } from '../hooks/useProfessionalApi';
import { errorHandler } from '../lib/professionalErrorHandler';
import { performanceMonitor } from '../lib/professionalPerformance';
import { analytics } from '../lib/professionalAnalytics';
import { notify } from '../lib/professionalNotifications';
import { ProfessionalCard, ProfessionalButton } from '../components/ProfessionalComponents';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import StatCard from '../components/StatCard';

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

  const { execute: loadDashboardStats } = useProfessionalApi(
    () => api.get('/dashboard/stats'),
    { cache: true, cacheTTL: 60000 }
  );

  const loadDashboardData = async () => {
    const startTime = performance.now();
    
    try {
      const data = await loadDashboardStats();
      
      if (data) {
        setStats(data);
        
        // Track analytics
        analytics.trackUserAction('dashboard_loaded', {
          statsLoaded: true,
          loadTime: performance.now() - startTime
        });
        
        // Show success notification for refresh
        if (refreshing) {
          notify.success('Yangilandi', 'Dashboard ma\'lumotlari yangilandi');
        }
      }
    } catch (error) {
      const professionalError = errorHandler.handleError(error, {
        action: 'loadDashboard',
        refreshing
      });
      
      // Convert unknown error to Error type for analytics
      const errorObj = error instanceof Error ? error : new Error(String(error));
      analytics.trackError(errorObj, { action: 'loadDashboard' });
      notify.error('Xatolik', 'Dashboard ma\'lumotlarini yuklashda xatolik yuz berdi');
      
      console.error('Dashboard yuklashda xatolik:', professionalError.userMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      // Track performance
      const loadTime = performance.now() - startTime;
      performanceMonitor.trackPerformance('dashboard_load_time', loadTime);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const quickActions = [
    { 
      title: 'Yangi Sotuv', 
      icon: ShoppingCart, 
      color: 'from-blue-500 to-blue-600',
      href: '/sales/add',
      description: 'Tez sotuv qilish'
    },
    { 
      title: 'Yangi Mahsulot', 
      icon: Package, 
      color: 'from-emerald-500 to-emerald-600',
      href: '/add-product',
      description: 'Mahsulot qo\'shish'
    },
    { 
      title: 'Buyurtmalar', 
      icon: Truck, 
      color: 'from-violet-500 to-violet-600',
      href: '/orders',
      description: 'Barcha buyurtmalar'
    },
    { 
      title: 'Mijozlar', 
      icon: Users, 
      color: 'from-amber-500 to-amber-600',
      href: '/customers',
      description: 'Mijozlarni boshqarish'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'sale', description: 'Sotuv #1234', amount: '1,250,000 UZS', time: '5 daqiqa oldin', status: 'success' },
    { id: 2, type: 'order', description: 'Buyurtma #5678', amount: '3,500,000 UZS', time: '15 daqiqa oldin', status: 'pending' },
    { id: 3, type: 'payment', description: 'To\'lov #9012', amount: '750,000 UZS', time: '1 soat oldin', status: 'success' },
    { id: 4, type: 'return', description: 'Qaytarish #3456', amount: '250,000 UZS', time: '2 soat oldin', status: 'warning' }
  ];

  const chartData = [
    { name: 'Dush', sales: 4000, orders: 240 },
    { name: 'Sesh', sales: 3000, orders: 139 },
    { name: 'Chor', sales: 2000, orders: 380 },
    { name: 'Pay', sales: 2780, orders: 390 },
    { name: 'Jum', sales: 1890, orders: 480 },
    { name: 'Shan', sales: 2390, orders: 380 },
    { name: 'Yak', sales: 3490, orders: 430 }
  ];

  const pieData = [
    { name: 'Sotuvlar', value: 45, color: '#3b82f6' },
    { name: 'Buyurtmalar', value: 30, color: '#10b981' },
    { name: 'Qaytarishlar', value: 15, color: '#f59e0b' },
    { name: 'Boshqa', value: 10, color: '#8b5cf6' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {latinToCyrillic('Dashboard')}
            </h1>
            <p className="text-gray-600">
              {latinToCyrillic('LUX PET PLAST zavod boshqaruv tizimi')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <ProfessionalButton
              onClick={handleRefresh}
              loading={refreshing}
              variant="outline"
              className="hover:scale-105 transition-transform"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              {latinToCyrillic('Yangilash')}
            </ProfessionalButton>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={latinToCyrillic('Jami Sotuvlar')}
          value={stats?.totalSales ? `${stats.totalSales.toLocaleString()} UZS` : '0 UZS'}
          icon={DollarSign}
          iconColor="text-blue-500"
          trend={{ value: 12.5, isPositive: true }}
          description="O'tgan oyga nisbatan"
        />
        
        <StatCard
          title={latinToCyrillic('Buyurtmalar')}
          value={stats?.totalOrders || '0'}
          icon={ShoppingCart}
          iconColor="text-emerald-500"
          trend={{ value: 8.2, isPositive: true }}
          description="O'tgan oyga nisbatan"
        />
        
        <StatCard
          title={latinToCyrillic('Mijozlar')}
          value={stats?.totalCustomers || '0'}
          icon={Users}
          iconColor="text-violet-500"
          trend={{ value: 15.3, isPositive: true }}
          description="O'tgan oyga nisbatan"
        />
        
        <StatCard
          title={latinToCyrillic('Mahsulotlar')}
          value={stats?.totalProducts || '0'}
          icon={Package}
          iconColor="text-amber-500"
          trend={{ value: 5.7, isPositive: false }}
          description="O'tgan oyga nisbatan"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {latinToCyrillic('Tezkor Amallar')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.href)}
              className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {latinToCyrillic(action.title)}
                </h3>
                <p className="text-sm text-gray-600">
                  {latinToCyrillic(action.description)}
                </p>
              </div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              {latinToCyrillic('Sotuvlar Statistikasi')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Pie Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' } as any}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              {latinToCyrillic('Buyurtmalar Tahlili')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.2s' } as any}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-500" />
            {latinToCyrillic('So\'nggi Faoliyatlar')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'success' ? 'bg-emerald-100' :
                    activity.status === 'pending' ? 'bg-amber-100' :
                    'bg-red-100'
                  }`}>
                    {activity.status === 'success' ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                    ) : activity.status === 'pending' ? (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">
                      {latinToCyrillic(activity.description)}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{activity.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
