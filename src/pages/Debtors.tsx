import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { getExchangeRates } from '../lib/settings';
import { getCategoryEmoji, getCategoryText } from '../lib/stockUtils';
import { latinToCyrillic } from '../lib/transliterator';
import { 
  CreditCard, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Mail, 
  Users,
  Crown,
  ArrowLeft,
  Sparkles,
  Wallet,
  Receipt
} from 'lucide-react';

export default function Debtors() {
  const navigate = useNavigate();
  const [debtors, setDebtors] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [paymentForm, setPaymentForm] = useState({
    paidUZS: '',
    paidUSD: '',
    paidCLICK: '',
    description: ''
  });
  const [sortBy, setSortBy] = useState<'amount' | 'date'>('amount');

  useEffect(() => {
    loadDebtors();
    loadExchangeRates();
  }, []);

  const loadDebtors = () => {
    api.get('/customers').then(({ data }) => {
      const customersWithDebt = data.filter((customer: any) => customer.debt > 0);
      setDebtors(customersWithDebt);
    });
  };

  const loadExchangeRates = async () => {
    const rates = await getExchangeRates();
    setExchangeRates(rates);
  };

  // Saralash
  const sortedDebtors = [...debtors].sort((a, b) => {
    if (sortBy === 'amount') {
      return b.debt - a.debt; // Eng katta qarz birinchi
    } else {
      return new Date(b.lastPurchase || 0).getTime() - new Date(a.lastPurchase || 0).getTime();
    }
  });

  // Statistika
  const totalDebt = debtors.reduce((sum, debtor) => sum + debtor.debt, 0);
  const avgDebt = debtors.length > 0 ? totalDebt / debtors.length : 0;
  const highDebtors = debtors.filter(d => d.debt > 1000);

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
    const clickInUSD = click / exchangeRates.USD_TO_UZS;
    
    return uzsInUSD + usd + clickInUSD;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const paidAmount = calculatePaidInUSD();
      
      if (paidAmount <= 0) {
        alert('Iltimos, to\'lov summasini kiriting');
        return;
      }

      await api.post(`/customers/${selectedCustomer.id}/payment`, {
        amount: paidAmount,
        currency: 'USD',
        description: paymentForm.description,
        paymentDetails: {
          uzs: parseFloat(paymentForm.paidUZS) || 0,
          usd: parseFloat(paymentForm.paidUSD) || 0,
          click: parseFloat(paymentForm.paidCLICK) || 0,
        }
      });

      setShowPaymentModal(false);
      setSelectedCustomer(null);
      loadDebtors();
      alert('To\'lov muvaffaqiyatli amalga oshirildi!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'To\'lovda xatolik yuz berdi');
    }
  };

  const getCategoryColor = (category: string) => {
    if (category === 'VIP') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    if (category === 'RISK') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const paidAmount = calculatePaidInUSD();
  const remainingDebt = selectedCustomer ? Math.max(0, selectedCustomer.debt - paidAmount) : 0;

  return (
    <div className="min-h-screen space-y-10 pb-20 animate-in fade-in duration-1000 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-b-[3rem] p-10 sm:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border-b border-gray-100 dark:border-gray-800">
        {/* Background blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-br from-red-200/30 to-orange-200/30 dark:from-red-900/20 dark:to-orange-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-100/20 to-red-100/20 dark:from-amber-900/10 dark:to-red-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/30 rounded-full border border-red-100 dark:border-red-800 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 dark:text-red-400 shadow-sm">
                <Sparkles className="w-3 h-3 animate-pulse" />
                DEBT MANAGEMENT
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9]">
                {latinToCyrillic("Qarzdor")} <br />
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">{latinToCyrillic("Mijozlar")}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-lg max-w-md">
                {debtors.length} {latinToCyrillic("ta qarzdor mijoz")} • {latinToCyrillic("Jami qarz:")} {formatCurrency(totalDebt, 'USD')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <button 
                onClick={() => navigate('/customers')} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-[2rem] font-black text-xs tracking-widest transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
                {latinToCyrillic("MIJOZLARGA QAYTISH")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stat Cards */}
      <div className="px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: latinToCyrillic('Qarzdorlar Soni'), 
              value: debtors.length, 
              icon: Users, 
              color: 'red',
              gradient: 'from-red-500 to-rose-600',
              desc: latinToCyrillic('ta mijoz')
            },
            { 
              title: latinToCyrillic('Jami Qarz'), 
              value: formatCurrency(totalDebt, 'USD'),
              subValue: `≈ ${(totalDebt * exchangeRates.USD_TO_UZS).toLocaleString()} UZS`,
              icon: Wallet, 
              color: 'orange',
              gradient: 'from-orange-500 to-amber-600',
              desc: latinToCyrillic('umumiy qarz')
            },
            { 
              title: latinToCyrillic("O'rtacha Qarz"), 
              value: formatCurrency(avgDebt, 'USD'),
              icon: TrendingUp, 
              color: 'amber',
              gradient: 'from-amber-500 to-yellow-600',
              desc: latinToCyrillic('har bir mijoz')
            },
            { 
              title: latinToCyrillic('Katta Qarzdorlar'), 
              value: highDebtors.length,
              icon: Crown, 
              color: 'purple',
              gradient: 'from-purple-500 to-violet-600',
              desc: latinToCyrillic('$1000 dan yuqori')
            }
          ].map((stat, idx) => (
            <div key={idx} className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-[0_15px_50px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              {/* Hover Glow */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                
                <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-3">{stat.title}</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
                {stat.subValue && (
                  <p className="text-sm font-bold text-gray-500 mt-1">{stat.subValue}</p>
                )}
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg w-fit">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Buttons - Premium Style */}
      <div className="px-4 sm:px-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSortBy('amount')}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs tracking-widest transition-all duration-300 ${
              sortBy === 'amount'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-red-300'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            {latinToCyrillic("QARZ MIQYOSIDA")}
          </button>
          <button
            onClick={() => setSortBy('date')}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs tracking-widest transition-all duration-300 ${
              sortBy === 'date'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-red-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {latinToCyrillic("SANA BO'YICHA")}
          </button>
        </div>
      </div>

      {/* Debtors List - Premium Cards */}
      <div className="px-4 sm:px-8 space-y-5">
        {sortedDebtors.map((debtor, index) => (
          <div 
            key={debtor.id} 
            className="group bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
          >
            {/* Gradient border on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                {/* Left - Info */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                      #{index + 1}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{debtor.name}</h3>
                    <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest ${getCategoryColor(debtor.category)}`}>
                      <span className="mr-1">{getCategoryEmoji(debtor.category)}</span>
                      {getCategoryText(debtor.category)}
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {debtor.phone && (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{debtor.phone}</span>
                      </div>
                    )}
                    {debtor.email && (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{debtor.email}</span>
                      </div>
                    )}
                    {debtor.lastPurchase && (
                      <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-amber-700 dark:text-amber-300">
                          {latinToCyrillic("Oxirgi:")} {new Date(debtor.lastPurchase).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500">{latinToCyrillic("Qarz:")}</span>
                      <span className="text-2xl font-black text-red-600">
                        {formatCurrency(debtor.debt, 'USD')}
                      </span>
                      <span className="text-xs font-bold text-red-400">
                        (≈ {(debtor.debt * exchangeRates.USD_TO_UZS).toLocaleString()} UZS)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500">{latinToCyrillic("Balans:")}</span>
                      <span className="text-lg font-black text-gray-800 dark:text-gray-200">{formatCurrency(debtor.balance, 'USD')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500">{latinToCyrillic("Sotuvlar:")}</span>
                      <span className="text-lg font-black text-blue-600">{debtor._count.sales} {latinToCyrillic("ta")}</span>
                    </div>
                  </div>
                </div>

                {/* Right - Actions */}
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  <button
                    onClick={(e) => handlePayDebt(debtor, e)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-lg shadow-green-500/25 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Receipt className="w-4 h-4" />
                    {latinToCyrillic("QARZ TO'LASH")}
                  </button>
                  <button
                    onClick={() => navigate(`/customers/${debtor.id}`)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-xs tracking-widest transition-all"
                  >
                    {latinToCyrillic("BATAFSIL")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {debtors.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-16 text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-emerald-600 mb-3">{latinToCyrillic("Qarzdorlar Yo'q!")}</h3>
            <p className="text-gray-500 font-medium">
              {latinToCyrillic("Barcha mijozlar qarzlarini to'lagan. Ajoyib!")}
            </p>
          </div>
        )}
      </div>

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
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold">Jami Qarz:</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    ${selectedCustomer.debt.toFixed(2)} USD
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ {(selectedCustomer.debt * exchangeRates.USD_TO_UZS).toLocaleString()} UZS
                </p>
              </div>

              {/* To'lov - 3 xil valyuta */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  To'lov Summasi
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* UZS */}
                  <div>
                    <label className="text-sm font-medium">Naqd So'm (UZS)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-1"
                      value={paymentForm.paidUZS}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paidUZS: e.target.value })}
                      placeholder="0"
                      step="1000"
                      min="0"
                    />
                    {paymentForm.paidUZS && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ ${(parseFloat(paymentForm.paidUZS) / exchangeRates.USD_TO_UZS).toFixed(2)} USD
                      </p>
                    )}
                  </div>

                  {/* USD */}
                  <div>
                    <label className="text-sm font-medium">Dollar (USD)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-1"
                      value={paymentForm.paidUSD}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paidUSD: e.target.value })}
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                    {paymentForm.paidUSD && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ {(parseFloat(paymentForm.paidUSD) * exchangeRates.USD_TO_UZS).toLocaleString()} UZS
                      </p>
                    )}
                  </div>

                  {/* CLICK */}
                  <div>
                    <label className="text-sm font-medium">Click (UZS)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-1"
                      value={paymentForm.paidCLICK}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paidCLICK: e.target.value })}
                      placeholder="0"
                      step="1000"
                      min="0"
                    />
                    {paymentForm.paidCLICK && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ ${(parseFloat(paymentForm.paidCLICK) / exchangeRates.USD_TO_UZS).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                </div>

                {/* To'lov Xulosasi */}
                {paidAmount > 0 && (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Jami To'lanmoqda:</span>
                      <span className="font-bold text-green-600">
                        ${paidAmount.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Qolgan Qarz:</span>
                      <span className={`font-bold ${remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${remainingDebt.toFixed(2)} USD
                      </span>
                    </div>
                    {paidAmount > selectedCustomer.debt && (
                      <div className="flex justify-between">
                        <span className="font-medium">Ortiqcha:</span>
                        <span className="font-bold text-blue-600">
                          ${(paidAmount - selectedCustomer.debt).toFixed(2)} USD
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Izoh */}
              <div>
                <label className="text-sm font-medium">Izoh (ixtiyoriy)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg mt-1"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="Qarz to'lovi"
                />
              </div>

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
                  Bekor qilish
                </Button>
                <Button type="submit" className="flex-1">
                  <DollarSign className="w-4 h-4 mr-2" />
                  To'lovni Amalga Oshirish
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
