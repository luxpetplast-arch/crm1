import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../lib/api';
import { formatDate } from '../lib/utils';
import { getExchangeRates } from '../lib/settings';
import SalesHistory from '../components/SalesHistory';
import CustomerSelector from '../components/CustomerSelector';
import ProductSelector from '../components/ProductSelector';
import { 
  ShoppingCart, 
  Plus, 
  DollarSign, 
  Zap,
  Trash2,
  Package,
  Calculator
} from 'lucide-react';

export default function SalesMulti() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [activeTab, setActiveTab] = useState<'sales' | 'history'>('sales');
  
  // Qidiruv
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    // Multi-product items
    items: [] as Array<{
      productId: string;
      productName: string;
      quantity: string;
      pricePerBag: string;
      subtotal: number;
    }>,
    // To'lov - 3 xil valyuta
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

  useEffect(() => {
    loadData();
    
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N = Yangi sotuv
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowForm(true);
      }
      
      // Esc = Bekor qilish
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showForm]);

  const loadData = async () => {
    try {
      const [salesRes, productsRes, customersRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
        api.get('/customers')
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
      
      // Kurslarni yuklash
      const rates = await getExchangeRates();
      setExchangeRates(rates);
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik');
    }
  };

  // Jami summani hisoblash (USD da)
  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Mahsulot qo'shish
  const addProduct = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.pricePerBag) {
      alert('Barcha maydonlarni to\'ldiring');
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    const price = parseFloat(newItem.pricePerBag);
    const subtotal = quantity * price;

    const item = {
      productId: newItem.productId,
      productName: newItem.productName,
      quantity: newItem.quantity,
      pricePerBag: newItem.pricePerBag,
      subtotal: subtotal
    };

    setForm(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    // Reset new item form
    setNewItem({
      productId: '',
      productName: '',
      quantity: '',
      pricePerBag: '',
    });
    setProductSearch('');
  };

  // Mahsulotni o'chirish
  const removeProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // To'langan summani hisoblash (barcha valyutalarni USD ga o'tkazish)
  const calculatePaidInUSD = () => {
    const uzs = parseFloat(form.paidUZS) || 0;
    const usd = parseFloat(form.paidUSD) || 0;
    const click = parseFloat(form.paidCLICK) || 0;
    
    const uzsInUSD = uzs / exchangeRates.USD_TO_UZS;
    const clickInUSD = click / exchangeRates.USD_TO_UZS; // CLICK ham UZS kabi
    
    return uzsInUSD + usd + clickInUSD;
  };

  // Qarzni hisoblash
  const calculateDebt = () => {
    const total = calculateTotal();
    const paid = calculatePaidInUSD();
    return Math.max(0, total - paid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.customerId) {
      alert('Mijozni tanlang');
      return;
    }

    if (form.items.length === 0) {
      alert('Kamida bitta mahsulot qo\'shing');
      return;
    }

    const totalAmount = calculateTotal();
    const paidInUSD = calculatePaidInUSD();

    try {
      const saleData = {
        customerId: form.customerId,
        items: form.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          pricePerBag: parseFloat(item.pricePerBag)
        })),
        totalAmount: totalAmount,
        paidAmount: paidInUSD,
        currency: 'USD',
        paymentStatus: paidInUSD >= totalAmount ? 'PAID' : paidInUSD > 0 ? 'PARTIAL' : 'UNPAID',
        paymentDetails: {
          uzs: parseFloat(form.paidUZS) || 0,
          usd: parseFloat(form.paidUSD) || 0,
          click: parseFloat(form.paidCLICK) || 0
        }
      };

      await api.post('/sales', saleData);
      
      // Reset form
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
      setCustomerSearch('');
      setProductSearch('');
      setShowForm(false);
      
      await loadData();
      alert('✅ Multi-Product sotuv muvaffaqiyatli yaratildi!');
    } catch (error: any) {
      console.error('Sotuv yaratishda xatolik:', error);
      alert(error.response?.data?.error || 'Sotuv yaratishda xatolik');
    }
  };

  const totalAmount = calculateTotal();
  const paidAmount = calculatePaidInUSD();
  const debtAmount = calculateDebt();

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Multi-Product Sotuvlar
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'sales'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🛒 Multi-Sotuvlar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📜 Tarix
          </button>
        </div>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && <SalesHistory />}

      {/* Sales Tab */}
      {activeTab === 'sales' && showForm && (
        <div className="max-h-[85vh] overflow-y-auto">
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 sticky top-0 z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="w-6 h-6 text-primary" />
              Yangi Multi-Product Sotuv
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mijoz Selector */}
              <CustomerSelector
                customers={customers}
                selectedId={form.customerId}
                searchValue={customerSearch}
                onSearchChange={setCustomerSearch}
                onSelect={(id, name) => {
                  setForm(prev => ({ ...prev, customerId: id, customerName: name }));
                }}
              />

              {/* Mahsulot Qo'shish */}
              <div className="space-y-4">
                <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-green-600">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  2. Mahsulotlar Qo'shish
                </label>

                {/* Yangi Mahsulot Qo'shish */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <ProductSelector
                    products={products}
                    selectedId={newItem.productId}
                    searchValue={productSearch}
                    onSearchChange={setProductSearch}
                    onSelect={(id, name, price) => {
                      setNewItem(prev => ({ 
                        ...prev, 
                        productId: id, 
                        productName: name, 
                        pricePerBag: price.toString() 
                      }));
                    }}
                  />

                  {newItem.productId && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Miqdor (qop)"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="5"
                        min="1"
                        step="1"
                      />
                      <Input
                        label="Narx ($/qop)"
                        type="number"
                        value={newItem.pricePerBag}
                        onChange={(e) => setNewItem(prev => ({ ...prev, pricePerBag: e.target.value }))}
                        placeholder="25.00"
                        min="0"
                        step="0.01"
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={addProduct}
                          className="w-full"
                          size="lg"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Qo'shish
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Qo'shilgan Mahsulotlar Ro'yxati */}
                {form.items.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Qo'shilgan Mahsulotlar ({form.items.length})
                    </h3>
                    
                    <div className="space-y-2">
                      {form.items.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.productName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} qop × ${item.pricePerBag} = ${item.subtotal.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Jami Summa */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Jami Summa:</span>
                        <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* To'lov Ma'lumotlari */}
              {form.items.length > 0 && (
                <div className="space-y-4">
                  <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-purple-600">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    3. To'lov Ma'lumotlari
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="UZS (so'm)"
                      type="number"
                      value={form.paidUZS}
                      onChange={(e) => setForm(prev => ({ ...prev, paidUZS: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                    <Input
                      label="USD (dollar)"
                      type="number"
                      value={form.paidUSD}
                      onChange={(e) => setForm(prev => ({ ...prev, paidUSD: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                    <Input
                      label="CLICK (so'm)"
                      type="number"
                      value={form.paidCLICK}
                      onChange={(e) => setForm(prev => ({ ...prev, paidCLICK: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                  </div>

                  {/* To'lov Xulosasi */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Jami summa:</span>
                      <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To'langan:</span>
                      <span className="font-semibold text-green-600">${paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Qarz:</span>
                      <span className={`font-semibold ${debtAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${debtAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {form.items.length > 0 && (
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 text-lg py-3"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Sotuvni Yaratish
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Sales List */}
      {activeTab === 'sales' && !showForm && (
        <div className="grid gap-4">
          {sales.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">Hozircha sotuvlar yo'q</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Birinchi sotuvni yaratish uchun "Yangi Sotuv" tugmasini bosing
                </p>
              </CardContent>
            </Card>
          ) : (
            sales.map((sale) => (
              <Card key={sale.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{sale.customer?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sale.product?.name || `${sale.items?.length || 0} mahsulot`} • {sale.quantity} qop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">${sale.totalAmount}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.paymentStatus === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : sale.paymentStatus === 'PARTIAL'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sale.paymentStatus === 'PAID' ? 'To\'langan' : 
                         sale.paymentStatus === 'PARTIAL' ? 'Qisman' : 'To\'lanmagan'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}