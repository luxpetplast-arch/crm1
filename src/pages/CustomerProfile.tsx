import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Package,
  Send,
  Crown,
  CreditCard,
  Activity,
  Users,
  Star,
  FileSpreadsheet,
  MapPin,
  Clock,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { exportToExcel } from '../lib/excelUtils';
import { latinToCyrillic } from '../lib/transliterator';

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const loadCustomerData = async () => {
    try {
      const [customerRes, salesRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/sales?customerId=${id}`)
      ]);
      setCustomer(customerRes.data);
      setSales(salesRes.data);
    } catch (error) {
      console.error('Mijoz ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCustomerData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-600">{latinToCyrillic('Yuklanmoqda...')}</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="glass-card p-12 rounded-3xl text-center max-w-md">
          <AlertTriangle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{latinToCyrillic("Mijoz topilmadi")}</h2>
          <button
            onClick={() => navigate('/cashier/customers')}
            className="btn-gradient-primary px-8 py-3"
          >
            {latinToCyrillic("Mijozlar ro'yxatiga qaytish")}
          </button>
        </div>
      </div>
    );
  }

  const totalPurchases = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalPaid = sales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
  
  const purchasesUSD = sales.filter(s => s.currency === 'USD').reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const purchasesUZS = sales.filter(s => s.currency === 'UZS').reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const paidUSD = sales.filter(s => s.currency === 'USD').reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const paidUZS = sales.filter(s => s.currency === 'UZS').reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const averagePurchase = sales.length > 0 ? totalPurchases / sales.length : 0;

  const handleExportExcel = () => {
    const historyData = sales.map(sale => ({
      'Sana': formatDate(sale.createdAt),
      'Mahsulotlar': sale.items?.map((i: any) => `${i.name} (${i.quantity} ${i.saleType === 'piece' ? 'dona' : 'qop'})`).join(', '),
      'Jami': sale.totalAmount,
      'To\'langan': sale.paidAmount,
      'Qarz': sale.debtAmount,
      'Valyuta': sale.currency,
      'Status': sale.debtAmount > 0 ? 'Qarz' : 'To\'langan'
    }));

    exportToExcel(historyData, `Mijoz_${customer.name}_Tarixi`, 'Savdolar Tarixi');
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Premium Header */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 mb-8 hover-lift">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="p-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all active:scale-90 group hover-lift"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                <Users className="w-3 h-3" />
                Customer Intelligence
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {customer.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <button
              onClick={handleRefresh}
              className="btn bg-white hover:bg-gray-50 shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {latinToCyrillic("Yangilash")}
            </button>
            <button
              onClick={handleExportExcel}
              className="btn bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            {customer.telegramChatId && (
              <button
                onClick={() => navigate('/customer-chat')}
                className="btn-gradient-primary"
              >
                <Send className="w-4 h-4" />
                Telegram
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card hover-lift p-10 overflow-hidden relative group">
            
            <div className="relative z-10 text-center">
              <div className="relative inline-block mb-6">
                <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-bold text-white shadow-2xl transition-all duration-700 group-hover:rotate-6 ${
                  customer.category === 'VIP' ? 'bg-gradient-to-br from-amber-400 to-orange-600' :
                  customer.category === 'RISK' ? 'bg-gradient-to-br from-rose-400 to-red-600' :
                  'bg-gradient-to-br from-blue-400 to-indigo-600'
                }`}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                {customer.category === 'VIP' && (
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-amber-500 animate-bounce" />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">{customer.name}</h2>
              <span className={`badge ${
                customer.category === 'VIP' ? 'badge-warning' :
                customer.category === 'RISK' ? 'badge-error' :
                'badge-blue'
              }`}>
                {customer.category} {latinToCyrillic("mijoz")}
              </span>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{latinToCyrillic("Telefon")}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{customer.phone || '-'}</p>
                  </div>
                </div>

                {customer.telegramUsername && (
                  <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                      <Send className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Telegram</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">@{customer.telegramUsername}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{latinToCyrillic("Qo'shilgan")}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Balance Card */}
            <div className="glass-card hover-lift p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <DollarSign className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{latinToCyrillic("Joriy Balans")}</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">${(customer.balanceUSD || 0).toFixed(2)}</p>
                  <p className="text-xs font-bold text-gray-400">{(customer.balanceUZS || 0).toLocaleString()} sum</p>
                </div>
              </div>
            </div>

            {/* Debt Card */}
            <div className="glass-card hover-lift p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                  (customer.debtUSD > 0 || customer.debtUZS > 0) ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{latinToCyrillic("Jami Qarz")}</p>
                <div className="space-y-1">
                  <p className={`text-2xl font-bold tracking-tight ${customer.debtUSD > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ${(customer.debtUSD || 0).toFixed(2)}
                  </p>
                  <p className="text-xs font-bold text-gray-400">{(customer.debtUZS || 0).toLocaleString()} sum</p>
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="glass-card hover-lift p-8 sm:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{latinToCyrillic("Mijoz ma'lumotlari")}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{latinToCyrillic("Jami Xaridlar")}</p>
                  <p className="text-xl font-bold text-gray-900">{sales.length} {latinToCyrillic("ta")}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{latinToCyrillic("Umumiy Qiymat")}</p>
                  <p className="text-xl font-bold text-emerald-600">${totalPurchases.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{latinToCyrillic("O'rtacha Chek")}</p>
                  <p className="text-xl font-bold text-blue-600">${averagePurchase.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-8 border-b border-gray-200/50 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{latinToCyrillic("Savdolar Tarixi")}</h3>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-8 py-6 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Sana")}</th>
                    <th className="px-8 py-6 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Mahsulotlar")}</th>
                    <th className="px-8 py-6 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Jami")}</th>
                    <th className="px-8 py-6 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Qarz")}</th>
                    <th className="px-8 py-6 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{formatDate(sale.createdAt)}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: #{sale.id.slice(-6)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-xs">
                          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {sale.items?.map((i: any) => i.name).join(', ')}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1">
                            {sale.items?.length} {latinToCyrillic("tur mahsulot")}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {sale.currency === 'USD' ? '$' : ''}{sale.totalAmount.toLocaleString()}{sale.currency === 'UZS' ? ' sum' : ''}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className={`font-bold text-sm ${sale.debtAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {sale.currency === 'USD' ? '$' : ''}{sale.debtAmount.toLocaleString()}{sale.currency === 'UZS' ? ' sum' : ''}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          sale.debtAmount > 0 
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${sale.debtAmount > 0 ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                          {sale.debtAmount > 0 ? latinToCyrillic("Qarz") : latinToCyrillic("To'langan")}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <Package className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Sotuvlar mavjud emas")}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

