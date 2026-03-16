import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import api from '../lib/api';
import { getExchangeRates } from '../lib/settings';
import { getCategoryEmoji, getCategoryText } from '../lib/stockUtils';
import { formatCurrency } from '../lib/utils';
import { Users, Eye, DollarSign, AlertTriangle, TrendingUp, Users2, Crown, CreditCard, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: 'NORMAL', telegramId: '' });
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
    if (filter === 'debtors') return customer.debt > 0;
    if (filter === 'vip') return customer.category === 'VIP';
    return true;
  });

  // Statistika
  const debtCustomers = customers.filter(c => c.debt > 0);
  const totalDebt = debtCustomers.reduce((sum, c) => sum + c.debt, 0);
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
        email: form.email || undefined,
        phone: form.phone,
        category: form.category,
        ...(form.telegramId.trim() && { telegramId: form.telegramId.toUpperCase().trim() })
      };
      
      await api.post('/customers', submitData);
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', category: 'NORMAL', telegramId: '' });
      loadCustomers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Mijoz qo\'shishda xatolik yuz berdi');
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
      loadCustomers();
      alert('To\'lov muvaffaqiyatli amalga oshirildi!');
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Mijozlar</h1>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto min-h-[44px]">
          {showForm ? 'Bekor qilish' : 'Mijoz Qo\'shish'}
        </Button>
      </div>

      {/* Statistika Kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Mijozlar</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qarzdorlar</p>
                <p className="text-2xl font-bold text-red-600">{debtCustomers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalDebt, 'USD')}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP Mijozlar</p>
                <p className="text-2xl font-bold text-purple-600">{vipCustomers.length}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faol Mijozlar</p>
                <p className="text-2xl font-bold text-green-600">{activeCustomers.length}</p>
                <p className="text-xs text-muted-foreground">30 kun ichida</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtrlash Tugmalari */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
          className="min-h-[44px]"
        >
          <Users2 className="w-4 h-4 mr-2" />
          Barchasi ({customers.length})
        </Button>
        <Button
          variant={filter === 'debtors' ? 'primary' : 'secondary'}
          onClick={() => setFilter('debtors')}
          className="min-h-[44px]"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Qarzdorlar ({debtCustomers.length})
        </Button>
        <Button
          variant={filter === 'vip' ? 'primary' : 'secondary'}
          onClick={() => setFilter('vip')}
          className="min-h-[44px]"
        >
          <Crown className="w-4 h-4 mr-2" />
          VIP ({vipCustomers.length})
        </Button>
      </div>

      {showForm && (
        <div className="max-h-[80vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Yangi Mijoz</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              
              {/* Telegram ID input */}
              <div>
                <Input 
                  label="Telegram ID (ixtiyoriy)" 
                  value={form.telegramId} 
                  onChange={(e) => setForm({ ...form, telegramId: e.target.value.toUpperCase() })}
                  placeholder="Masalan: A1B2C3D4"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Mijoz Telegram botdan /start yuborgan paytda olgan 8 belgili ID raqamini kiriting
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="VIP">VIP</option>
                  <option value="RISK">Risk</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Mijoz Yaratish</Button>
            </form>
          </CardContent>
        </Card>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="cursor-pointer"
          >
            <Card className={`hover:shadow-lg transition-all active:scale-95 ${
              customer.debt > 0 ? 'border-2 border-red-200 dark:border-red-800' : ''
            }`}>
              <CardContent>
                <div 
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="mb-4"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base sm:text-lg">{customer.name}</h3>
                        {customer.telegramChatId && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full" title="Telegram bog'langan">
                            📱
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{customer.phone}</p>
                      {customer.telegramUsername && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">@{customer.telegramUsername}</p>
                      )}
                      
                      {/* Rangli Kategoriya Badge */}
                      <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg ${getCategoryColor(customer.category)}`}>
                        <span className="text-base">{getCategoryEmoji(customer.category)}</span>
                        <span className="text-xs font-semibold">{getCategoryText(customer.category)}</span>
                      </div>
                    </div>
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Balans:</span>
                      <span className="font-semibold">{formatCurrency(customer.balance, 'USD')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Qarz:</span>
                      <div className="flex items-center gap-2">
                        {customer.debt > 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`font-semibold ${customer.debt > 0 ? 'text-red-500' : ''}`}>
                          {formatCurrency(customer.debt, 'USD')}
                        </span>
                      </div>
                    </div>
                    {customer.debt > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        ≈ {(customer.debt * exchangeRates.USD_TO_UZS).toLocaleString()} UZS
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Jami Sotuvlar:</span>
                      <span className="font-semibold">{customer._count.sales}</span>
                    </div>
                  </div>
                </div>

                {/* Qarz to'lash tugmasi */}
                {customer.debt > 0 && (
                  <div className="pt-3 border-t border-border">
                    <Button
                      onClick={(e) => handlePayDebt(customer, e)}
                      className="w-full bg-green-600 hover:bg-green-700 min-h-[44px]"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Qarz To'lash
                    </Button>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="flex items-center justify-center gap-2 text-primary text-sm font-medium hover:text-primary/80 transition-colors min-h-[44px] px-3 py-2 rounded-lg hover:bg-primary/10"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Batafsil</span>
                    </button>
                    <button
                      onClick={(e) => handleDiscountTemplate(customer, e)}
                      className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors min-h-[44px] px-3 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20"
                    >
                      <span className="text-base">🎁</span>
                      <span>Chegirma</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteCustomer(customer, e)}
                      className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors min-h-[44px] px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>O'chirish</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
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
                      <Input
                        label="Naqd So'm (UZS)"
                        type="number"
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
                      <Input
                        label="Dollar (USD)"
                        type="number"
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
                      <Input
                        label="Click (UZS)"
                        type="number"
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
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="Masalan: 5000 (standart narxdan -5000 UZS)"
                required
                step="1"
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
                Bekor qilish
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <span className="text-lg mr-2">✨</span>
                Qo'llash
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
