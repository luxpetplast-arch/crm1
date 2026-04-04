import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';   
import Input from '../components/Input';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Plus, 
  RefreshCw, 
  ArrowLeft,
  Receipt,
  Calendar,
  Zap,
  Truck,
  UserCheck,
  MoreHorizontal,
  ArrowDownRight,
  ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

const CATEGORY_ICONS: any = {
  SALARY: UserCheck,
  ELECTRICITY: Zap,
  RAW_MATERIALS: Receipt,
  TRANSPORT: Truck,
  TAX: DollarSign,
  OTHER: MoreHorizontal
};

export default function Expenses() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'SALARY',
    amount: '',
    currency: 'UZS',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expRes, sumRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary')
      ]);
      setExpenses(expRes.data);
      const chartData = sumRes.data.map((item: any) => ({
        name: item.category,
        value: item._sum.amount,
      }));
      setSummary(chartData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setShowForm(false);
      setForm({
        category: 'SALARY',
        amount: '',
        currency: 'UZS',
        description: '',
      });
      loadData();
    } catch (err) {
      console.error('Failed to save expense:', err);
      alert(t('Xarajatni saqlashda xatolik yuz berdi'));
    }
  };

  const totalMonthly = summary.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-1000 px-4">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl p-10 sm:p-16 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-rose-900/10 dark:to-orange-900/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 dark:text-rose-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                {t("MOLIYA BOSHQARUVI")}
              </div>
              <h1 className="text-7xl sm:text-[100px] font-black text-gray-900 dark:text-white tracking-tighter leading-[0.85]">
                {t("Moliya")}<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-600">{t("Nazorati")}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold max-w-md text-lg leading-relaxed">
                {t("Barcha xarajatlar ro'yxati va kategoriyalar bo'yicha tahlil")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 w-full lg:w-auto">
              <button 
                onClick={() => setShowForm(true)} 
                className="flex-1 lg:flex-none flex items-center justify-center gap-4 px-12 py-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black text-sm shadow-2xl shadow-gray-900/20 dark:shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                {t("YANGI XARAJAT")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { 
            label: t("Umumiy Xarajat"), 
            value: totalMonthly, 
            icon: TrendingDown, 
            color: 'rose',
            currency: 'UZS',
            desc: t("Joriy oydagi jami chiqim")
          },
          { 
            label: t("Oylik Kirim"), 
            value: totalMonthly * 1.5, 
            icon: TrendingUp, 
            color: 'emerald',
            currency: 'UZS',
            desc: t("Taxminiy oylik foyda")
          },
          { 
            label: t("Xarajat Turlari"), 
            value: summary.length, 
            icon: PieChartIcon, 
            color: 'blue',
            suffix: t('TUR'),
            desc: t("Kategoriyalar soni")
          },
          { 
            label: t("Bugungi Chiqim"), 
            value: totalMonthly / 30, 
            icon: Calendar, 
            color: 'orange',
            currency: 'UZS',
            desc: t("O'rtacha kunlik chiqim")
          }
        ].map((stat, i) => (
          <div key={i} className="group relative bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:-translate-y-2">
            <div className={`w-16 h-16 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center text-${stat.color}-600 mb-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[10deg]`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                  {stat.currency ? (stat.value || 0).toLocaleString() : stat.value}
                </p>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.currency || stat.suffix}</span>
              </div>
              <p className="text-xs font-bold text-gray-400/80 pt-2 border-t border-gray-50 dark:border-gray-800 mt-4 group-hover:text-gray-500 transition-colors">
                {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-10 border border-gray-100 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                {t("Xarajatlar")} <span className="text-purple-600">{t("Taqsimoti")}</span>
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("Kategoriyalar bo'yicha ulush")}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600">
              <PieChartIcon className="w-6 h-6" />
            </div>
          </div>
          
          <div className="h-[350px] w-full relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("JAMI")}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{totalMonthly.toLocaleString()}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">UZS</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={140}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {summary.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827',
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                    padding: '15px 20px'
                  }}
                  itemStyle={{ fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', color: '#fff' }}
                  labelStyle={{ display: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-12">
            {summary.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{item.name}</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{(item.value || 0).toLocaleString()} UZS</p>
                </div>
                <div className="text-[10px] font-black text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                  {((item.value / totalMonthly) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-10 border border-gray-100 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                {t("So'nggi")} <span className="text-rose-600">{t("Xarajatlar")}</span>
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("Oxirgi 15 ta operatsiya")}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-lg flex items-center justify-center text-rose-600">
              <Receipt className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[550px]">
            {expenses.slice(0, 15).map((expense) => {
              const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal;
              return (
                <div key={expense.id} className="group flex items-center gap-5 p-5 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
                  <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center text-rose-600 shadow-sm border border-gray-50 dark:border-gray-800 transition-transform group-hover:scale-110">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{expense.category}</p>
                      <p className="text-lg font-black text-rose-600 tracking-tighter">-{formatCurrency(expense.amount, expense.currency)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px]">{expense.description}</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-300" />
                        <p className="text-[10px] font-black text-gray-400 uppercase">{formatDate(expense.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {t("Yangi")} <span className="text-rose-600">{t("Xarajat")}</span>
                </h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("Barcha maydonlarni to'ldiring")}</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-gray-900 text-gray-400 hover:text-rose-500 hover:rotate-90 transition-all shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <MoreHorizontal className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="space-y-5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t("Kategoriya Tanlash")}</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'SALARY', name: 'Ish Haqi', icon: UserCheck, color: 'blue' },
                    { id: 'ELECTRICITY', name: 'Elektr', icon: Zap, color: 'amber' },
                    { id: 'RAW_MATERIALS', name: 'Xom Ashyo', icon: Receipt, color: 'emerald' },
                    { id: 'TRANSPORT', name: 'Transport', icon: Truck, color: 'indigo' },
                    { id: 'TAX', name: 'Soliq', icon: DollarSign, color: 'rose' },
                    { id: 'OTHER', name: 'Boshqa', icon: MoreHorizontal, color: 'gray' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.id })}
                      className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-lg border-2 transition-all ${
                        form.category === cat.id 
                          ? `border-${cat.color}-500 bg-${cat.color}-50/50 dark:bg-${cat.color}-900/20` 
                          : 'border-gray-50 dark:border-gray-800 hover:border-gray-100'
                      }`}
                    >
                      <cat.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${form.category === cat.id ? `text-${cat.color}-600` : 'text-gray-400'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest text-center ${form.category === cat.id ? `text-${cat.color}-700 dark:text-${cat.color}-400` : 'text-gray-400'}`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t("Summa")}</label>
                  <div className="relative group">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.amount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(',', '.');
                        if (raw !== '' && isNaN(Number(raw)) && raw !== '.') return;
                        setForm({ ...form, amount: raw });
                      }}
                      className="w-full h-16 px-6 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-rose-500 rounded-lg font-black text-xl transition-all outline-none"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs group-focus-within:text-rose-500 transition-colors">
                      {form.currency}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t("Valyuta")}</label>
                  <div className="relative">
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="w-full h-16 rounded-lg border-2 border-gray-50 dark:bg-gray-800 dark:border-gray-800 px-6 font-black text-base focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="UZS">UZS (so'm)</option>
                      <option value="USD">USD ($)</option>
                      <option value="CLICK">CLICK</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MoreHorizontal className="w-4 h-4 text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t("Tavsif")}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-rose-500 outline-none transition-all font-bold text-base min-h-[120px] resize-none"
                  placeholder={t("Izoh qoldiring...")}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-20 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black text-sm tracking-[0.3em] shadow-2xl shadow-gray-900/20 dark:shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 group"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                {t("XARAJATNI TASDIQLASH")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
   