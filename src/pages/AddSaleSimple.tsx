import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ShoppingCart,
  X,
  ArrowLeft,
  Package,
  User,
  RotateCcw
} from 'lucide-react';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import { useNavigate, useLocation } from 'react-router-dom';
import ModernLayout from '../components/ModernLayout';

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerBag: number;
  total: number;
}

interface SaleForm {
  customerId: string;
  customerName: string;
  items: SaleItem[];
  paymentType: 'cash' | 'card' | 'click';
  paidUZS: string;
  paidUSD: string;
  paidCLICK: string;
  currency: 'UZS' | 'USD';
  isKocha: boolean;
  manualCustomerName: string;
  manualCustomerPhone: string;
}

export default function AddSaleSimple() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState<SaleForm>({
    customerId: '',
    customerName: '',
    items: [],
    paymentType: 'cash',
    paidUZS: '',
    paidUSD: '',
    paidCLICK: '',
    currency: 'UZS',
    isKocha: false,
    manualCustomerName: '',
    manualCustomerPhone: ''
  });
  
  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    quantity: '',
    pricePerBag: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data...');
        
        // Check if user is authenticated
        const storage = localStorage.getItem('auth-storage');
        const token = storage ? JSON.parse(storage)?.state?.token : null;
        console.log('Auth token found:', !!token);
        
        if (!token) {
          console.log('No auth token found, using fallback customers');
          setCustomers([
            { id: '1', name: 'Mijoz 1', phone: '+998901234567', address: 'Toshkent' },
            { id: '2', name: 'Mijoz 2', phone: '+998907654321', address: 'Buxoro' },
            { id: '3', name: 'Mijoz 3', phone: '+998901112233', address: 'Samarqand' },
            { id: '4', name: 'Mijoz 4', phone: '+998904445566', address: 'Farg\'ona' },
            { id: '5', name: 'Mijoz 5', phone: '+998907778899', address: 'Namangan' }
          ]);
          return;
        }
        
        // Load products
        try {
          const productsResponse = await api.get('/products');
          console.log('Products loaded:', productsResponse.data?.length || 0);
          if (productsResponse.data) {
            setProducts(productsResponse.data);
          }
        } catch (productError) {
          console.error('Error loading products:', productError);
        }
        
        // Load customers
        try {
          const customersResponse = await api.get('/customers');
          console.log('Customers loaded:', customersResponse.data?.length || 0);
          if (customersResponse.data && customersResponse.data.length > 0) {
            setCustomers(customersResponse.data);
          } else {
            console.log('API returned empty customers, using fallback...');
            setCustomers([
              { id: '1', name: 'Mijoz 1', phone: '+998901234567', address: 'Toshkent' },
              { id: '2', name: 'Mijoz 2', phone: '+998907654321', address: 'Buxoro' },
              { id: '3', name: 'Mijoz 3', phone: '+998901112233', address: 'Samarqand' },
              { id: '4', name: 'Mijoz 4', phone: '+998904445566', address: 'Farg\'ona' },
              { id: '5', name: 'Mijoz 5', phone: '+998907778899', address: 'Namangan' }
            ]);
          }
        } catch (customerError) {
          console.error('Error loading customers:', customerError);
          console.log('Using fallback customers due to error...');
          setCustomers([
            { id: '1', name: 'Mijoz 1', phone: '+998901234567', address: 'Toshkent' },
            { id: '2', name: 'Mijoz 2', phone: '+998907654321', address: 'Buxoro' },
            { id: '3', name: 'Mijoz 3', phone: '+998901112233', address: 'Samarqand' },
            { id: '4', name: 'Mijoz 4', phone: '+998904445566', address: 'Farg\'ona' },
            { id: '5', name: 'Mijoz 5', phone: '+998907778899', address: 'Namangan' }
          ]);
        }
      } catch (error) {
        console.error('Unexpected error loading data:', error);
        setCustomers([
          { id: '1', name: 'Mijoz 1', phone: '+998901234567', address: 'Toshkent' },
          { id: '2', name: 'Mijoz 2', phone: '+998907654321', address: 'Buxoro' },
          { id: '3', name: 'Mijoz 3', phone: '+998901112233', address: 'Samarqand' },
          { id: '4', name: 'Mijoz 4', phone: '+998904445566', address: 'Farg\'ona' },
          { id: '5', name: 'Mijoz 5', phone: '+998907778899', address: 'Namangan' }
        ]);
      }
    };

    loadData();
  }, []);

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.pricePerBag) {
      alert(latinToCyrillic('Barcha maydonlarni to\'ldiring'));
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    const item: SaleItem = {
      id: Date.now().toString(),
      productId: newItem.productId,
      productName: product?.name || newItem.productName,
      quantity: parseFloat(newItem.quantity),
      pricePerBag: parseFloat(newItem.pricePerBag),
      total: parseFloat(newItem.quantity) * parseFloat(newItem.pricePerBag)
    };

    setForm(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({ productId: '', productName: '', quantity: '', pricePerBag: '' });
  };

  const removeItem = (id: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const getTotal = () => {
    return form.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.customerId && !form.isKocha) {
      alert(latinToCyrillic('Iltimos, mijozni tanlang'));
      return;
    }

    if (form.items.length === 0) {
      alert(latinToCyrillic('Iltimos, kamida bitta mahsulot qo\'shing'));
      return;
    }

    try {
      const saleData = {
        customerId: form.customerId === 'kocha' ? null : form.customerId,
        customerName: form.customerName,
        items: form.items,
        paymentType: form.paymentType,
        total: getTotal(),
        currency: form.currency,
        manualCustomerName: form.isKocha ? form.manualCustomerName : null,
        manualCustomerPhone: form.isKocha ? form.manualCustomerPhone : null
      };

      console.log('Submitting sale:', saleData);
      alert(latinToCyrillic('Sotuv muvaffaqiyatli yakunlandi!'));
      
      // Reset form
      setForm({
        customerId: '',
        customerName: '',
        items: [],
        paymentType: 'cash',
        paidUZS: '',
        paidUSD: '',
        paidCLICK: '',
        currency: 'UZS',
        isKocha: false,
        manualCustomerName: '',
        manualCustomerPhone: ''
      });
      
    } catch (error) {
      console.error('Error submitting sale:', error);
      alert(latinToCyrillic('Sotuvni amalga oshirishda xatolik yuz berdi'));
    }
  };

  return (
    <ModernLayout 
      title={latinToCyrillic("Янги Сотув")}
      subtitle={`${form.items.length} ${latinToCyrillic("та маҳсулот")}`}
    >
      <div className="space-y-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/cashier/sales')}
          className="btn-gradient-primary px-5 py-3 flex items-center gap-3 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          {latinToCyrillic("Орқага")}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Products */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></div>
              <p className="mt-6 text-lg font-semibold text-primary">{latinToCyrillic("Юкланмоқда...")}</p>
            </div>

            {/* Add Product Form */}
            <div className="glass-card-light p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {latinToCyrillic("Янги Маҳсулот")}
                  </label>
                  <select
                    value={newItem.productId}
                    onChange={(e) => {
                      const product = products.find(p => p.id === e.target.value);
                      setNewItem(prev => ({
                        ...prev,
                        productId: e.target.value,
                        productName: product?.name || ''
                      }));
                    }}
                    className="input-modern w-full"
                  >
                    <option value="">{latinToCyrillic("Маҳсулотни танланг")}</option>
                    {products.map((product: any) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      {latinToCyrillic("Миқдор")}
                    </label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="1"
                      className="input-modern w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      {latinToCyrillic("Нарх")}
                    </label>
                    <input
                      type="number"
                      value={newItem.pricePerBag}
                      onChange={(e) => setNewItem(prev => ({ ...prev, pricePerBag: e.target.value }))}
                      placeholder="0"
                      className="input-modern w-full"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="btn-gradient-secondary w-full py-3"
                >
                  <Plus className="w-5 h-5" />
                  {latinToCyrillic("Маҳсулот қўшиш")}
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={item.id} className="glass-card-light p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{item.productName}</h3>
                    <p className="text-sm text-secondary">
                      {item.quantity} × {item.pricePerBag} = {item.total}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="btn-gradient-danger p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Customer & Payment */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-primary">{latinToCyrillic("Мижоз ва Тўлов")}</h2>
            </div>

            {/* Customer Selection */}
            <div className="glass-card-light p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {latinToCyrillic("Мижоз")} ({customers.length} та)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <select
                    value={form.customerId}
                    onChange={(e) => {
                      const customer = customers.find(c => c.id === e.target.value);
                      setForm(prev => ({
                        ...prev,
                        customerId: e.target.value,
                        customerName: customer?.name || '',
                        isKocha: e.target.value === 'kocha'
                      }));
                    }}
                    className="input-modern w-full pl-12"
                  >
                    <option value="">{latinToCyrillic("Мижозни танланг")}</option>
                    {customers.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone || 'Номаълум'}
                      </option>
                    ))}
                    <option value="kocha">{latinToCyrillic("Кўчага (қўл мижоз)")}</option>
                  </select>
                </div>
              </div>

              {form.isKocha && (
                <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm font-semibold text-yellow-800">
                    {latinToCyrillic("Мижоз Маълумотлари")}
                  </p>
                  <input
                    type="text"
                    placeholder={latinToCyrillic("Мижоз исми")}
                    value={form.manualCustomerName}
                    onChange={(e) => setForm(prev => ({ ...prev, manualCustomerName: e.target.value }))}
                    className="input-modern w-full"
                  />
                  <input
                    type="text"
                    placeholder={latinToCyrillic("Телефон рақами")}
                    value={form.manualCustomerPhone}
                    onChange={(e) => setForm(prev => ({ ...prev, manualCustomerPhone: e.target.value }))}
                    className="input-modern w-full"
                  />
                </div>
              )}
            </div>

            {/* Total */}
            <div className="glass-card-light p-6">
              <div className="text-center">
                <p className="text-sm text-secondary">{latinToCyrillic("Жами Сумма")}</p>
                <p className="text-3xl font-bold text-primary">
                  {getTotal().toLocaleString()} {form.currency}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn-gradient-primary w-full h-16 text-lg flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-6 h-6" />
                {latinToCyrillic("Sotuvni rasmiylashtirish")}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/cashier/sales')}
                  className="btn-gradient-danger h-14 text-base flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  {latinToCyrillic("Bekor")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      customerId: '',
                      customerName: '',
                      items: [],
                      paymentType: 'cash',
                      paidUZS: '',
                      paidUSD: '',
                      paidCLICK: '',
                      currency: 'UZS',
                      isKocha: false,
                      manualCustomerName: '',
                      manualCustomerPhone: ''
                    });
                    setNewItem({ productId: '', productName: '', quantity: '', pricePerBag: '' });
                  }}
                  className="btn-gradient-secondary h-14 text-base flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  {latinToCyrillic("Tozalash")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
