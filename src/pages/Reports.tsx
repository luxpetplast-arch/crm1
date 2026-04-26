import { useState } from 'react';
import api from '../lib/api';
import { latinToCyrillic } from '../lib/transliterator';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar, 
  Filter, 
  Sparkles,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      switch (reportType) {
        case 'sales':
          endpoint = '/sales';
          break;
        case 'expenses':
          endpoint = '/expenses';
          break;
        case 'customers':
          endpoint = '/customers';
          break;
        case 'products':
          endpoint = '/products';
          break;
      }

      const { data: result } = await api.get(`${endpoint}?${params.toString()}`);
      setData(result);
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    let csv = '';
    const headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';

    data.forEach((row) => {
      csv += headers.map((header) => {
        const value = row[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${Date.now()}.csv`;
    a.click();
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'sales': return TrendingUp;
      case 'expenses': return DollarSign;
      case 'customers': return Users;
      case 'products': return Package;
      default: return FileText;
    }
  };

  const getReportColor = (type: string) => {
    switch (type) {
      case 'sales': return 'from-blue-500 to-indigo-600';
      case 'expenses': return 'from-rose-500 to-orange-600';
      case 'customers': return 'from-purple-500 to-violet-600';
      case 'products': return 'from-emerald-500 to-teal-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getReportLabel = (type: string) => {
    switch (type) {
      case 'sales': return latinToCyrillic('Sotuvlar');
      case 'expenses': return latinToCyrillic('Xarajatlar');
      case 'customers': return latinToCyrillic('Mijozlar');
      case 'products': return latinToCyrillic('Mahsulotlar');
      default: return type;
    }
  };

  return (
    <div className="min-h-screen space-y-10 pb-20 animate-in fade-in duration-1000 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Premium Header Section - Login Page Style */}
      <div className="relative overflow-hidden login-card rounded-[2.5rem] mx-4 sm:mx-8">
        {/* Background blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-100/20 to-blue-100/20 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>

        <div className="relative z-10 p-10 sm:p-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-[10px] font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-blue-500/25">
                <Sparkles className="w-3 h-3 animate-pulse" />
                ANALYTICS & REPORTS
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-[0.9]">
                {latinToCyrillic("Hisobotlar")} <br />
                <span className="text-blue-600">{latinToCyrillic("Markazi")}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-lg max-w-md">
                {latinToCyrillic("Barcha turdagi hisobotlarni yuklab olish va tahlil qilish")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Turlari")}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Generator Card */}
      <div className="px-4 sm:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_15px_50px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Filter className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{latinToCyrillic("Hisobot Yaratish")}</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Parametrlarni tanlang")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Report Type */}
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">{latinToCyrillic("Hisobot Turi")}</label>
              <div className="relative">
                <select
                  aria-label="Hisobot turi tanlash"
                  className="w-full h-14 px-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-gray-900 dark:text-white appearance-none cursor-pointer transition-all outline-none"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="sales">{latinToCyrillic("Sotuvlar")}</option>
                  <option value="expenses">{latinToCyrillic("Xarajatlar")}</option>
                  <option value="customers">{latinToCyrillic("Mijozlar")}</option>
                  <option value="products">{latinToCyrillic("Mahsulotlar")}</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {(() => {
                    const Icon = getReportIcon(reportType);
                    return <Icon className="w-5 h-5 text-gray-400" />;
                  })()}
                </div>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">{latinToCyrillic("Boshlanish")}</label>
              <div className="relative">
                <input
                  type="date"
                  aria-label="Boshlanish sanasi"
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-14 px-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-gray-900 dark:text-white outline-none transition-all"
                />
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">{latinToCyrillic("Tugash")}</label>
              <div className="relative">
                <input
                  type="date"
                  aria-label="Tugash sanasi"
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-14 px-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-gray-900 dark:text-white outline-none transition-all"
                />
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em]">{latinToCyrillic("Amallar")}</label>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={generateReport} 
                  disabled={loading}
                  className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-semibold text-sm tracking-widest transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  {loading ? latinToCyrillic('Yuklanmoqda...') : latinToCyrillic('YARATISH')}
                </button>
                {data.length > 0 && (
                  <button 
                    type="button"
                    onClick={exportToCSV}
                    className="h-14 px-5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center"
                  >
                    <Download className="w-5 h-5" />
                    {latinToCyrillic('YUKLAB OLISH')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {data.length > 0 && (
        <div className="px-4 sm:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getReportColor(reportType)} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  {(() => {
                    const Icon = getReportIcon(reportType);
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getReportLabel(reportType)} {latinToCyrillic("Hisoboti")}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{latinToCyrillic("Jami qaydlar:")} {data.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">LIVE</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    {Object.keys(data[0]).slice(0, 6).map((key) => (
                      <th key={key} className="px-6 py-4 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.slice(0, 50).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      {Object.values(row).slice(0, 6).map((value: any, i) => (
                        <td key={i} className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                          {typeof value === 'object' ? JSON.stringify(value).slice(0, 30) : String(value).slice(0, 30)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {data.length > 50 && (
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-sm font-bold text-gray-400">
                  {latinToCyrillic("Yana")} {data.length - 50} {latinToCyrillic("ta qayd mavjud. Excel formatida yuklab oling.")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && !loading && (
        <div className="px-4 sm:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-16 text-center shadow-[0_15px_50px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{latinToCyrillic("Hisobot Tayyor Emas")}</h3>
            <p className="text-gray-500 font-medium max-w-md mx-auto">
              {latinToCyrillic("Hisobot yaratish uchun yuqoridagi parametrlarni tanlang va 'Yaratish' tugmasini bosing")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
