import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import api from '../lib/api';
import { formatDate } from '../lib/dateUtils';
import { formatCurrency } from '../lib/utils';
import {
  Calendar,
  Sun,
  Moon,
  FileText,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';

interface DailyReport {
  date: string;
  type: string;
  sales: {
    totalCount: number;
    totalUZS: number;
    totalUSD: number;
    byPaymentType: {
      cash: number;
      card: number;
      transfer: number;
      debt: number;
    };
    topProducts: Array<{
      id: string;
      name: string;
      quantity: number;
      revenue: number;
    }>;
  };
  orders: {
    total: number;
    sold: number;
    pending: number;
    inProduction: number;
    ready: number;
    list: Array<{
      id: string;
      orderNumber: string;
      customer: string;
      status: string;
      totalAmount: number;
      priority: string;
    }>;
  };
  finance: {
    salesUZS: number;
    salesUSD: number;
    paymentsReceivedUZS: number;
    paymentsReceivedUSD: number;
    expenses: number;
    customerDebtUZS: number;
    customerDebtUSD: number;
    cashboxBalance: {
      cashUZS: number;
      cashUSD: number;
      cardUZS: number;
      cardUSD: number;
    } | null;
  };
  customers: {
    newCount: number;
    newList: Array<{ id: string; name: string; phone?: string }>;
    debtorsCount: number;
    debtorsList: Array<{
      id: string;
      name: string;
      debtUZS: number;
      debtUSD: number;
    }>;
  };
  inventory: {
    lowStockCount: number;
    lowStockProducts: Array<{
      id: string;
      name: string;
      currentStock: number;
      minLimit: number;
    }>;
    totalProducts: number;
  };
  expenses: {
    total: number;
    count: number;
    list: Array<{
      id: string;
      amount: number;
      category: string;
      description?: string;
    }>;
  };
  summary: {
    netRevenueUZS: number;
    activeOrders: number;
    completedOrders: number;
    totalTransactions: number;
  };
}

export default function DailyReports() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [reportType, setReportType] = useState<'full' | 'morning' | 'evening'>('full');
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['sales', 'finance']);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/daily?date=${selectedDate}&type=${reportType}`);
      setReport(data);
    } catch (error) {
      console.error('Hisobotni yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedDate, reportType]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'morning': return 'Ertalabki Hisobot (9:00 gacha)';
      case 'evening': return 'Kechki Hisobot (9:00 - 18:00)';
      default: return 'Kunlik Hisobot (To\'liq)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SOLD':
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'IN_PRODUCTION': return 'bg-purple-100 text-purple-800';
      case 'READY_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunlik Hisobotlar</h1>
          <p className="text-gray-500 mt-1">Ertalabki va kechki hisobotlarni ko'rish</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printReport} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Chop etish
          </Button>
          <Button onClick={fetchReport} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sana
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hisobot Turi
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setReportType('morning')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    reportType === 'morning'
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Ertalabki
                </button>
                <button
                  onClick={() => setReportType('evening')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    reportType === 'evening'
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Kechki
                </button>
                <button
                  onClick={() => setReportType('full')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    reportType === 'full'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  To'liq
                </button>
              </div>
            </div>

            {/* Quick Date Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tezkor Tanlash
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDate(formatDate(new Date()))}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Bugun
                </button>
                <button
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setSelectedDate(formatDate(yesterday));
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Kecha
                </button>
                <button
                  onClick={() => {
                    const lastWeek = new Date();
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    setSelectedDate(formatDate(lastWeek));
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  7 kun oldin
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Title */}
      {report && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{getReportTitle()}</h2>
              <p className="text-blue-100 mt-1">
                Sana: {new Date(selectedDate).toLocaleDateString('uz-UZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{report.summary.totalTransactions}</p>
                <p className="text-xs text-blue-100">Tranzaksiyalar</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(report.finance.salesUZS, 'UZS')}</p>
                <p className="text-xs text-blue-100">Sotuvlar</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Section */}
          <Card className={expandedSections.includes('sales') ? '' : 'overflow-hidden'}>
            <CardHeader 
              className="cursor-pointer bg-gray-50"
              onClick={() => toggleSection('sales')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Sotuvlar</CardTitle>
                    <p className="text-sm text-gray-500">
                      {report.sales.totalCount} ta sotuv • {formatCurrency(report.sales.totalUZS, 'UZS')}
                    </p>
                  </div>
                </div>
                {expandedSections.includes('sales') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            {expandedSections.includes('sales') && (
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">So'mda</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(report.sales.totalUZS, 'UZS')}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Dollarda</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(report.sales.totalUSD, 'USD')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">To'lov turlari:</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-lg font-bold">{report.sales.byPaymentType.cash}</p>
                      <p className="text-xs text-gray-500">Naqd</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-lg font-bold">{report.sales.byPaymentType.card}</p>
                      <p className="text-xs text-gray-500">Karta</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-lg font-bold">{report.sales.byPaymentType.transfer}</p>
                      <p className="text-xs text-gray-500">O'tkazma</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-lg font-bold">{report.sales.byPaymentType.debt}</p>
                      <p className="text-xs text-gray-500">Qarz</p>
                    </div>
                  </div>
                </div>

                {report.sales.topProducts.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Top mahsulotlar:</p>
                    <div className="space-y-1">
                      {report.sales.topProducts.slice(0, 3).map((product, idx) => (
                        <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm">{idx + 1}. {product.name}</span>
                          <span className="text-sm font-medium">{product.quantity} dona</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Finance Section */}
          <Card className={expandedSections.includes('finance') ? '' : 'overflow-hidden'}>
            <CardHeader 
              className="cursor-pointer bg-gray-50"
              onClick={() => toggleSection('finance')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Moliya</CardTitle>
                    <p className="text-sm text-gray-500">
                      Sof foyda: {formatCurrency(report.summary.netRevenueUZS, 'UZS')}
                    </p>
                  </div>
                </div>
                {expandedSections.includes('finance') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            {expandedSections.includes('finance') && (
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600">Tushumlar (UZS)</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(report.finance.paymentsReceivedUZS, 'UZS')}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-red-600">Xarajatlar</p>
                    <p className="text-lg font-bold text-red-700">
                      {formatCurrency(report.finance.expenses, 'UZS')}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">Mijozlar qarzlari</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-yellow-700">
                      {report.customers.debtorsCount} ta mijoz
                    </span>
                    <span className="font-bold text-yellow-800">
                      {formatCurrency(report.finance.customerDebtUZS, 'UZS')}
                    </span>
                  </div>
                </div>

                {report.finance.cashboxBalance && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Kassa holati:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span>Naqd so'm:</span>
                        <span className="font-medium">{formatCurrency(report.finance.cashboxBalance.cashUZS, 'UZS')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span>Naqd dollar:</span>
                        <span className="font-medium">{formatCurrency(report.finance.cashboxBalance.cashUSD, 'USD')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span>Karta so'm:</span>
                        <span className="font-medium">{formatCurrency(report.finance.cashboxBalance.cardUZS, 'UZS')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span>Karta dollar:</span>
                        <span className="font-medium">{formatCurrency(report.finance.cashboxBalance.cardUSD, 'USD')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Orders Section */}
          <Card className={expandedSections.includes('orders') ? '' : 'overflow-hidden'}>
            <CardHeader 
              className="cursor-pointer bg-gray-50"
              onClick={() => toggleSection('orders')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Buyurtmalar</CardTitle>
                    <p className="text-sm text-gray-500">
                      {report.orders.sold} ta sotilgan • {report.orders.pending} ta kutilmoqda
                    </p>
                  </div>
                </div>
                {expandedSections.includes('orders') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            {expandedSections.includes('orders') && (
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-700">{report.orders.sold}</p>
                    <p className="text-xs text-green-600">Sotilgan</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <p className="text-lg font-bold text-yellow-700">{report.orders.pending}</p>
                    <p className="text-xs text-yellow-600">Kutilmoqda</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-lg font-bold text-purple-700">{report.orders.inProduction}</p>
                    <p className="text-xs text-purple-600">Ishlab chiqarishda</p>
                  </div>
                  <div className="text-center p-2 bg-indigo-50 rounded">
                    <p className="text-lg font-bold text-indigo-700">{report.orders.ready}</p>
                    <p className="text-xs text-indigo-600">Yetkazishga tayyor</p>
                  </div>
                </div>

                {report.orders.list.length > 0 && (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Buyurtma</th>
                          <th className="px-3 py-2 text-left">Mijoz</th>
                          <th className="px-3 py-2 text-center">Status</th>
                          <th className="px-3 py-2 text-right">Summa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {report.orders.list.slice(0, 10).map(order => (
                          <tr key={order.id}>
                            <td className="px-3 py-2 font-medium">{order.orderNumber}</td>
                            <td className="px-3 py-2 text-gray-600">{order.customer}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-medium">
                              {formatCurrency(order.totalAmount, 'UZS')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Customers & Inventory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Customers */}
            <Card>
              <CardHeader className="bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Yangi Mijozlar</CardTitle>
                    <p className="text-sm text-gray-500">{report.customers.newCount} ta qo'shilgan</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {report.customers.newList.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {report.customers.newList.map(customer => (
                      <div key={customer.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm">{customer.name}</span>
                        {customer.phone && (
                          <span className="text-xs text-gray-500">{customer.phone}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Yangi mijoz qo'shilmagan</p>
                )}
              </CardContent>
            </Card>

            {/* Inventory Alerts */}
            <Card>
              <CardHeader className="bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ombor</CardTitle>
                    <p className="text-sm text-gray-500">
                      {report.inventory.lowStockCount} ta kam qoldiq
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {report.inventory.lowStockProducts.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {report.inventory.lowStockProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm truncate">{product.name}</span>
                        <span className="text-xs text-red-600 font-medium">
                          {product.currentStock} / {product.minLimit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 py-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Barcha mahsulotlar yetarli</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !report && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Hisobot yuklanmoqda...</p>
          </div>
        </div>
      )}
    </div>
  );
}
