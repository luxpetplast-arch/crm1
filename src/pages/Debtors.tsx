import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { getExchangeRates } from '../lib/settings';
import { getCategoryEmoji, getCategoryText } from '../lib/stockUtils';
import { CreditCard, AlertTriangle, DollarSign, TrendingUp, Calendar, Phone, Mail } from 'lucide-react';

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-red-500" />
          Qarzdor Mijozlar
        </h1>
        <Button onClick={() => navigate('/customers')} className="w-full sm:w-auto min-h-[44px]">
          Barcha Mijozlarga Qaytish
        </Button>
      </div>

      {/* Statistika Kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qarzdorlar Soni</p>
                <p className="text-2xl font-bold text-red-600">{debtors.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Qarz</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt, 'USD')}</p>
                <p className="text-xs text-muted-foreground">
                  ≈ {(totalDebt * exchangeRates.USD_TO_UZS).toLocaleString()} UZS
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">O'rtacha Qarz</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(avgDebt, 'USD')}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Katta Qarzdorlar</p>
                <p className="text-2xl font-bold text-purple-600">{highDebtors.length}</p>
                <p className="text-xs text-muted-foreground">&gt;$1000+</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saralash Tugmalari */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortBy === 'amount' ? 'primary' : 'secondary'}
          onClick={() => setSortBy('amount')}
          className="min-h-[44px]"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Qarz miqyosida
        </Button>
        <Button
          variant={sortBy === 'date' ? 'primary' : 'secondary'}
          onClick={() => setSortBy('date')}
          className="min-h-[44px]"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Sana bo'yicha
        </Button>
      </div>

      {/* Qarzdorlar Ro'yxati */}
      <div className="space-y-4">
        {sortedDebtors.map((debtor, index) => (
          <Card key={debtor.id} className="border-2 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-red-600">#{index + 1}</span>
                    <h3 className="font-semibold text-lg">{debtor.name}</h3>
                    <div className={`px-3 py-1 rounded-lg ${getCategoryColor(debtor.category)}`}>
                      <span className="text-base">{getCategoryEmoji(debtor.category)}</span>
                      <span className="text-xs font-semibold ml-1">{getCategoryText(debtor.category)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{debtor.phone}</span>
                    </div>
                    {debtor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{debtor.email}</span>
                      </div>
                    )}
                    {debtor.address && (
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{debtor.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Qarz: </span>
                      <span className="font-bold text-red-600 text-lg">
                        {formatCurrency(debtor.debt, 'USD')}
                      </span>
                      <span className="text-xs text-red-600 ml-1">
                        (≈ {(debtor.debt * exchangeRates.USD_TO_UZS).toLocaleString()} UZS)
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Balans: </span>
                      <span className="font-semibold">{formatCurrency(debtor.balance, 'USD')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sotuvlar: </span>
                      <span className="font-semibold">{debtor._count.sales} ta</span>
                    </div>
                  </div>

                  {debtor.lastPurchase && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Ohirgi xarid: {new Date(debtor.lastPurchase).toLocaleDateString('uz-UZ')}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={(e) => handlePayDebt(debtor, e)}
                    className="bg-green-600 hover:bg-green-700 min-h-[44px]"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Qarz To'lash
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/customers/${debtor.id}`)}
                    className="min-h-[44px]"
                  >
                    Batafsil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {debtors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-600 mb-2">Qarzdorlar Yo'q!</h3>
              <p className="text-muted-foreground">
                Barcha mijozlar qarzlarini to'lagan. Ajoyib!
              </p>
            </CardContent>
          </Card>
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
