import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  DollarSign,
  ShoppingCart,
  Receipt,
  Search,
  Clock,
} from 'lucide-react';
import { latinToCyrillic } from '../lib/transliterator';
import { useSales } from '../hooks/useSales';
import { SalesStatsCards, SalesFilters, SaleCard } from '../components/sales';
import SalesHistory from '../components/SalesHistory';
import { generateSimpleReceiptHTML } from '../lib/simpleReceiptPrinter';
import { formatDateTime } from '../lib/dateUtils';
import type { Sale } from '../types';

// Receipt print function
const printReceipt = (sale: Sale) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };

  const receiptItems = (sale.items || []).map((item: any) => ({
    id: item?.id || item?.product?.id || 'N/A',
    name: item?.product?.name || item?.productName || 'Nomalum',
    quantity: item?.quantity || 0,
    unit: item?.saleType === 'piece' ? 'dona' : 'qop',
    piecesPerBag: item?.product?.unitsPerBag || item?.unitsPerBag || 2000,
    pricePerBag: item?.pricePerBag || item?.price || 0,
    pricePerPiece: item?.pricePerPiece || (item?.pricePerBag / (item?.product?.unitsPerBag || 2000)) || 0,
    pricePerUnit: item?.pricePerBag || item?.pricePerUnit || 0,
    subtotal: item?.subtotal || 0,
  }));

  const receiptData = {
    saleId: sale.id,
    receiptNumber: sale.id.slice(0, 8),
    date: formatDateTime(sale.createdAt).split(' ')[0],
    time: formatDateTime(sale.createdAt).split(' ')[1],
    cashier: user.name,
    currency: sale.currency || 'USD',
    customer: {
      name: sale.customer?.name || 'Nomalum',
      phone: sale.customer?.phone,
      address: sale.customer?.address,
      previousBalanceUSD: sale.customer?.debtUSD || 0,
      newBalanceUSD: sale.customer?.debtUSD || 0,
    },
    items: receiptItems,
    subtotal: sale.total || sale.totalAmount || 0,
    total: sale.total || sale.totalAmount || 0,
    payments: {
      uzs: sale.paymentDetails?.uzs || 0,
      usd: sale.paymentDetails?.usd || 0,
      click: sale.paymentDetails?.click || 0,
    },
    totalPaid: sale.paidAmount || sale.paid || 0,
    debt: sale.debtAmount || sale.debt || 0,
    companyInfo: {
      name: 'LUX PET PLAST',
      address: "Buxoro viloyati, Vobkent tumani",
      phone: '+998 91 414 44 58, +998 91 920 07 00',
    },
  };

  const receiptHTML = generateSimpleReceiptHTML(receiptData);
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  }
};

export default function SalesClean() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCashierRoute = location.pathname.startsWith('/cashier');
  const addSalePath = isCashierRoute ? '/cashier/sales/add' : '/sales/add';
  const {
    filteredSales,
    stats,
    loading,
    error,
    filter,
    exchangeRate,
    activeTab,
    setFilter,
    setExchangeRate,
    setActiveTab,
  } = useSales();

  const handleEdit = useCallback(
    (sale: Sale) => {
      navigate(addSalePath, { state: { editSale: sale } });
    },
    [navigate, addSalePath]
  );

  const handlePrint = useCallback((sale: Sale) => {
    try {
      printReceipt(sale);
    } catch (error) {
      console.error('Chek chiqarishda xatolik:', error);
      alert('Chek chiqarishda xatolik yuz berdi!');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-bold">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {latinToCyrillic('Qayta yuklash')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
        {/* Decorative elements with pointer-events-none */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pointer-events-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/30">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{latinToCyrillic("Savdo Bo'limi")}</h1>
                <p className="text-sm text-blue-100/80">{latinToCyrillic('Mijozlar bilan savdo jarayonlari')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-50">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="text"
                  placeholder={latinToCyrillic('Qidiruv...')}
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 w-48 cursor-pointer"
                />
              </div>

              {/* Exchange Rate */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20">
                <DollarSign className="w-4 h-4 text-blue-200" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-100">1 USD =</span>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 12500)}
                    className="w-20 text-sm font-semibold text-white bg-white/20 border border-white/30 rounded-lg px-2 py-1 focus:outline-none focus:bg-white/30"
                    min="1"
                    placeholder="12500"
                  />
                  <span className="text-xs text-blue-200">UZS</span>
                </div>
              </div>

              <button
                onClick={() => {
                  console.log('Yangi Sotuv button clicked!', { isCashierRoute, addSalePath });
                  navigate(addSalePath);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer relative"
                type="button"
              >
                <Plus className="w-5 h-5" />
                {latinToCyrillic('Yangi Sotuv')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex p-1.5 bg-white/80 backdrop-blur-sm rounded-2xl w-fit shadow-lg shadow-blue-900/5 border border-white/50 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {latinToCyrillic('Amaldagi sotuvlar')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            {latinToCyrillic('Sotuvlar tarixi')}
          </button>
        </div>

        {activeTab === 'history' && <SalesHistory />}

        {activeTab === 'sales' && (
          <div className="space-y-6 rounded-xl">
            {/* Stats */}
            {filteredSales.length > 0 && <SalesStatsCards stats={stats} latinToCyrillic={latinToCyrillic} />}

            {/* Filters */}
            {filteredSales.length > 0 && (
              <SalesFilters
                search={filter.search}
                status={filter.status}
                resultCount={filteredSales.length}
                latinToCyrillic={latinToCyrillic}
                onSearchChange={(value) => setFilter({ ...filter, search: value })}
                onStatusChange={(status) => setFilter({ ...filter, status })}
              />
            )}

            {/* Empty State */}
            {filteredSales.length === 0 && filter.search === '' ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-900/5 p-16 text-center">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-blue-50">
                  <Receipt className="w-14 h-14 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{latinToCyrillic("Hozircha sotuvlar yo'q")}</h3>
                <p className="text-base text-slate-500 mb-8 max-w-md mx-auto">
                  {latinToCyrillic('Birinchi sotuvni yaratish uchun quyidagi tugmani bosing')}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(addSalePath)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold text-base transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  {latinToCyrillic('Yangi Sotuv')}
                </button>
              </div>
            ) : filteredSales.length === 0 && filter.search !== '' ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-900/5 p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-xl font-medium text-slate-600">{latinToCyrillic('Qidiruv bo\'yicha natija topilmadi')}</p>
                <p className="text-sm text-slate-400 mt-2">{latinToCyrillic("Boshqa so'z bilan qidirib ko'ring")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSales.map((sale) => (
                  <SaleCard
                    key={sale.id}
                    sale={sale}
                    latinToCyrillic={latinToCyrillic}
                    onEdit={() => handleEdit(sale)}
                    onPrint={() => handlePrint(sale)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
