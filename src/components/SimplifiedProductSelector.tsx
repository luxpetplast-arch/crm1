import { useState, useEffect } from 'react';
import { Search, Package, Plus, X, CheckCircle2 } from 'lucide-react';
import { latinToCyrillic } from '../lib/transliterator';

interface Product {
  id: string;
  name: string;
  pricePerBag: number;
  currentStock: number;
  unitsPerBag: number;
  warehouse: string;
  subType?: string;
}

interface SimplifiedProductSelectorProps {
  products: Product[];
  onProductSelect: (product: Product, quantity: number, price: number, priceUnit?: 'dona' | 'qop') => void;
  currency: string;
  exchangeRate: number;
}

export default function SimplifiedProductSelector({ 
  products, 
  onProductSelect, 
  currency, 
  exchangeRate 
}: SimplifiedProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantity, setQuantity] = useState('1');
  const [priceUnit, setPriceUnit] = useState<'dona' | 'qop'>('qop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Kategoriyalar
  const categories = [
    { id: 'all', label: 'Barchasi', icon: '📦' },
    { id: 'preform', label: 'Preform', icon: '🥤' },
    { id: 'krishka', label: 'Krishka', icon: '🔴' },
    { id: 'ruchka', label: 'Ruchka', icon: '⚫' },
    { id: 'other', label: 'Boshqa', icon: '📋' }
  ];

  // Mahsulotlarni filter qilish
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      product.warehouse === selectedCategory || 
      product.name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Narxni ko'rsatish
  const getDisplayPrice = (price: number) => {
    if (currency === 'UZS') {
      return Math.round(price * exchangeRate).toLocaleString();
    }
    return price.toFixed(2);
  };

  // Mahsulotni tanlash
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity('1');
  };

  // Mahsulotni qo'shish
  const handleAddProduct = () => {
    if (!selectedProduct || !quantity) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    // Zaxirani tekshirish
    if (qty > selectedProduct.currentStock) {
      alert(latinToCyrillic(
        `Zaxirada yetarli mahsulot yo'q!\nOmborda: ${selectedProduct.currentStock} qop\nSotmoqchisiz: ${qty} qop`
      ));
      return;
    }

    const displayPrice = currency === 'UZS' 
      ? selectedProduct.pricePerBag * exchangeRate 
      : selectedProduct.pricePerBag;

    onProductSelect(selectedProduct, qty, displayPrice, priceUnit);
    
    // Formani tozalash
    setSelectedProduct(null);
    setQuantity('1');
    setSearchTerm('');
  };

  // Klaviatura yordamida qo'shish
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedProduct && quantity) {
      handleAddProduct();
    }
  };

  return (
    <div className="professional-card p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Package className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">{latinToCyrillic("Mahsulot Qo'shish")}</h3>
          <p className="text-sm text-gray-600 font-medium">{latinToCyrillic("Tez va oson tanlash")}</p>
        </div>
      </div>

      {/* Qidiruv */}
      <div className="relative mb-6">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
        <input
          type="text"
          placeholder={latinToCyrillic("Mahsulot nomini kiriting...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="professional-input pl-14 pr-5 py-5 text-lg font-bold"
        />
      </div>

      {/* Kategoriya tugmalari */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`py-4 px-2 rounded-2xl text-sm font-black transition-all hover-scale ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{cat.icon}</div>
            <div>{cat.label}</div>
          </button>
        ))}
      </div>

      {/* Mahsulotlar ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-96 overflow-y-auto professional-scrollbar">
        {filteredProducts.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-bold text-lg">{latinToCyrillic("Mahsulot topilmadi")}</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleProductSelect(product)}
              className={`p-5 rounded-2xl border-2 transition-all text-left card-hover-lift ${
                selectedProduct?.id === product.id
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl shadow-blue-500/20'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 text-base mb-2">{product.name}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 font-medium">
                      {latinToCyrillic("Zaxira")}: <span className="font-bold text-gray-700">{product.currentStock} qop</span>
                    </span>
                    <span className="text-blue-600 font-black text-lg">
                      {currency === 'UZS' ? 'UZS' : '$'}{getDisplayPrice(product.pricePerBag)}
                    </span>
                  </div>
                </div>
                {selectedProduct?.id === product.id && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Tanlangan mahsulot va miqdor */}
      {selectedProduct && (
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-black text-gray-900 text-lg">{selectedProduct.name}</h4>
                <p className="text-sm text-blue-600 font-bold">
                  {currency === 'UZS' ? 'UZS' : '$'}{getDisplayPrice(selectedProduct.pricePerBag)} / {latinToCyrillic("qop")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-10 h-10 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all hover-scale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">
                {latinToCyrillic("Miqdor")}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="professional-input px-5 py-4 text-lg font-bold flex-1"
                  placeholder="1"
                />
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value as 'dona' | 'qop')}
                  className="professional-input px-3 py-4 text-lg font-bold"
                >
                  <option value="qop">qop</option>
                  <option value="dona">dona</option>
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddProduct}
                className="professional-button px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl flex items-center gap-3 hover-lift"
              >
                <Plus className="w-6 h-6" />
                {latinToCyrillic("Qo'shish")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
