import { useState, useEffect } from 'react';
import { 
  Package, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Search, 
  RefreshCw, 
  Pencil, 
  Check, 
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import { useNavigate } from 'react-router-dom';
import { errorHandler } from '../lib/professionalErrorHandler';
import Input from '../components/Input';

interface Product {
  id: string;
  name: string;
  pricePerBag: number;
  pricePerPiece: number;
  currentStock: number;
  optimalStock: number;
  unitsPerBag: number;
  warehouse: string;
  bagType: string;
  active: boolean;
}

export default function SimplifiedInventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPriceBag, setEditingPriceBag] = useState('');
  const [editingPricePiece, setEditingPricePiece] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Yangi mahsulot qo'shish modal uchun state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    pricePerBag: '',
    pricePerPiece: '',
    currentStock: '',
    unitsPerBag: '2000',
    warehouse: 'preform'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Mahsulotlarni yuklashda xatolik:', error);
      errorHandler.handleError(error, { action: 'loadProducts' });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product.id);
    setEditingName(product.name);
    setEditingPriceBag(product.pricePerBag?.toString() || '');
    setEditingPricePiece(product.pricePerPiece?.toString() || '');
  };

  const saveProductData = async (productId: string) => {
    try {
      if (!editingName || !editingPriceBag) {
        alert(latinToCyrillic('Iltimos, mahsulot nomi va narxini to\'ldiring!'));
        return;
      }
      
      const updateData = {
        name: editingName,
        pricePerBag: parseFloat(editingPriceBag) || 0,
        pricePerPiece: parseFloat(editingPricePiece) || 0
      };
      
      await api.put(`/products/${productId}`, updateData);
      loadProducts();
      setEditingProduct(null);
      alert(latinToCyrillic('✅ Ma\'lumotlar yangilandi!'));
    } catch (error: any) {
      console.error('Xatolik:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik';
      alert(latinToCyrillic(`❌ Xatolik: ${errorMessage}`));
    }
  };

  const cancelEditing = () => {
    setEditingProduct(null);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm(latinToCyrillic('Rostdan ham ushbu mahsulotni o\'chirmoqchimisiz?'))) return;
    
    try {
      await api.delete(`/products/${productId}`);
      loadProducts();
      alert(latinToCyrillic('✅ Mahsulot muvaffaqiyatli o\'chirildi!'));
    } catch (error) {
      console.error('Mahsulotni o\'chirishda xatolik:', error);
      errorHandler.handleError(error, { action: 'deleteProduct', productId });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.pricePerBag || !newProduct.currentStock) {
      alert(latinToCyrillic('Iltimos, barcha majburiy maydonlarni to\'ldiring!'));
      return;
    }
    
    try {
      const productData = {
        name: newProduct.name,
        pricePerBag: parseFloat(newProduct.pricePerBag),
        pricePerPiece: parseFloat(newProduct.pricePerPiece) || parseFloat(newProduct.pricePerBag) / parseInt(newProduct.unitsPerBag),
        currentStock: parseInt(newProduct.currentStock),
        unitsPerBag: parseInt(newProduct.unitsPerBag) || 2000,
        warehouse: newProduct.warehouse,
        bagType: newProduct.warehouse,
        active: true
      };
      
      await api.post('/products', productData);
      
      // Modalni yopish va formni tozalash
      setShowAddModal(false);
      setNewProduct({
        name: '',
        pricePerBag: '',
        pricePerPiece: '',
        currentStock: '',
        unitsPerBag: '2000',
        warehouse: 'preform'
      });
      
      // Mahsulotlar ro'yxatini yangilash
      loadProducts();
      
      alert(latinToCyrillic('✅ Yangi mahsulot muvaffaqiyatli qo\'shildi!'));
    } catch (error: any) {
      console.error('Mahsulot qo\'shishda xatolik:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik';
      alert(latinToCyrillic(`❌ Xatolik: ${errorMessage}`));
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewProduct({
      name: '',
      pricePerBag: '',
      pricePerPiece: '',
      currentStock: '',
      unitsPerBag: '2000',
      warehouse: 'preform'
    });
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) {
      return { 
        color: 'text-red-600', 
        bgColor: 'bg-red-100 border-2 border-red-300',
        label: latinToCyrillic('Tugagan'),
        emoji: '❌',
        icon: AlertTriangle
      };
    }
    
    if (product.currentStock < (product.optimalStock || 100)) {
      return { 
        color: 'text-amber-600', 
        bgColor: 'bg-amber-100 border-2 border-amber-300',
        label: latinToCyrillic('Kam'),
        emoji: '⚠️',
        icon: TrendingDown
      };
    }
    
    return { 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-100 border-2 border-emerald-300',
      label: latinToCyrillic('Yaxshi'),
      emoji: '✅',
      icon: TrendingUp
    };
  };

  const extractProductType = (productName: string): string => {
    const name = productName.toLowerCase();
    
    // AVVAL Krishka/Qopqoqlarni tekshirish - o'lchami bo'yicha alohida guruhlash
    if (name.includes('krishka') || name.includes('cap') || name.includes('qopqoq')) {
      // O'lchamni topish (masalan: 28mm, 28, 30mm, 38mm, 38, 48mm, 48)
      // Avval mm/ml bilan qidirish, keyin faqat raqam
      let sizeMatch = name.match(/(\d+)\s*(mm|ml)/i);
      if (!sizeMatch) {
        // Agar mm/ml yo'q bo'lsa, faqat raqamni qidirish (krishka 28, 28 krishka)
        sizeMatch = name.match(/(?:krishka|cap|qopqoq).*?(\d+)|(\d+).*?(?:krishka|cap|qopqoq)/i);
        if (sizeMatch) {
          // Guruh nomida faqat o'lcham (28, 38, 48)
          const size = sizeMatch[1] || sizeMatch[2];
          return `${size}mm Qopqoqlar`;
        }
      } else {
        const size = sizeMatch[1];
        return `${size}mm Qopqoqlar`;
      }
      
      // Rangni topish
      const colorPatterns = [
        { pattern: /oq|white|belyy/i, label: latinToCyrillic('Oq') },
        { pattern: /qora|black|chernyy/i, label: latinToCyrillic('Qora') },
        { pattern: /kok|ko'k|blue|siniy/i, label: latinToCyrillic('Ko\'k') },
        { pattern: /yashil|green|zelenyy/i, label: latinToCyrillic('Yashil') },
        { pattern: /qizil|red|krasnyy/i, label: latinToCyrillic('Qizil') },
        { pattern: /sariq|yellow|zheltyy/i, label: latinToCyrillic('Sariq') }
      ];
      
      // Agar o'lcham topilmasa, rang bo'yicha guruhlash
      let colorLabel = '';
      for (const color of colorPatterns) {
        if (color.pattern.test(name)) {
          colorLabel = color.label;
          break;
        }
      }
      
      if (colorLabel) {
        return `${colorLabel} ${latinToCyrillic('Qopqoqlar')}`;
      }
      return latinToCyrillic('Qopqoqlar');
    }
    
    // Ruchkalarni hajmi/o'lchami bo'yicha guruhlash (28mm, 38mm, 48mm)
    if (name.includes('ruchka') || name.includes('handle')) {
      // O'lchamni topish (masalan: 28mm, 28, 38mm, 38, 48mm, 48)
      let sizeMatch = name.match(/(\d+)\s*(mm|ml)/i);
      if (!sizeMatch) {
        // Agar mm/ml yo'q bo'lsa, faqat raqamni qidirish (ruchka 28, 28 ruchka)
        sizeMatch = name.match(/(?:ruchka|handle).*?(\d+)|(\d+).*?(?:ruchka|handle)/i);
        if (sizeMatch) {
          const size = sizeMatch[1] || sizeMatch[2];
          return `${size}mm Ruchkalar`;
        }
      } else {
        const size = sizeMatch[1];
        return `${size}mm Ruchkalar`;
      }
      
      return latinToCyrillic('Ruchkalar');
    }
    
    // Preform - gramajga ega mahsulotlar (faqat raqam+g/gr/gram pattern)
    // Masalan: 15g, 20gr, 30gram, 15 g, preform 15g
    const gramMatch = name.match(/(\d+)\s*(g|gr|gram)/i);
    if (name.includes('preform') || gramMatch) {
      // Agar gramaj topilsa, uni guruh nomida ko'rsatish
      if (gramMatch) {
        return `${gramMatch[1]}gr Preform`;
      }
      return latinToCyrillic('Preform');
    }
    
    return latinToCyrillic('Boshqa');
  };

  const groupProducts = (products: Product[]) => {
    const groups: { [key: string]: Product[] } = {};
    
    const filteredProducts = products.filter(product => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (activeCategory === 'all') return true;

      if (product.warehouse) {
        return product.warehouse === activeCategory;
      }

      const name = product.name.toLowerCase();
      if (activeCategory === 'preform') {
        return (name.includes('g') || name.includes('gr')) && !name.includes('krishka') && !name.includes('ruchka');
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
      const groupName = extractProductType(product.name);
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(product);
    });
    
    return groups;
  };

  const groupedProducts = groupProducts(products);
  const groupNames = Object.keys(groupedProducts).sort((a, b) => {
    // Raqamli guruhlarni (masalan: 15gr, 20gr) avval tartiblash
    const aMatch = a.match(/^(\d+)gr/);
    const bMatch = b.match(/^(\d+)gr/);
    
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    if (aMatch) return -1; // Raqamli guruhlarni boshqalardan oldin qo'yish
    if (bMatch) return 1;
    
    // Qolganlarini alifbo tartibida
    return a.localeCompare(b);
  });

  const categories = [
    { id: 'all', label: latinToCyrillic('Barchasi'), icon: '📦', color: 'blue' },
    { id: 'preform', label: 'Preform', icon: '🥤', color: 'green' },
    { id: 'krishka', label: latinToCyrillic('Krishka'), icon: '🔴', color: 'red' },
    { id: 'ruchka', label: latinToCyrillic('Ruchka'), icon: '⚫', color: 'gray' },
    { id: 'other', label: latinToCyrillic('Boshqa'), icon: '📋', color: 'purple' }
  ];

  const formatPrice = (price: number) => {
    return price.toFixed(2) + ' $';
  };

  if (loading) {
    return (
      <div className="min-h-screen professional-bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Package className="w-10 h-10 text-white animate-spin" />
          </div>
          <p className="text-xl font-bold text-gray-700">{latinToCyrillic("Mahsulotlar yuklanmoqda...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen professional-bg-pattern">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{latinToCyrillic("Ombor")}</h1>
              <p className="text-sm text-gray-600 font-medium">
                {products.length} {latinToCyrillic("ta mahsulot")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadProducts}
              className="professional-button px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl font-bold shadow-lg hover:shadow-xl flex items-center gap-3 hover-lift"
            >
              <RefreshCw className="w-5 h-5" />
              {latinToCyrillic("Yangilash")}
            </button>
            
            <button
              type="button"
              onClick={() => {
                const isCashierRoute = window.location.pathname.startsWith('/cashier');
                navigate(isCashierRoute ? '/cashier/add-product' : '/add-product');
              }}
              className="professional-button px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl flex items-center gap-3 hover-lift"
            >
              <Plus className="w-5 h-5" />
              {latinToCyrillic("Mahsulot Qo'shish")}
            </button>
          </div>
        </div>

        {/* Qidiruv va Kategoriyalar */}
        <div className="professional-card p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Qidiruv */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder={latinToCyrillic("Mahsulot nomini kiriting...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="professional-input pl-14 pr-5 py-4 text-lg font-bold w-full"
              />
            </div>

            {/* Kategoriya tugmalari */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`group py-4 px-3 rounded-2xl text-sm font-black transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    activeCategory === cat.id
                      ? `bg-gradient-to-br from-${cat.color}-500 via-${cat.color}-600 to-${cat.color}-700 text-white shadow-xl shadow-${cat.color}-500/30 ring-2 ring-${cat.color}-300/50`
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 border-2 border-transparent hover:border-gray-400 hover:shadow-gray-400/20'
                  }`}
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                  <div className="group-hover:font-extrabold transition-all">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mahsulotlar guruhlari */}
        <div className="space-y-4">
          {groupNames.length === 0 ? (
            <div className="professional-card p-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-500 mb-2">{latinToCyrillic("Mahsulot topilmadi")}</p>
              <p className="text-gray-400">{latinToCyrillic("Qidiruv shartlarini o'zgartiring")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupNames.map((groupName) => {
              const groupProducts = groupedProducts[groupName];
              const isExpanded = expandedGroups.includes(groupName);
              const totalStock = groupProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0);
              const totalValue = groupProducts.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.pricePerBag || 0)), 0);
              return (
                <div key={groupName} className="group border-2 border-gray-200/60 rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-blue-300/60 hover:scale-[1.02]">
                  {/* Guruh headeri */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupName)}
                    className="w-full p-4 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 border-b-2 border-gray-200/60 cursor-pointer hover:from-blue-50/40 hover:via-white hover:to-blue-100/40 transition-all duration-300 relative overflow-hidden text-left"
                    aria-label={isExpanded ? latinToCyrillic("Yopish") : latinToCyrillic("Ochish")}
                    aria-expanded={isExpanded ? "true" : "false"} // eslint-disable-line jsx-a11y/aria-proptypes
                  >
                    {/* Background gradient orqali */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                          isExpanded 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30 scale-110' 
                            : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 hover:from-blue-100 hover:to-blue-200 hover:text-blue-600 hover:shadow-blue-200/30'
                        }`}>
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-black text-gray-900 truncate max-w-[140px] group-hover:text-blue-700 transition-colors">{groupName}</h3>
                          <p className="text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                            {groupProducts.length} {latinToCyrillic("ta")} • {totalStock} {latinToCyrillic("qop")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                          {formatPrice(totalValue)}
                        </p>
                        <p className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                          {latinToCyrillic("Jami qiymat")}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Mahsulotlar ro'yxati */}
                  {isExpanded && (
                    <div className="p-4 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/20">
                      <div className="space-y-3">
                        {groupProducts.map((product) => {
                          const stockStatus = getStockStatus(product);
                          const StatusIcon = stockStatus.icon;
                          const isEditing = editingProduct === product.id;
                          
                          return (
                            <div key={product.id} className="group bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 rounded-2xl border border-gray-200/60 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300/60">
                              {/* Mahsulot header */}
                              <div className={`p-4 border-b-2 ${stockStatus.bgColor} bg-gradient-to-r ${stockStatus.bgColor.replace('bg-', 'from-').replace('border-', 'to-')} relative overflow-hidden`}>
                                {/* Background pattern */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
                                
                                <div className="relative flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        aria-label="Mahsulot nomini tahrirlash"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl font-black text-gray-900 mb-3 bg-white/90 backdrop-blur-sm shadow-inner focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all"
                                      />
                                    ) : (
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-black text-gray-900 text-sm truncate group-hover:text-blue-700 transition-colors">{product.name}</h4>
                                        {/* Zaxira miqdori badge */}
                                        <span className={`text-xs font-black px-3 py-1.5 rounded-full shadow-md transition-all group-hover:scale-105 ${
                                          product.currentStock === 0 
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-300 shadow-red-500/20' 
                                            : product.currentStock < 50 
                                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-2 border-amber-300 shadow-amber-500/20'
                                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-2 border-emerald-300 shadow-emerald-500/20'
                                        }`}>
                                          {product.currentStock || 0} {latinToCyrillic('qop')}
                                        </span>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${stockStatus.bgColor} shadow-md`}>
                                        <StatusIcon className="w-3 h-3 text-white" />
                                      </div>
                                      <span className={`text-xs font-black px-3 py-1 rounded-full ${stockStatus.bgColor} ${stockStatus.color} shadow-sm`}>
                                        {stockStatus.emoji} {stockStatus.label}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 ml-3">
                                    {isEditing ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => saveProductData(product.id)}
                                          className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-all hover-scale"
                                          aria-label="Save"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={cancelEditing}
                                          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all hover-scale"
                                          aria-label="Cancel"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => navigate(`/cashier/products/${product.id}`)}
                                          className="h-9 px-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white rounded-2xl flex items-center gap-1.5 transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 font-black text-xs"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span>{latinToCyrillic("Батафсил")}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => startEditing(product)}
                                          className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-500 hover:to-blue-600 text-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-blue-500/30"
                                          title={latinToCyrillic("Таҳрир")}
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deleteProduct(product.id)}
                                          className="w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-500 hover:to-red-600 text-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-red-500/30"
                                          title={latinToCyrillic("Ўчириш")}
                                          aria-label={latinToCyrillic("Ўчириш")}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Mahsulot ma'lumotlari - Narx */}
                              <div className="p-4 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/20 border-t border-gray-200/60">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                      <span className="text-xs font-black text-blue-600">₽</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{latinToCyrillic("Narx/qop")}</span>
                                  </div>
                                  <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                    {formatPrice(product.pricePerBag || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>

      {/* Yangi mahsulot qo'shish modal oynasi */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {latinToCyrillic("Yangi Mahsulot")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeAddModal}
                  aria-label={latinToCyrillic("Yopish")}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddProduct} className="space-y-5">
                {/* Mahsulot nomi */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {latinToCyrillic("Mahsulot nomi")} *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder={latinToCyrillic("Masalan: 15gr Preform Oq")}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>

                {/* Narx va Zaxira */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={latinToCyrillic("Narx (qop)") + " *"}
                    decimal
                    value={newProduct.pricePerBag}
                    onChange={(e) => setNewProduct({...newProduct, pricePerBag: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                  <Input
                    label={latinToCyrillic("Zaxira (qop)") + " *"}
                    numeric
                    value={newProduct.currentStock}
                    onChange={(e) => setNewProduct({...newProduct, currentStock: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>

                {/* Qo'shimcha sozlamalar */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={latinToCyrillic("Narx (dona)")}
                    decimal
                    value={newProduct.pricePerPiece}
                    onChange={(e) => setNewProduct({...newProduct, pricePerPiece: e.target.value})}
                    placeholder="Avtomatik"
                  />
                  <Input
                    label={latinToCyrillic("1 qopda (dona)")}
                    numeric
                    value={newProduct.unitsPerBag}
                    onChange={(e) => setNewProduct({...newProduct, unitsPerBag: e.target.value})}
                    placeholder="2000"
                  />
                </div>

                {/* Ombor kategoriyasi */}
                <div>
                  <label htmlFor="warehouse-select" className="block text-sm font-bold text-gray-700 mb-2">
                    {latinToCyrillic("Ombor kategoriyasi")}
                  </label>
                  <select
                    id="warehouse-select"
                    value={newProduct.warehouse}
                    onChange={(e) => setNewProduct({...newProduct, warehouse: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="preform">Preform</option>
                    <option value="krishka">Krishka</option>
                    <option value="ruchka">Ruchka</option>
                    <option value="other">Boshqa</option>
                  </select>
                </div>

                {/* Tugmalar */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                  >
                    {latinToCyrillic("Bekor qilish")}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
                  >
                    {latinToCyrillic("Saqlash")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
