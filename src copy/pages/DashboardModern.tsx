import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Target,
  Activity,
  ShoppingCart,
  Truck,
  Zap,
  ArrowUpRight,
  Brain,
  LayoutDashboard,
  CheckSquare,
  Factory
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import ModernLayout from '../components/ModernLayout';

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  totalCustomers: number;
  totalProducts: number;
  netProfit: number;
  growth: number;
}

export default function DashboardModern() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockStats: DashboardStats = {
          totalRevenue: 250000000,
          monthlyRevenue: 45000000,
          totalOrders: 1250,
          monthlyOrders: 180,
          totalCustomers: 77,
          totalProducts: 25,
          netProfit: 8500000,
          growth: 12.5
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="modern-bg page-container">
        <div className="content-wrapper">
          <div className="glass-card p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="mt-6 text-lg font-semibold text-primary">{latinToCyrillic("Yuklanmoqda...")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="modern-bg page-container">
        <div className="content-wrapper">
          <div className="glass-card p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg text-primary mb-4">{latinToCyrillic("Xatolik yuz berdi")}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-gradient-primary px-6 py-3"
              >
                {latinToCyrillic("Qayta urinish")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profitMargin = stats.monthlyRevenue > 0 
    ? ((stats.netProfit / stats.monthlyRevenue) * 100).toFixed(1)
    : 0;

  const salesData = [
    { name: 'Yanvar', revenue: 38000000 },
    { name: 'Fevral', revenue: 42000000 },
    { name: 'Mart', revenue: 45000000 },
    { name: 'Aprel', revenue: 41000000 },
    { name: 'May', revenue: 48000000 },
    { name: 'Iyun', revenue: 52000000 }
  ];

  const categoryData = [
    { name: 'Preformalar', value: 45, color: '#3b82f6' },
    { name: 'Qoplamlar', value: 30, color: '#10b981' },
    { name: 'Etiketkalar', value: 25, color: '#f59e0b' }
  ];

  return (
    <ModernLayout 
      title={latinToCyrillic("Бошқарув Панели")}
      subtitle={new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">{latinToCyrillic("Жами Даромад")}</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalRevenue.toLocaleString()} UZS
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+{stats.growth}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">{latinToCyrillic("Ойлик Даромад")}</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.monthlyRevenue.toLocaleString()} UZS
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-500">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">{latinToCyrillic("Жами Буюртмалар")}</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ShoppingCart className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-500">+{stats.monthlyOrders}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">{latinToCyrillic("Мижозлар")}</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalCustomers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-500">+12</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="glass-card-light p-6">
            <h3 className="text-lg font-bold text-primary mb-6">{latinToCyrillic("Сотув Графиги")}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
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
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie Chart */}
          <div className="glass-card-light p-6">
            <h3 className="text-lg font-bold text-primary mb-6">{latinToCyrillic("Маҳсулот Категориялари")}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-gradient-primary px-6 py-3"
            >
              {latinToCyrillic("Қайта уриниш")}
              <span className="text-sm font-medium">{latinToCyrillic("Янги Сотув")}</span>
            </button>
            
            <button 
              onClick={() => navigate('/customers')}
              className="btn-gradient-secondary p-4 flex flex-col items-center gap-2"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">{latinToCyrillic("Мижозлар")}</span>
            </button>
            
            <button 
              onClick={() => navigate('/products')}
              className="btn-gradient-secondary p-4 flex flex-col items-center gap-2"
            >
              <Package className="w-6 h-6" />
              <span className="text-sm font-medium">{latinToCyrillic("Маҳсулотлар")}</span>
            </button>
            
            <button 
              onClick={() => navigate('/reports')}
              className="btn-gradient-secondary p-4 flex flex-col items-center gap-2"
            >
              <Brain className="w-6 h-6" />
              <span className="text-sm font-medium">{latinToCyrillic("Ҳисботлар")}</span>
            </button>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
