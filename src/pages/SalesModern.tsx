import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  User,
  Eye,
  Download,
  ArrowLeft,
  Plus,
  BarChart3,
  Edit2
} from 'lucide-react';
import { latinToCyrillic } from '../lib/transliterator';
import ModernLayout from '../components/ModernLayout';

interface Sale {
  id: string;
  date: string;
  customerName: string;
  totalAmount: number;
  paymentType: string;
  status: 'completed' | 'pending' | 'cancelled';
  items: number;
  cashier: string;
}

export default function SalesModern() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const statuses = ['all', 'completed', 'pending', 'cancelled'];
  const periods = ['all', 'today', 'week', 'month', 'year'];

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockSales: Sale[] = [
          {
            id: '1',
            date: '2024-04-13',
            customerName: 'Azizbek Karimov',
            totalAmount: 1250000,
            paymentType: 'cash',
            status: 'completed',
            items: 5,
            cashier: 'Admin'
          },
          {
            id: '2',
            date: '2024-04-13',
            customerName: 'Gulnora Sobirova',
            totalAmount: 850000,
            paymentType: 'card',
            status: 'completed',
            items: 3,
            cashier: 'Admin'
          },
          {
            id: '3',
            date: '2024-04-12',
            customerName: 'Jahongir To\'xtayev',
            totalAmount: 2100000,
            paymentType: 'cash',
            status: 'pending',
            items: 8,
            cashier: 'Kassir'
          },
          {
            id: '4',
            date: '2024-04-11',
            customerName: 'Dilfuza Rahmatova',
            totalAmount: 650000,
            paymentType: 'click',
            status: 'completed',
            items: 2,
            cashier: 'Kassir'
          }
        ];
        
        setSales(mockSales);
        
      } catch (error) {
        console.error('Error loading sales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  useEffect(() => {
    let filtered = sales;
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sale => sale.status === selectedStatus);
    }
    
    // Filter by period
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date);
        
        switch (selectedPeriod) {
          case 'today':
            return saleDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return saleDate >= weekAgo;
          case 'month':
            return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
          case 'year':
            return saleDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.includes(searchTerm) ||
        sale.paymentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSales(filtered);
  }, [sales, selectedStatus, selectedPeriod, searchTerm]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return latinToCyrillic('Bajarildi');
      case 'pending': return latinToCyrillic('Kutilmoqda');
      case 'cancelled': return latinToCyrillic('Bekor qilindi');
      default: return status;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'cash': return latinToCyrillic('Naqt');
      case 'card': return latinToCyrillic('Karta');
      case 'click': return latinToCyrillic('Click');
      default: return type;
    }
  };

  const getTotalSales = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  };

  const getCompletedSales = () => {
    return filteredSales.filter(sale => sale.status === 'completed').length;
  };

  return (
    <ModernLayout 
      title={latinToCyrillic("Sotuvlar")}
      subtitle={`${filteredSales.length} ${latinToCyrillic("ta sotuv")}`}
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="sales-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={latinToCyrillic("Сотувларни қидириш...")}
                className="input-modern w-full pl-12"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <label htmlFor="sales-status-filter" className="sr-only">Status Filter</label>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter className="w-5 h-5" />
              </div>
              <select
                id="sales-status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-modern pl-12 appearance-none cursor-pointer"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? latinToCyrillic("Барчаси") : getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div className="relative">
              <label htmlFor="sales-period-filter" className="sr-only">Period Filter</label>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar className="w-5 h-5" />
              </div>
              <select
                id="sales-period-filter"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-modern pl-12 appearance-none cursor-pointer"
              >
                {periods.map(period => (
                  <option key={period} value={period}>
                    {period === 'all' ? latinToCyrillic("Barcha vaqt") : 
                     period === 'today' ? latinToCyrillic("Bugun") :
                     period === 'week' ? latinToCyrillic("Oxirgi 7 kun") :
                     period === 'month' ? latinToCyrillic("Oylik") :
                     period === 'year' ? latinToCyrillic("Yillik") : period}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Add Sale Button */}
          <button
            type="button"
            onClick={() => navigate('/cashier/sales/add-simple')}
            className="btn-gradient-primary px-6 py-3 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {latinToCyrillic("Янги Сотув")}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card-light p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-secondary">{latinToCyrillic("Жами Сотув")}</p>
                <p className="text-2xl font-bold text-primary">{getTotalSales().toLocaleString()} UZS</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card-light p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-secondary">{latinToCyrillic("Бажарилган")}</p>
                <p className="text-2xl font-bold text-primary">{getCompletedSales()}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card-light p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-secondary">{latinToCyrillic("Ортача Сотув")}</p>
                <p className="text-2xl font-bold text-primary">
                  {filteredSales.length > 0 ? Math.round(getTotalSales() / filteredSales.length).toLocaleString() : 0} UZS
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card-light p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-secondary">{latinToCyrillic("Бугунги Сотув")}</p>
                <p className="text-2xl font-bold text-primary">
                  {filteredSales
                    .filter(sale => sale.status === 'completed' && new Date(sale.date).toDateString() === new Date().toDateString())
                    .reduce((sum, sale) => sum + sale.totalAmount, 0)
                    .toLocaleString()} UZS
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card-light p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-lg font-semibold text-primary mb-4">{latinToCyrillic("Хатолик Юз Берди")}</p>
            </div>
          </div>
        )}

        {/* Sales Table */}
        {!loading && (
          <div className="glass-card-light p-6">
            <div className="overflow-x-auto">
              <table className="table-modern w-full">
                <thead>
                  <tr>
                    <th className="table-header">{latinToCyrillic("Sana")}</th>
                    <th className="table-header">{latinToCyrillic("Mijoz")}</th>
                    <th className="table-header">{latinToCyrillic("Mahsulotlar")}</th>
                    <th className="table-header">{latinToCyrillic("Summa")}</th>
                    <th className="table-header">{latinToCyrillic("To'lov")}</th>
                    <th className="table-header">{latinToCyrillic("Holat")}</th>
                    <th className="table-header">{latinToCyrillic("Kassir")}</th>
                    <th className="table-header">{latinToCyrillic("Amallar")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>{sale.date}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-secondary" />
                          <span className="font-medium">{sale.customerName}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge-blue">{sale.items}</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-bold text-primary">{sale.totalAmount.toLocaleString()} UZS</span>
                      </td>
                      <td className="table-cell">
                        <span className="badge-secondary">{getPaymentTypeText(sale.paymentType)}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`text-xs ${getStatusBadgeColor(sale.status)}`}>
                          {getStatusText(sale.status)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm">{sale.cashier}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/sales/${sale.id}`)}
                            className="btn-gradient-secondary p-1"
                            aria-label="Sotuvni ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/sales/${sale.id}/edit`)}
                            className="btn-gradient-primary p-1"
                            aria-label="Sotuvni tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSales.length === 0 && (
          <div className="glass-card-light p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {latinToCyrillic("Сотувлар топилмади")}
              </h3>
              <p className="text-secondary">
                {latinToCyrillic("Қидириш шартларини ўзгартириб қайта уриниб кўринг")}
              </p>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
