import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import { 
  Plus, 
  Trash2, 
  Calculator,
  Zap,
  DollarSign,
  Printer
} from 'lucide-react';
import CustomerSelector from '../components/CustomerSelector';
import ProductSelector from '../components/ProductSelector';
import api from '../lib/api';
import { latinToCyrillic } from '../lib/transliterator';
import SalesHistory from '../components/SalesHistory';
import { formatDateTime } from '../lib/dateUtils';
import { printReceipt, prepareSaleReceipt } from '../lib/receiptPrinter';

export default function Sales() {
  console.log('🏪 Sales component rendering...');
  
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [activeTab, setActiveTab] = useState<'sales' | 'history'>('sales');
  
  // Qidiruv
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // Form uchun
  const [form, setForm] = useState<{
    customerId: string;
    customerName: string;
    items: any[];
    paidUZS: string;
    paidUSD: string;
    paidCLICK: string;
  }>({
    customerId: '',
    customerName: '',
    items: [],
    paidUZS: '',
    paidUSD: '',
    paidCLICK: '',
  });

  // Yangi mahsulot qo'shish uchun
  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    quantity: '',
    pricePerBag: '',
  });

  // Debug: showForm state'ini kuzatish
  console.log('📝 Current showForm state:', showForm);
  console.log('📝 Current newItem state:', newItem);

  // Tanlangan mijozni olish
  const selectedCustomer = customers.find(c => c.id === form.customerId);

  // Narx belgilash modal uchun
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [customerPrices, setCustomerPrices] = useState<Record<string, string>>({});
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Mijozning mahsulot narxlarini olish
  useEffect(() => {
    if (selectedCustomer?.productPrices) {
      try {
        const prices = JSON.parse(selectedCustomer.productPrices);
        setCustomerPrices(prices);
      } catch (error) {
        console.error('Error parsing customer prices:', error);
        setCustomerPrices({});
      }
    } else {
      setCustomerPrices({});
    }
  }, [selectedCustomer?.productPrices]);

  // Mijoz o'zgarganda narxni avtomatik to'ldirish
  useEffect(() => {
    if (selectedCustomer && newItem.productId) {
      const productPrice = customerPrices[newItem.productId];
      if (productPrice) {
        setNewItem(prev => ({
          ...prev,
          pricePerBag: productPrice
        }));
      } else if (selectedCustomer.pricePerBag) {
        setNewItem(prev => ({
          ...prev,
          pricePerBag: selectedCustomer.pricePerBag.toString()
        }));
      }
    }
  }, [form.customerId, selectedCustomer, newItem.productId, customerPrices]);

  useEffect(() => {
    console.log('🔄 Sales useEffect - calling loadData...');
    loadData();
    
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N = Yangi sotuv
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowForm(true);
      }
      // Esc = Formani yopish
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showForm]);

  const loadData = async () => {
    try {
      console.log('🔄 Loading data...');
      const [salesRes, productsRes, customersRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
        api.get('/customers')
      ]);
      
      console.log('📦 Mahsulotlar yuklandi:', productsRes.data.length, 'ta');
      console.log('📦 Mahsulotlar:', productsRes.data);
      console.log('👥 Mijozlar yuklandi:', customersRes.data.length, 'ta');
      console.log('💰 Sotuvlar yuklandi:', salesRes.data.length, 'ta');
      
      setSales(salesRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
      
      // Valyuta kurslari
      setExchangeRates({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
      
      console.log('✅ Data loading completed');
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      if (error.response?.status === 401) {
        console.error('❌ Authentication error - please login again');
      }
    }
  };

  const addProduct = () => {
    console.log('🛒 addProduct called');
    console.log('📝 Current newItem:', newItem);
    
    if (!newItem.productId || !newItem.quantity) {
      console.log('❌ Validation failed - productId or quantity missing');
      return;
    }
    
    console.log('✅ Validation passed');
    const subtotal = (parseFloat(newItem.quantity) || 0) * (parseFloat(newItem.pricePerBag) || 0);
    console.log('💰 Subtotal calculated:', subtotal);
    
    setForm(prev => {
      const updatedForm = {
        ...prev,
        items: [...prev.items, {
          productId: newItem.productId,
          productName: newItem.productName,
          quantity: parseFloat(newItem.quantity),
          pricePerBag: parseFloat(newItem.pricePerBag),
          subtotal
        }]
      };
      console.log('📋 Form updated with new item:', updatedForm.items);
      return updatedForm;
    });
    
    // Yangi mahsulot qo'shish formini tozalash
    setNewItem({
      productId: '',
      productName: '',
      quantity: '',
      pricePerBag: '',
    });
    
    console.log('🔄 Form cleared');
    setProductSearch('');
  };

  const removeProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const totalAmount = form.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  const calculatePaidInUSD = () => {
    const paidUZS = parseFloat(form.paidUZS) || 0;
    const paidUSD = parseFloat(form.paidUSD) || 0;
    const paidCLICK = parseFloat(form.paidCLICK) || 0;
    
    return (paidUZS / exchangeRates.USD_TO_UZS) + paidUSD + (paidCLICK / exchangeRates.USD_TO_UZS);
  };
  
  const paidAmount = calculatePaidInUSD();
  const debtAmount = totalAmount - paidAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.customerId || form.items.length === 0) {
      alert('Iltimos, mijoz va mahsulotlarni to\'ldiring!');
      return;
    }
    
    try {
      console.log('💰 Sotuv yaratilmoqda...');
      
      const saleData = {
        customerId: form.customerId,
        items: form.items,
        totalAmount,
        paidAmount,
        debtAmount,
        paymentDetails: {
          uzs: form.paidUZS,
          usd: form.paidUSD,
          click: form.paidCLICK
        }
      };
      
      const response = await api.post('/sales', saleData);
      const createdSale = response.data;
      
      console.log('✅ Sotuv yaratildi:', createdSale);
      
      // Chek chiqarish
      try {
        console.log('🖨️ Chek chiqarilmoqda...');
        
        // Foydalanuvchi ma'lumotlarini olish
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
        
        // Chek ma'lumotlarini tayyorlash
        const receiptData = prepareSaleReceipt(
          {
            ...createdSale,
            items: form.items
          },
          selectedCustomer,
          user,
          exchangeRates.USD_TO_UZS
        );
        
        // Chekni chop etish
        printReceipt(receiptData);
        
        console.log('✅ Chek chiqarildi!');
      } catch (printError) {
        console.error('❌ Chek chiqarishda xatolik:', printError);
        // Chek chiqarishda xatolik bo'lsa ham, sotuvni davom ettirish
        alert('Sotuv muvaffaqiyatli yaratildi, lekin chek chiqarishda xatolik yuz berdi!');
      }
      
      // Formani tozalash
      setForm({
        customerId: '',
        customerName: '',
        items: [],
        paidUZS: '',
        paidUSD: '',
        paidCLICK: '',
      });
      setNewItem({
        productId: '',
        productName: '',
        quantity: '',
        pricePerBag: '',
      });
      setShowForm(false);
      
      // Ma'lumotlarni qayta yuklash
      loadData();
    } catch (error) {
      console.error('❌ Sotuvni yaratishda xatolik:', error);
      alert('Sotuvni yaratishda xatolik yuz berdi!');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{latinToCyrillic("Sotuvlar")}</h1>
        <div className="flex gap-4">
          <Button
            variant={activeTab === 'sales' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('sales')}
          >
            {latinToCyrillic("Sotuvlar")}
          </Button>
          <Button
            variant={activeTab === 'history' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('history')}
          >
            {latinToCyrillic("Tarix")}
          </Button>
        </div>
      </div>

      {activeTab === 'history' && <SalesHistory />}

      {activeTab === 'sales' && (
        <div>
          {!showForm ? (
            <div className="space-y-4">
              {/* Yangi sotuv tugmasi */}
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    console.log('🆕 Yangi sotuv tugmasi bosildi');
                    setShowForm(true);
                  }} 
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {latinToCyrillic("Yangi Sotuv")}
                </Button>
              </div>

              {/* Sotuvlar ro'yxati */}
              {sales.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-gray-500 mb-4">Hozircha sotuvlar yo'q</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Birinchi Sotuvni Qo'shing
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sales.map((sale: any) => (
                    <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>#{sale.id.slice(0, 8)}</span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(sale.createdAt)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mijoz:</span>
                            <span className="font-semibold">{sale.customer?.name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Jami:</span>
                            <span className="font-semibold text-green-600">
                              ${sale.totalAmount?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">To'landi:</span>
                            <span className="font-semibold text-blue-600">
                              ${sale.paidAmount?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          {sale.debtAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Qarz:</span>
                              <span className="font-semibold text-red-600">
                                ${sale.debtAmount?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          )}
                          <div className="pt-2 border-t">
                            <p className="text-sm text-gray-500">
                              {sale.items?.length || 0} ta mahsulot
                            </p>
                          </div>
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                try {
                                  console.log('🖨️ Chek qayta chiqarilmoqda...');
                                  
                                  // Foydalanuvchi ma'lumotlarini olish
                                  const userStr = localStorage.getItem('user');
                                  const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
                                  
                                  // Chek ma'lumotlarini tayyorlash
                                  const receiptData = prepareSaleReceipt(
                                    sale,
                                    sale.customer,
                                    user,
                                    exchangeRates.USD_TO_UZS
                                  );
                                  
                                  // Chekni chop etish
                                  printReceipt(receiptData);
                                  
                                  console.log('✅ Chek qayta chiqarildi!');
                                } catch (error) {
                                  console.error('❌ Chek chiqarishda xatolik:', error);
                                  alert('Chek chiqarishda xatolik yuz berdi!');
                                }
                              }}
                              className="w-full"
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Chek Chiqarish
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-h-[85vh] overflow-y-auto">
              <Card className="border-2 border-primary shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 sticky top-0 z-10">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Zap className="w-6 h-6 text-primary" />
                    {latinToCyrillic("Yangi Sotuv")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Asosiy ma'lumotlar - 2 qator */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Mijoz tanlash */}
                      <div className="space-y-2">
                        <label className="block text-lg font-bold text-blue-600 flex items-center gap-2">
                          👤 Mijoz
                        </label>
                        <CustomerSelector
                          customers={customers}
                          selectedId={form.customerId}
                          searchValue={customerSearch}
                          onSearchChange={setCustomerSearch}
                          onSelect={(id, name) => {
                            setForm(prev => ({ ...prev, customerId: id, customerName: name }));
                          }}
                        />
                      </div>

                      {/* Mahsulotlar qo'shish - yonma-yon */}
                      <div className="space-y-4">
                        <label className="block text-lg font-bold text-green-600 flex items-center gap-2">
                          📦 Mahsulot
                        </label>
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full w-fit">
                          {form.items.length} mahsulot
                        </span>

                        {/* Narx belgilash tugmasi */}
                        {selectedCustomer && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPriceModal(true)}
                            className="text-purple-600 hover:bg-purple-50 border-purple-300"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Narx Belgilash
                          </Button>
                        )}

                        {/* Yangi mahsulot qo'shish - ixcham */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4 rounded-xl border-2 border-green-200">
                          <div className="space-y-3">
                            {/* Mahsulot tanlash */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Mahsulot nomi</label>
                              <div className="text-xs text-gray-500 mb-2">
                                📦 Mahsulotlar soni: {products.length} ta
                              </div>
                              <ProductSelector
                                products={products}
                                selectedId={newItem.productId}
                                searchValue={productSearch}
                                onSearchChange={setProductSearch}
                                onSelect={(id, name, price) => {
                                  console.log('🎯 onSelect called:', { id, name, price });
                                  try {
                                    const updatedItem = {
                                      ...newItem,
                                      productId: id, 
                                      productName: name, 
                                      pricePerBag: price.toString()
                                    };
                                    console.log('🔄 Setting newItem to:', updatedItem);
                                    setNewItem(updatedItem);
                                    console.log('✅ setNewItem completed');
                                  } catch (error) {
                                    console.error('❌ setNewItem error:', error);
                                  }
                                }}
                                customerPrice={customerPrices[newItem.productId] ? parseFloat(customerPrices[newItem.productId]) : undefined}
                                onPriceClick={(productId) => {
                                  setSelectedProductId(productId);
                                  setShowPriceModal(true);
                                }}
                              />
                            </div>

                            {/* Miqdor va Narx - bir qatorda */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Qop soni</label>
                                <input
                                  type="number"
                                  value={newItem.quantity}
                                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                                  placeholder="10"
                                  min="1"
                                  step="1"
                                  disabled={!newItem.productId}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base font-semibold focus:border-green-500 focus:outline-none disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Narx (USD)</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-sm">$</span>
                                  <input
                                    type="number"
                                    value={newItem.pricePerBag}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, pricePerBag: e.target.value }))}
                                    placeholder="25.00"
                                    min="0"
                                    step="0.01"
                                    disabled={!newItem.productId}
                                    className="w-full pl-7 pr-3 py-2 border-2 border-gray-300 rounded-lg text-base font-semibold focus:border-green-500 focus:outline-none disabled:bg-gray-100"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Jami miqdor va summa - alohida ko'rsatish */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Jami qop</label>
                                <div className="px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-base font-bold text-blue-800">
                                  {parseFloat(newItem.quantity) || 0} qop
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Jami summa (USD)</label>
                                <div className="px-3 py-2 bg-green-50 border-2 border-green-200 rounded-lg text-base font-bold text-green-800">
                                  ${((parseFloat(newItem.quantity) || 0) * (parseFloat(newItem.pricePerBag) || 0)).toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Qo'shish tugmasi */}
                            <Button
                              type="button"
                              onClick={addProduct}
                              className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 text-base font-bold"
                              disabled={!newItem.productId || !newItem.quantity}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Savatga qo'shish
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Qo'shilgan mahsulotlar ro'yxati */}
                    {form.items.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-xl text-blue-600 flex items-center gap-2">
                            🛒 Savatdagi mahsulotlar ({form.items.length})
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setForm(prev => ({ ...prev, items: [] }))}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Savatni tozalash
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {form.items.map((item, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-blue-600">{item.productName}</h4>
                                  <div className="flex gap-6 mt-2 text-sm">
                                    <span className="font-semibold">📦 {item.quantity} qop</span>
                                    <span className="font-semibold">💵 ${item.pricePerBag}/qop</span>
                                    <span className="font-bold text-green-600 text-base">= ${item.subtotal.toFixed(2)}</span>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeProduct(index)}
                                  className="text-red-600 hover:bg-red-50 px-3"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Jami summa - kattaroq va ko'zga tashlanadigan */}
                        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-xl shadow-lg mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold flex items-center gap-2">
                              <Calculator className="w-6 h-6" />
                              JAMI SUMMA:
                            </span>
                            <span className="text-3xl font-bold">${totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* To'lov ma'lumotlari - yaxshilangan */}
                    {form.items.length > 0 && (
                      <div className="space-y-4">
                        <label className="block text-lg font-bold text-purple-600 flex items-center gap-2">
                          💳 To'lov ma'lumotlari
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="bg-white border-2 border-green-400 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
                            <label className="block text-base font-bold text-green-700 mb-3 flex items-center gap-2">
                              💵 So'm
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 font-bold text-lg">UZS</span>
                              <input
                                type="number"
                                value={form.paidUZS}
                                onChange={(e) => setForm(prev => ({ ...prev, paidUZS: e.target.value }))}
                                placeholder="0"
                                min="0"
                                step="1000"
                                className="w-full pl-12 pr-3 py-3 border-2 border-green-300 rounded-lg text-lg font-bold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-medium">1$ = {exchangeRates.USD_TO_UZS} so'm</p>
                          </div>
                          
                          <div className="bg-white border-2 border-blue-400 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
                            <label className="block text-base font-bold text-blue-700 mb-3 flex items-center gap-2">
                              💵 Dollar
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 font-bold text-lg">$</span>
                              <input
                                type="number"
                                value={form.paidUSD}
                                onChange={(e) => setForm(prev => ({ ...prev, paidUSD: e.target.value }))}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className="w-full pl-8 pr-3 py-3 border-2 border-blue-300 rounded-lg text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-medium">AQSH dollari</p>
                          </div>
                          
                          <div className="bg-white border-2 border-purple-400 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
                            <label className="block text-base font-bold text-purple-700 mb-3 flex items-center gap-2">
                              💳 Kilik
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 font-bold text-lg">💳</span>
                              <input
                                type="number"
                                value={form.paidCLICK}
                                onChange={(e) => setForm(prev => ({ ...prev, paidCLICK: e.target.value }))}
                                placeholder="0"
                                min="0"
                                step="1000"
                                className="w-full pl-12 pr-3 py-3 border-2 border-purple-300 rounded-lg text-lg font-bold focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-medium">1$ = {exchangeRates.USD_TO_UZS} so'm</p>
                          </div>

                          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
                            <label className="block text-base font-bold text-yellow-700 mb-3 flex items-center gap-2">
                              💰 Jami (USD)
                            </label>
                            <div className="bg-white border-2 border-yellow-300 rounded-lg px-4 py-3">
                              <div className="text-2xl font-black text-yellow-800 text-center">
                                ${paidAmount.toFixed(2)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-medium text-center">⚡ Avtomatik hisoblash</p>
                          </div>
                        </div>

                        {/* To'lov xulosasi - chiroyroq ko'rinish */}
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-xl shadow-lg">
                          <div className="space-y-3">
                            <div className="flex justify-between text-lg">
                              <span>Jami summa:</span>
                              <span className="font-bold">${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg">
                              <span>To'langan summa:</span>
                              <span className="font-bold text-green-400">${paidAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-600 pt-3">
                              <div className="flex justify-between text-2xl font-bold">
                                <span>Qarz:</span>
                                <span className={debtAmount > 0 ? 'text-red-400' : 'text-green-400'}>
                                  ${debtAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tugmalar - kattaroq va aniqroq */}
                    {form.items.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowForm(false);
                            setForm({
                              customerId: '',
                              customerName: '',
                              items: [],
                              paidUZS: '',
                              paidUSD: '',
                              paidCLICK: '',
                            });
                          }}
                          className="text-lg py-4 border-2 border-red-300 text-red-600 hover:bg-red-50"
                          size="lg"
                        >
                          ❌ Bekor qilish
                        </Button>
                        <Button
                          type="submit"
                          className="text-lg py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg"
                          size="lg"
                        >
                          ✅ Sotuvni tasdiqlash
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Narx belgilash modal */}
      {showPriceModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-600">
                💰 {selectedCustomer.name} uchun narx
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPriceModal(false)}
              >
                ❌
              </Button>
            </div>

            {selectedProductId ? (
              // Faqat bitta mahsulot uchun
              (() => {
                const product = products.find(p => p.id === selectedProductId);
                if (!product) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600">Asosiy narx: ${product.pricePerBag}/qop</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">Yangi narx:</label>
                      <span className="text-sm font-medium">$</span>
                      <input
                        type="number"
                        value={customerPrices[product.id] || ''}
                        onChange={(e) => {
                          const newPrices = { ...customerPrices };
                          if (e.target.value) {
                            newPrices[product.id] = e.target.value;
                          } else {
                            delete newPrices[product.id];
                          }
                          setCustomerPrices(newPrices);
                        }}
                        placeholder={product.pricePerBag.toString()}
                        min="0"
                        step="0.01"
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <span className="text-sm text-gray-600">/qop</span>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPriceModal(false)}
                        className="flex-1"
                      >
                        Bekor qilish
                      </Button>
                      <Button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.put(`/customers/${selectedCustomer.id}`, {
                              productPrices: JSON.stringify(customerPrices)
                            });
                            setShowPriceModal(false);
                            setSelectedProductId('');
                            // Mijozlarni qayta yuklash
                            const customersRes = await api.get('/customers');
                            setCustomers(customersRes.data);
                          } catch (error) {
                            console.error('Error saving customer price:', error);
                          }
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        💾 Saqlash
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : (
              // Barcha mahsulotlar uchun
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">Asosiy narx: ${product.pricePerBag}/qop</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">$</span>
                      <input
                        type="number"
                        value={customerPrices[product.id] || ''}
                        onChange={(e) => {
                          const newPrices = { ...customerPrices };
                          if (e.target.value) {
                            newPrices[product.id] = e.target.value;
                          } else {
                            delete newPrices[product.id];
                          }
                          setCustomerPrices(newPrices);
                        }}
                        placeholder={product.pricePerBag.toString()}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">/qop</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!selectedProductId && (
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPriceModal(false)}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.put(`/customers/${selectedCustomer.id}`, {
                        productPrices: JSON.stringify(customerPrices)
                      });
                      setShowPriceModal(false);
                      // Mijozlarni qayta yuklash
                      const customersRes = await api.get('/customers');
                      setCustomers(customersRes.data);
                    } catch (error) {
                      console.error('Error saving customer prices:', error);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  💾 Saqlash
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
