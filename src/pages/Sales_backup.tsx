import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
  Plus, 
  Trash2, 
  Calculator,
  Zap,
  DollarSign,
  Printer,
  Search,
  ShoppingCart,
  ArrowLeft,
  X,
  RotateCcw
} from 'lucide-react';
import CustomerSelector from '../components/CustomerSelector';
import ProductSelector from '../components/ProductSelector';
import api from '../lib/api';
import { latinToCyrillic } from '../lib/transliterator';
import SalesHistory from '../components/SalesHistory';
import { formatDateTime } from '../lib/dateUtils';
import { printReceipt, prepareSaleReceipt } from '../lib/receiptPrinter';
import { generateSimpleReceiptHTML, generateDeliveryReceiptHTML } from '../lib/simpleReceiptPrinter';
import { FileText, Settings } from 'lucide-react';

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
    paymentType: string;
  }>({
    customerId: '',
    customerName: '',
    items: [],
    paidUZS: '',
    paidUSD: '',
    paidCLICK: '',
    paymentType: 'cash'
  });

  // Yangi mahsulot qo'shish uchun
  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    quantity: '',
    pricePerBag: ''
  });

  // Narx belgilash modal uchun
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [customerPrices, setCustomerPrices] = useState<{[key: string]: string}>({});
  const [selectedProductId, setSelectedProductId] = useState('');

  // Tanlangan mijozni olish
  const selectedCustomer = customers.find(c => c.id === form.customerId);

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

  // Ma'lumotlarni yuklash
  const loadData = async () => {
    try {
      console.log('🔄 Loading data...');
      
      // Parallel yuklash
      const [productsRes, customersRes, salesRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/sales')
      ]);
      
      console.log('📊 Data loaded:', {
        products: productsRes.data.length,
        customers: customersRes.data.length,
        sales: salesRes.data.length
      });
      
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
      setSales(salesRes.data);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 Sales useEffect - calling loadData...');
    loadData();
  }, []);

  // Mahsulot qo'shish
  const addProduct = () => {
    if (!newItem.productId || !newItem.quantity) {
      alert('Iltimos, mahsulot va miqdorni to\'ldiring!');
      return;
    }
    
    const subtotal = parseFloat(newItem.quantity) * parseFloat(newItem.pricePerBag);
    
    setForm(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: newItem.productId,
        productName: newItem.productName,
        quantity: parseFloat(newItem.quantity),
        pricePerBag: parseFloat(newItem.pricePerBag),
        subtotal
      }]
    }));
    
    setNewItem({
      productId: '',
      productName: '',
      quantity: '',
      pricePerBag: ''
    });
    
    setProductSearch('');
  };

  // Mahsulot o'chirish
  const removeProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Birlashtirish funksiyasi
  const mergeItemsByType = (mergeType: 'sum' | 'dollar' | 'pieces' | 'bags') => {
    if (form.items.length === 0) return;
    
    let mergedItems: any[] = [];
    
    switch (mergeType) {
      case 'sum':
        // Xuddi shu narxlarda birlashtirish
        const priceGroups = form.items.reduce((groups: any, item: any) => {
          const key = item.pricePerBag;
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
          return groups;
        }, {});
        
        mergedItems = Object.values(priceGroups).map((group: any) => {
          const totalQuantity = group.reduce((sum: number, item: any) => sum + item.quantity, 0);
          const firstItem = group[0];
          return {
            ...firstItem,
            quantity: totalQuantity,
            subtotal: totalQuantity * firstItem.pricePerBag
          };
        });
        break;
        
      case 'dollar':
        // O'rtacha $ narxda birlashtirish
        const totalQuantity = form.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const totalSubtotal = form.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
        const avgPrice = totalSubtotal / totalQuantity;
        
        mergedItems = [{
          ...form.items[0],
          productName: 'Birlashtirilgan mahsulotlar',
          quantity: totalQuantity,
          pricePerBag: avgPrice,
          subtotal: totalSubtotal
        }];
        break;
        
      case 'pieces':
        // Dona bo'yicha birlashtirish
        const totalPieces = form.items.reduce((sum: number, item: any) => sum + (item.quantity * 2000), 0);
        mergedItems = [{
          ...form.items[0],
          productName: 'Birlashtirilgan mahsulotlar',
          quantity: totalPieces / 2000,
          pricePerBag: form.items[0].pricePerBag,
          subtotal: totalPieces / 2000 * form.items[0].pricePerBag
        }];
        break;
        
      case 'bags':
        // Qop bo'yicha birlashtirish
        const totalBags = form.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        mergedItems = [{
          ...form.items[0],
          productName: 'Birlashtirilgan mahsulotlar',
          quantity: totalBags,
          pricePerBag: form.items[0].pricePerBag,
          subtotal: totalBags * form.items[0].pricePerBag
        }];
        break;
    }
    
    setForm(prev => ({
      ...prev,
      items: mergedItems
    }));
  };

  // Formni yuborish
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.customerId || form.items.length === 0) {
      alert('Iltimos, mijozni tanlang va kamida bitta mahsulot qo\'shing!');
      return;
    }
    
    try {
      const totalAmount = form.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
      const paidAmount = parseFloat(form.paidUZS || '0') + parseFloat(form.paidUSD || '0') * exchangeRates.USD_TO_UZS;
      
      const saleData = {
        customerId: form.customerId,
        items: form.items,
        totalAmount,
        paidAmount,
        paymentType: 'cash',
        exchangeRates
      };
      
      const response = await api.post('/sales', saleData);
      console.log('✅ Sale created:', response.data);
      
      // Chek chiqarish
      const user = { name: 'Kassir' };
      printSimpleReceipt(response.data, selectedCustomer, user);
      
      // Formni tozalash
      setForm({
        customerId: '',
        customerName: '',
        items: [],
        paidUZS: '',
        paidUSD: '',
        paidCLICK: '',
        paymentType: 'cash'
      });
      setShowForm(false);
      
      // Ma'lumotlarni qayta yuklash
      loadData();
      
    } catch (error) {
      console.error('❌ Error creating sale:', error);
      alert('Sotuvni yaratishda xatolik yuz berdi!');
    }
  };

  // Oddiy chek chiqarish
  const printSimpleReceipt = (sale: any, customer: any, user: any) => {
    try {
      const receiptData = prepareSaleReceipt(sale, customer, user);
      printReceipt(receiptData);
      console.log('🧾 Chek muvaffaqiyatli chop etildi!');
    } catch (error) {
      console.error('❌ Chek chop etishda xatolik:', error);
      alert('Chek chop etishda xatolik yuz berdi!');
    }
  };

  // Jami summani hisoblash
  const totalAmount = form.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  const paidAmount = parseFloat(form.paidUZS || '0') + parseFloat(form.paidUSD || '0') * exchangeRates.USD_TO_UZS;
  const debtAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {!showForm ? (
          <div>
            <div className="mb-6">
              <Button 
                onClick={() => setShowForm(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                {latinToCyrillic("Yangi Sotuv")}
              </Button>
            </div>
            
            <SalesHistory />
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
                  {/* 3 ustunli layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1-USTUN: Mahsulotlar */}
                    <div className="space-y-4">
                      <label className="block text-lg font-bold text-green-600 flex items-center gap-2">
                        📦 Mahsulotlar
                      </label>
                      
                      {/* Mahsulot qo'shish formasi */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 shadow-lg">
                        <div className="space-y-3">
                          {/* Mahsulot tanlash */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mahsulot</label>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="Mahsulot nomini kiriting..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full pr-10"
                              />
                              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                            
                            {productSearch && (
                              <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                                {(() => {
                                  const filteredProducts = products.filter(product => 
                                    product.name.toLowerCase().includes(productSearch.toLowerCase())
                                  );
                                  return filteredProducts.length === 0 ? (
                                    <div className="p-3 text-gray-500 text-sm">Mahsulot topilmadi</div>
                                  ) : (
                                    filteredProducts.map((product) => (
                                      <div
                                        key={product.id}
                                        onClick={() => {
                                          setNewItem({
                                            productId: product.id,
                                            productName: product.name,
                                            quantity: '1',
                                            pricePerBag: product.pricePerBag || '0'
                                          });
                                          setProductSearch('');
                                        }}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 last:border-b-0"
                                      >
                                        <div className="font-semibold">{product.name}</div>
                                        <div className="text-sm text-gray-500">Asosiy narx: ${product.pricePerBag || 0}/qop</div>
                                      </div>
                                    ))
                                  );
                                })()
                                }
                              </div>
                            )}
                          </div>

                          {/* Miqdor va narx */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Miqdor (qop)</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                                className="w-full"
                                min="0"
                                step="1"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Narx ($/qop)</label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={newItem.pricePerBag}
                                onChange={(e) => setNewItem(prev => ({ ...prev, pricePerBag: e.target.value }))}
                                className="w-full"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>

                          {/* Qo'shish tugmasi */}
                          <Button
                            type="button"
                            onClick={addProduct}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg border-0"
                            disabled={!newItem.productId || !newItem.quantity}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Plus className="w-5 h-5" />
                              Mahsulot qo'shish
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 2-USTUN: Savat */}
                    <div className="space-y-4">
                      <label className="block text-lg font-bold text-blue-600 flex items-center gap-2">
                        🛒 Savat
                      </label>
                      
                      {form.items.length > 0 && (
                        <div className="space-y-3">
                          {/* Umumiy ma'lumotlar */}
                          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-3 rounded-lg border-2 border-blue-200">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <div className="text-xs font-semibold text-gray-600">Jami</div>
                                <div className="text-sm font-bold text-blue-800">
                                  {form.items.reduce((sum, item) => sum + (item.quantity * 2000), 0).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-600">Narx/qop</div>
                                <div className="text-sm font-bold text-green-800">
                                  ${form.items.length > 0 ? (form.items.reduce((sum, item) => sum + item.subtotal, 0) / form.items.reduce((sum, item) => sum + item.quantity, 0)).toFixed(2) : '0.00'}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-600">Jami (USD)</div>
                                <div className="text-sm font-bold text-purple-800">
                                  ${totalAmount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Birlashtirish tugmalari */}
                            <div className="flex gap-1 mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => mergeItemsByType('sum')}
                                className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:border-blue-400 text-xs"
                                title="Xuddi shu narxlarda birlashtirish"
                              >
                                📊 Sum
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => mergeItemsByType('dollar')}
                                className="text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200 hover:border-green-400 text-xs"
                                title="O'rtacha $ narxda birlashtirish"
                              >
                                💵 $
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => mergeItemsByType('pieces')}
                                className="text-purple-600 hover:bg-purple-50 px-2 py-1 rounded border border-purple-200 hover:border-purple-400 text-xs"
                                title="Dona bo'yicha birlashtirish"
                              >
                                🔢 Dona
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => mergeItemsByType('bags')}
                                className="text-orange-600 hover:bg-orange-50 px-2 py-1 rounded border border-orange-200 hover:border-orange-400 text-xs"
                                title="Qop bo'yicha birlashtirish"
                              >
                                📦 Qop
                              </Button>
                            </div>
                          </div>

                          {/* Mahsulotlar ro'yxati */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {form.items.map((item, index) => (
                              <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border-2 border-gray-200">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold text-sm">{item.productName}</div>
                                    <div className="text-xs text-gray-500">
                                      {item.quantity} qop × ${item.pricePerBag} = ${item.subtotal.toFixed(2)}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeProduct(index)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3-USTUN: Mijoz va To'lov */}
                    <div className="space-y-4">
                      <label className="block text-lg font-bold text-purple-600 flex items-center gap-2">
                        👤 Mijoz & 💳 To'lov
                      </label>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 shadow-lg space-y-4">
                        <CustomerSelector
                          customers={customers}
                          selectedId={form.customerId}
                          searchValue={customerSearch}
                          onSearchChange={setCustomerSearch}
                          onSelect={(customerId, customerName) => {
                            setForm(prev => ({ ...prev, customerId, customerName }));
                          }}
                        />
                        
                        {/* To'lov ma'lumotlari */}
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="paymentType" className="block text-sm font-semibold text-gray-700 mb-2">To'lov turi</label>
                            <select
                              id="paymentType"
                              value={form.paymentType || 'cash'}
                              onChange={(e) => setForm(prev => ({ ...prev, paymentType: e.target.value }))}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            >
                              <option value="cash">Naqt</option>
                              <option value="debt">Qarz</option>
                              <option value="partial">Qisman</option>
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">UZS</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={form.paidUZS}
                                onChange={(e) => setForm(prev => ({ ...prev, paidUZS: e.target.value }))}
                                className="w-full"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">USD</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={form.paidUSD}
                                onChange={(e) => setForm(prev => ({ ...prev, paidUSD: e.target.value }))}
                                className="w-full"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Qarz hisobi */}
                        {form.items.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Jami summa:</span>
                                <span className="font-bold">${totalAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>To'langan:</span>
                                <span className="font-bold">${(paidAmount / exchangeRates.USD_TO_UZS).toFixed(2)}</span>
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between font-bold">
                                  <span>Qarz:</span>
                                  <span className={debtAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                                    ${(debtAmount / exchangeRates.USD_TO_UZS).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tugmalar */}
                        {form.items.length > 0 && (
                          <div className="space-y-3">
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-500 font-bold text-lg border-0"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                Sotuvni rasmiylashtirish
                              </div>
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForm(false)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Bekor qilish
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setForm({
                                    customerId: '',
                                    customerName: '',
                                    items: [],
                                    paidUZS: '',
                                    paidUSD: '',
                                    paidCLICK: '',
                                    paymentType: 'cash'
                                  });
                                }}
                                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                              >
                                Tozalash
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
