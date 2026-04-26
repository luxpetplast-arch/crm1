import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Calendar,
  ShoppingCart,
  AlertTriangle,
  Package,
  FileSpreadsheet,
  MapPin,
  RefreshCw,
  TrendingUp,
  Wallet,
  Trash2
} from 'lucide-react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { exportToExcel } from '../lib/excelUtils';
import { latinToCyrillic } from '../lib/transliterator';

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCashier = location.pathname.startsWith('/cashier');
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteCustomer = async () => {
    try {
      if (!id) return;
      console.log('Mijoz o\'chirilmoqda:', id);
      await api.delete(`/customers/${id}`);
      console.log('Mijoz muvaffaqiyatli o\'chirildi');
      setShowDeleteModal(false);
      alert('✅ Mijoz muvaffaqiyatli o\'chirildi!');
      navigate(isCashier ? '/cashier/customers' : '/customers');
    } catch (error: any) {
      console.error('Delete customer error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Mijozni o\'chirishda xatolik yuz berdi';
      alert('❌ Xatolik: ' + errorMsg);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">{latinToCyrillic('Yuklanmoqda...')}</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{latinToCyrillic("Mijoz topilmadi")}</h2>
          <button
            onClick={() => navigate('/cashier/customers')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {latinToCyrillic("Mijozlar ro'yxatiga qaytish")}
          </button>
        </div>
      </div>
    );
  }

  const totalPurchases = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalPaid = sales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
  const totalDebt = sales.reduce((sum, sale) => sum + ((sale.debtAmount || 0)), 0);

  const handleExportExcel = () => {
    const historyData = sales.map(sale => ({
      'Sana': formatDate(sale.createdAt),
      'Mahsulotlar': sale.items?.map((i: any) => `${i.name} (${i.quantity})`).join(', '),
      'Jami': sale.totalAmount,
      'To\'langan': sale.paidAmount,
      'Qarz': sale.debtAmount,
      'Valyuta': sale.currency,
    }));
    exportToExcel(historyData, { fileName: `Mijoz_${customer.name}_Tarixi` });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">{latinToCyrillic("Mijoz kodi")}: {customer.code || 'N/A'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {latinToCyrillic("Yangilash")}
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            type="button"
            onClick={() => { console.log('O\'chirish tugmasi bosildi'); setShowDeleteModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm transition-all"
            title={latinToCyrillic("Mijozni o'chirish")}
          >
            <Trash2 className="w-4 h-4" />
            {latinToCyrillic("O'chirish")}
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{latinToCyrillic("Telefon")}</p>
              <p className="font-medium text-gray-900">{customer.phone || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{latinToCyrillic("Manzil")}</p>
              <p className="font-medium text-gray-900">{customer.address || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{latinToCyrillic("Ro'yxatdan o'tgan")}</p>
              <p className="font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-500">{latinToCyrillic("Balans")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900">${(customer.balanceUSD || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500">{(customer.balanceUZS || 0).toLocaleString()} sum</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-sm text-gray-500">{latinToCyrillic("Qarz")}</p>
          </div>
          <p className="text-xl font-bold text-rose-600">${(customer.debtUSD || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500">{(customer.debtUZS || 0).toLocaleString()} sum</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">{latinToCyrillic("Xaridlar")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{sales.length} {latinToCyrillic("ta")}</p>
          <p className="text-xs text-gray-500">${totalPurchases.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm text-gray-500">{latinToCyrillic("O'rtacha")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            ${sales.length > 0 ? (totalPurchases / sales.length).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-gray-500">{latinToCyrillic("Har bir sotuv")}</p>
        </div>
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-600" />
            {latinToCyrillic("Sotuvlar tarixi")}
          </h2>
          <span className="text-sm text-gray-500">{sales.length} {latinToCyrillic("ta sotuv")}</span>
        </div>
        
        {sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>{latinToCyrillic("Sotuvlar mavjud emas")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{latinToCyrillic("Sana")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{latinToCyrillic("Mahsulotlar")}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{latinToCyrillic("Jami")}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{latinToCyrillic("To'langan")}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{latinToCyrillic("Qarz")}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{latinToCyrillic("Holat")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="space-y-1">
                        {sale.items?.map((i: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="font-medium">{i.name}</span>
                            <span className="text-gray-400">×</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">{i.quantity}</span>
                          </div>
                        )) || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(sale.totalAmount, sale.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-600 text-right">
                      {formatCurrency(sale.paidAmount, sale.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {(sale.debtAmount || 0) > 0 ? (
                        <span className="text-rose-600 font-medium">{formatCurrency(sale.debtAmount, sale.currency)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(sale.debtAmount || 0) > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          {latinToCyrillic("Qarz")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {latinToCyrillic("To'langan")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mijozni O'chirish Modal */}
      {showDeleteModal && customer && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={latinToCyrillic("Mijozni O'chirish")}
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    {latinToCyrillic("Mijozni o'chirishni tasdiqlang")}
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {customer.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>{latinToCyrillic("Diqqat:")}</strong> {latinToCyrillic("Mijozni o'chirgandan so'ng, barcha ma'lumotlari (sotuvlar, to'lovlar, qarzlar) ham o'chiriladi. Bu amalni qaytarib bo'lmaydi!")}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                {latinToCyrillic("Bekor qilish")}
              </Button>
              <Button
                type="button"
                onClick={handleDeleteCustomer}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {latinToCyrillic("O'chirish")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
