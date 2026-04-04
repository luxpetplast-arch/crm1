import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import Button from '../components/Button';
import api from '../lib/api';
import { Package, Eye, Trash2, Plus, ChevronDown, Search, Expand, Minimize2, RefreshCw, List, LayoutGrid, Pencil, Check, X } from 'lucide-react';

export default function ProductsGrouped() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPriceBag, setEditingPriceBag] = useState('');
  const [editingPricePiece, setEditingPricePiece] = useState('');
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12800 });

  useEffect(() => {
    loadProducts();
    loadExchangeRate();
    
    // Listen for storage changes (when product is added)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'productAdded') {
        console.log('🔄 Storage event: Yangi mahsulot qo\'shildi, ro\'yxatni yangilayapman...');
        loadProducts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
  };

  const loadProducts = async () => {
    try {
      // Mahsulotlarni yuklash
      const response = await api.get('/products');
      const allData = response.data;
      
      setProducts(allData);
    } catch (error) {
      console.error('Mahsulotlarni yuklashda xatolik:', error);
      alert('❌ Маҳсулотларни юклашда хатолик юз берди!');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Ростдан ҳам ушбу маҳсулотни ўчирмоқчимисиз?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      loadProducts(); // Маҳсулотлар рўйхатини қайта юклаш
      alert('✅ Маҳсулот муваффақиятли ўчирилди!');
    } catch (error) {
      console.error('Маҳсулотни ўчиришда хатолик:', error);
      alert('❌ Хатолик юз берди!');
    }
  };

  // Guruhni ochish/yopish funksiyasi
  const toggleGroup = (size: string) => {
    if (expandedGroups.includes(size)) {
      setExpandedGroups(expandedGroups.filter(g => g !== size));
    } else {
      setExpandedGroups([...expandedGroups, size]);
    }
  };

  // Determine if we're in cashier mode
  const isCashier = window.location.pathname.startsWith('/cashier');
  const getProductDetailPath = (productId: string) => {
    return isCashier ? `/cashier/products/${productId}` : `/products/${productId}`;
  };

  // Махсулотларни гуруҳлаш (bagType бўйича)
  const groupProducts = (products: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    // Qidiruv va Kategoriya bo'yicha filtr
    const filteredProducts = products.filter(product => {
      // 1. Qidiruv filtri
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // 2. Kategoriya filtri
      if (activeCategory === 'all') return true;

      if (product.warehouse) {
        return product.warehouse === activeCategory;
      }

      // Fallback - eski mahsulotlar uchun
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
    
    filteredProducts.forEach((product) => {
      // Qop turi (bagType) бўйича гуруҳлаш - ҳар bir янги тип янги div бўлиши uchun
      const groupName = product.bagType || 'Бошқа';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(product);
    });
    
    return groups;
  };

  // Statistika uchun filtrlangan mahsulotlar
  const statsFilteredProducts = useMemo(() => {
    return products.filter(p => {
      if (activeCategory === 'all') return true;
      if (p.warehouse) return p.warehouse === activeCategory;
      const name = p.name.toLowerCase();
      if (activeCategory === 'preform') return (name.includes('g') || name.includes('gr')) && !name.includes('krishka') && !name.includes('ruchka');
      if (activeCategory === 'krishka') return name.includes('krishka') || name.includes('cap');
      if (activeCategory === 'ruchka') return name.includes('ruchka') || name.includes('handle');
      return false;
    });
  }, [products, activeCategory]);

  const groupedProducts = groupProducts(products);
  const sizes = Object.keys(groupedProducts).sort((a, b) => {
    // Guruh nomlarini (bagType) o'lchamga qarab tartiblash (agar raqam bo'lsa)
    const aMatch = a.match(/(\d+)/);
    const bMatch = b.match(/(\d+)/);
    
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    return a.localeCompare(b);
  });

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Омборни танлаш (Tabs) - ЭНГ ТЕПАДА */}
      <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md py-2 -mx-2 px-2 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mr-2 hidden lg:block">
            Омбор Бўлими:
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { id: 'all', label: 'Ҳаммаси', icon: '📋', activeClass: 'bg-emerald-600 ring-emerald-100 text-white', hoverClass: 'text-emerald-600 hover:bg-emerald-50' },
              { id: 'preform', label: 'Преформа', icon: '📦', activeClass: 'bg-blue-600 ring-blue-100 text-white', hoverClass: 'text-blue-600 hover:bg-blue-50' },
              { id: 'krishka', label: 'Қопқоқ', icon: '⭕', activeClass: 'bg-orange-600 ring-orange-100 text-white', hoverClass: 'text-orange-600 hover:bg-orange-50' },
              { id: 'ruchka', label: 'Ручка', icon: '🎗️', activeClass: 'bg-green-600 ring-green-100 text-white', hoverClass: 'text-green-600 hover:bg-green-50' },
              { id: 'other', label: 'Бошқа', icon: '🛠️', activeClass: 'bg-gray-600 ring-gray-100 text-white', hoverClass: 'text-gray-600 hover:bg-gray-50' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? `${cat.activeClass} shadow-lg ring-4 scale-105` 
                    : `bg-white border border-gray-200 text-gray-500 shadow-sm ${cat.hoverClass}`
                }`}
              >
                <span className="text-base sm:text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header - MOBIL OPTIMALLASHTIRILGAN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Маҳсулотлар
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Омбор бошқаруви ва мониторинг
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={loadProducts}
            variant="outline"
            className="min-h-[44px] text-xs sm:text-sm"
            title="Mahsulotlarni yangilash"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode(viewMode === 'grouped' ? 'list' : 'grouped')}
            variant="outline"
            className={`min-h-[44px] text-xs sm:text-sm ${viewMode === 'list' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : ''}`}
            title={viewMode === 'list' ? "Guruhlangan ko'rinish" : "Ro'yxat ko'rinishi"}
          >
            {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={() => window.location.href = isCashier ? '/cashier/add-product' : '/add-product'} 
            className="w-full sm:w-auto min-h-[44px] bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCashier ? 'Mahsulot Qo\'shish' : 'Янги Маҳсулот'}
          </Button>
        </div>
      </div>

      {/* Statistika - ZAMONAVIY KOMPAKT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className={`p-3 rounded-xl shadow-md text-white ${
          activeCategory === 'all' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
          activeCategory === 'preform' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
          activeCategory === 'krishka' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
          activeCategory === 'ruchka' ? 'bg-gradient-to-br from-green-500 to-green-600' :
          'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <span className="text-xs opacity-90">Турдаги</span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {statsFilteredProducts.length}
          </p>
        </div>

        <div className={`p-3 rounded-xl shadow-md text-white ${
          activeCategory === 'all' ? 'bg-gradient-to-br from-teal-500 to-teal-600' :
          activeCategory === 'preform' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' :
          activeCategory === 'krishka' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
          activeCategory === 'ruchka' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
          'bg-gradient-to-br from-slate-500 to-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span className="text-xs opacity-90">Қоплар</span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {statsFilteredProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-md text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="text-xs opacity-90">Яхши</span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {statsFilteredProducts.filter(p => (p.currentStock || 0) >= (p.minStockLimit || 50)).length}
          </p>
        </div>

        <div className={`p-3 rounded-xl shadow-md text-white ${
          statsFilteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length > 0
            ? 'bg-gradient-to-br from-red-500 to-red-600' 
            : 'bg-gradient-to-br from-green-500 to-green-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-xs opacity-90">
              {statsFilteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length > 0 ? 'Кам' : 'Оптимал'}
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {statsFilteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length}
          </p>
        </div>
      </div>

      {/* Qidiruv va boshqaruv - KOMPAKT */}
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-2 -mx-2 px-2">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Қидириш..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-1 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedGroups(sizes)}
              className="flex-1 sm:flex-none items-center gap-1 text-xs py-2 px-3"
            >
              <Expand className="w-3 h-3" />
              <span className="sm:hidden">Очиш</span>
              <span className="hidden sm:inline">Барчасини очиш</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedGroups([])}
              className="flex-1 sm:flex-none items-center gap-1 text-xs py-2 px-3"
            >
              <Minimize2 className="w-3 h-3" />
              <span className="sm:hidden">Ёпиш</span>
              <span className="hidden sm:inline">Барчасини ёпиш</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Гуруҳланган махсулотлар - 3 ta bir qatorda */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sizes.map((size) => {
          const sizeProducts = groupedProducts[size];
          const totalStock = sizeProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0);
          const avgPrice = sizeProducts.reduce((sum, p) => sum + (p.pricePerBag || 0), 0) / sizeProducts.length;
          const isExpanded = expandedGroups.includes(size);
          
          return (
            <Card key={size} className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              {/* Guruh header - KOMPAKT */}
              <div 
                className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer"
                onClick={() => toggleGroup(size)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold">{size}</span>
                      <span className="text-xs opacity-80 ml-2">{sizeProducts.length} тур • {totalStock} қоп</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">${avgPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Mahsulotlar - faqat ochiq bo'lsa ko'rsatiladi */}
              <div className={`overflow-hidden ${isExpanded ? 'block' : 'hidden'}`}>
                <div className="divide-y divide-gray-100">
                  {sizeProducts.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <div 
                        key={product.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.bgColor.replace(/border-2 border-\w+-300/, '')}`}></div>
                          <span className="font-medium text-sm text-gray-800 truncate">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                            <span className="text-xs text-gray-600 ml-1">{product.currentStock || 0} қоп</span>
                          </div>
                          <span className="text-sm font-bold text-green-600 min-w-[60px] text-right">${(product.pricePerBag || 0).toFixed(2)}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => navigate(getProductDetailPath(product.id))}
                              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              title="Батафсил"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            {!isCashier && (
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                title="Ўчириш"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Маҳсулотлар йўқ</h3>
          <p className="text-muted-foreground mb-4">
            Биринчи маҳсулотни қўшиш учун "Янги Маҳсулот" тугмасини босинг
          </p>
          <Button onClick={() => window.location.href = isCashier ? '/cashier/add-product' : '/add-product'}>
            📦 Маҳсулот Қўшиш
          </Button>
        </Card>
      )}
    </div>
  );
}
