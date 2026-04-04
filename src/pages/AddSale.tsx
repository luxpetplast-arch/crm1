import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
  Plus, 
  Trash2, 
  Calculator,
  DollarSign,
  ShoppingCart,
  X,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Factory,
  Package,
  User,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import CustomerSelector from '../components/CustomerSelector';
import api from '../lib/api';
import { latinToCyrillic } from '../lib/transliterator';
import { generateSimpleReceiptHTML, generateDeliveryReceiptHTML } from '../lib/simpleReceiptPrinter';
import { formatDateTime } from '../lib/dateUtils';
import { useNavigate } from 'react-router-dom';

export default function AddSale() {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState('12500');
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [customerSearch, setCustomerSearch] = useState('');
  const [expandedProductGroups, setExpandedProductGroups] = useState<string[]>([]);
  const [activeProductCategory, setActiveProductCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  
  const [form, setForm] = useState<{
    customerId: string;
    customerName: string;
    items: any[];
    paidUZS: string;
    paidUSD: string;
    paidCLICK: string;
    paymentType: string;
    currency: string;
  }>({
    customerId: '',
    customerName: '',
    items: [],
    paidUZS: '',
    paidUSD: '',
    paidCLICK: '',
    paymentType: 'cash',
    currency: 'USD',
  });

  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    quantity: '',
    pricePerBag: '',
  });

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [customerPrices, setCustomerPrices] = useState<Record<string, string>>({});

  const selectedCustomer = customers.find(c => c.id === form.customerId);

  useEffect(() => {
    if (selectedCustomer?.productPrices) {
      try {
        const prices = JSON.parse(selectedCustomer.productPrices);
        setCustomerPrices(prices);
      } catch (error) {
        setCustomerPrices({});
      }
    } else {
      setCustomerPrices({});
    }
  }, [selectedCustomer?.productPrices]);

  useEffect(() => {
    if (selectedCustomer && newItem.productId) {
      const productPrice = customerPrices[newItem.productId];
      if (productPrice) {
        setNewItem(prev => ({ ...prev, pricePerBag: productPrice }));
      } else if (selectedCustomer.pricePerBag) {
        setNewItem(prev => ({ ...prev, pricePerBag: selectedCustomer.pricePerBag.toString() }));
      }
    }
  }, [form.customerId, selectedCustomer, newItem.productId, customerPrices]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, customersRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers')
      ]);
      
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
      setExchangeRates({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const groupProductsByType = (products: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    products.forEach(product => {
      const groupName = product.bagType || product.warehouse || 'Boshqa';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(product);
    });
    
    return groups;
  };

  const toggleProductGroup = (groupName: string) => {
    setExpandedProductGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const addProduct = () => {
    if (!newItem.productId || !newItem.quantity) {
      alert(latinToCyrillic('Iltimos, mahsulot va miqdorni to\'ldiring!'));
      return;
    }
    
    const selectedProduct = products.find(p => p.id === newItem.productId);
    if (!selectedProduct) {
      alert(latinToCyrillic('Mahsulot topilmadi!'));
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    const pricePerBag = parseFloat(newItem.pricePerBag) || 0;
    const subtotal = quantity * pricePerBag;
    const unitsPerBag = selectedProduct.unitsPerBag || 2000;
    
    const newItems: any[] = [{
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: quantity,
      pricePerBag: pricePerBag,
      subtotal: subtotal,
      saleType: 'bag',
      unitsPerBag: unitsPerBag,
      warehouse: selectedProduct.warehouse,
      subType: selectedProduct.subType
    }];
    
    const isPreform = selectedProduct.warehouse === 'preform' || selectedProduct.name.toLowerCase().includes('g');
    
    if (isPreform) {
      const accessorySize = selectedProduct.subType || '';
      const totalUnits = quantity * unitsPerBag;
      
      let krishkaSize = accessorySize;
      let ruchkaSize = accessorySize;

      if (!accessorySize) {
        const nameMatch = selectedProduct.name.match(/(\d+)/);
        const weight = nameMatch ? parseInt(nameMatch[1]) : 0;
        
        if ([15, 21, 26, 30].includes(weight)) {
          krishkaSize = '28';
          ruchkaSize = '28';
        } else if ([52, 70].includes(weight)) {
          krishkaSize = '38';
          ruchkaSize = '38';
        } else if ([75, 80, 85, 86, 175].includes(weight)) {
          krishkaSize = '48';
          ruchkaSize = '48';
        }
      }

      if (krishkaSize) {
        const krishka = products.find(p => 
          (p.warehouse === 'krishka' || p.name.toLowerCase().includes('krishka')) && 
          p.name.includes(krishkaSize) && 
          p.active !== false
        );
        
        if (krishka) {
          const upb = Number(krishka.unitsPerBag) || 1000;
          const kPrice = Number(krishka.pricePerBag) || 65;
          const kPricePerPiece = upb > 0 ? kPrice / upb : 0;
          
          newItems.push({
            productId: krishka.id,
            productName: krishka.name,
            quantity: totalUnits,
            pricePerBag: kPrice,
            subtotal: totalUnits * kPricePerPiece,
            saleType: 'piece',
            unitsPerBag: upb,
            warehouse: 'krishka'
          });
        }
        
        const ruchka = products.find(p => 
          (p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka')) && 
          p.name.includes(ruchkaSize) && 
          p.active !== false
        );
        
        if (ruchka) {
          const upb = Number(ruchka.unitsPerBag) || 1000;
          const rPrice = Number(ruchka.pricePerBag) || 76;
          const rPricePerPiece = upb > 0 ? rPrice / upb : 0;
          
          newItems.push({
            productId: ruchka.id,
            productName: ruchka.name,
            quantity: totalUnits,
            pricePerBag: rPrice,
            subtotal: totalUnits * rPricePerPiece,
            saleType: 'piece',
            unitsPerBag: upb,
            warehouse: 'ruchka'
          });
        }
      }
    }
    
    setForm(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
    
    setNewItem({
      productId: '',
      productName: '',
      quantity: '',
      pricePerBag: '',
    });
  };

  const removeProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, updates: any) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, idx) => 
        idx === index ? { ...item, ...updates } : item
      )
    }));
  };

  const totalAmount = form.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Convert amount based on selected currency
  const getDisplayAmount = (amountUSD: number) => {
    if (form.currency === 'UZS') {
      return (amountUSD * exchangeRates.USD_TO_UZS).toFixed(0);
    }
    return amountUSD.toFixed(2);
  };
  
  const getCurrencySymbol = () => form.currency === 'UZS' ? 'UZS' : '$';
  
  const calculatePaidInSelectedCurrency = () => {
    const paidUZS = parseFloat(form.paidUZS) || 0;
    const paidUSD = parseFloat(form.paidUSD) || 0;
    const paidCLICK = parseFloat(form.paidCLICK) || 0;
    
    // Convert everything to USD first
    const totalPaidUSD = (paidUZS / exchangeRates.USD_TO_UZS) + paidUSD + (paidCLICK / exchangeRates.USD_TO_UZS);
    
    // Return in selected currency
    if (form.currency === 'UZS') {
      return totalPaidUSD * exchangeRates.USD_TO_UZS;
    }
    return totalPaidUSD;
  };
  
  const paidAmount = calculatePaidInSelectedCurrency();
  const debtAmount = (form.currency === 'UZS' ? totalAmount * exchangeRates.USD_TO_UZS : totalAmount) - paidAmount;

  const printSimpleReceipt = (sale: any, customer: any, user: any) => {
    try {
      // Ensure valid date
      let dateStr = '';
      let timeStr = '';
      try {
        const dateTime = formatDateTime(sale?.createdAt || new Date());
        const parts = dateTime.split(' ');
        dateStr = parts[0] || '';
        timeStr = parts[1] || '';
      } catch (e) {
        const now = new Date();
        dateStr = now.toLocaleDateString('uz-UZ');
        timeStr = now.toLocaleTimeString('uz-UZ');
      }

      // Ensure items have correct structure
      const receiptItems = (sale?.items || []).map((item: any) => {
        // Try multiple possible field names for product name
        // Server returns: item.product?.name (from Prisma relation)
        const productName = item?.product?.name || item?.productName || item?.name || 'Noma\'lum';
        console.log('📝 Item:', item, '-> Product name:', productName);
        
        return {
          name: productName,
          quantity: item?.quantity || 0,
          unit: item?.saleType === 'piece' ? 'dona' : 'qop',
          piecesPerBag: item?.product?.unitsPerBag || item?.unitsPerBag || item?.piecesPerBag || 2000,
          pricePerUnit: item?.pricePerBag || item?.pricePerUnit || 0,
          subtotal: item?.subtotal || 0
        };
      });

      const receiptData = {
        saleId: sale?.id || 'N/A',
        receiptNumber: sale?.receiptNumber || sale?.id?.slice(0, 8) || 'N/A',
        date: dateStr,
        time: timeStr,
        cashier: user?.name || 'Kassir',
        currency: sale?.currency || 'UZS', // Valyuta
        customer: {
          name: customer?.name || 'Noma\'lum',
          phone: customer?.phone || '',
          address: customer?.address || '',
          previousBalanceUZS: customer?.debtUZS || 0,
          previousBalanceUSD: customer?.debtUSD || 0,
          newBalanceUZS: (customer?.debtUZS || 0) + (sale?.debtAmount ? sale.debtAmount * exchangeRates.USD_TO_UZS : 0),
          newBalanceUSD: (customer?.debtUSD || 0) + (sale?.debtAmount || 0)
        },
        items: receiptItems,
        subtotal: sale?.totalAmount || 0,
        total: sale?.totalAmount || 0,
        totalPaid: sale?.paidAmount || 0,
        debt: sale?.debtAmount || 0,
        payments: {
          uzs: parseFloat(sale?.paymentDetails?.uzs) || 0,
          usd: parseFloat(sale?.paymentDetails?.usd) || 0,
          click: parseFloat(sale?.paymentDetails?.click) || 0
        },
        companyInfo: {
          name: 'LUX PET PLAST',
          address: 'Buxoro viloyati, Vobkent tumani',
          phone: '+998 91 414 44 58, +998 91 920 07 00'
        }
      };

      const receiptHTML = generateSimpleReceiptHTML(receiptData);
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Chek chiqarishda xatolik yuz berdi!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.customerId || form.items.length === 0) {
      alert('Iltimos, mijoz va mahsulotlarni to\'ldiring!');
      return;
    }
    
    try {
      // Calculate USD values for API (internal storage is always USD)
      const paidUZS = parseFloat(form.paidUZS) || 0;
      const paidUSD = parseFloat(form.paidUSD) || 0;
      const paidCLICK = parseFloat(form.paidCLICK) || 0;
      const totalPaidUSD = (paidUZS / exchangeRates.USD_TO_UZS) + paidUSD + (paidCLICK / exchangeRates.USD_TO_UZS);
      const debtUSD = totalAmount - totalPaidUSD;
      
      const saleData = {
        customerId: form.customerId,
        items: form.items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity) || 0,
          pricePerBag: parseFloat(item.pricePerBag) || 0,
          subtotal: parseFloat(item.subtotal) || 0
        })),
        totalAmount: totalAmount,
        paidAmount: totalPaidUSD,
        debtAmount: debtUSD > 0 ? debtUSD : 0,
        paymentDetails: {
          uzs: form.paidUZS,
          usd: form.paidUSD,
          click: form.paidCLICK
        },
        currency: form.currency
      };
      
      console.log('📦 Sending saleData:', JSON.stringify(saleData, null, 2));
      
      const response = await api.post('/sales', saleData);
      const createdSale = response.data;
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
      
      printSimpleReceipt(createdSale, selectedCustomer, user);
      
      navigate('/cashier/sales');
    } catch (error: any) {
      console.error('Error creating sale:', error);
      console.error('Error response data:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.details || error.message || 'Noma\'lum xatolik';
      alert('Sotuvni yaratishda xatolik: ' + errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 p-4 relative overflow-hidden">
      {/* Background blobs - Login page style */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="w-full h-full z-10 px-6">
        {/* Header - Login page style */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate('/cashier/sales')}
            className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl font-bold text-gray-700 dark:text-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-gray-200 dark:border-gray-700"
          >
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            {latinToCyrillic("Orqaga")}
          </button>
          
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-500/25 mb-2">
              <Sparkles className="w-4 h-4" />
              {latinToCyrillic("Yangi Sotuv")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                {latinToCyrillic("Savat")}
              </span>
            </h1>
          </div>
          
          {/* Item count badge */}
          <div className="px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-500 uppercase">{latinToCyrillic("Mahsulotlar")}</span>
            <div className="text-2xl font-black text-blue-600">{form.items.length}</div>
          </div>
          
          {/* Currency Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, currency: 'UZS' }))}
              className={`px-4 py-2 rounded-xl font-black text-sm transition-all duration-200 ${
                form.currency === 'UZS'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              UZS
            </button>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, currency: 'USD' }))}
              className={`px-4 py-2 rounded-xl font-black text-sm transition-all duration-200 ${
                form.currency === 'USD'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              $
            </button>
          </div>
        </div>
        
        {/* Main Card - Login page style */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-gray-800 overflow-hidden">
          {/* Top Decorative bar - blue for sales */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600"></div>
          
          <div className="p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                
                {/* 1-USTUN: Mahsulotlar */}
                <div className="space-y-5 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white">{latinToCyrillic("Mahsulotlar")}</h2>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{form.items.length} {latinToCyrillic("tanlandi")}</p>
                    </div>
                  </div>

                  {selectedCustomer && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPriceModal(true)}
                      className="w-full text-purple-600 hover:bg-purple-50 border-purple-200 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-sm"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {latinToCyrillic("Narx Belgilash")}
                    </Button>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                        <label className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">{latinToCyrillic("Kategoriya")}</label>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        {[
                          { id: 'all', label: 'All', color: 'bg-gray-500' },
                          { id: 'preform', label: 'Pre', color: 'bg-blue-500' },
                          { id: 'krishka', label: 'Kri', color: 'bg-orange-500' },
                          { id: 'ruchka', label: 'Ruc', color: 'bg-emerald-500' },
                          { id: 'other', label: 'Bsh', color: 'bg-slate-500' }
                        ].map((cat) => (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setActiveProductCategory(cat.id as any)}
                            className={`py-2 px-1 rounded-lg text-sm font-black transition-all duration-200 ${
                              activeProductCategory === cat.id 
                                ? `${cat.color} text-white shadow-md` 
                                : 'bg-transparent text-gray-600 hover:bg-white dark:hover:bg-gray-600'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {(() => {
                          const filteredProducts = activeProductCategory === 'all' 
                            ? products 
                            : products.filter(p => p.warehouse === activeProductCategory || p.bagType?.toLowerCase().includes(activeProductCategory));
                          
                          const grouped = groupProductsByType(filteredProducts);
                          const groupNames = Object.keys(grouped).sort();
                          
                          if (groupNames.length === 0) {
                            return (
                              <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold">{latinToCyrillic("Mahsulot topilmadi")}</p>
                              </div>
                            );
                          }
                          
                          return groupNames.map((groupName) => {
                            const groupProducts = grouped[groupName];
                            const isExpanded = expandedProductGroups.includes(groupName);
                            
                            return (
                              <div key={groupName} className={`border rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 bg-white dark:bg-gray-800'}`}>
                                <button
                                  type="button"
                                  onClick={() => toggleProductGroup(groupName)}
                                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{groupName}</span>
                                    <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{groupProducts.length}</span>
                                  </div>
                                  <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                
                                <div className={`${isExpanded ? 'block' : 'hidden'}`}>
                                  <div className="p-2 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                    {groupProducts.map((product) => (
                                      <div
                                        key={product.id}
                                        onClick={() => {
                                          setNewItem({
                                            productId: product.id,
                                            productName: product.name,
                                            quantity: '1',
                                            pricePerBag: product.pricePerBag || '0'
                                          });
                                        }}
                                        className={`p-3 rounded-xl cursor-pointer text-sm transition-all duration-200 ${
                                          newItem.productId === product.id 
                                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 shadow-sm' 
                                            : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-200'
                                        }`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-bold text-gray-800 dark:text-gray-200 truncate pr-2">{product.name}</span>
                                          <span className="font-black text-emerald-600">{getCurrencySymbol()}{getDisplayAmount(product.pricePerBag || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                                          <span>{latinToCyrillic("Zaxira")}: {product.currentStock || 0} {latinToCyrillic("qop")}</span>
                                          {newItem.productId === product.id && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      {newItem.productName && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mb-1 uppercase tracking-wider">{latinToCyrillic("Tanlangan")}</div>
                          <div className="font-bold text-gray-800 dark:text-gray-200 truncate">{newItem.productName}</div>
                          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-black">{getCurrencySymbol()}{getDisplayAmount(parseFloat(newItem.pricePerBag) || 0)} / {latinToCyrillic("qop")}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 uppercase">{latinToCyrillic("Miqdor (qop)")}</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={newItem.quantity}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            setNewItem(prev => ({ ...prev, quantity: val }));
                          }}
                          className="w-full h-12 px-4 text-base font-black rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 uppercase">{latinToCyrillic("Narx")} ({getCurrencySymbol()}/{latinToCyrillic("qop")})</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={newItem.pricePerBag}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            setNewItem(prev => ({ ...prev, pricePerBag: val }));
                          }}
                          className="w-full h-12 px-4 text-base font-black rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={addProduct}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white h-14 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
                      disabled={!newItem.productId || !newItem.quantity}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {latinToCyrillic("Qo'shish")}
                    </Button>
                  </div>
                </div>

                {/* 2-USTUN: Savat */}
                <div className="space-y-5 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white">{latinToCyrillic("Savat")}</h2>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{form.items.length} {latinToCyrillic("ta mahsulot")}</p>
                    </div>
                  </div>
                  
                  {form.items.length > 0 && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-black text-sm text-blue-600 uppercase tracking-wider">{latinToCyrillic("Savat")}</h3>
                          
                          <Button type="button" variant="outline" onClick={() => setForm(prev => ({ ...prev, items: [] }))} className="h-10 px-3 text-sm text-red-600 border-red-200 hover:bg-red-50 rounded-xl">
                            <Trash2 className="w-4 h-4 mr-1" /> {latinToCyrillic("Tozalash")}
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="text-sm font-bold text-gray-500 uppercase mb-1">{latinToCyrillic("Dona")}</div>
                            <div className="text-lg font-black text-blue-600">{form.items.reduce((sum, item) => sum + (item.quantity * (item.unitsPerBag || 2000)), 0).toLocaleString()}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="text-sm font-bold text-gray-500 uppercase mb-1">{latinToCyrillic("Narx")}</div>
                            <div className="text-lg font-black text-emerald-600">{getCurrencySymbol()}{form.items.length > 0 ? getDisplayAmount(form.items.reduce((sum, item) => sum + item.subtotal, 0) / form.items.reduce((sum, item) => sum + item.quantity, 0)) : '0.00'}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="text-sm font-bold text-gray-500 uppercase mb-1">{latinToCyrillic("Jami")}</div>
                            <div className="text-lg font-black text-purple-600">{getCurrencySymbol()}{getDisplayAmount(totalAmount)}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Savat items - Komplekt va alohida */}
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {(() => {
                          // Komplektlarni aniqlash
                          const komplekts: any[] = [];
                          const usedIndices = new Set<number>();
                          const items = form.items;
                          
                          console.log('🔍 Komplekt tekshirilmoqda...', items.length, 'ta item');
                          items.forEach((item, idx) => {
                            console.log(`  Item ${idx}:`, item.productName, '- qty:', item.quantity, '- warehouse:', item.warehouse);
                          });
                          
                          // Har bir preform uchun komplekt qidirish
                          items.forEach((item, index) => {
                            if (usedIndices.has(index)) return;
                            
                            const nameLower = item.productName.toLowerCase();
                            const isPreform = nameLower.includes('preform') ||
                                              nameLower.includes('преформ') ||
                                              nameLower.includes('празрачни') ||
                                              nameLower.includes('15g') ||
                                              nameLower.includes('15г') ||
                                              nameLower.includes('гидро') ||
                                              nameLower.includes('gidra') ||
                                              nameLower.includes('синий') ||
                                              nameLower.includes('sini');
                            
                            console.log(`🔍 Item ${index} (${item.productName}): isPreform=${isPreform}`);
                            
                            if (isPreform) {
                              const preformQtyInPieces = item.quantity * (item.unitsPerBag || 2000);
                              
                              const krishkaIndex = items.findIndex((i, idx) => 
                                !usedIndices.has(idx) && idx !== index &&
                                (i.productName.toLowerCase().includes('krishka') ||
                                 i.productName.toLowerCase().includes('крышка') ||
                                 i.productName.toLowerCase().includes('galuboy') ||
                                 i.productName.toLowerCase().includes('голубой')) &&
                                i.quantity === preformQtyInPieces
                              );
                              
                              const ruchkaIndex = items.findIndex((i, idx) => 
                                !usedIndices.has(idx) && idx !== index && idx !== krishkaIndex &&
                                (i.productName.toLowerCase().includes('ruchka') ||
                                 i.productName.toLowerCase().includes('ручка') ||
                                 i.productName.toLowerCase().includes('qora') ||
                                 i.productName.toLowerCase().includes('черная')) &&
                                i.quantity === preformQtyInPieces
                              );
                              
                              console.log(`🔍 Preform ${item.quantity} qop = ${preformQtyInPieces} dona. Krishka: ${krishkaIndex}, Ruchka: ${ruchkaIndex}`);
                              
                              if (krishkaIndex !== -1 && ruchkaIndex !== -1) {
                                console.log('✅ Komplekt topildi!');
                                komplekts.push({
                                  type: 'komplekt',
                                  preform: { ...item, originalIndex: index },
                                  krishka: { ...items[krishkaIndex], originalIndex: krishkaIndex },
                                  ruchka: { ...items[ruchkaIndex], originalIndex: ruchkaIndex },
                                  totalSubtotal: item.subtotal + items[krishkaIndex].subtotal + items[ruchkaIndex].subtotal
                                });
                                usedIndices.add(index);
                                usedIndices.add(krishkaIndex);
                                usedIndices.add(ruchkaIndex);
                              }
                            }
                          });
                          
                          console.log(`📊 Komplekts: ${komplekts.length}, Used indices:`, [...usedIndices]);
                          
                          const remainingItems = items.map((item, index) => ({ ...item, originalIndex: index }))
                            .filter((_, index) => !usedIndices.has(index));
                          
                          return (
                            <>
                              {/* Komplekt kartalar */}
                              {komplekts.map((komplekt, idx) => (
                                <div key={`komplekt-${idx}`} className="bg-white rounded-[2rem] border-2 border-purple-200 shadow-[0_8px_30px_rgba(168,85,247,0.15)] overflow-hidden">
                                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🎁</div>
                                        <div>
                                          <h4 className="font-black text-white text-lg uppercase tracking-tight">{latinToCyrillic("Komplekt")}</h4>
                                          <p className="text-white/80 text-sm font-bold">{komplekt.preform.quantity} {latinToCyrillic("qop")} × 3</p>
                                        </div>
                                      </div>
                                      <span className="font-black text-white text-2xl">{getCurrencySymbol()}{getDisplayAmount(komplekt.totalSubtotal)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="p-4 space-y-3">
                                    {/* Preform, Krishka, Ruchka - Bitta qatorda 3 ta ustun */}
                                    <div className="grid grid-cols-3 gap-2">
                                      {/* Preform */}
                                      <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-bold text-gray-800 text-base">📦 {komplekt.preform.productName}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeProduct(komplekt.preform.originalIndex)}
                                            className="text-red-500 hover:text-red-700 p-0.5"
                                            title={latinToCyrillic("O'chirish")}
                                          >
                                            <Trash2 className="w-5 h-5" />
                                          </button>
                                        </div>
                                        <select
                                          value={komplekt.preform.productId}
                                          onChange={(e) => {
                                            const newProduct = products.find(p => p.id === e.target.value);
                                            if (newProduct) {
                                              const upb = newProduct.unitsPerBag || 2000;
                                              const oldQty = komplekt.preform.quantity;
                                              updateItem(komplekt.preform.originalIndex, {
                                                productId: newProduct.id,
                                                productName: newProduct.name,
                                                pricePerBag: newProduct.pricePerBag || 0,
                                                pricePerPiece: (newProduct.pricePerBag || 0) / upb,
                                                unitsPerBag: upb,
                                                subtotal: oldQty * (newProduct.pricePerBag || 0)
                                              });
                                            }
                                          }}
                                          className="text-sm border rounded px-2 py-1 bg-white w-full mb-1"
                                        >
                                          {products.filter(p => p.warehouse === 'preform' || p.name.toLowerCase().includes('g')).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                          ))}
                                        </select>
                                        <div className="flex gap-1 mb-1">
                                          <button
                                            type="button"
                                            onClick={() => { const upb = komplekt.preform.unitsPerBag || 2000; const currentPricePerPiece = komplekt.preform.pricePerPiece || komplekt.preform.pricePerBag / upb; updateItem(komplekt.preform.originalIndex, { priceMode: 'bag', pricePerBag: currentPricePerPiece * upb, pricePerPiece: currentPricePerPiece }); }}
                                            className={`px-2 py-0.5 text-sm font-bold rounded ${!komplekt.preform.priceMode || komplekt.preform.priceMode === 'bag' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                          >
                                            {latinToCyrillic("Qop")}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => { const upb = komplekt.preform.unitsPerBag || 2000; const currentPricePerPiece = komplekt.preform.pricePerPiece || komplekt.preform.pricePerBag / upb; updateItem(komplekt.preform.originalIndex, { priceMode: 'piece', pricePerPiece: currentPricePerPiece, pricePerBag: currentPricePerPiece * upb }); }}
                                            className={`px-2 py-0.5 text-sm font-bold rounded ${komplekt.preform.priceMode === 'piece' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                          >
                                            {latinToCyrillic("Dona")}
                                          </button>
                                        </div>
                                        <input type="text" inputMode="decimal" value={komplekt.preform.quantity} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.preform.unitsPerBag || 2000; const price = komplekt.preform.priceMode === 'piece' ? (komplekt.preform.pricePerPiece || komplekt.preform.pricePerBag / upb) : komplekt.preform.pricePerBag; updateItem(komplekt.preform.originalIndex, { quantity: v, subtotal: komplekt.preform.priceMode === 'piece' ? v * upb * price : v * price }); }} className="w-full h-9 px-2 text-base font-black border rounded mb-2" placeholder={latinToCyrillic("Miqdor")} />
                                        <input type="text" inputMode="decimal" value={!komplekt.preform.priceMode || komplekt.preform.priceMode === 'bag' ? komplekt.preform.pricePerBag : (komplekt.preform.pricePerPiece || komplekt.preform.pricePerBag / (komplekt.preform.unitsPerBag || 2000))} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.preform.unitsPerBag || 2000; if (!komplekt.preform.priceMode || komplekt.preform.priceMode === 'bag') { updateItem(komplekt.preform.originalIndex, { pricePerBag: v, pricePerPiece: v / upb, subtotal: komplekt.preform.quantity * v }); } else { updateItem(komplekt.preform.originalIndex, { pricePerPiece: v, pricePerBag: v * upb, subtotal: komplekt.preform.quantity * upb * v }); } }} className="w-full h-9 px-2 text-base font-black border rounded mb-2" placeholder={latinToCyrillic("Narx")} />
                                        <div className="text-base font-black text-green-600 text-center">{getCurrencySymbol()}{getDisplayAmount(komplekt.preform.subtotal)}</div>
                                      </div>
                                      {/* Krishka */}
                                      <div className="bg-orange-50 p-2 rounded-xl border border-orange-100">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-bold text-gray-800 text-base">⭕ {komplekt.krishka.productName}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeProduct(komplekt.krishka.originalIndex)}
                                            className="text-red-500 hover:text-red-700 p-0.5"
                                            title={latinToCyrillic("O'chirish")}
                                          >
                                            <Trash2 className="w-5 h-5" />
                                          </button>
                                        </div>
                                        <select
                                          value={komplekt.krishka.productId}
                                          onChange={(e) => {
                                            const newProduct = products.find(p => p.id === e.target.value);
                                            if (newProduct) {
                                              const upb = newProduct.unitsPerBag || 1000;
                                              const oldQty = komplekt.krishka.quantity;
                                              updateItem(komplekt.krishka.originalIndex, {
                                                productId: newProduct.id,
                                                productName: newProduct.name,
                                                pricePerBag: newProduct.pricePerBag || 0,
                                                pricePerPiece: (newProduct.pricePerBag || 0) / upb,
                                                unitsPerBag: upb,
                                                subtotal: oldQty * ((newProduct.pricePerBag || 0) / upb)
                                              });
                                            }
                                          }}
                                          className="text-sm border rounded px-2 py-1 bg-white w-full mb-1"
                                        >
                                          {products.filter(p => p.warehouse === 'krishka' || p.name.toLowerCase().includes('krishka')).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                          ))}
                                        </select>
                                        <div className="flex gap-1 mb-1">
                                          <button
                                            type="button"
                                            onClick={() => { const upb = komplekt.krishka.unitsPerBag || 1000; const currentPricePerPiece = komplekt.krishka.pricePerPiece || komplekt.krishka.pricePerBag / upb; updateItem(komplekt.krishka.originalIndex, { priceMode: 'bag', pricePerBag: currentPricePerPiece * upb, pricePerPiece: currentPricePerPiece }); }}
                                            className={`px-2 py-0.5 text-sm font-bold rounded ${!komplekt.krishka.priceMode || komplekt.krishka.priceMode === 'bag' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                          >
                                            {latinToCyrillic("Qop")}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => { const upb = komplekt.krishka.unitsPerBag || 1000; const currentPricePerPiece = komplekt.krishka.pricePerPiece || komplekt.krishka.pricePerBag / upb; updateItem(komplekt.krishka.originalIndex, { priceMode: 'piece', pricePerPiece: currentPricePerPiece, pricePerBag: currentPricePerPiece * upb }); }}
                                            className={`px-2 py-0.5 text-sm font-bold rounded ${komplekt.krishka.priceMode === 'piece' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                          >
                                            {latinToCyrillic("Dona")}
                                          </button>
                                        </div>
                                        <input type="text" inputMode="decimal" value={komplekt.krishka.quantity} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.krishka.unitsPerBag || 1000; const price = komplekt.krishka.priceMode === 'piece' ? (komplekt.krishka.pricePerPiece || komplekt.krishka.pricePerBag / upb) : komplekt.krishka.pricePerBag; updateItem(komplekt.krishka.originalIndex, { quantity: v, subtotal: komplekt.krishka.priceMode === 'piece' ? v * price : v * price }); }} className="w-full h-9 px-2 text-base font-black border rounded mb-2" placeholder={latinToCyrillic("Miqdor")} />
                                        <input type="text" inputMode="decimal" value={!komplekt.krishka.priceMode || komplekt.krishka.priceMode === 'bag' ? komplekt.krishka.pricePerBag : (komplekt.krishka.pricePerPiece || komplekt.krishka.pricePerBag / (komplekt.krishka.unitsPerBag || 1000))} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.krishka.unitsPerBag || 1000; if (!komplekt.krishka.priceMode || komplekt.krishka.priceMode === 'bag') { const pricePerPiece = v / upb; updateItem(komplekt.krishka.originalIndex, { pricePerBag: v, pricePerPiece: pricePerPiece, subtotal: komplekt.krishka.quantity * pricePerPiece }); } else { updateItem(komplekt.krishka.originalIndex, { pricePerPiece: v, pricePerBag: v * upb, subtotal: komplekt.krishka.quantity * v }); } }} className="w-full h-9 px-2 text-base font-black border rounded mb-2" placeholder={latinToCyrillic("Narx")} />
                                        <div className="text-base font-black text-green-600 text-center">{getCurrencySymbol()}{getDisplayAmount(komplekt.krishka.subtotal)}</div>
                                      </div>
                                      {/* Ruchka */}
                                      <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-bold text-gray-800 text-base">🎗️ {komplekt.ruchka.productName}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeProduct(komplekt.ruchka.originalIndex)}
                                            className="text-red-500 hover:text-red-700 p-0.5"
                                            title={latinToCyrillic("O'chirish")}
                                          >
                                            <Trash2 className="w-5 h-5" />
                                          </button>
                                        </div>
                                        <select
                                          value={komplekt.ruchka.productId}
                                          onChange={(e) => {
                                            const newProduct = products.find(p => p.id === e.target.value);
                                            if (newProduct) {
                                              const upb = newProduct.unitsPerBag || 1000;
                                              const oldQty = komplekt.ruchka.quantity;
                                              updateItem(komplekt.ruchka.originalIndex, {
                                                productId: newProduct.id,
                                                productName: newProduct.name,
                                                pricePerBag: newProduct.pricePerBag || 0,
                                                pricePerPiece: (newProduct.pricePerBag || 0) / upb,
                                                unitsPerBag: upb,
                                                subtotal: oldQty * ((newProduct.pricePerBag || 0) / upb)
                                              });
                                            }
                                          }}
                                          className="text-sm border rounded px-2 py-1 bg-white w-full mb-1"
                                        >
                                          {products.filter(p => p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka')).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                          ))}
                                        </select>
                                        <div className="flex gap-1 mb-1">
                                          <button
                                            type="button"
                                            onClick={() => { const upb = komplekt.ruchka.unitsPerBag || 1000; const currentPricePerPiece = komplekt.ruchka.pricePerPiece || komplekt.ruchka.pricePerBag / upb; updateItem(komplekt.ruchka.originalIndex, { priceMode: 'bag', pricePerBag: currentPricePerPiece * upb, pricePerPiece: currentPricePerPiece }); }}
                                            className={`px-2 py-0.5 text-sm font-bold rounded ${!komplekt.ruchka.priceMode || komplekt.ruchka.priceMode === 'bag' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                          >
                                            {latinToCyrillic("Qop")}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => { const upb = komplekt.ruchka.unitsPerBag || 1000; const currentPricePerPiece = komplekt.ruchka.pricePerPiece || komplekt.ruchka.pricePerBag / upb; updateItem(komplekt.ruchka.originalIndex, { priceMode: 'piece', pricePerPiece: currentPricePerPiece, pricePerBag: currentPricePerPiece * upb }); }}
                                            className={`px-2 py-0.5 text-sm font-bold rounded ${komplekt.ruchka.priceMode === 'piece' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                          >
                                            {latinToCyrillic("Dona")}
                                          </button>
                                        </div>
                                        <input type="text" inputMode="decimal" value={komplekt.ruchka.quantity} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.ruchka.unitsPerBag || 1000; const price = komplekt.ruchka.priceMode === 'piece' ? (komplekt.ruchka.pricePerPiece || komplekt.ruchka.pricePerBag / upb) : komplekt.ruchka.pricePerBag; updateItem(komplekt.ruchka.originalIndex, { quantity: v, subtotal: komplekt.ruchka.priceMode === 'piece' ? v * price : v * price }); }} className="w-full h-9 px-2 text-base font-black border rounded mb-2" placeholder={latinToCyrillic("Miqdor")} />
                                        <input type="text" inputMode="decimal" value={!komplekt.ruchka.priceMode || komplekt.ruchka.priceMode === 'bag' ? komplekt.ruchka.pricePerBag : (komplekt.ruchka.pricePerPiece || komplekt.ruchka.pricePerBag / (komplekt.ruchka.unitsPerBag || 1000))} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.ruchka.unitsPerBag || 1000; if (!komplekt.ruchka.priceMode || komplekt.ruchka.priceMode === 'bag') { const pricePerPiece = v / upb; updateItem(komplekt.ruchka.originalIndex, { pricePerBag: v, pricePerPiece: pricePerPiece, subtotal: komplekt.ruchka.quantity * pricePerPiece }); } else { updateItem(komplekt.ruchka.originalIndex, { pricePerPiece: v, pricePerBag: v * upb, subtotal: komplekt.ruchka.quantity * v }); } }} className="w-full h-9 px-2 text-base font-black border rounded mb-2" placeholder={latinToCyrillic("Narx")} />
                                        <div className="text-base font-black text-green-600 text-center">{getCurrencySymbol()}{getDisplayAmount(komplekt.ruchka.subtotal)}</div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="p-4 pt-0">
                                    <Button type="button" onClick={() => { const indices = [komplekt.preform.originalIndex, komplekt.krishka.originalIndex, komplekt.ruchka.originalIndex].sort((a,b) => b-a); setForm(prev => ({...prev, items: prev.items.filter((_,i) => !indices.includes(i))})); }} className="w-full bg-red-500 hover:bg-red-600 text-white h-14 rounded-xl font-black text-base shadow-lg">
                                      <Trash2 className="w-5 h-5 mr-3" /> {latinToCyrillic("Komplektni o'chirish")}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Alohida mahsulotlar */}
                              {remainingItems.map((item) => (
                                <div key={item.originalIndex} className="bg-white rounded-[2rem] border-2 border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
                                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                                          {item.productName.toLowerCase().includes('preform') ? '📦' : 
                                           item.productName.toLowerCase().includes('krishka') ? '⭕' : 
                                           item.productName.toLowerCase().includes('ruchka') ? '🎗️' : '📦'}
                                        </div>
                                        <div>
                                          <h4 className="font-black text-white text-lg">{item.productName}</h4>
                                          <select
                                            value={item.productId}
                                            onChange={(e) => {
                                              const newProduct = products.find(p => p.id === e.target.value);
                                              if (newProduct && newProduct.id !== item.productId) {
                                                const upb = newProduct.unitsPerBag || 2000;
                                                const oldQty = item.quantity;
                                                updateItem(item.originalIndex, {
                                                  productId: newProduct.id,
                                                  productName: newProduct.name,
                                                  pricePerBag: newProduct.pricePerBag || 0,
                                                  pricePerPiece: (newProduct.pricePerBag || 0) / upb,
                                                  unitsPerBag: upb,
                                                  subtotal: oldQty * (newProduct.pricePerBag || 0)
                                                });
                                              }
                                            }}
                                            className="text-base border rounded px-2 py-1 bg-white text-gray-800"
                                          >
                                            {products
                                              .filter(p => {
                                                if (item.productName.toLowerCase().includes('preform')) return p.warehouse === 'preform' || p.name.toLowerCase().includes('g');
                                                if (item.productName.toLowerCase().includes('krishka')) return p.warehouse === 'krishka' || p.name.toLowerCase().includes('krishka');
                                                if (item.productName.toLowerCase().includes('ruchka')) return p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka');
                                                return p.warehouse === item.warehouse || p.bagType === item.bagType;
                                              })
                                              .map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                              ))}
                                          </select>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          type="button"
                                          onClick={() => { const upb = item.unitsPerBag || 2000; const currentPricePerPiece = item.pricePerPiece || item.pricePerBag / upb; updateItem(item.originalIndex, { priceMode: 'bag', pricePerBag: currentPricePerPiece * upb, pricePerPiece: currentPricePerPiece }); }}
                                          className={`px-3 py-1.5 text-base font-bold rounded ${!item.priceMode || item.priceMode === 'bag' ? 'bg-white text-blue-600' : 'bg-white/30 text-white'}`}
                                        >
                                          {latinToCyrillic("Qop")}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => { const upb = item.unitsPerBag || 2000; const currentPricePerPiece = item.pricePerPiece || item.pricePerBag / upb; updateItem(item.originalIndex, { priceMode: 'piece', pricePerPiece: currentPricePerPiece, pricePerBag: currentPricePerPiece * upb }); }}
                                          className={`px-3 py-1.5 text-base font-bold rounded ${item.priceMode === 'piece' ? 'bg-white text-blue-600' : 'bg-white/30 text-white'}`}
                                        >
                                          {latinToCyrillic("Dona")}
                                        </button>
                                        <Button type="button" onClick={() => removeProduct(item.originalIndex)} className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 p-0 rounded-xl shadow-lg ml-2">
                                          <Trash2 className="w-5 h-5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="p-4">
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                      <div className="bg-gray-50 p-2 rounded-xl border-2 border-gray-100">
                                        <label className="text-base font-bold text-gray-500 uppercase block mb-1">{!item.priceMode || item.priceMode === 'bag' ? latinToCyrillic("Qop") : latinToCyrillic("Dona")}</label>
                                        <input type="text" inputMode="decimal" value={item.quantity} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = item.unitsPerBag || 2000; const price = !item.priceMode || item.priceMode === 'bag' ? item.pricePerBag : (item.pricePerPiece || item.pricePerBag / upb); updateItem(item.originalIndex, { quantity: v, subtotal: v * price }); }} className="w-full h-10 px-3 text-base font-black border rounded" />
                                      </div>
                                      <div className="bg-blue-50 p-2 rounded-xl border-2 border-blue-100">
                                        <label className="text-base font-bold text-blue-600 uppercase block mb-1">{!item.priceMode || item.priceMode === 'bag' ? latinToCyrillic("Dona") : latinToCyrillic("Qop")}</label>
                                        <div className="h-8 flex items-center text-base font-black text-blue-700">{!item.priceMode || item.priceMode === 'bag' ? (item.quantity * (item.unitsPerBag || 2000)).toLocaleString() : (item.quantity / (item.unitsPerBag || 2000)).toFixed(2)}</div>
                                      </div>
                                      <div className="bg-green-50 p-2 rounded-xl border-2 border-green-100">
                                        <label className="text-base font-bold text-green-600 uppercase block mb-1">{latinToCyrillic("Narx")} ({!item.priceMode || item.priceMode === 'bag' ? latinToCyrillic("qop") : latinToCyrillic("dona")})</label>
                                        <input type="text" inputMode="decimal" value={!item.priceMode || item.priceMode === 'bag' ? item.pricePerBag : (item.pricePerPiece || item.pricePerBag / (item.unitsPerBag || 2000))} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = item.unitsPerBag || 2000; if (!item.priceMode || item.priceMode === 'bag') { updateItem(item.originalIndex, { pricePerBag: v, pricePerPiece: v / upb, subtotal: item.quantity * v }); } else { updateItem(item.originalIndex, { pricePerPiece: v, pricePerBag: v * upb, subtotal: item.quantity * v }); } }} className="w-full h-10 px-3 text-base font-black border rounded" />
                                      </div>
                                      <div className="bg-purple-50 p-2 rounded-xl border-2 border-purple-100">
                                        <label className="text-base font-bold text-purple-600 uppercase block mb-1">{latinToCyrillic("Jami")}</label>
                                        <div className="h-8 flex items-center text-base font-black text-purple-700">{getCurrencySymbol()}{getDisplayAmount(item.subtotal)}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                      
                      {form.items.length === 0 && (
                        <div className="p-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <ShoppingCart className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-bold mb-2 text-lg">{latinToCyrillic("Savat bo'sh")}</p>
                          <p className="text-gray-400 dark:text-gray-500 text-base">{latinToCyrillic("Mahsulot qo'shing")}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3-USTUN: Mijoz va To'lov */}
                <div className="space-y-5 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white">{latinToCyrillic("Mijoz va To'lov")}</h2>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{latinToCyrillic("Sotuvni yakunlash")}</p>
                    </div>
                  </div>

                  {/* Mijoz tanlash */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <label className="block text-base font-bold text-gray-600 mb-2 uppercase">{latinToCyrillic("Mijoz")}</label>
                    <CustomerSelector
                      customers={customers}
                      selectedId={form.customerId}
                      onSelect={(id, name) => setForm(prev => ({ ...prev, customerId: id, customerName: name }))}
                      searchValue={customerSearch}
                      onSearchChange={setCustomerSearch}
                    />
                  </div>

                  {form.items.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-xl font-bold text-purple-600">
                        💳 {latinToCyrillic("To'lov")}
                      </label>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <div>
                          <label className="block text-base font-bold text-gray-600 mb-1">{latinToCyrillic("To'lov turi")}</label>
                          <select value={form.paymentType} onChange={(e) => setForm(prev => ({ ...prev, paymentType: e.target.value }))} className="w-full h-12 px-3 text-base font-bold border rounded bg-white">
                            <option value="cash">{latinToCyrillic("Naqd")}</option>
                            <option value="debt">{latinToCyrillic("Qarz")}</option>
                            <option value="partial">{latinToCyrillic("Qisman")}</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-base text-gray-500 font-bold">UZS</label>
                            <input type="text" inputMode="decimal" placeholder="0" value={form.paidUZS} onChange={(e) => setForm(prev => ({ ...prev, paidUZS: e.target.value.replace(/[^0-9.]/g, '') }))} className="w-full h-12 px-3 text-base font-bold border rounded" />
                          </div>
                          <div>
                            <label className="block text-base text-gray-500 font-bold">USD</label>
                            <input type="text" inputMode="decimal" placeholder="0.00" value={form.paidUSD} onChange={(e) => setForm(prev => ({ ...prev, paidUSD: e.target.value.replace(/[^0-9.]/g, '') }))} className="w-full h-12 px-3 text-base font-bold border rounded" />
                          </div>
                          <div>
                            <label className="block text-base text-gray-500 font-bold">CLICK</label>
                            <input type="text" inputMode="decimal" placeholder="0" value={form.paidCLICK} onChange={(e) => setForm(prev => ({ ...prev, paidCLICK: e.target.value.replace(/[^0-9.]/g, '') }))} className="w-full h-12 px-3 text-base font-bold border rounded" />
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border">
                          <div className="flex justify-between text-base">
                            <span className="text-gray-500">{latinToCyrillic("Qarz")}:</span>
                            <span className="font-bold text-red-600">{getCurrencySymbol()}{debtAmount.toFixed(form.currency === 'UZS' ? 0 : 2)}</span>
                          </div>
                          <div className="flex justify-between text-base">
                            <span className="text-gray-500">{latinToCyrillic("To'langan")}:</span>
                            <span className="font-bold text-green-600">{getCurrencySymbol()}{paidAmount.toFixed(form.currency === 'UZS' ? 0 : 2)}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-2xl shadow-lg shadow-blue-500/25">
                          <div className="flex justify-between items-center">
                            <span className="font-black uppercase tracking-wider">{latinToCyrillic("JAMI")}:</span>
                            <span className="text-3xl font-black">{getCurrencySymbol()}{getDisplayAmount(totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {form.items.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 bg-amber-50 p-3 rounded border border-amber-200">
                        <label className="text-base font-bold text-amber-700">{latinToCyrillic("Kurs")}:</label>
                        <input type="text" inputMode="decimal" placeholder="12500" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value.replace(/[^0-9.]/g, ''))} className="flex-1 h-12 px-3 border rounded text-base" />
                        <Button type="button" onClick={() => { const rate = parseFloat(exchangeRate) || 12500; const totalUZS = totalAmount * rate; setForm(prev => ({ ...prev, paidUZS: totalUZS.toFixed(0), paidUSD: totalAmount.toFixed(2) })); }} className="h-12 px-4 bg-amber-500 hover:bg-amber-600 text-white text-base font-bold">
                          UZS/$</Button>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white h-16 rounded-xl font-black text-xl uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
                      >
                        <ShoppingCart className="w-6 h-6 mr-3" />
                        {latinToCyrillic("Sotuvni rasmiylashtirish")}
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => navigate('/cashier/sales')} 
                          className="h-14 border-red-200 text-red-600 hover:bg-red-50 font-bold text-base rounded-xl"
                        >
                          <X className="w-5 h-5 mr-2" /> {latinToCyrillic("Bekor")}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => { const currentCurrency = form.currency; setForm({ customerId: '', customerName: '', items: [], paymentType: 'cash', paidUZS: '', paidUSD: '', paidCLICK: '', currency: currentCurrency }); setNewItem({ productId: '', productName: '', quantity: '', pricePerBag: '' }); }} 
                          className="h-14 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-base rounded-xl"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" /> {latinToCyrillic("Tozalash")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Price Modal */}
      {showPriceModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600">{selectedCustomer.name} - {latinToCyrillic("Narx")}</h2>
              <button onClick={() => setShowPriceModal(false)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 text-gray-500 hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{product.name}</h3>
                    <p className="text-base text-gray-500">${product.pricePerBag}/qop</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={customerPrices[product.id] || ''}
                      onChange={(e) => {
                        const newPrices = { ...customerPrices };
                        if (e.target.value) newPrices[product.id] = e.target.value.replace(/[^0-9.]/g, '');
                        else delete newPrices[product.id];
                        setCustomerPrices(newPrices);
                      }}
                      placeholder={product.pricePerBag.toString()}
                      className="w-28 h-10 px-3 border rounded text-base font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowPriceModal(false)} className="flex-1 h-12 border-gray-200 font-bold text-base">
                {latinToCyrillic("Bekor")}
              </Button>
              <Button type="button" onClick={async () => { try { await api.put(`/customers/${selectedCustomer.id}`, { productPrices: JSON.stringify(customerPrices) }); setShowPriceModal(false); const res = await api.get('/customers'); setCustomers(res.data); } catch (err) { console.error(err); } }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12 font-bold text-base">
                {latinToCyrillic("Saqlash")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
