import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import CashboxHistory from '../components/CashboxHistory';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  PieChart as PieChartIcon,
  RefreshCw,
  Filter,
  ArrowLeftRight,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  History
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export default function Cashbox() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [cashbox, setCashbox] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    type: 'CASH' // CASH, CARD, CLICK
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'ALL', // ALL, INCOME, EXPENSE
    paymentMethod: 'ALL' // ALL, CASH, CARD, CLICK
  });
  const [transferForm, setTransferForm] = useState({
    from: 'CASH',
    to: 'CARD',
    amount: '',
    description: ''
  });
  const [limits, setLimits] = useState({
    cashLimit: 50000,
    cardLimit: 100000,
    clickLimit: 100000,
    alertEnabled: true
  });

  useEffect(() => {
    loadCashbox();
  }, []);

  const loadCashbox = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type !== 'ALL') params.append('type', filters.type);
      if (filters.paymentMethod !== 'ALL') params.append('paymentMethod', filters.paymentMethod);

      const [cashboxRes, transactionsRes] = await Promise.all([
        api.get(`/cashbox/summary?${params.toString()}`),
        api.get(`/cashbox/transactions?limit=50&${params.toString()}`)
      ]);
      setCashbox(cashboxRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Kassa ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cashbox/add', {
        amount: parseFloat(form.amount),
        currency: form.currency,
        type: form.type,
        description: form.description || 'Kassa to\'ldirish'
      });
      setShowAddMoney(false);
      setForm({ amount: '', currency: 'USD', description: '', type: 'CASH' });
      loadCashbox();
      alert('Kassa muvaffaqiyatli to\'ldirildi!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cashbox/withdraw', {
        amount: parseFloat(form.amount),
        currency: form.currency,
        type: form.type,
        description: form.description || 'Kassa chiqim'
      });
      setShowWithdraw(false);
      setForm({ amount: '', currency: 'USD', description: '', type: 'CASH' });
      loadCashbox();
      alert('Chiqim muvaffaqiyatli amalga oshirildi!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cashbox/transfer', {
        from: transferForm.from,
        to: transferForm.to,
        amount: parseFloat(transferForm.amount),
        description: transferForm.description || 'To\'lov usullari o\'rtasida transfer'
      });
      setShowTransfer(false);
      setTransferForm({ from: 'CASH', to: 'CARD', amount: '', description: '' });
      loadCashbox();
      alert('Transfer muvaffaqiyatli amalga oshirildi!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/cashbox/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kassa-hisobot-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('PDF eksport qilishda xatolik');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/cashbox/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kassa-hisobot-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Excel eksport qilishda xatolik');
    }
  };

  const applyFilters = () => {
    loadCashbox();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: 'ALL',
      paymentMethod: 'ALL'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const paymentMethodsData = [
    { name: 'Naqd (UZS)', value: cashbox?.byCurrency?.cashUZS || 0, color: COLORS[0] },
    { name: 'Dollar (USD)', value: cashbox?.byCurrency?.cashUSD || 0, color: COLORS[1] },
    { name: 'Click (UZS)', value: cashbox?.byCurrency?.clickUZS || 0, color: COLORS[2] },
  ];

  // Limit ogohlantirishlari
  const cashWarning = limits.alertEnabled && (cashbox?.byCurrency?.cashUZS || 0) > limits.cashLimit;
  const cardWarning = limits.alertEnabled && (cashbox?.byCurrency?.cashUSD || 0) > limits.cardLimit;
  const clickWarning = limits.alertEnabled && (cashbox?.byCurrency?.clickUZS || 0) > limits.clickLimit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            Kassa Boshqaruvi
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time kassa nazorati va tahlili
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowAddMoney(true)} className="bg-green-600 hover:bg-green-700">
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Kirim
          </Button>
          <Button onClick={() => setShowWithdraw(true)} variant="destructive">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Chiqim
          </Button>
          <Button onClick={() => setShowTransfer(true)} variant="secondary">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Transfer
          </Button>
          <Button onClick={() => setShowFilters(true)} variant="secondary">
            <Filter className="w-4 h-4" />
          </Button>
          <Button onClick={loadCashbox} variant="secondary">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wallet className="w-4 h-4 inline mr-2" />
          Umumiy Ko'rinish
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4 inline mr-2" />
          Tarix
        </button>
      </div>

      {/* Content */}
      {activeTab === 'history' ? (
        <CashboxHistory />
      ) : (
        <>
      {/* Asosiy Balans */}
      <Card className="border-2 border-primary bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-2">Jami Kassa Balansi</p>
            <p className="text-5xl font-bold text-primary mb-4">
              {formatCurrency(cashbox?.totalBalance || 0, 'USD')}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>Bugun: {formatCurrency(cashbox?.todayIncome || 0, 'USD')}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span>Bugun: {formatCurrency(cashbox?.todayExpense || 0, 'USD')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limit Ogohlantirishlari */}
      {(cashWarning || cardWarning || clickWarning) && (
        <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Kassa Limiti Oshdi!
                </p>
                <div className="space-y-1 text-sm text-orange-800 dark:text-orange-200">
                  {cashWarning && (
                    <p>• Naqd pul (UZS): {(cashbox?.byCurrency?.cashUZS || 0).toLocaleString()} so'm (Limit: {(limits.cashLimit * 12500).toLocaleString()} so'm)</p>
                  )}
                  {cardWarning && (
                    <p>• Dollar (USD): ${(cashbox?.byCurrency?.cashUSD || 0).toFixed(2)} (Limit: ${limits.cardLimit.toFixed(2)})</p>
                  )}
                  {clickWarning && (
                    <p>• Click (UZS): {(cashbox?.byCurrency?.clickUZS || 0).toLocaleString()} so'm (Limit: {(limits.clickLimit * 12500).toLocaleString()} so'm)</p>
                  )}
                </div>
                <Button 
                  onClick={() => setShowLimits(true)} 
                  variant="secondary" 
                  size="sm" 
                  className="mt-3"
                >
                  Limitlarni Sozlash
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Valyuta bo'yicha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Banknote className="w-8 h-8 text-green-500" />
              <span className="text-sm text-muted-foreground">Naqd (UZS)</span>
            </div>
            <p className="text-2xl font-bold">
              {(cashbox?.byCurrency?.cashUZS || 0).toLocaleString()} so'm
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Naqd pul (O'zbek so'mi)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-8 h-8 text-blue-500" />
              <span className="text-sm text-muted-foreground">Dollar (USD)</span>
            </div>
            <p className="text-2xl font-bold">
              ${(cashbox?.byCurrency?.cashUSD || 0).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Dollar to'lovlar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Smartphone className="w-8 h-8 text-orange-500" />
              <span className="text-sm text-muted-foreground">Click (UZS)</span>
            </div>
            <p className="text-2xl font-bold">
              {(cashbox?.byCurrency?.clickUZS || 0).toLocaleString()} so'm
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Elektron to'lovlar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafiklar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* To'lov Usullari */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              To'lov Usullari Taqsimoti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${((entry.value / cashbox?.totalBalance) * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value), 'USD')} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Kunlik Oqim */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Kunlik Pul Oqimi (7 kun)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashbox?.dailyFlow || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value), 'USD')} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Kirim" />
                <Bar dataKey="expense" fill="#ef4444" name="Chiqim" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bugungi Kirim</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(cashbox?.todayIncome || 0, 'USD')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bugungi Chiqim</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(cashbox?.todayExpense || 0, 'USD')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Oylik Kirim</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(cashbox?.monthlyIncome || 0, 'USD')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Oylik Chiqim</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(cashbox?.monthlyExpense || 0, 'USD')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tranzaksiyalar Tarixi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Oxirgi Tranzaksiyalar</CardTitle>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Sana</th>
                  <th className="text-left py-3 px-4">Turi</th>
                  <th className="text-left py-3 px-4">Usul</th>
                  <th className="text-left py-3 px-4">Tavsif</th>
                  <th className="text-right py-3 px-4">Summa</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      {new Date(tx.createdAt).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.type === 'INCOME' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {tx.type === 'INCOME' ? 'Kirim' : 'Chiqim'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {tx.paymentMethod === 'CASH' && <Banknote className="w-4 h-4" />}
                        {tx.paymentMethod === 'CARD' && <CreditCard className="w-4 h-4" />}
                        {tx.paymentMethod === 'CLICK' && <Smartphone className="w-4 h-4" />}
                        <span className="text-sm">
                          {tx.paymentMethod === 'CASH' ? 'Naqd' : 
                           tx.paymentMethod === 'CARD' ? 'Karta' : 'Click'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {tx.description}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Kirim Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Kassa Kirim</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMoney} className="space-y-4">
                <Input
                  label="Summa"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
                <div>
                  <label className="text-sm font-medium">Valyuta</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">To'lov Usuli</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="CASH">Naqd</option>
                    <option value="CARD">Karta</option>
                    <option value="CLICK">Click</option>
                  </select>
                </div>
                <Input
                  label="Tavsif"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Kirim sababi"
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddMoney(false)}
                    className="flex-1"
                  >
                    Bekor qilish
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Qo'shish
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chiqim Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Kassa Chiqim</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <Input
                  label="Summa"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
                <div>
                  <label className="text-sm font-medium">Valyuta</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">To'lov Usuli</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="CASH">Naqd</option>
                    <option value="CARD">Karta</option>
                    <option value="CLICK">Click</option>
                  </select>
                </div>
                <Input
                  label="Tavsif"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Chiqim sababi"
                  required
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowWithdraw(false)}
                    className="flex-1"
                  >
                    Bekor qilish
                  </Button>
                  <Button type="submit" variant="destructive" className="flex-1">
                    Chiqarish
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5" />
                To'lov Usullari O'rtasida Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Qayerdan</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    value={transferForm.from}
                    onChange={(e) => setTransferForm({ ...transferForm, from: e.target.value })}
                  >
                    <option value="CASH">Naqd</option>
                    <option value="CARD">Karta</option>
                    <option value="CLICK">Click</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Qayerga</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    value={transferForm.to}
                    onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
                  >
                    <option value="CASH">Naqd</option>
                    <option value="CARD">Karta</option>
                    <option value="CLICK">Click</option>
                  </select>
                </div>
                <Input
                  label="Summa (USD)"
                  type="number"
                  step="0.01"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  required
                />
                <Input
                  label="Tavsif"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                  placeholder="Transfer sababi"
                />
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p>
                    <strong>{transferForm.from === 'CASH' ? 'Naqd' : transferForm.from === 'CARD' ? 'Karta' : 'Click'}</strong>
                    {' → '}
                    <strong>{transferForm.to === 'CASH' ? 'Naqd' : transferForm.to === 'CARD' ? 'Karta' : 'Click'}</strong>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowTransfer(false)}
                    className="flex-1"
                  >
                    Bekor qilish
                  </Button>
                  <Button type="submit" className="flex-1">
                    Transfer Qilish
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtrlar Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtrlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Boshlanish Sanasi"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Input
                  label="Tugash Sanasi"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
                <div>
                  <label className="text-sm font-medium">Tranzaksiya Turi</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <option value="ALL">Barchasi</option>
                    <option value="INCOME">Kirim</option>
                    <option value="EXPENSE">Chiqim</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">To'lov Usuli</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                  >
                    <option value="ALL">Barchasi</option>
                    <option value="CASH">Naqd</option>
                    <option value="CARD">Karta</option>
                    <option value="CLICK">Click</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetFilters}
                    className="flex-1"
                  >
                    Tozalash
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowFilters(false)}
                    className="flex-1"
                  >
                    Bekor qilish
                  </Button>
                  <Button onClick={applyFilters} className="flex-1">
                    Qo'llash
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Limitlar Modal */}
      {showLimits && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Kassa Limitlari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    checked={limits.alertEnabled}
                    onChange={(e) => setLimits({ ...limits, alertEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">Limit ogohlantirishlarini yoqish</label>
                </div>
                <Input
                  label="Naqd Pul Limiti (USD)"
                  type="number"
                  value={limits.cashLimit}
                  onChange={(e) => setLimits({ ...limits, cashLimit: parseFloat(e.target.value) })}
                  disabled={!limits.alertEnabled}
                />
                <Input
                  label="Karta Limiti (USD)"
                  type="number"
                  value={limits.cardLimit}
                  onChange={(e) => setLimits({ ...limits, cardLimit: parseFloat(e.target.value) })}
                  disabled={!limits.alertEnabled}
                />
                <Input
                  label="Click Limiti (USD)"
                  type="number"
                  value={limits.clickLimit}
                  onChange={(e) => setLimits({ ...limits, clickLimit: parseFloat(e.target.value) })}
                  disabled={!limits.alertEnabled}
                />
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                  <p className="text-blue-900 dark:text-blue-100">
                    Limit oshganda ogohlantirish ko'rsatiladi. Bu xavfsizlik va nazorat uchun foydali.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowLimits(false)}
                    className="flex-1"
                  >
                    Bekor qilish
                  </Button>
                  <Button onClick={() => setShowLimits(false)} className="flex-1">
                    Saqlash
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </>
      )}
    </div>
  );
}
