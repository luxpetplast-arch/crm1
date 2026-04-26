import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import api from '../lib/api';
import { Package, Eye, Plus, Trash2, ChevronDown, Pencil, Check, X, FileSpreadsheet, AlertTriangle, List, LayoutGrid, DollarSign, ShoppingCart, Layers } from 'lucide-react';
import { exportToExcel } from '../lib/excelUtils';
import { useTranslation } from 'react-i18next';

function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPriceBag, setEditingPriceBag] = useState<string>('');
  const [editingPricePiece, setEditingPricePiece] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12800 }); // Default, ideally fetch from API

  // Product detail modal state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Determine if we're in cashier mode
  const isCashier = window.location.pathname.startsWith('/cashier');
  const getProductDetailPath = (productId: string) => {
    return isCashier ? `/cashier/products/${productId}` : `/products/${productId}`;
  };

  // Open product detail modal
  const openProductModal = async (product: any) => {
    try {
      const { data } = await api.get(`/products/${product.id}`);
      setSelectedProduct(data);
      setShowProductModal(true);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  };

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
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err: any) {
      console.error('Маҳсулотларни юклашда хатолик:', err);
      setError(err?.response?.data?.error || err?.message || 'Маҳсулотларни юклашда хатолик юз берди');
    } finally {
      setLoading(false);
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

  // Komplekt bilan sotuvga o'tish funksiyasi
  const navigateToSaleWithKomplekt = (product: any) => {
    // Mahsulot nomidan o'lchamni aniqlash (15g, 26g, 30g...)
    const nameMatch = product.name.match(/(\d+)(g|G|г|Г|gr|GR)/);
    const weight = nameMatch ? parseInt(nameMatch[1]) : 0;

    // Preform emasligini tekshirish
    const isPreform = product.warehouse === 'preform' ||
                      product.name.toLowerCase().includes('g') ||
                      product.name.toLowerCase().includes('преформ');

    if (!isPreform || weight === 0) {
      // Preform emas bo'lsa, faqat o'zini sotish
      navigate('/add-sale', {
        state: {
          preSelectedProduct: {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            pricePerBag: product.pricePerBag || 0,
            unitsPerBag: product.unitsPerBag || 2000,
            warehouse: product.warehouse
          }
        }
      });
      return;
    }

    // Aksessuar o'lchamini aniqlash (28, 38, 48)
    let accessorySize = product.subType || '';
    if (!accessorySize) {
      if ([15, 21, 26, 30].includes(weight)) {
        accessorySize = '28';
      } else if ([52, 70].includes(weight)) {
        accessorySize = '38';
      } else if ([75, 80, 85, 86, 175].includes(weight)) {
        accessorySize = '48';
      }
    }

    // Mos keluvchi krishka va ruchka topish
    const krishka = products.find(p =>
      (p.warehouse === 'krishka' || p.name.toLowerCase().includes('krishka') || p.name.toLowerCase().includes('крышка')) &&
      p.name.includes(accessorySize) &&
      p.active !== false
    );

    const ruchka = products.find(p =>
      (p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka') || p.name.toLowerCase().includes('ручка')) &&
      p.name.includes(accessorySize) &&
      p.active !== false
    );

    // 26g preform uchun ruchka kerak emas
    const is26gPreform = weight === 26;

    // Komplekt ma'lumotlarini tayyorlash
    const komplektItems: any[] = [{
      productId: product.id,
      productName: product.name,
      quantity: 1,
      pricePerBag: product.pricePerBag || 0,
      unitsPerBag: product.unitsPerBag || 2000,
      warehouse: product.warehouse,
      type: 'preform'
    }];

    if (krishka) {
      const upb = Number(krishka.unitsPerBag) || 1000;
      const kPrice = Number(krishka.pricePerBag) || 65;
      const totalUnits = product.unitsPerBag || 2000;

      komplektItems.push({
        productId: krishka.id,
        productName: krishka.name,
        quantity: totalUnits,
        pricePerBag: kPrice,
        unitsPerBag: upb,
        warehouse: 'krishka',
        type: 'krishka'
      });
    }

    if (ruchka && !is26gPreform) {
      const upb = Number(ruchka.unitsPerBag) || 1000;
      const rPrice = Number(ruchka.pricePerBag) || 76;
      const totalUnits = product.unitsPerBag || 2000;

      komplektItems.push({
        productId: ruchka.id,
        productName: ruchka.name,
        quantity: totalUnits,
        pricePerBag: rPrice,
        unitsPerBag: upb,
        warehouse: 'ruchka',
        type: 'ruchka'
      });
    }

    // AddSale sahifasiga o'tish
    navigate('/add-sale', {
      state: {
        preSelectedKomplekt: komplektItems,
        is26gPreform: is26gPreform
      }
    });
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
    
    exportToExcel(dataToExport, { fileName: `Mahsulotlar_${activeCategory}`, sheetName: 'Mahsulotlar Ro\'yxati' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-12">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/30">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {t("Mahsulotlar")}
                </h1>
                <p className="text-sm text-blue-100/80">
                  {filteredProducts.length} {t("ta turdagi mahsulot")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium text-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button 
                type="button"
                onClick={() => navigate('/add-product')} 
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                {t("Yangi mahsulot")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 font-medium">{t("Mahsulotlar yuklanmoqda...")}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-700">{t("Xatolik yuz berdi")}</h3>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={loadProducts}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
            >
              {t("Qayta urinish")}
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Category Tabs - Modern Design */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-50 rounded-2xl w-fit shadow-md border border-gray-200">
          {[
            { id: 'all', label: t('Hammasi'), color: 'blue' },
            { id: 'preform', label: t('Preforma'), color: 'indigo' },
            { id: 'krishka', label: t('Qopqoq'), color: 'orange' },
            { id: 'ruchka', label: t('Ruchka'), color: 'emerald' },
            { id: 'other', label: t('Boshqa'), color: 'slate' }
          ].map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeCategory === cat.id 
                  ? `bg-gradient-to-r from-${cat.color}-500 to-${cat.color === 'slate' ? 'gray' : cat.color}-600 text-white shadow-lg shadow-${cat.color}-500/25` 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats - Modern Gradient Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: t("Turlar"), value: filteredProducts.length, icon: Package, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
            { label: t("Jami qop"), value: filteredProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0), icon: Check, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
            { label: t("Optimal"), value: filteredProducts.filter(p => (p.currentStock || 0) >= (p.minStockLimit || 50)).length, icon: Check, color: 'cyan', gradient: 'from-cyan-500 to-blue-500' },
            { label: t("Kam qolgan"), value: filteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length, icon: AlertTriangle, color: 'rose', gradient: 'from-rose-500 to-pink-600' }
          ].map((stat, i) => (
            <div key={i} className={`group bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 shadow-lg shadow-${stat.color}-500/25 hover:shadow-xl hover:shadow-${stat.color}-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded-full">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/70 mt-1">{t("ta mahsulot")}</p>
            </div>
          ))}
        </div>
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
                    <button
                      type="button"
                      onClick={() => toggleGroup(size)}
                      className={`p-8 cursor-pointer bg-gradient-to-r w-full text-left ${
                        activeCategory === 'preform' ? 'from-blue-600 to-indigo-600' :
                        activeCategory === 'krishka' ? 'from-orange-500 to-amber-500' :
                        activeCategory === 'ruchka' ? 'from-emerald-500 to-teal-500' :
                        activeCategory === 'all' ? 'from-emerald-500 to-teal-500' :
                        'from-gray-600 to-slate-600'
                      } text-white transition-all duration-500 group-hover/card:scale-[1.02]`}
                      aria-label={isExpanded ? "Yopish" : "Ochish"}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                            <div className={`transform transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-8 h-8" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold tracking-tight uppercase">{size}</h3>
                            <p className="text-white/70 font-medium text-xs tracking-wide mt-1">
                              {sizeProducts.length} tur • {totalStock} qop
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>

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
                                          aria-label="Mahsulot nomi"
                                          placeholder="Mahsulot nomi"
                                        />
                                        <button type="button" onClick={() => saveProductData(product.id)} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" aria-label="Saqlash">
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={cancelEditing} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" aria-label="Bekor qilish">
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate uppercase tracking-tight">{product.name}</h4>
                                        <button type="button" onClick={() => startEditing(product)} className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all" aria-label="Tahrirlash">
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className={`text-[10px] font-semibold uppercase tracking-widest ${status.color}`}>
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
                                    <p className="text-sm font-bold text-emerald-600 tracking-tighter">${(product.pricePerBag || 0).toFixed(2)}</p>
                                    <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest">QOP NARXI</p>
                                  </div>
                                  <div className="flex gap-2">
                                    {/* Komplekt bilan sotish tugmasi */}
                                    <button
                                      type="button"
                                      onClick={() => navigateToSaleWithKomplekt(product)}
                                      className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-sm"
                                      aria-label="Komplekt bilan sotish"
                                    >
                                      <Layers className="w-5 h-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openProductModal(product)}
                                      className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-sm"
                                      aria-label="Ko'rish"
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteProduct(product.id)}
                                      className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm"
                                      aria-label="O'chirish"
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
                    <th className="px-8 py-6 text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">Mahsulot</th>
                    <th className="px-8 py-6 text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">Turi</th>
                    <th className="px-8 py-6 text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] text-center">Holat</th>
                    <th className="px-8 py-6 text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] text-right">Zaxira</th>
                    <th className="px-8 py-6 text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] text-center">Narx (Qop)</th>
                    <th className="px-8 py-6 text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] text-center">Narx (Dona)</th>
                    <th className="px-8 py-6 text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] text-center">Amallar</th>
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
                                  aria-label="Edit product name"
                                  placeholder="Product name"
                                />
                              ) : (
                                <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{product.name}</span>
                              )}
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.productId || 'ID NO'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                            {product.bagType || 'BOSHQA'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-sm ${status.bgColor} ${status.color}`}>
                            {status.emoji} {status.label}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">{product.currentStock || 0}</span>
                          <span className="text-[10px] text-gray-400 ml-2 uppercase font-semibold tracking-widest">QOP</span>
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
                                  aria-label="Price per bag"
                                />
                              </div>
                              <span className="text-[9px] text-gray-400">{(parseFloat(editingPriceBag) * exchangeRates.USD_TO_UZS).toLocaleString()} UZS</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-bold text-emerald-600">${(product.pricePerBag || 0).toFixed(2)}</span>
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
                                  aria-label="Price per piece"
                                />
                              </div>
                              <span className="text-[9px] text-gray-400">{(parseFloat(editingPricePiece) * exchangeRates.USD_TO_UZS).toFixed(2)} UZS</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-bold text-blue-600">${(product.pricePerPiece || 0).toFixed(4)}</span>
                              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{( (product.pricePerPiece || 0) * exchangeRates.USD_TO_UZS).toFixed(2)} UZS</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveProductData(product.id)}
                                  className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center hover:bg-green-600 transition-all shadow-sm"
                                  aria-label="Saqlash"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="w-10 h-10 bg-gray-500 text-white rounded-xl flex items-center justify-center hover:bg-gray-600 transition-all shadow-sm"
                                  aria-label="Bekor qilish"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => navigateToSaleWithKomplekt(product)}
                                  className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-sm"
                                  aria-label="Komplekt bilan sotish"
                                >
                                  <Layers className="w-5 h-5" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => startEditing(product)}
                                  className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all duration-500 shadow-sm"
                                  aria-label="Tahrirlash"
                                >
                                  <Pencil className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openProductModal(product)}
                                  className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-sm"
                                  aria-label="Ko'rish"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteProduct(product.id)}
                                  className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm"
                                  aria-label="O'chirish"
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

        </>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-900/5 mx-4">
          <div className="w-36 h-36 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-4 ring-blue-50">
            <Package className="w-20 h-20 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">{t("Mahsulotlar yo'q")}</h3>
          <p className="text-slate-500 font-medium mb-10 max-w-md text-center text-lg">
            Hali hech qanday mahsulot qo'shilmagan. Birinchi mahsulotni qo'shish uchun pastdagi tugmani bosing.
          </p>
          <button 
            type="button"
            onClick={() => navigate('/add-product')}
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-6 h-6" />
            {t("Mahsulot qo'shish")}
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProductModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">ID: {selectedProduct.productId || selectedProduct.id}</p>
                </div>
                <button type="button" onClick={() => setShowProductModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Yopish">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Product Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Zaxira (qop)</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedProduct.currentStock || 0}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Zaxira (dona)</p>
                  <p className="text-2xl font-bold text-green-600">{selectedProduct.currentUnits || 0}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Narx (qop)</p>
                  <p className="text-2xl font-bold text-purple-600">${selectedProduct.pricePerBag?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Narx (dona)</p>
                  <p className="text-2xl font-bold text-orange-600">${selectedProduct.pricePerPiece?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Mahsulot turi</span>
                  <span className="font-medium">{selectedProduct.bagType || 'Boshqa'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Ombor</span>
                  <span className="font-medium capitalize">{selectedProduct.warehouse || 'Boshqa'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Dona/qop nisbat</span>
                  <span className="font-medium">{selectedProduct.unitsPerBag || 0} dona</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    navigate(getProductDetailPath(selectedProduct.id));
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  To'liq ma'lumot
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
