import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import api from '../lib/api';
import { getExchangeRates } from '../lib/settings';
import { getCategoryEmoji, getCategoryText } from '../lib/stockUtils';
import { formatCurrency } from '../lib/utils';
import { latinToCyrillic } from '../lib/transliterator';
import { Users, Eye, DollarSign, AlertTriangle, TrendingUp, Users2, Crown, CreditCard, Trash2, FileSpreadsheet, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exportToExcel } from '../lib/excelUtils';

import type { Customer } from '../types';

export default function Customers() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCashier = location.pathname.startsWith('/cashier');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [form, setForm] = useState({ name: '', phone: '', category: 'NORMAL', telegramId: '' });
  const [paymentForm, setPaymentForm] = useState({
    paidUZS: '',
    paidUSD: '',
    paidCLICK: '',
    description: ''
  });
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'debtors' | 'vip'>('all');

  useEffect(() => {
    loadCustomers();
    loadExchangeRates();
  }, []);

  const loadCustomers = () => {
    api.get('/customers').then(({ data }) => setCustomers(data));
  };

  const loadExchangeRates = async () => {
    const rates = await getExchangeRates();
    setExchangeRates(rates);
  };

  // Qarzdor mijozlarni filtrlash
  const filteredCustomers = customers.filter(customer => {
    if (filter === 'debtors') return (customer.debtUSD > 0 || customer.debtUZS > 0);
    if (filter === 'vip') return customer.category === 'VIP';
    return true;
  });

  // Statistika
  const debtCustomers = customers.filter(c => (c.debtUSD > 0 || c.debtUZS > 0));
  const totalDebtUSD = debtCustomers.reduce((sum, c) => sum + (c.debtUSD || 0), 0);
  const totalDebtUZS = debtCustomers.reduce((sum, c) => sum + (c.debtUZS || 0), 0);
  const vipCustomers = customers.filter(c => c.category === 'VIP');
  const activeCustomers = customers.filter(c => {
    if (!c.lastPurchase) return false;
    const lastPurchase = new Date(c.lastPurchase);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return lastPurchase > thirtyDaysAgo;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Agar Telegram ID kiritilgan bo'lsa, uni yuqori registrga o'tkazish
      const submitData = {
        name: form.name,
        phone: form.phone,
        category: form.category,
        ...(form.telegramId.trim() && { telegramId: form.telegramId.toUpperCase().trim() })
      };
      
      await api.post('/customers', submitData);
      setShowForm(false);
      setForm({ name: '', phone: '', category: 'NORMAL', telegramId: '' });
      loadCustomers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Mijoz qo\'shishda xatolik yuz berdi');
    }
  };

  const deleteCustomer = async (customerId: string, customerName: string) => {
    if (confirm(`Ростдан ҳам "${customerName}" mijozini ўчирмоқчимисиз? Бу амал бекор қилинмайди!`)) {
      try {
        await api.delete(`/customers/${customerId}`);
        alert('✅ Mijoz muvaffaqiyatli o\'chirildi!');
        loadCustomers(); // Ro'yxatni yangilash
      } catch (error) {
        console.error('Mijozni o\'chirishda xatolik:', error);
        alert('❌ Xatolik yuz berdi!');
      }
    }
  };

  const handlePayDebt = (customer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setShowPaymentModal(true);
    setPaymentForm({
      paidUZS: '',
      paidUSD: '',
      paidCLICK: '',
      description: 'Qarz to\'lovi'
    });
  };

  const calculatePaidInUSD = () => {
    const uzs = parseFloat(paymentForm.paidUZS) || 0;
    const usd = parseFloat(paymentForm.paidUSD) || 0;
    const click = parseFloat(paymentForm.paidCLICK) || 0;
    
    const uzsInUSD = uzs / exchangeRates.USD_TO_UZS;
    const clickInUSD = click / exchangeRates.USD_TO_UZS; // CLICK ham UZS kabi
    
    return uzsInUSD + usd + clickInUSD;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const paidUSD = parseFloat(paymentForm.paidUSD) || 0;
      const paidUZS = parseFloat(paymentForm.paidUZS) || 0;
      const paidCLICK = parseFloat(paymentForm.paidCLICK) || 0;
      
      if (paidUSD <= 0 && paidUZS <= 0 && paidCLICK <= 0) {
        alert('Iltimos, to\'lov summasini kiriting');
        return;
      }

      // To'lovni yuborish. Backend'da qaysi valyuta qarzini qanday tartibda yopish
      // avtomatik hisoblanishi uchun paymentDetails va umumiy amount yuboriladi.
      await api.post(`/customers/${selectedCustomer.id}/payment`, {
        description: paymentForm.description,
        paymentDetails: {
          usd: paidUSD,
          uzs: paidUZS,
          click: paidCLICK
        },
        // Umumiy USD ekvivalenti (Waterfall mantiqi uchun backend'ga yordam beradi)
        amountUSD: paidUSD + ((paidUZS + paidCLICK) / exchangeRates.USD_TO_UZS),
        currency: 'USD'
      });

      setShowPaymentModal(false);
      setSelectedCustomer(null);
      loadCustomers();
      
      const totalUZS = (paidUZS + paidCLICK).toLocaleString();
      alert(`✅ To'lov qabul qilindi!\n\nKiritilgan: ${paidUSD > 0 ? `$${paidUSD}` : ''} ${paidUZS + paidCLICK > 0 ? `${totalUZS} sum` : ''}\n\nUshbu summalar avval o'z valyutasidagi qarzni, ortiqchasi esa boshqa valyutadagi qarzni yopishga yo'naltiriladi.`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'To\'lovda xatolik yuz berdi');
    }
  };

  const handleDiscountTemplate = (customer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setShowDiscountModal(true);
    setDiscountAmount('');
  };

  const handleApplyDiscountTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const discount = parseFloat(discountAmount);
    if (!discount || discount === 0) {
      alert('⚠️ Iltimos, chegirma miqdorini kiriting!');
      return;
    }

    const confirmMsg = `🎁 Chegirma shabloni:\n\n` +
      `Mijoz: ${selectedCustomer.name}\n` +
      `Chegirma: ${discount > 0 ? '-' : '+'}${Math.abs(discount)} UZS\n\n` +
      `Ushbu chegirma barcha mahsulotlarga qo'llanadi.\n\n` +
      `Davom ettirilsinmi?`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      const response = await api.post(`/customers/${selectedCustomer.id}/apply-discount-template`, {
        discount
      });

      setShowDiscountModal(false);
      setSelectedCustomer(null);
      alert(`✅ Muvaffaqiyatli!\n\n${response.data.appliedCount} ta mahsulot uchun chegirma qo'llandi.`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Chegirma qo\'llashda xatolik yuz berdi');
    }
  };

  const handleDeleteCustomer = (customer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    try {
      await api.delete(`/customers/${selectedCustomer.id}`);
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (error: any) {
      console.error('Delete customer error:', error);
      // Modalni yopish va xatolikni ko'rsatish
      setShowDeleteModal(false);
      setSelectedCustomer(null);
    }
  };

  const getCategoryColor = (category: string) => {
    if (category === 'VIP') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    if (category === 'RISK') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const paidAmount = calculatePaidInUSD();
  const remainingDebt = selectedCustomer ? Math.max(0, selectedCustomer.debt - paidAmount) : 0;

  const handleExportExcel = () => {
    const dataToExport = filteredCustomers.map(c => ({
      'Ism': c.name,
      'Telefon': c.phone || '-',
      'Kategoriya': c.category || 'NORMAL',
      'Qarz (USD)': c.debtUSD || 0,
      'Qarz (UZS)': c.debtUZS || 0,
      'Balans (USD)': c.balanceUSD || 0,
      'Balans (UZS)': c.balanceUZS || 0,
      'Oxirgi xarid': c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : '-'
    }));
    
    exportToExcel(dataToExport, 'Mijozlar_Ro\'yxati', 'Mijozlar');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-12">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/30">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {latinToCyrillic("Mijozlar")}
                </h1>
                <p className="text-sm text-blue-100/80">
                  {customers.length} {latinToCyrillic("ta mijoz")} • {activeCustomers.length} {latinToCyrillic("ta faol")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium text-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {latinToCyrillic("Excel")}
              </button>
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95"
              >
                {showForm ? latinToCyrillic("Bekor") : <><Plus className="w-5 h-5" />{latinToCyrillic("Yangi mijoz")}</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Modern Gradient Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: latinToCyrillic("Jami mijozlar"), value: customers.length, icon: Users, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
            { title: latinToCyrillic("Qarzdorlar"), value: debtCustomers.length, icon: CreditCard, color: 'rose', gradient: 'from-rose-500 to-pink-600' },
            { title: latinToCyrillic("VIP mijozlar"), value: vipCustomers.length, icon: Crown, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
            { title: latinToCyrillic("Faol mijozlar"), value: activeCustomers.length, icon: TrendingUp, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' }
          ].map((stat, idx) => (
            <div key={idx} className={`group bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 shadow-lg shadow-${stat.color}-500/25 hover:shadow-xl hover:shadow-${stat.color}-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded-full">{stat.title}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/70 mt-1">{latinToCyrillic("ta mijoz")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filter Tabs - Modern Design */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/80 backdrop-blur-sm rounded-2xl w-fit shadow-lg shadow-blue-900/5 border border-white/50">
          {[
            { id: 'all', name: latinToCyrillic("Barchasi"), icon: Users2, count: customers.length, color: 'blue' },
            { id: 'debtors', name: latinToCyrillic("Qarzdorlar"), icon: CreditCard, count: debtCustomers.length, color: 'rose' },
            { id: 'vip', name: latinToCyrillic("VIP"), icon: Crown, count: vipCustomers.length, color: 'amber' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                filter === f.id 
                  ? `bg-gradient-to-r from-${f.color}-500 to-${f.color === 'amber' ? 'orange' : f.color}-600 text-white shadow-lg shadow-${f.color}-500/25` 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.name}
              <span className={`px-2 py-0.5 rounded-lg text-xs ${filter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{f.count}</span>
            </button>
          ))}
        </div>

        {showForm && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <Card className="rounded-2xl border-0 overflow-hidden shadow-xl shadow-blue-900/10">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white">
                <h3 className="text-lg font-bold tracking-tight">{latinToCyrillic("Yangi Mijoz Qo'shish")}</h3>
                <p className="text-blue-100 text-sm font-medium opacity-90">{latinToCyrillic("Mijoz ma'lumotlarini to'ldiring")}</p>
              </div>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Исм" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-lg h-11 text-sm" />
                  <Input label="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="rounded-lg h-11 text-sm" />
                  <Input 
                    label="Telegram ID (ixtiyoriy)" 
                    value={form.telegramId} 
                    onChange={(e) => setForm({ ...form, telegramId: e.target.value.toUpperCase() })}
                    placeholder="Masalan: A1B2C3D4"
                    maxLength={8}
                    className="rounded-lg h-11 text-sm"
                  />
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">KATEGORIYA</label>
                    <select
                      className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-800 border-none rounded-lg font-bold text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="NORMAL">Одатий</option>
                      <option value="VIP">VIP</option>
                      <option value="RISK">Хавфли</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <Button type="submit" size="lg" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-base shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]">
                      {latinToCyrillic("Mijozni Saqlash")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCustomers.map((customer, index) => {
            const isDebtor = (customer.debtUSD > 0 || customer.debtUZS > 0);
            const isVIP = customer.category === 'VIP';
            const isRisk = customer.category === 'RISK';
            
            return (
              <div 
                key={customer.id}
                onClick={() => navigate(isCashier ? `/cashier/customers/${customer.id}` : `/customers/${customer.id}`)}
                className={`group relative bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-slate-100/50 overflow-hidden ${
                  isRisk ? 'ring-2 ring-rose-200' : 
                  isVIP ? 'ring-2 ring-amber-200' : ''
                }`}
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isVIP ? 'from-amber-50/50 via-orange-50/30 to-transparent' : isRisk ? 'from-rose-50/50 via-pink-50/30 to-transparent' : 'from-blue-50/50 via-indigo-50/30 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Status Badge & VIP - Premium */}
                <div className="relative flex items-center justify-between mb-5">
                  {isVIP ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                      <Crown className="w-4 h-4" />
                      VIP
                    </div>
                  ) : isRisk ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30">
                      <AlertTriangle className="w-4 h-4" />
                      Risk
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                      <Users className="w-4 h-4" />
                      Normal
                    </div>
                  )}
                  <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
                    #{customer.id?.slice(0, 6).toUpperCase() || 'N/A'}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110 ${
                    isVIP ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/30' : 
                    isRisk ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-rose-500/30' : 
                    'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                  }`}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate text-base">{customer.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{customer.phone || latinToCyrillic("Telefon yo'q")}</p>
                  </div>
                </div>

                {/* Debt Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1">{latinToCyrillic("Qarz (USD)")}</p>
                    <p className={`text-lg font-bold ${customer.debtUSD > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ${customer.debtUSD?.toFixed(0) || '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-medium mb-1">{latinToCyrillic("Qarz (UZS)")}</p>
                    <p className={`text-lg font-bold ${customer.debtUZS > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {customer.debtUZS?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handlePayDebt(customer, e)}
                    className="flex-1 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold text-xs uppercase tracking-wide transition-all shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <DollarSign className="w-4 h-4" />
                    {latinToCyrillic("To'lov")}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(isCashier ? `/cashier/sales?customerId=${customer.id}` : `/sales?customerId=${customer.id}`); }}
                    className="w-10 h-10 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteCustomer(customer, e)}
                    className="w-10 h-10 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Qarz To'lash Modal */}
      {/* Qarz To'lash Modal */}
      {showPaymentModal && selectedCustomer && (
        <Modal 
          isOpen={showPaymentModal} 
          onClose={() => setShowPaymentModal(false)}
          title={`Qarz To'lash - ${selectedCustomer.name}`}
          size="lg"
        >
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Qarz Ma'lumoti */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold">USD Qarz:</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                      ${selectedCustomer.debtUSD.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-red-600" />
                      <span className="font-semibold">UZS Qarz:</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                      {selectedCustomer.debtUZS.toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                {/* To'lov - 3 xil valyuta */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    To'lov Summasi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* USD */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Input
                        label="Dollar (USD)"
                        type="text"
                        inputMode="decimal"
                        value={paymentForm.paidUSD}
                        onChange={(e) => {
                          const raw = e.target.value.replace(',', '.');
                          if (raw !== '' && isNaN(Number(raw)) && raw !== '.') return;
                          setPaymentForm({ ...paymentForm, paidUSD: raw });
                        }}
                        placeholder="0"
                      />
                      <p className="text-[10px] text-blue-600 font-bold mt-1">
                        USD qarzni yopish uchun
                      </p>
                    </div>

                    {/* UZS */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <Input
                        label="Naqd So'm (UZS)"
                        type="text"
                        inputMode="decimal"
                        value={paymentForm.paidUZS}
                        onChange={(e) => {
                          const raw = e.target.value.replace(',', '.');
                          if (raw !== '' && isNaN(Number(raw)) && raw !== '.') return;
                          setPaymentForm({ ...paymentForm, paidUZS: raw });
                        }}
                        placeholder="0"
                      />
                      <p className="text-[10px] text-green-600 font-bold mt-1">
                        UZS qarzni yopish uchun
                      </p>
                    </div>

                    {/* CLICK */}
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Input
                        label="Click (UZS)"
                        type="text"
                        inputMode="decimal"
                        value={paymentForm.paidCLICK}
                        onChange={(e) => {
                          const raw = e.target.value.replace(',', '.');
                          if (raw !== '' && isNaN(Number(raw)) && raw !== '.') return;
                          setPaymentForm({ ...paymentForm, paidCLICK: raw });
                        }}
                        placeholder="0"
                      />
                      <p className="text-[10px] text-purple-600 font-bold mt-1">
                        UZS qarzni yopish uchun
                      </p>
                    </div>
                  </div>

                  {/* To'lov Xulosasi */}
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-sm font-medium text-gray-600">Jami USD to'lov:</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">${(parseFloat(paymentForm.paidUSD) || 0).toFixed(2)}</span>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">USD qarz uchun</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Jami UZS to'lov:</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">{( (parseFloat(paymentForm.paidUZS) || 0) + (parseFloat(paymentForm.paidCLICK) || 0) ).toLocaleString()} sum</span>
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">UZS qarz uchun</p>
                      </div>
                    </div>
                    
                    {/* Qolgan qarz prognozi */}
                    <div className="mt-2 pt-2 border-t-2 border-dashed border-gray-300">
                      <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">To'lovdan keyingi umumiy qoldiq:</p>
                      
                      {/* Waterfall hisoblash mantiqi UI uchun */}
                      {(() => {
                        const pUSD = parseFloat(paymentForm.paidUSD) || 0;
                        const pUZS = (parseFloat(paymentForm.paidUZS) || 0) + (parseFloat(paymentForm.paidCLICK) || 0);
                        
                        let remUSD = selectedCustomer.debtUSD;
                        let remUZS = selectedCustomer.debtUZS;
                        
                        // 1. USD to'lov avval USD qarzni yopadi
                        const coverUSD = Math.min(remUSD, pUSD);
                        remUSD -= coverUSD;
                        const extraUSD = pUSD - coverUSD;
                        
                        // 2. UZS to'lov avval UZS qarzni yopadi
                        const coverUZS = Math.min(remUZS, pUZS);
                        remUZS -= coverUZS;
                        const extraUZS = pUZS - coverUZS;
                        
                        // 3. Ortiqcha USD -> UZS qarzga
                        if (extraUSD > 0 && remUZS > 0) {
                          const convertToUZS = extraUSD * exchangeRates.USD_TO_UZS;
                          const useUSDforUZS = Math.min(remUZS, convertToUZS);
                          remUZS -= useUSDforUZS;
                        }
                        
                        // 4. Ortiqcha UZS -> USD qarzga
                        if (extraUZS > 0 && remUSD > 0) {
                          const convertToUSD = extraUZS / exchangeRates.USD_TO_UZS;
                          const useUZSforUSD = Math.min(remUSD, convertToUSD);
                          remUSD -= useUZSforUSD;
                        }

                        return (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                              <p className="text-[9px] text-gray-500 font-bold uppercase">Qolgan USD:</p>
                              <p className={`text-sm font-bold ${remUSD > 0.01 ? 'text-red-500' : 'text-green-500'}`}>
                                ${remUSD.toFixed(2)}
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                              <p className="text-[9px] text-gray-500 font-bold uppercase">Qolgan UZS:</p>
                              <p className={`text-sm font-bold ${remUZS > 100 ? 'text-red-500' : 'text-green-500'}`}>
                                {Math.round(remUZS).toLocaleString()} sum
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                      
                      <p className="text-[9px] text-gray-400 mt-2 italic">
                        * Ortiqcha to'lov avtomatik tarzda boshqa valyutadagi qarzni yopishga yo'naltiriladi (Kurs: 1$ = {exchangeRates.USD_TO_UZS.toLocaleString()} sum)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Izoh */}
                <Input
                  label="Izoh (ixtiyoriy)"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="Qarz to'lovi"
                />

                {/* Kurslar */}
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    <strong>Joriy Kurs:</strong> 1 USD = {exchangeRates.USD_TO_UZS.toLocaleString()} UZS
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1"
                  >
                    Бекор қилиш
                  </Button>
                  <Button type="submit" className="flex-1">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Тўловни Амалга Ошириш
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
      )}

      {/* Chegirma Shabloni Modal */}
      {showDiscountModal && selectedCustomer && (
        <Modal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          title={`Chegirma Shabloni - ${selectedCustomer.name}`}
        >
          <form onSubmit={handleApplyDiscountTemplate} className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                <span className="text-lg">🎁</span>
                Chegirma Shabloni
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Ushbu mijoz uchun barcha mahsulotlarga bir xil chegirma qo'llash
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Chegirma Miqdori (UZS)
              </label>
              <Input
                type="text"
                inputMode="decimal"
                value={discountAmount}
                onChange={(e) => {
                  const raw = e.target.value.replace(',', '.');
                  if (raw !== '' && isNaN(Number(raw)) && raw !== '.' && raw !== '-') return;
                  setDiscountAmount(raw);
                }}
                placeholder="Masalan: 5000 (standart narxdan -5000 UZS)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Musbat son: chegirma (masalan: 5000 = -5000 UZS)<br />
                💡 Manfiy son: qo'shimcha (masalan: -5000 = +5000 UZS)
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Misol:</strong><br />
                Agar 5000 kiritsangiz, barcha mahsulotlar standart narxdan 5000 UZS arzonroq bo'ladi.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDiscountModal(false)}
                className="flex-1"
              >
                Бекор қилиш
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <span className="text-lg mr-2">✨</span>
                Қўллаш
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mijozni O'chirish Modal */}
      {showDeleteModal && selectedCustomer && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Mijozni O'chirish"
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    Mijozni o'chirishni tasdiqlang
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {selectedCustomer.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Diqqat:</strong> Mijozni o'chirgandan so'ng, barcha ma'lumotlari (sotuvlar, to'lovlar, qarzlar) ham o'chiriladi. Bu amalni qaytarib bo'lmaydi!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={confirmDeleteCustomer}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                O'chirish
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
