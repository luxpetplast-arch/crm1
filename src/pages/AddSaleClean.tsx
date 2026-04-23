import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Package, ShoppingCart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { latinToCyrillic } from '../lib/transliterator';
import { useSaleForm } from '../hooks/useSaleForm';
import { ProductTypeCard, CartItem, CustomerSelector, PaymentSection } from '../components/sales';
import { filterProductsByCategory, getCurrencySymbol, getDisplayAmount } from '../lib/saleUtils';
import api from '../lib/professionalApi';
import type { Product } from '../types';

// Product Section Component - Yangi tip kartochkalar
const ProductSection = ({
  filteredProducts,
  currency,
  productSearch,
  activeCategory,
  latinToCyrillic,
  onSearchChange,
  onCategoryChange,
  onQuickAdd,
}: {
  filteredProducts: Product[];
  currency: string;
  productSearch: string;
  activeCategory: string;
  latinToCyrillic: (text: string) => string;
  onSearchChange: (val: string) => void;
  onCategoryChange: (cat: string) => void;
  onQuickAdd: (product: Product) => void;
}) => {
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'preform', label: 'Pre' },
    { id: 'krishka', label: 'Kri' },
    { id: 'ruchka', label: 'Ruc' },
    { id: 'other', label: 'Bsh' },
  ];

  // Group products by type
  const allPreforms = filteredProducts.filter((p) => {
    const name = p.name?.toLowerCase() || '';
    const warehouse = p.warehouse?.toLowerCase() || '';
    return warehouse === 'preform' || name.includes('preform') || /\d+\s*(gr|g|гр|г)/.test(name);
  });

  // Preformlarni gram bo'yicha guruhlash
  const gramSizes = [15, 21, 28, 32, 38, 43, 48];
  const preformGroups: { key: string; title: string; products: Product[] }[] = [];

  gramSizes.forEach((gram) => {
    const groupProducts = allPreforms.filter((p) => {
      const name = p.name?.toLowerCase() || '';
      return name.includes(gram.toString()) || name.includes(`${gram}gr`) || name.includes(`${gram}g`);
    });
    if (groupProducts.length > 0) {
      preformGroups.push({
        key: `${gram}gr`,
        title: `${gram} gr Preformlar`,
        products: groupProducts,
      });
    }
  });

  const krishkaProducts = filteredProducts.filter((p) => {
    const name = p.name?.toLowerCase() || '';
    const warehouse = p.warehouse?.toLowerCase() || '';
    return warehouse === 'krishka' || name.includes('krishka') || name.includes('qopqoq') || name.includes('cap');
  });

  const ruchkaProducts = filteredProducts.filter((p) => {
    const name = p.name?.toLowerCase() || '';
    const warehouse = p.warehouse?.toLowerCase() || '';
    return warehouse === 'ruchka' || name.includes('ruchka') || name.includes('handle');
  });

  const otherProducts = filteredProducts.filter((p) => {
    const name = p.name?.toLowerCase() || '';
    const warehouse = p.warehouse?.toLowerCase() || '';
    const isPreform = warehouse === 'preform' || name.includes('preform') || /\d+\s*(gr|g|гр|г)/.test(name);
    const isKrishka = warehouse === 'krishka' || name.includes('krishka') || name.includes('qopqoq') || name.includes('cap');
    const isRuchka = warehouse === 'ruchka' || name.includes('ruchka') || name.includes('handle');
    return !isPreform && !isKrishka && !isRuchka;
  });

  return (
    <div className="space-y-3">
      <div className="glass-card p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{latinToCyrillic('Mahsulotlar')}</h2>
            <p className="text-sm text-gray-500">{filteredProducts.length} {latinToCyrillic('mahsulot')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Package className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder={latinToCyrillic('Mahsulot qidirish...')}
            value={productSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-12 px-4 pl-12 text-sm font-bold rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-5 gap-1 p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-inner">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`py-2.5 px-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-transparent text-gray-600 hover:bg-white/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Type Cards */}
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-600 font-bold text-lg">{latinToCyrillic('Mahsulot topilmadi')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {preformGroups.map((group) => (
                <ProductTypeCard
                  key={group.key}
                  title={group.title}
                  color="blue"
                  products={group.products}
                  currency={currency}
                  onAddProduct={onQuickAdd}
                  latinToCyrillic={latinToCyrillic}
                />
              ))}
              {krishkaProducts.length > 0 && (
                <ProductTypeCard
                  title={latinToCyrillic('Krishkalar')}
                  color="purple"
                  products={krishkaProducts}
                  currency={currency}
                  onAddProduct={onQuickAdd}
                  latinToCyrillic={latinToCyrillic}
                />
              )}
              {ruchkaProducts.length > 0 && (
                <ProductTypeCard
                  title={latinToCyrillic('Ruchkalar')}
                  color="pink"
                  products={ruchkaProducts}
                  currency={currency}
                  onAddProduct={onQuickAdd}
                  latinToCyrillic={latinToCyrillic}
                />
              )}
              {otherProducts.length > 0 && (
                <ProductTypeCard
                  title={latinToCyrillic('Boshqa mahsulotlar')}
                  color="orange"
                  products={otherProducts}
                  currency={currency}
                  onAddProduct={onQuickAdd}
                  latinToCyrillic={latinToCyrillic}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function AddSaleClean() {
  const navigate = useNavigate();
  const location = useLocation();
  const editSale = location.state?.editSale;
  const orderData = location.state?.orderData;

  const saleForm = useSaleForm({ editSale, orderData });
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers'),
        ]);

        if (productsRes.data) {
          saleForm.setProducts(productsRes.data);
        }
        if (customersRes.data) {
          saleForm.setCustomers(customersRes.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Refresh products periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/products');
        if (res.data) {
          saleForm.setProducts(res.data);
        }
      } catch (error) {
        console.error('Error refreshing products:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter products
  const filteredProducts = filterProductsByCategory(
    saleForm.products.filter((p) =>
      p.name?.toLowerCase().includes(saleForm.productSearch.toLowerCase())
    ),
    saleForm.activeCategory
  );

  // Handlers
  const handleSelectProduct = useCallback(
    (product: Product) => {
      saleForm.selectProduct(product, saleForm.products, saleForm.selectedCustomer, saleForm.customerPrices);
    },
    [saleForm]
  );

  const handleQuickAdd = useCallback(
    (product: Product) => {
      handleSelectProduct(product);
      setTimeout(() => saleForm.addItem(), 100);
    },
    [handleSelectProduct, saleForm]
  );

  const handleSubmit = useCallback(async () => {
    try {
      await saleForm.submitSale();
    } catch (error) {
      // Error handled in hook
    }
  }, [saleForm]);

  return (
    <div className="modern-bg page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="glass-card p-4 mb-4 fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/cashier/sales')}
                className="btn-gradient-primary px-4 py-2 flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {latinToCyrillic('Orqaga')}
              </button>

              <div>
                <h1 className="text-2xl font-bold text-blue-600 mb-0.5">
                  {saleForm.isEditMode ? latinToCyrillic('Sotuvni Tahrirlash') : latinToCyrillic('Yangi Sotuv')}
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                  {saleForm.form.items.length} {latinToCyrillic('ta mahsulot tanlandi')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="toggle-modern">
                <button
                  type="button"
                  onClick={() => saleForm.updateFormField('currency', 'UZS')}
                  className={`toggle-option ${saleForm.form.currency === 'UZS' ? 'active' : ''}`}
                >
                  UZS
                </button>
                <button
                  type="button"
                  onClick={() => saleForm.updateFormField('currency', 'USD')}
                  className={`toggle-option ${saleForm.form.currency === 'USD' ? 'active' : ''}`}
                >
                  $
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="glass-card p-5 slide-up">
          {/* Row 1: Products + Cart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Products Column */}
            <ProductSection
              filteredProducts={filteredProducts}
              currency={saleForm.form.currency}
              activeCategory={saleForm.activeCategory}
              productSearch={saleForm.productSearch}
              latinToCyrillic={latinToCyrillic}
              onCategoryChange={(cat) => saleForm.setActiveCategory(cat as any)}
              onSearchChange={saleForm.setProductSearch}
              onQuickAdd={handleQuickAdd}
            />

            {/* Cart Column */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{latinToCyrillic('Savat')}</h2>
                    <p className="text-sm text-emerald-100">{saleForm.form.items.length} {latinToCyrillic('ta mahsulot')}</p>
                  </div>
                </div>
              </div>

              {saleForm.form.items.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-900">{latinToCyrillic('Savat')}</h3>
                      <button
                        type="button"
                        onClick={saleForm.clearItems}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        {latinToCyrillic('Tozalash')}
                      </button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {saleForm.form.items.map((item, index) => (
                        <CartItem
                          key={index}
                          item={item}
                          index={index}
                          isEditing={editingItemIndex === index}
                          products={saleForm.products}
                          currency={saleForm.form.currency}
                          latinToCyrillic={latinToCyrillic}
                          onUpdate={(idx, updates) => {
                            saleForm.updateItem(idx, updates);
                            setEditingItemIndex(idx);
                          }}
                          onRemove={saleForm.removeItem}
                        />
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{latinToCyrillic('Jami')}:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {getCurrencySymbol(saleForm.form.currency)}
                          {getDisplayAmount(saleForm.totalAmount, saleForm.form.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold mb-2">{latinToCyrillic("Savat bo'sh")}</p>
                  <p className="text-gray-400">{latinToCyrillic("Mahsulot qo'shing")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Customer & Payment (Full Width) */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{latinToCyrillic("Mijoz va To'lov")}</h2>
                  <p className="text-sm text-purple-100">
                    {latinToCyrillic('Sotuvni yakunlash')} ({saleForm.customers.length} {latinToCyrillic('ta mijoz')})
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Selector */}
              <CustomerSelector
                customers={saleForm.customers}
                selectedCustomerId={saleForm.form.customerId}
                isKocha={saleForm.form.isKocha}
                customerSearch={saleForm.customerSearch}
                manualCustomerName={saleForm.form.manualCustomerName}
                manualCustomerPhone={saleForm.form.manualCustomerPhone}
                latinToCyrillic={latinToCyrillic}
                onSelectCustomer={(customer) => {
                  saleForm.updateFormField('customerId', customer.id);
                  saleForm.updateFormField('customerName', customer.name);
                  saleForm.updateFormField('isKocha', false);
                  saleForm.setCustomerSearch('');
                }}
                onSelectKocha={() => {
                  saleForm.updateFormField('customerId', '');
                  saleForm.updateFormField('customerName', '');
                  saleForm.updateFormField('isKocha', true);
                }}
                onSearchChange={saleForm.setCustomerSearch}
                onManualNameChange={(val) => saleForm.updateFormField('manualCustomerName', val)}
                onManualPhoneChange={(val) => saleForm.updateFormField('manualCustomerPhone', val)}
              />

              {/* Payment Section */}
              {saleForm.form.items.length > 0 && (
                <PaymentSection
                  form={saleForm.form}
                  totalAmount={saleForm.totalAmount}
                  paidAmount={saleForm.paidAmount}
                  debtAmount={saleForm.debtAmount}
                  exchangeRate={saleForm.exchangeRate}
                  currency={saleForm.form.currency}
                  isSubmitting={saleForm.isSubmitting}
                  isEditMode={saleForm.isEditMode}
                  latinToCyrillic={latinToCyrillic}
                  onUpdateForm={(updates) => {
                    Object.entries(updates).forEach(([key, value]) => {
                      saleForm.updateFormField(key as any, value);
                    });
                  }}
                  onExchangeRateChange={saleForm.setExchangeRate}
                  onSubmit={handleSubmit}
                  onCancel={() => navigate('/cashier/sales')}
                  onReset={saleForm.resetForm}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
