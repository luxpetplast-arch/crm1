import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import api from '../lib/api';
import { Package, Eye, Plus, Trash2, ChevronDown, Pencil, Check, X, FileSpreadsheet, AlertTriangle, List, LayoutGrid, DollarSign } from 'lucide-react';
import { exportToExcel } from '../lib/excelUtils';
import { useTranslation } from 'react-i18next';

function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPriceBag, setEditingPriceBag] = useState<string>('');
  const [editingPricePiece, setEditingPricePiece] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12800 }); // Default, ideally fetch from API

  useEffect(() => {
    loadProducts();
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data && response.data.exchangeRate) {
        setExchangeRates({ USD_TO_UZS: response.data.exchangeRate });
      }
    } catch (error) {
      console.error('Kursni yuklashda xatolik:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Маҳсулотларни юклашда хатолик:', error);
    }
  };

  // Махсулотларни гуруҳлаш
  const groupProducts = (products: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    products.forEach(product => {
      const groupName = product.bagType || 'Бошқа';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(product);
    });
    
    return groups;
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Ростдан ҳам ушбу маҳсулотни ўчирмоқчимисиз?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      loadProducts();
      alert('✅ Маҳсулот муваффақиятли ўчирилди!');
    } catch (error) {
      console.error('Маҳсулотни ўчиришда хатолик:', error);
      alert('❌ Хатолик юз берди!');
    }
  };

  const editProduct = (productId: string) => {
    navigate(`/add-product?edit=${productId}`);
  };

  const startEditing = (product: any) => {
    setEditingProduct(product.id);
    setEditingName(product.name);
    setEditingPriceBag(product.pricePerBag?.toString() || '');
    setEditingPricePiece(product.pricePerPiece?.toString() || '');
  };

  const saveProductData = async (productId: string) => {
    try {
      await api.patch(`/products/${productId}`, { 
        name: editingName,
        pricePerBag: parseFloat(editingPriceBag),
        pricePerPiece: parseFloat(editingPricePiece)
      });
      loadProducts();
      setEditingProduct(null);
      alert('✅ Ma\'lumotlar yangilandi!');
    } catch (error) {
      console.error('Xatolik:', error);
      alert('❌ Xatolik yuz berdi');
    }
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditingName('');
    setEditingPriceBag('');
    setEditingPricePiece('');
  };

  const toggleGroup = (size: string) => {
    setExpandedGroups(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const getStockStatus = (product: any) => {
    if (product.currentStock === 0) {
      return { 
        color: 'text-red-600', 
        bgColor: 'bg-red-100 border-2 border-red-300',
        label: 'Тугаган',
        emoji: '❌'
      };
    }
    
    if (product.currentStock >= (product.optimalStock || 200)) {
      return { 
        color: 'text-emerald-600', 
        bgColor: 'bg-emerald-100 border-2 border-emerald-300',
        label: 'Зўр',
        emoji: '💎'
      };
    }
    
    if (product.currentStock >= (product.minStockLimit || 50)) {
      return { 
        color: 'text-green-600', 
        bgColor: 'bg-green-100 border-2 border-green-300',
        label: 'Яхши',
        emoji: '✅'
      };
    }
    
    return { 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100 border-2 border-orange-300',
      label: 'Кам',
      emoji: '⚠️'
    };
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      if (activeCategory === 'all') return true;

      // 1. Agar warehouse maydoni bo'lsa, undan foydalanamiz
      if (product.warehouse) {
        return product.warehouse === activeCategory;
      }

      // 2. Eski mahsulotlar uchun nom bo'yicha qidirish (fallback)
      const name = product.name.toLowerCase();
      if (activeCategory === 'preform') {
        return (name.includes('g') || name.includes('gr')) && !name.includes('krishka') && !name.includes('ruchka') && !name.includes('cap');
      }
      if (activeCategory === 'krishka') {
        return name.includes('krishka') || name.includes('cap');
      }
      if (activeCategory === 'ruchka') {
        return name.includes('ruchka') || name.includes('handle');
      }
      return activeCategory === 'other';
    });
  };

  const filteredProducts = getFilteredProducts();
  const groupedProducts = groupProducts(filteredProducts);
  const sizes = Object.keys(groupedProducts).sort((a, b) => {
    const aMatch = a.match(/(\d+)/);
    const bMatch = b.match(/(\d+)/);
    
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    return a.localeCompare(b);
  });

  const handleExportExcel = () => {
    const dataToExport = filteredProducts.map(p => ({
      'Nomi': p.name,
      'Turi': p.bagType || '',
      'Ombor': p.warehouse === 'preform' ? 'Preforma' : 
               p.warehouse === 'krishka' ? 'Qopqoq' : 
               p.warehouse === 'ruchka' ? 'Ruchka' : 'Boshqa',
      'Zaxira (qop)': p.currentStock || 0,
      'Narxi ($)': p.pricePerBag || 0,
      'Qopdagi dona': p.unitsPerBag || 0,
      'Status': getStockStatus(p).label
    }));
    
    exportToExcel(dataToExport, `Mahsulotlar_${activeCategory}`, 'Mahsulotlar Ro\'yxati');
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl rounded-[2.5rem] p-10 sm:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white dark:border-gray-800 group">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/50 dark:bg-blue-900/30 rounded-full border border-blue-100/50 dark:border-blue-800/50 text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 backdrop-blur-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                {t("INVENTORY_CONTROL_SYSTEM")}
              </div>
              <h1 className="text-6xl sm:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.85]">
                {t("Mahsulotlar")} <br />
                <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">{t("Ombori")}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold max-w-lg text-lg leading-relaxed">
                {activeCategory === 'preform' ? t('📦 Preformalar ombori nazorati va real vaqtda hisob-kitobi') : 
                 activeCategory === 'krishka' ? t('⭕ Qopqoqlar ombori nazorati va real vaqtda hisob-kitobi') : 
                 activeCategory === 'ruchka' ? t('🎗️ Ruchkalar ombori nazorati va real vaqtda hisob-kitobi') : t('Boshqa inventar nazorati')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <button 
                onClick={handleExportExcel}
                className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-6 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-3xl font-black text-xs border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none transition-all hover:scale-105 active:scale-95 group/btn"
              >
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover/btn:rotate-12 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                EXCEL EXPORT
              </button>
              <button 
                onClick={() => navigate('/add-product')} 
                className="flex-[1.5] lg:flex-none flex items-center justify-center gap-4 px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xs shadow-2xl shadow-blue-500/40 transition-all hover:scale-105 active:scale-95 group/add"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover/add:rotate-90 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                {t("YANGI MAHSULOT")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Tabs - Advanced Glassmorphism */}
      <div className="sticky top-4 z-40 px-4">
        <div className="max-w-5xl mx-auto bg-white/40 dark:bg-gray-900/40 backdrop-blur-[40px] p-2.5 rounded-[2rem] border border-white/40 dark:border-gray-800/40 shadow-[0_32px_64px_rgba(0,0,0,0.1)] flex flex-wrap justify-center items-center gap-2">
          {[
            { id: 'all', label: 'HAMMASI', icon: '📋', color: 'emerald' },
            { id: 'preform', label: 'PREFORMA', icon: '📦', color: 'blue' },
            { id: 'krishka', label: 'QOPQOQ', icon: '⭕', color: 'orange' },
            { id: 'ruchka', label: 'RUCHKA', icon: 'emerald', color: 'emerald' },
            { id: 'other', label: 'BOSHQA', icon: '🛠️', color: 'slate' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[11px] tracking-[0.15em] transition-all duration-700 relative overflow-hidden group ${
                activeCategory === cat.id 
                  ? `bg-${cat.color}-600 text-white shadow-2xl shadow-${cat.color}-500/40 scale-[1.05]` 
                  : `text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50`
              }`}
            >
              {activeCategory === cat.id && (
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
              )}
              <span className="text-xl group-hover:scale-125 transition-transform duration-500">{cat.id === 'ruchka' ? '🎗️' : cat.icon}</span>
              {cat.label}
            </button>
          ))}
          
          <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 mx-2"></div>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`p-4 rounded-2xl border-2 transition-all duration-500 flex items-center justify-center gap-2 font-black text-[10px] tracking-widest ${
              viewMode === 'list' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-white dark:bg-gray-800 border-gray-100 text-gray-400 hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
            }`}
            title={viewMode === 'list' ? "Guruhlangan ko'rinish" : "Ro'yxat ko'rinishi"}
          >
            {viewMode === 'list' ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
            {viewMode === 'list' ? 'GURUH' : 'LIST'}
          </button>
        </div>
      </div>

      {/* Stats Grid - High End Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        {[
          { 
            label: t("Turdagi Mahsulotlar"), 
            value: filteredProducts.length, 
            icon: Package, 
            color: 'blue',
            suffix: t('TUR'),
            gradient: 'from-blue-500 to-indigo-600'
          },
          { 
            label: t("Jami Qoplar"), 
            value: filteredProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0), 
            icon: Package, 
            color: 'indigo',
            suffix: t('QOP'),
            gradient: 'from-indigo-500 to-purple-600'
          },
          { 
            label: t("Optimal Holatda"), 
            value: filteredProducts.filter(p => (p.currentStock || 0) >= (p.minStockLimit || 50)).length, 
            icon: Check, 
            color: 'emerald',
            suffix: t('TUR'),
            gradient: 'from-emerald-500 to-teal-600'
          },
          { 
            label: t("Kam Qolgan"), 
            value: filteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length, 
            icon: AlertTriangle, 
            color: filteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length > 0 ? 'rose' : 'emerald',
            suffix: t('TUR'),
            gradient: filteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length > 0 ? 'from-rose-500 to-red-600' : 'from-emerald-500 to-teal-600'
          }
        ].map((stat, i) => (
          <div key={i} className="group relative bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-[0.03] dark:opacity-[0.07] rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700`}></div>
            
            <div className={`w-16 h-16 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl flex items-center justify-center text-${stat.color}-600 mb-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-transparent group-hover:shadow-${stat.color}-500/10`}>
              <stat.icon className="w-8 h-8" />
            </div>
            
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4">{stat.label}</p>
            <div className="flex items-baseline gap-3">
              <p className={`text-5xl font-black tracking-tighter text-gray-900 dark:text-white`}>
                {stat.value}
              </p>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Products Grid ёки Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 px-4">
          {sizes.map((size) => {
            const sizeProducts = groupedProducts[size];
            const totalStock = sizeProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0);
            const isExpanded = expandedGroups.includes(size);
            
            return (
              <div key={size} className="group/card relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  activeCategory === 'preform' ? 'from-blue-600 to-indigo-700' :
                  activeCategory === 'krishka' ? 'from-orange-500 to-amber-600' :
                  activeCategory === 'ruchka' ? 'from-emerald-500 to-teal-600' :
                  activeCategory === 'all' ? 'from-emerald-500 to-teal-600' :
                  'from-gray-600 to-slate-700'
                } rounded-[3rem] opacity-0 group-hover/card:opacity-100 blur-2xl transition-all duration-700 -z-10 scale-95`}></div>
                
                <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden h-full flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Size Header */}
                    <div 
                      onClick={() => toggleGroup(size)}
                      className={`p-8 cursor-pointer bg-gradient-to-r ${
                        activeCategory === 'preform' ? 'from-blue-600 to-indigo-600' :
                        activeCategory === 'krishka' ? 'from-orange-500 to-amber-500' :
                        activeCategory === 'ruchka' ? 'from-emerald-500 to-teal-500' :
                        activeCategory === 'all' ? 'from-emerald-500 to-teal-500' :
                        'from-gray-600 to-slate-600'
                      } text-white transition-all duration-500 group-hover/card:scale-[1.02]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                            <div className={`transform transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-8 h-8" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase">{size}</h3>
                            <p className="text-white/70 font-bold text-xs tracking-widest mt-1">
                              {sizeProducts.length} TUR • {totalStock} QOP
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products List in Group */}
                    <div className={`flex-1 transition-all duration-700 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-6 space-y-4">
                        {sizeProducts.map((product) => {
                          const status = getStockStatus(product);
                          const isEditing = editingProduct === product.id;

                          return (
                            <div key={product.id} className="group/item relative bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-500">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className={`w-3 h-3 rounded-full shadow-lg ${status.bgColor.split(' ')[0]} animate-pulse`}></div>
                                  <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={editingName}
                                          onChange={(e) => setEditingName(e.target.value)}
                                          className="flex-1 bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-xl px-3 py-1 text-sm font-bold focus:outline-none"
                                          autoFocus
                                        />
                                        <button onClick={() => saveProductData(product.id)} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={cancelEditing} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">{product.name}</h4>
                                        <button onClick={() => startEditing(product)} className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all">
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                        {status.emoji} {status.label}
                                      </span>
                                      <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {product.currentStock || 0} QOP
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600 tracking-tighter">${(product.pricePerBag || 0).toFixed(2)}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">QOP NARXI</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => navigate(`/products/${product.id}`)}
                                      className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-sm"
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => deleteProduct(product.id)}
                                      className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Mahsulot</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Turi</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center">Holat</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-right">Zaxira</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center">Narx (Qop)</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center">Narx (Dona)</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    const isEditing = editingProduct === product.id;
                    return (
                      <tr key={product.id} className="group/tr hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-500">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl group-hover/tr:scale-110 transition-transform duration-500 shadow-inner">
                              {product.warehouse === 'krishka' ? '⭕' : 
                               product.warehouse === 'ruchka' ? '🎗️' : 
                               product.warehouse === 'preform' ? '📦' : '🛠️'}
                            </div>
                            <div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-xl px-3 py-1 text-sm font-bold focus:outline-none"
                                />
                              ) : (
                                <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{product.name}</span>
                              )}
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.productId || 'ID NO'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                            {product.bagType || 'BOSHQA'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${status.bgColor} ${status.color}`}>
                            {status.emoji} {status.label}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-xl font-black text-gray-900 dark:text-white">{product.currentStock || 0}</span>
                          <span className="text-[10px] text-gray-400 ml-2 uppercase font-black tracking-widest">QOP</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          {isEditing ? (
                            <div className="flex flex-col gap-1 items-center">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                  type="number"
                                  value={editingPriceBag}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingPriceBag(val);
                                    if (product.unitsPerBag) {
                                      setEditingPricePiece((parseFloat(val) / product.unitsPerBag).toFixed(6));
                                    }
                                  }}
                                  className="w-24 pl-5 pr-2 py-1 bg-white dark:bg-gray-900 border-2 border-emerald-500 rounded-lg text-sm font-bold focus:outline-none"
                                />
                              </div>
                              <span className="text-[9px] text-gray-400">{(parseFloat(editingPriceBag) * exchangeRates.USD_TO_UZS).toLocaleString()} UZS</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-black text-emerald-600">${(product.pricePerBag || 0).toFixed(2)}</span>
                              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{( (product.pricePerBag || 0) * exchangeRates.USD_TO_UZS).toLocaleString()} UZS</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          {isEditing ? (
                            <div className="flex flex-col gap-1 items-center">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                  type="number"
                                  value={editingPricePiece}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingPricePiece(val);
                                    if (product.unitsPerBag) {
                                      setEditingPriceBag((parseFloat(val) * product.unitsPerBag).toFixed(2));
                                    }
                                  }}
                                  className="w-24 pl-5 pr-2 py-1 bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-lg text-sm font-bold focus:outline-none"
                                />
                              </div>
                              <span className="text-[9px] text-gray-400">{(parseFloat(editingPricePiece) * exchangeRates.USD_TO_UZS).toFixed(2)} UZS</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-black text-blue-600">${(product.pricePerPiece || 0).toFixed(4)}</span>
                              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{( (product.pricePerPiece || 0) * exchangeRates.USD_TO_UZS).toFixed(2)} UZS</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveProductData(product.id)}
                                  className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center hover:bg-green-600 transition-all shadow-sm"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="w-10 h-10 bg-gray-500 text-white rounded-xl flex items-center justify-center hover:bg-gray-600 transition-all shadow-sm"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(product)}
                                  className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all duration-500 shadow-sm"
                                >
                                  <Pencil className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => navigate(`/products/${product.id}`)}
                                  className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-sm"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm mx-4">
          <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-8 opacity-20">
            <Package className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2 uppercase">{t("Mahsulotlar yo'q")}</h3>
          <p className="text-gray-500 font-bold mb-10 max-w-xs text-center text-sm">
            Hali hech qanday mahsulot qo'shilmagan. Birinchi mahsulotni qo'shish uchun pastdagi tugmani bosing.
          </p>
          <button 
            onClick={() => navigate('/add-product')}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
          >
            📦 {t("MAHSULOT QO'SHISH")}
          </button>
        </div>
      )}
    </div>
  );
}

export default Products;
