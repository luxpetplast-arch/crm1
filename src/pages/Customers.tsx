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
import { Users, Eye, DollarSign, AlertTriangle, TrendingUp, Users2, Crown, CreditCard, Trash2, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../lib/excelUtils';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
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
    <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl p-10 sm:p-16 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800">
        {/* Background blobs */}
        <div className="absolute top-0 -left-10 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                <Crown className="w-3 h-3 animate-pulse" />
                Customer Management
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9]">
                {latinToCyrillic("Mijozlar")} <br />
                <span className="text-indigo-600">{latinToCyrillic("Bazasi")}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-bold tracking-tight">
                {customers.length} {latinToCyrillic("ta umumiy mijoz")} • {activeCustomers.length} {latinToCyrillic("ta faol")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <button 
                onClick={handleExportExcel}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-black text-sm transition-all active:scale-95 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                {latinToCyrillic("EXCEL")}
              </button>
              
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black text-sm transition-all active:scale-95 text-white shadow-2xl shadow-indigo-500/30"
              >
                {showForm ? latinToCyrillic("BEKOR QILISH") : latinToCyrillic("YANGI MIJOZ")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Jami Mijozlar', value: customers.length, icon: Users, color: 'blue', desc: 'Bazadagi barcha mijozlar' },
          { title: 'Qarzdorlar', value: debtCustomers.length, icon: CreditCard, color: 'rose', desc: `${totalDebtUSD.toFixed(0)}$ + ${totalDebtUZS.toLocaleString()} UZS` },
          { title: 'VIP Mijozlar', value: vipCustomers.length, icon: Crown, color: 'amber', desc: 'Eng ko\'p xarid qilganlar' },
          { title: 'Faol Mijozlar', value: activeCustomers.length, icon: TrendingUp, color: 'emerald', desc: 'Oxirgi 30 kunda faol' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-2xl ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 
              stat.color === 'rose' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' : 
              stat.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
            }`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{stat.title}</p>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2 leading-none">{stat.value}</h3>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter and Content Area */}
      <div className="space-y-8">
        <div className="flex flex-wrap gap-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
          {[
            { id: 'all', name: 'BARCHASI', icon: Users2, count: customers.length },
            { id: 'debtors', name: 'QARZDORLAR', icon: CreditCard, count: debtCustomers.length },
            { id: 'vip', name: 'VIP MIJOZLAR', icon: Crown, count: vipCustomers.length }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-lg font-black text-xs transition-all duration-300 ${
                filter === f.id 
                  ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xl scale-105' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.name}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${filter === f.id ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>{f.count}</span>
            </button>
          ))}
        </div>

        {showForm && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <Card className="rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 overflow-hidden shadow-2xl">
              <div className="bg-indigo-600 p-8 text-white">
                <h3 className="text-2xl font-black tracking-tight">{latinToCyrillic("Yangi Mijoz Qo'shish")}</h3>
                <p className="text-indigo-100 text-sm font-bold opacity-80">{latinToCyrillic("Mijoz ma'lumotlarini to'ldiring")}</p>
              </div>
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Исм" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-lg h-14" />
                  <Input label="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="rounded-lg h-14" />
                  <Input 
                    label="Telegram ID (ixtiyoriy)" 
                    value={form.telegramId} 
                    onChange={(e) => setForm({ ...form, telegramId: e.target.value.toUpperCase() })}
                    placeholder="Masalan: A1B2C3D4"
                    maxLength={8}
                    className="rounded-lg h-14"
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">KATEGORIYA</label>
                    <select
                      className="w-full h-14 px-6 bg-gray-50 dark:bg-gray-800 border-none rounded-lg font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="NORMAL">Одатий</option>
                      <option value="VIP">VIP</option>
                      <option value="RISK">Хавфли</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <Button type="submit" size="lg" className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black text-lg shadow-2xl shadow-indigo-500/30 transition-all active:scale-[0.98]">
                      {latinToCyrillic("Mijozni Saqlash")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCustomers.map((customer) => {
            const isDebtor = (customer.debtUSD > 0 || customer.debtUZS > 0);
            const isVIP = customer.category === 'VIP';
            const isRisk = customer.category === 'RISK';
            
            return (
              <div 
                key={customer.id}
                onClick={() => navigate(`/customers/${customer.id}`)}
                className={`group relative bg-white dark:bg-gray-900 rounded-xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border-2 transition-all duration-500 hover:scale-[1.03] cursor-pointer ${
                  isRisk ? 'border-red-100 dark:border-red-900/30' : 
                  isVIP ? 'border-amber-100 dark:border-amber-900/30' : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                {/* VIP Badge */}
                {isVIP && (
                  <div className="absolute top-6 right-6">
                    <Crown className="w-6 h-6 text-amber-500 animate-pulse" />
                  </div>
                )}

                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center font-black text-xl shadow-2xl transition-all duration-500 group-hover:rotate-6 ${
                    isVIP ? 'bg-amber-500 text-white' : 
                    isRisk ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 dark:text-white truncate text-lg tracking-tight leading-none mb-1">{customer.name}</h3>
                    <p className="text-xs font-bold text-gray-400 truncate tracking-wide">{customer.phone}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">QARZ (USD)</p>
                    <p className={`font-black text-lg ${customer.debtUSD > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ${customer.debtUSD?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">QARZ (UZS)</p>
                    <p className={`font-black text-lg ${customer.debtUZS > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {customer.debtUZS?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handlePayDebt(customer, e)}
                    className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    {latinToCyrillic("To'lov")}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}`); }}
                    className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-indigo-600 rounded-lg flex items-center justify-center transition-all active:scale-95"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteCustomer(customer, e)}
                    className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
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
                        <span className="text-lg font-black text-blue-600">${(parseFloat(paymentForm.paidUSD) || 0).toFixed(2)}</span>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">USD qarz uchun</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Jami UZS to'lov:</span>
                      <div className="text-right">
                        <span className="text-lg font-black text-green-600">{( (parseFloat(paymentForm.paidUZS) || 0) + (parseFloat(paymentForm.paidCLICK) || 0) ).toLocaleString()} sum</span>
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
