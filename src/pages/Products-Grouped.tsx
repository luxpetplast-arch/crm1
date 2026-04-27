import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import Button from '../components/Button';
import api from '../lib/professionalApi';
import { Package, Eye, Trash2, Plus, ChevronDown, Search, Expand, Minimize2, RefreshCw, List, LayoutGrid, Check, AlertCircle } from 'lucide-react';

export default function ProductsGrouped() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  useEffect(() => {
    loadProducts();
    
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
      {/* Омборни танлаш (Tabs) - Eng tepada */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2 hidden sm:block">
              Бўлим:
            </span>
            {[
              { id: 'all', label: 'Ҳаммаси', icon: '📋', color: 'emerald' },
              { id: 'preform', label: 'Преформа', icon: '📦', color: 'blue' },
              { id: 'krishka', label: 'Қопқоқ', icon: '⭕', color: 'orange' },
              { id: 'ruchka', label: 'Ручка', icon: '🎗️', color: 'green' },
              { id: 'other', label: 'Бошқа', icon: '�️', color: 'gray' }
            ].map((cat) => {
              const isActive = activeCategory === cat.id;
              const colorClasses = {
                emerald: isActive ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600',
                blue: isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600',
                orange: isActive ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600',
                green: isActive ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600',
                gray: isActive ? 'bg-gray-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-600'
              };
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border ${
                    isActive ? 'shadow-md border-transparent' : 'border-gray-200 shadow-sm'
                  } ${colorClasses[cat.color as keyof typeof colorClasses]}`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Header - Zamonaviy va Professional */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Маҳсулотлар
              </h1>
              <p className="text-sm text-gray-500">
                Омбор бошқаруви ва мониторинг
              </p>
            </div>
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
            >
              {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>
            <Button 
              onClick={() => window.location.href = isCashier ? '/cashier/add-product' : '/add-product'} 
              className="min-h-[44px] bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Янги Маҳсулот
            </Button>
          </div>
        </div>
      </div>

      {/* Statistika - Zamonaviy Kartochkalar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { 
            label: 'Жами турлар', 
            value: statsFilteredProducts.length,
            icon: Package,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50'
          },
          { 
            label: 'Жами қоплар', 
            value: statsFilteredProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0),
            icon: Package,
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50'
          },
          { 
            label: 'Яхши ҳолатда', 
            value: statsFilteredProducts.filter(p => (p.currentStock || 0) >= (p.minStockLimit || 50)).length,
            icon: Check,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50'
          },
          { 
            label: 'Кам қолган', 
            value: statsFilteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length,
            icon: AlertCircle,
            color: statsFilteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
            bgColor: statsFilteredProducts.filter(p => (p.currentStock || 0) < (p.minStockLimit || 50)).length > 0 ? 'bg-red-50' : 'bg-green-50'
          }
        ].map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-4 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Qidiruv va boshqaruv - Zamonaviy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Маҳсулот қидириш..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setExpandedGroups(sizes)}
              className="flex-1 sm:flex-none items-center gap-2 text-sm py-2.5 px-4 rounded-xl"
            >
              <Expand className="w-4 h-4" />
              <span className="hidden sm:inline">Барчасини очиш</span>
              <span className="sm:hidden">Очиш</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setExpandedGroups([])}
              className="flex-1 sm:flex-none items-center gap-2 text-sm py-2.5 px-4 rounded-xl"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Барчасини ёпиш</span>
              <span className="sm:hidden">Ёпиш</span>
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
              <button
                type="button"
                className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer"
                onClick={() => toggleGroup(size)}
                aria-label={isExpanded ? "Yopish" : "Ochish"}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-base">{size}</span>
                      <span className="text-xs opacity-80">{sizeProducts.length} тур • {totalStock} қоп</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-lg">${avgPrice.toFixed(2)}</span>
                  </div>
                </div>
              </button>

              {/* Mahsulotlar - faqat ochiq bo'lsa ko'rsatiladi */}
              <div className={`overflow-hidden ${isExpanded ? 'block' : 'hidden'}`}>
                <div className="divide-y divide-gray-100">
                  {sizeProducts.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <div 
                        key={product.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status.bgColor.replace(/border-2 border-\w+-300/, '')}`}></div>
                          <span className="font-medium text-sm text-gray-800 truncate">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <span className={`text-xs font-semibold ${status.color} block`}>{status.label}</span>
                            <span className="text-xs text-gray-500">{product.currentStock || 0} қоп</span>
                          </div>
                          <span className="text-base font-bold text-green-600 min-w-[70px] text-right">${(product.pricePerBag || 0).toFixed(2)}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(getProductDetailPath(product.id))}
                              className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              title="Батафсил"
                              aria-label="Батафсил"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!isCashier && (
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                title="Ўчириш"
                              >
                                <Trash2 className="w-4 h-4" />
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
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 rounded-lg" />
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
