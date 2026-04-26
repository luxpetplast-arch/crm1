import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  DollarSign,
  X,
  Save,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import { safeArray, safeApiResponse } from '../lib/safe-math';
import { latinToCyrillic } from '../lib/transliterator';
import ModernLayout from '../components/ModernLayout';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
}

export default function ProductsModern() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Narx belgilash modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [savingPrices, setSavingPrices] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(12500);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // API dan haqiqiy mahsulotlarni yuklash
        const response = await api.get('/products');
        
        // API javobini Product interfeysiga moslashtirish (xavfsiz)
        const apiData = safeArray(response.data, []);
        const apiProducts: Product[] = apiData.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.bagType || p.category || 'Umumiy',
          price: p.pricePerBag || p.price || 0,
          stock: p.currentStock || p.stock || 0,
          unit: 'dona',
          description: p.warehouse || ''
        }));
        
        setProducts(apiProducts);
        
        // Extract unique categories (xavfsiz)
        const uniqueCategories = apiProducts.length > 0 
          ? Array.from(new Set(apiProducts.map(p => p.category || 'Umumiy')))
          : ['all'];
        setCategories(['all', ...uniqueCategories]);
        
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  return (
    <ModernLayout 
      title={latinToCyrillic("Mahsulotlar")}
      subtitle={`${filteredProducts.length} ${latinToCyrillic("ta mahsulot")}`}
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={latinToCyrillic("Маҳсулотларни қидириш...")}
                className="input-modern w-full pl-12"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter className="w-5 h-5" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-modern pl-12 appearance-none cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? latinToCyrillic("Барчаси") : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Narx belgilash tugmasi */}
            <button
              onClick={() => {
                // Barcha mahsulotlar narxini inputlarga yuklash
                const initialPrices: Record<string, string> = {};
                products.forEach(p => {
                  initialPrices[p.id] = p.price > 0 ? p.price.toString() : '';
                });
                setPriceInputs(initialPrices);
                setShowPriceModal(true);
              }}
              className="btn-gradient-secondary px-6 py-3 flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              {latinToCyrillic("Нарх белгилаш")}
            </button>
            
            {/* Add Product Button */}
            <button
              onClick={() => navigate('/add-product')}
              className="btn-gradient-primary px-6 py-3 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {latinToCyrillic("Янги Маҳсулот")}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card-light p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-lg font-semibold text-primary mb-4">{latinToCyrillic("Хатолик Юз Берди")}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="glass-card-light p-6 hover:scale-105 transition-transform duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <span className="badge-success text-xs">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-primary mb-2">{product.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">{latinToCyrillic("Narx")}</span>
                    <span className="text-lg font-bold text-primary">{product.price.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">{latinToCyrillic("Ombor")}</span>
                    <span className={`font-medium ${product.stock < 100 ? 'text-red-500' : 'text-green-500'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="btn-gradient-secondary flex-1 p-2 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{latinToCyrillic("Батафсил")}</span>
                  </button>
                  <button
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="btn-gradient-primary flex-1 p-2 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">{latinToCyrillic("Таҳрир")}</span>
                  </button>
                  <button
                    className="btn-gradient-danger p-2 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="glass-card-light p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {latinToCyrillic("Маҳсулотлар топилмади")}
              </h3>
              <p className="text-secondary">
                {latinToCyrillic("Қидириш шартларини ўзгартириб қайта уриниб кўринг")}
              </p>
            </div>
          </div>
        )}

        {/* Narx belgilash Modal */}
        {showPriceModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {latinToCyrillic("Барча маҳсулотлар нархини белгилаш")}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {latinToCyrillic("Excel жадвали каби нархларни киритинг")} • 1 USD = {exchangeRate.toLocaleString()} UZS
                  </p>
                </div>
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Modal Body - Excel jadvali */}
              <div className="flex-1 overflow-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                          №
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                          {latinToCyrillic("Маҳсулот номи")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                          {latinToCyrillic("Тури")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                          {latinToCyrillic("Омбор")}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200 w-48">
                          {latinToCyrillic("Нарх (UZS)")}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200 w-40">
                          {latinToCyrillic("Нарх (USD)")}
                      </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((product, index) => (
                        <tr key={product.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {product.stock} {product.unit}
                          </td>
                          {/* UZS Input */}
                          <td className="px-4 py-3 bg-emerald-50/50">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={priceInputs[product.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
                                setPriceInputs(prev => ({ ...prev, [product.id]: val }));
                              }}
                              placeholder="0"
                              className="w-full px-3 py-2.5 text-right font-bold text-emerald-700 bg-white border-2 border-emerald-400 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300 outline-none transition-all shadow-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={priceInputs[product.id] 
                                ? (parseFloat(priceInputs[product.id]) / exchangeRate).toFixed(2).replace(/\.00$/, '')
                                : ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
                                if (val === '' || val === '.') {
                                  setPriceInputs(prev => ({ ...prev, [product.id]: '' }));
                                } else {
                                  const usdVal = parseFloat(val);
                                  const uzsVal = usdVal * exchangeRate;
                                  setPriceInputs(prev => ({ ...prev, [product.id]: uzsVal.toString() }));
                                }
                              }}
                              placeholder="0.00"
                              className="w-full px-3 py-2 text-right font-bold text-blue-600 bg-white dark:bg-gray-800 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-500">
                  {products.length} {latinToCyrillic("та маҳсулот")}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPriceModal(false)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {latinToCyrillic("Бекор қилиш")}
                  </button>
                  <button
                    onClick={async () => {
                      setSavingPrices(true);
                      try {
                        // Har bir mahsulot uchun alohida saqlash
                        const updates = Object.entries(priceInputs).filter(([id, price]) => price !== '');
                        
                        for (const [productId, priceStr] of updates) {
                          const price = parseFloat(priceStr);
                          if (!isNaN(price) && price >= 0) {
                            await api.put(`/products/${productId}`, {
                              pricePerBag: price
                            });
                          }
                        }
                        
                        // Mahsulotlarni qayta yuklash
                        const response = await api.get('/products');
                        const apiProducts: Product[] = response.data.map((p: any) => ({
                          id: p.id,
                          name: p.name,
                          category: p.bagType || p.category || 'Umumiy',
                          price: p.pricePerBag || p.price || 0,
                          stock: p.currentStock || p.stock || 0,
                          unit: 'dona',
                          description: p.warehouse || ''
                        }));
                        setProducts(apiProducts);
                        
                        alert(`✅ ${updates.length} ${latinToCyrillic("та маҳсулот нархи сақланди!")}`);
                        setShowPriceModal(false);
                      } catch (error) {
                        console.error('Narx saqlashda xatolik:', error);
                        alert('❌ ' + latinToCyrillic("Нарxlarni сақлашда хатолик юз берди!"));
                      } finally {
                        setSavingPrices(false);
                      }
                    }}
                    disabled={savingPrices}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingPrices ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {latinToCyrillic("Сақланмоқда...")}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {latinToCyrillic("Сақлаш")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
