import { useState, useEffect } from 'react';
import { 
  Trash2, 
  ShoppingCart,
  ArrowLeft,
  User,
  DollarSign,
  Search
} from 'lucide-react';
import SimplifiedProductSelector from '../components/SimplifiedProductSelector';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import Input from '../components/Input';
import { generateSimpleReceiptHTML } from '../lib/simpleReceiptPrinter';
import { useNavigate } from 'react-router-dom';
import { errorHandler } from '../lib/professionalErrorHandler';

interface Product {
  id: string;
  name: string;
  pricePerBag: number;
  currentStock: number;
  unitsPerBag: number;
  warehouse: string;
  subType?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  pricePerBag: number;
  subtotal: number;
  priceUnit: 'dona' | 'qop';
}

export default function SimplifiedAddSale() {
  const navigate = useNavigate();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [currency, setCurrency] = useState<'USD' | 'UZS'>('USD');
  const [exchangeRate] = useState(12500);
  const [isKocha, setIsKocha] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // To'lov ma'lumotlari
  const [paidUZS, setPaidUZS] = useState('');
  const [paidUSD, setPaidUSD] = useState('');
  const [paidCLICK, setPaidCLICK] = useState('');

  // Ma'lumotlarni yuklash
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers')
        ]);
        setProducts(productsRes.data || []);
        setCustomers((customersRes.data || []).filter((c: any) => c && c.name));
      } catch (error) {
        errorHandler.handleError(error, { action: 'loadData' });
      }
    };
    loadData();
  }, []);

  // Mahsulotni savatga qo'shish
  const handleProductSelect = (product: Product, quantity: number, price: number, priceUnit: 'dona' | 'qop' = 'qop') => {
    const subtotal = quantity * price;

    const newItem: CartItem = {
      product,
      quantity,
      pricePerBag: price,
      subtotal,
      priceUnit
    };

    setCart(prev => [...prev, newItem]);
  };

  // Savatdan mahsulotni o'chirish
  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Savatdagi mahsulotni o'zgartirish
  const updateCartItem = (index: number, newProduct: Product, newQuantity: number, newPrice: number, newPriceUnit?: 'dona' | 'qop') => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          product: newProduct,
          quantity: newQuantity,
          pricePerBag: newPrice,
          subtotal: newQuantity * newPrice,
          priceUnit: newPriceUnit || item.priceUnit
        };
      }
      return item;
    }));
  };

  // Savatni tozalash
  const clearCart = () => {
    setCart([]);
  };

  // Jami summani hisoblash
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  
  // To'lovni hisoblash
  const calculatePaidInSelectedCurrency = () => {
    const uzs = parseFloat(paidUZS) || 0;
    const usd = parseFloat(paidUSD) || 0;
    const click = parseFloat(paidCLICK) || 0;
    
    if (currency === 'UZS') {
      return uzs + click + (usd * exchangeRate);
    }
    return usd + (uzs / exchangeRate) + (click / exchangeRate);
  };

  const paidAmount = calculatePaidInSelectedCurrency();
  const debtAmount = totalAmount - paidAmount;

  // Chek chiqarish
  const printReceipt = (sale: any) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
      
      const receiptData = {
        saleId: sale.id?.slice(0, 8) || 'N/A',
        receiptNumber: sale.receiptNumber || 'N/A',
        date: new Date().toLocaleDateString('uz-UZ'),
        time: new Date().toLocaleTimeString('uz-UZ'),
        cashier: user.name,
        currency: currency,
        customer: isKocha ? {
          name: manualCustomerName,
          phone: manualCustomerPhone,
          address: ''
        } : selectedCustomer,
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unit: 'qop',
          piecesPerBag: item.product.unitsPerBag,
          pricePerBag: item.pricePerBag,
          pricePerPiece: item.pricePerBag / (item.product.unitsPerBag || 1),
          pricePerUnit: item.pricePerBag,
          subtotal: item.subtotal,
          warehouse: item.product.warehouse
        })),
        subtotal: totalAmount,
        total: totalAmount,
        totalPaid: paidAmount,
        debt: debtAmount > 0 ? debtAmount : 0,
        payments: {
          uzs: parseFloat(paidUZS) || 0,
          usd: parseFloat(paidUSD) || 0,
          click: parseFloat(paidCLICK) || 0
        },
        companyInfo: {
          name: 'LUX PET PLAST',
          address: 'Buxoro viloyati, Vobkent tumani',
          phone: '+998 91 414 44 58'
        }
      };

      const receiptHTML = generateSimpleReceiptHTML(receiptData);
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Chek chiqarishda xatolik:', error);
      alert('Chek chiqarishda xatolik yuz berdi!');
    }
  };

  // Sotuvni tasdiqlash
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validatsiya
    if (cart.length === 0) {
      alert(latinToCyrillic('Iltimos, avval mahsulot qo\'shing!'));
      return;
    }

    if (!isKocha && !selectedCustomer) {
      alert(latinToCyrillic('Iltimos, mijoz tanlang!'));
      return;
    }

    if (isKocha && !manualCustomerName) {
      alert(latinToCyrillic('Iltimos, mijoz nomini kiriting!'));
      return;
    }

    try {
      // Sotuv ma'lumotlarini tayyorlash
      const saleData = {
        customerId: isKocha ? null : selectedCustomer.id,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          pricePerBag: currency === 'UZS' ? item.pricePerBag / exchangeRate : item.pricePerBag,
          subtotal: currency === 'UZS' ? item.subtotal / exchangeRate : item.subtotal,
          saleType: 'bag',
          unitsPerBag: item.product.unitsPerBag,
          warehouse: item.product.warehouse
        })),
        totalAmount: currency === 'UZS' ? totalAmount / exchangeRate : totalAmount,
        paidAmount: paidAmount,
        debtAmount: debtAmount > 0 ? debtAmount : 0,
        paymentDetails: {
          uzs: paidUZS,
          usd: paidUSD,
          click: paidCLICK
        },
        currency: currency,
        isKocha: isKocha,
        manualCustomerName: isKocha ? manualCustomerName : null,
        manualCustomerPhone: isKocha ? manualCustomerPhone : null
      };

      // Sotuvni yaratish
      const response = await api.post('/sales', saleData);
      const createdSale = response.data;

      // Chek chiqarish
      printReceipt(createdSale);

      // Muvaffaqiyat xabari
      alert(latinToCyrillic('Sotuv muvaffaqiyatli amalga oshirildi!'));
      
      // Savatni tozalash va sotuvlar sahifasiga qaytish
      clearCart();
      navigate('/cashier/sales');
      
    } catch (error: any) {
      const professionalError = errorHandler.handleError(error, { 
        action: 'createSale'
      });
      alert(latinToCyrillic('Xatolik: ') + professionalError.userMessage);
    }
  };

  // Narxni formatlash
  const formatPrice = (price: number) => {
    if (currency === 'UZS') {
      return Math.round(price).toLocaleString() + ' UZS';
    }
    return price.toFixed(2) + ' $';
  };

  return (
    <div className="min-h-screen professional-bg-pattern">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/cashier/sales')}
              className="professional-button px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl flex items-center gap-3 hover-lift"
            >
              <ArrowLeft className="w-5 h-5" />
              {latinToCyrillic("Orqaga")}
            </button>
            
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                {latinToCyrillic("Yangi Sotuv")}
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                {cart.length} {latinToCyrillic("ta mahsulot")}
              </p>
            </div>
          </div>
          
          {/* Valyuta tanlash */}
          <div className="flex bg-gray-100 rounded-2xl p-1 border-2 border-gray-200">
            <button
              type="button"
              onClick={() => setCurrency('UZS')}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${
                currency === 'UZS'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              UZS
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${
                currency === 'USD'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              $
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1-USTUN: Mahsulot tanlash */}
            <div className="lg:col-span-2">
              <SimplifiedProductSelector
                products={products}
                onProductSelect={handleProductSelect}
                currency={currency}
                exchangeRate={exchangeRate}
              />
            </div>

            {/* 2-USTUN: Savat va to'lov */}
            <div className="space-y-8">
              
              {/* Mijoz tanlash */}
              <div className="professional-card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{latinToCyrillic("Mijoz")}</h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      checked={isKocha}
                      onChange={(e) => setIsKocha(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded-2xl"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      {latinToCyrillic("Ko'cha mijoz")}
                    </span>
                  </label>

                  {isKocha ? (
                    <div className="space-y-4">
                      <input
                        id="manual-customer-name"
                        type="text"
                        placeholder={latinToCyrillic("Mijoz nomi")}
                        value={manualCustomerName}
                        onChange={(e) => setManualCustomerName(e.target.value)}
                        className="professional-input px-5 py-4 text-lg font-bold"
                        aria-label={latinToCyrillic("Mijoz nomi")}
                      />
                      <input
                        id="manual-customer-phone"
                        type="tel"
                        placeholder={latinToCyrillic("Telefon raqami")}
                        value={manualCustomerPhone}
                        onChange={(e) => setManualCustomerPhone(e.target.value)}
                        className="professional-input px-5 py-4 text-lg font-bold"
                        aria-label={latinToCyrillic("Telefon raqami")}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Mijoz qidiruv inputi */}
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="customer-search"
                          type="text"
                          placeholder={latinToCyrillic("Mijoz qidirish...")}
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm font-bold"
                        />
                      </div>
                      
                      {/* Filterlangan mijozlar ro'yxati */}
                      <div className="max-h-[250px] overflow-y-auto space-y-2">
                        {customers
                          .filter(c => {
                            if (!customerSearch) return true;
                            const search = customerSearch.toLowerCase();
                            return (c.name?.toLowerCase().includes(search) || 
                                    c.phone?.includes(search));
                          })
                          .map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setCustomerSearch('');
                            }}
                            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                              selectedCustomer?.id === customer.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.phone || '—'}</p>
                              </div>
                              {customer.debtUSD > 0 && (
                                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold">
                                  ${customer.debtUSD.toFixed(0)}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Tanlangan mijozni ko'rsatish */}
                {selectedCustomer && !isKocha && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-md">
                    <div className="text-sm font-bold text-green-700 mb-2">{latinToCyrillic("Tanlangan mijoz")}</div>
                    <div className="font-bold text-gray-800 truncate text-lg">{selectedCustomer.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{selectedCustomer.phone || '—'}</div>
                    {selectedCustomer.debtUSD > 0 && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <span className="text-sm font-bold text-red-600">
                          {latinToCyrillic("Qarz")}: ${selectedCustomer.debtUSD.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Ko'cha mijoz ko'rinishi */}
                {isKocha && manualCustomerName && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl shadow-md">
                    <div className="text-sm font-bold text-orange-700 mb-2">{latinToCyrillic("Ko'cha mijoz")}</div>
                    <div className="font-bold text-gray-800 truncate text-lg">{manualCustomerName}</div>
                    {manualCustomerPhone && (
                      <div className="text-sm text-gray-600 mt-1">{manualCustomerPhone}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Savat */}
              <div className="professional-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{latinToCyrillic("Savat")}</h3>
                  </div>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700 font-bold hover-scale"
                    >
                      {latinToCyrillic("Tozalash")}
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <ShoppingCart className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-bold text-lg">{latinToCyrillic("Savat bo'sh")}</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto professional-scrollbar">
                    {cart.map((item, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200 card-hover-lift">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-black text-gray-900 text-base mb-2">{item.product.name}</h4>
                            <div className="flex items-center gap-2">
                              <input
                                id={`cart-quantity-${index}`}
                                type="text"
                                inputMode="numeric"
                                value={item.quantity || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  const newQuantity = val === '' ? 0 : parseInt(val, 10);
                                  updateCartItem(index, item.product, newQuantity, item.pricePerBag, item.priceUnit);
                                }}
                                className="w-16 px-2 py-1 border-2 border-gray-300 rounded-lg text-center font-bold text-sm focus:border-blue-500 focus:outline-none"
                                aria-label="Miqdor"
                              />
                              <select
                                id={`cart-unit-${index}`}
                                value={item.priceUnit}
                                aria-label="Birlik"
                                onChange={(e) => {
                                  const newUnit = e.target.value as 'dona' | 'qop';
                                  const oldUnit = item.priceUnit;
                                  const upb = item.product.unitsPerBag || 2000;
                                  
                                  // Narxni raqamga aylantirish
                                  const currentPrice = parseFloat(item.pricePerBag as any) || 0;
                                  
                                  // Narxni yangi birlikka moslash
                                  let newPrice = currentPrice;
                                  if (oldUnit === 'qop' && newUnit === 'dona') {
                                    // Qopdan donaga: narxni dona soniga bo'lish
                                    newPrice = currentPrice / upb;
                                  } else if (oldUnit === 'dona' && newUnit === 'qop') {
                                    // Donadan qopga: narxni dona soniga ko'paytirish
                                    newPrice = currentPrice * upb;
                                  }
                                  
                                  console.log('🔄 Birlik o\'zgardi:', { oldUnit, newUnit, currentPrice, newPrice, upb });
                                  
                                  updateCartItem(index, item.product, item.quantity, newPrice, newUnit);
                                }}
                                className="px-2 py-1 border-2 border-gray-300 rounded-lg font-bold text-sm focus:border-blue-500 focus:outline-none"
                              >
                                <option value="qop">qop</option>
                                <option value="dona">dona</option>
                              </select>
                              <span className="text-sm text-gray-600 font-medium">×</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={item.pricePerBag || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
                                  const newPrice = val === '' ? 0 : parseFloat(val);
                                  updateCartItem(index, item.product, item.quantity, newPrice, item.priceUnit);
                                }}
                                className="w-20 px-2 py-1 border-2 border-gray-300 rounded-lg text-center font-bold text-sm focus:border-blue-500 focus:outline-none"
                                aria-label="Narx"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-blue-600 text-lg">{formatPrice(item.subtotal)}</p>
                            <button
                              type="button"
                              onClick={() => removeFromCart(index)}
                              className="text-red-500 hover:text-red-700 mt-2 hover-scale"
                              aria-label="Savatdan o'chirish"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="border-t-2 border-gray-200 pt-6 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-gray-900 text-lg">{latinToCyrillic("Jami:")}</span>
                      <span className="font-black text-2xl text-blue-600">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* To'lov */}
              {cart.length > 0 && (
                <div className="professional-card p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{latinToCyrillic("To'lov")}</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Input
                        label={latinToCyrillic("Naqd (UZS)")}
                        decimal
                        value={paidUZS}
                        onChange={(e) => setPaidUZS(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Input
                        label={latinToCyrillic("Naqd ($)")}
                        decimal
                        value={paidUSD}
                        onChange={(e) => setPaidUSD(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Input
                        label={latinToCyrillic("CLICK")}
                        decimal
                        value={paidCLICK}
                        onChange={(e) => setPaidCLICK(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    {debtAmount > 0 && (
                      <div className="professional-alert error">
                        <div className="flex justify-between items-center">
                          <span className="font-black">{latinToCyrillic("Qarz:")}</span>
                          <span className="font-black text-lg">{formatPrice(debtAmount)}</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="professional-button w-full py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover-lift"
                    >
                      {latinToCyrillic("Sotuvni Tasdiqlash")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
