// Fixed: Removed onPriceClick prop
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  DollarSign,
  Printer,          
  ShoppingCart,
  FileText,
  User, 
  Clock,
  Search, 
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Edit
} from 'lucide-react';
import CustomerSelector from '../components/CustomerSelector';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import SalesHistory from '../components/SalesHistory';
import { formatDateTime } from '../lib/dateUtils';
import { generateImprovedReceiptHTML, convertToImprovedFormat } from '../lib/improvedReceiptPrinter';
import { generateSimpleReceiptHTML } from '../lib/simpleReceiptPrinter';
import { useProfessionalApi } from '../hooks/useProfessionalApi';
import { errorHandler } from '../lib/professionalErrorHandler';
import { analytics } from '../lib/professionalAnalytics';
import { notify } from '../lib/professionalNotifications';
import { ProfessionalButton, ProfessionalCard } from '../components/ProfessionalComponents';

export default function Sales() {
  console.log('?? Sales component rendering...');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesSearch, setSalesSearch] = useState('');
  const [salesFilter, setSalesFilter] = useState<'all' | 'paid' | 'debt'>('all');
  const [showForm, setShowForm] = useState(false);
  const [exchangeRate, setExchangeRate] = useState('12500');
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [activeTab, setActiveTab] = useState<'sales' | 'history'>('sales');
  
  // URL parametrlarini olish
  const customerId = searchParams.get('customerId');
  
  // Sotuvlarni filtrlash
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer?.name?.toLowerCase().includes(salesSearch.toLowerCase()) ||
                         sale.id?.toLowerCase().includes(salesSearch.toLowerCase());
    
    if (salesFilter === 'all') return matchesSearch;
    if (salesFilter === 'paid') return matchesSearch && (sale.debtAmount === 0 || !sale.debtAmount);
    if (salesFilter === 'debt') return matchesSearch && sale.debtAmount > 0;
    return matchesSearch;
  });

  // Statistikalar
  const stats = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    totalPaid: sales.reduce((sum, s) => sum + (s.paidAmount || 0), 0),
    totalDebt: sales.reduce((sum, s) => sum + (s.debtAmount || 0), 0),
    paidCount: sales.filter(s => !s.debtAmount || s.debtAmount === 0).length,
    debtCount: sales.filter(s => s.debtAmount > 0).length
  };
  const [activeProductCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  
  // Form uchun
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
    console.log('?? Sales useEffect - calling loadData...');
    loadData();
  }, []); // Faqat bir marta ishlashi uchun

  useEffect(() => {
    // URL dan kelgan mijozni avtomatik tanlash
    if (customerId && customers.length > 0) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setForm(prev => ({
          ...prev,
          customerId: customer.id,
          customerName: customer.name
        }));
        setShowForm(true); // Avtomatik sotuv formini ochish
        console.log('?? Auto-selected customer from URL:', customer.name);
      }
    }
  }, [customerId, customers]);
    
  useEffect(() => {
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

  // Oddiy chek chiqarish funksiyasi
  const printSimpleReceipt = (sale: any, customer: any, user: any) => {
    // Debug: log the sale items to see their structure
    console.log('🖨️ Chek chiqarilmoqda...');
    console.log('📦 Sale items:', sale?.items);
    
    // Map items to correct format for receipt
    const receiptItems = (sale.items || []).map((item: any) => {
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
      saleId: sale.id,
      receiptNumber: sale.receiptNumber?.toString() || sale.id.slice(0, 8),
      date: formatDateTime(sale.createdAt).split(' ')[0],
      time: formatDateTime(sale.createdAt).split(' ')[1],
      cashier: user.name,
      currency: sale.currency || 'USD',
      customer: {
        name: customer?.name || 'Noma\'lum',
        phone: customer?.phone,
        address: customer?.address,
        previousBalanceUZS: customer?.debtUZS || 0,
        previousBalanceUSD: customer?.debtUSD || 0,
        newBalanceUZS: customer?.debtUZS || 0,
        newBalanceUSD: customer?.debtUSD || 0
      },
      items: receiptItems,
      subtotal: sale.totalAmount || 0,
      total: sale.totalAmount || 0,
      payments: {
        uzs: sale.paymentDetails?.uzs || 0,
        usd: sale.paymentDetails?.usd || 0,
        click: sale.paymentDetails?.click || 0
      },
      totalPaid: sale.paidAmount || 0,
      debt: sale.debtAmount || 0,
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
  };

  // Yuk xati chiqarish funksiyasi
  const printDeliveryReceipt = (sale: any, customer: any, user: any) => {
    // Debug: log the sale items to see their structure
    console.log('🖨️ Yuk xati chiqarilmoqda...');
    console.log('📦 Sale items:', sale?.items);
    
    // Map items to correct format for receipt
    const receiptItems = (sale.items || []).map((item: any) => {
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
      saleId: sale.id,
      receiptNumber: sale.receiptNumber?.toString() || sale.id.slice(0, 8),
      date: formatDateTime(sale.createdAt).split(' ')[0],
      time: formatDateTime(sale.createdAt).split(' ')[1],
      cashier: user.name,
      currency: sale.currency || 'USD',
      customer: {
        name: customer?.name || 'Noma\'lum',
        phone: customer?.phone,
        address: customer?.address,
        previousBalanceUZS: customer?.debtUZS || 0,
        previousBalanceUSD: customer?.debtUSD || 0,
        newBalanceUZS: customer?.debtUZS || 0,
        newBalanceUSD: customer?.debtUSD || 0
      },
      items: receiptItems,
      subtotal: sale.totalAmount || 0,
      total: sale.totalAmount || 0,
      payments: {
        uzs: sale.paymentDetails?.uzs || 0,
        usd: sale.paymentDetails?.usd || 0,
        click: sale.paymentDetails?.click || 0
      },
      totalPaid: sale.paidAmount || 0,
      debt: sale.debtAmount || 0,
      companyInfo: {
        name: 'LUX PET PLAST',
        address: 'Buxoro viloyati, Vobkent tumani',
        phone: '+998 91 414 44 58, +998 91 920 07 00'
      }
    };

    const receiptHTML = generateDeliveryReceiptHTML(receiptData);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
  };

  const loadData = async () => {
    try {
      console.log('🔄 Loading data...');
      const [salesRes, customersRes] = await Promise.all([
        api.get('/sales'),
        api.get('/customers')
      ]);
      
      console.log('👥 Mijozlar yuklandi:', customersRes.data.length, 'ta');
      console.log('💰 Sotuvlar yuklandi:', salesRes.data.length, 'ta');
      
      setSales(salesRes.data);
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

  const removeProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Savatni birlashtirish funktsiyalari
  const mergeItemsByType = (mergeType: 'sum' | 'dollar' | 'pieces' | 'bags') => {
    console.log('🔄 mergeItemsByType called with:', mergeType);
    console.log('🔄 Current items:', form.items);
    
    if (form.items.length === 0) {
      console.log('❌ No items to merge');
      return;
    }
    
    const mergedItems: Record<string, any> = {};
    const currentItems = [...form.items];
    
    // Komplektlarni aniqlash (Preform + Krishka + Ruchka)
    const preformItems = currentItems.filter(i => i.productName.toLowerCase().includes('preform'));
    const krishkaItems = currentItems.filter(i => i.productName.toLowerCase().includes('krishka'));
    const ruchkaItems = currentItems.filter(i => i.productName.toLowerCase().includes('ruchka'));
    
    // Har bir komplekt uchun birlashtirish
    preformItems.forEach(preform => {
      const matchingKrishka = krishkaItems.find(k => k.quantity === preform.quantity);
      const matchingRuchka = ruchkaItems.find(r => r.quantity === preform.quantity);
      
      if (matchingKrishka && matchingRuchka) {
        // Komplekt topildi - bitta card qilamiz
        const komlektKey = `Komplekt: ${preform.productName}`;
        
        if (mergeType === 'sum') {
          // Xuddi shu narxlarda birlashtirish
          const totalQuantity = preform.quantity;
          const totalSum = preform.subtotal + matchingKrishka.subtotal + matchingRuchka.subtotal;
          
          mergedItems[komlektKey] = {
            productId: preform.productId,
            productName: komlektKey,
            quantity: totalQuantity,
            pricePerBag: totalSum / totalQuantity,
            subtotal: totalSum,
            isKomplekt: true,
            items: [preform, matchingKrishka, matchingRuchka]
          };
        } else if (mergeType === 'dollar') {
          // O'rtacha $ narxda birlashtirish
          const totalQuantity = preform.quantity;
          const totalSum = preform.subtotal + matchingKrishka.subtotal + matchingRuchka.subtotal;
          const avgPrice = totalSum / totalQuantity;
          
          mergedItems[komlektKey] = {
            productId: preform.productId,
            productName: komlektKey,
            quantity: totalQuantity,
            pricePerBag: avgPrice,
            subtotal: totalSum,
            isKomplekt: true,
            items: [preform, matchingKrishka, matchingRuchka]
          };
        } else if (mergeType === 'pieces') {
          // Dona bo'yicha birlashtirish
          const totalPieces = preform.quantity * 2000;
          const totalQuantity = Math.ceil(totalPieces / 2000);
          const totalSum = preform.subtotal + matchingKrishka.subtotal + matchingRuchka.subtotal;
          
          mergedItems[komlektKey] = {
            productId: preform.productId,
            productName: komlektKey,
            quantity: totalQuantity,
            pricePerBag: totalSum / totalQuantity,
            subtotal: totalSum,
            isKomplekt: true,
            items: [preform, matchingKrishka, matchingRuchka]
          };
        } else if (mergeType === 'bags') {
          // Qop bo'yicha birlashtirish
          const totalQuantity = preform.quantity;
          const totalSum = preform.subtotal + matchingKrishka.subtotal + matchingRuchka.subtotal;
          
          mergedItems[komlektKey] = {
            productId: preform.productId,
            productName: komlektKey,
            quantity: totalQuantity,
            pricePerBag: totalSum / totalQuantity,
            subtotal: totalSum,
            isKomplekt: true,
            items: [preform, matchingKrishka, matchingRuchka]
          };
        }
        
        console.log(`🔄 Komplekt yaratildi:`, mergedItems[komlektKey]);
      } else {
        // Yolg'iz mahsulot - oddiy birlashtirish
        const productName = preform.productName;
        const itemsOfType = currentItems.filter(i => i.productName === productName);
        
        if (mergeType === 'sum') {
          const totalQuantity = itemsOfType.reduce((sum, i) => sum + i.quantity, 0);
          const firstPrice = itemsOfType[0].pricePerBag;
          
          mergedItems[productName] = {
            productId: itemsOfType[0].productId,
            productName: productName,
            quantity: totalQuantity,
            pricePerBag: firstPrice,
            subtotal: totalQuantity * firstPrice,
            isKomplekt: false
          };
        }
        // ... qolgan merge type lar uchun
      }
    });
    
    // Krishka va Ruchka larni komplektsiz qolganlarini qo'shish
    const usedKrishka = new Set();
    const usedRuchka = new Set();
    
    Object.values(mergedItems).forEach(item => {
      if (item.isKomplekt && item.items) {
        usedKrishka.add(item.items[1].productName);
        usedRuchka.add(item.items[2].productName);
      }
    });
    
    // Komplektsiz Krishka va Ruchka larni alohida qo'shish
    krishkaItems.forEach(krishka => {
      if (!usedKrishka.has(krishka.productName)) {
        mergedItems[krishka.productName] = {
          ...krishka,
          isKomplekt: false
        };
      }
    });
    
    ruchkaItems.forEach(ruchka => {
      if (!usedRuchka.has(ruchka.productName)) {
        mergedItems[ruchka.productName] = {
          ...ruchka,
          isKomplekt: false
        };
      }
    });
    
    // Yangi items array yaratish
    const newItems = Object.values(mergedItems);
    
    console.log('🔄 New items after merge:', newItems);
    console.log('🔄 Setting form with new items...');
    
    // Formni yangilash
    setForm(prev => {
      console.log('🔄 Previous form items:', prev.items);
      const newForm = { ...prev, items: newItems };
      console.log('🔄 New form items:', newForm.items);
      return newForm;
    });
    
    console.log(`✅ Savat ${mergeType} bo'yicha birlashtirildi!`);
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
      console.log('Sotuv yaratilmoqda...');
      console.log('Form data:', form);
      console.log('Total amount:', totalAmount);
      console.log('Paid amount:', paidAmount);
      
      // Backend kutgan formatdagi ma'lumotlar
      const saleData = {
        customerId: form.customerId,
        items: form.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          pricePerBag: item.pricePerBag || item.pricePerPiece,
          totalPrice: (parseFloat(item.quantity) || 0) * parseFloat(item.pricePerBag || item.pricePerPiece || 0)
        })),
        totalAmount: parseFloat(totalAmount) || 0,
        paymentMethod: 'CASH',
        paymentDetails: {
          uzs: parseFloat(form.paidUZS) || 0,
          usd: parseFloat(form.paidUSD) || 0,
          click: parseFloat(form.paidCLICK) || 0
        },
        notes: 'Kassir tomonidan yaratilgan sotuv'
      };
      
      console.log('Sending sale data:', JSON.stringify(saleData, null, 2));
      
      const response = await api.post('/sales', saleData);
      const createdSale = response.data;
      
      console.log('Sotuv yaratildi:', createdSale);
      
      // Oddiy chek chiqarish
      try {
        console.log('🖨️ Oddiy chek chiqarilmoqda...');
        
        // Foydalanuvchi ma'lumotlarini olish
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
        
        // Oddiy chek chiqarish
        printSimpleReceipt(createdSale, selectedCustomer, user);
        
        console.log('✅ Oddiy chek chiqarildi!');
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
        paymentType: 'cash',
        currency: 'USD',
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-12">
      {/* Gradient Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/30">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {latinToCyrillic("Savdo Bo'limi")}
                </h1>
                <p className="text-sm text-blue-100/80">
                  {latinToCyrillic("Mijozlar bilan savdo jarayonlari")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Qidiruv input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="text"
                  placeholder={latinToCyrillic("Qidiruv...")}
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 w-48"
                />
              </div>
              
              {/* Valyuta kursi */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20">
                <DollarSign className="w-4 h-4 text-blue-200" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-100">1 USD =</span>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="w-20 text-sm font-semibold text-white bg-white/20 border border-white/30 rounded-lg px-2 py-1 focus:outline-none focus:bg-white/30"
                    min="1"
                  />
                  <span className="text-xs text-blue-200">UZS</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/cashier/sales/add')} 
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                {latinToCyrillic("Yangi Sotuv")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Modern Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex p-1.5 bg-white/80 backdrop-blur-sm rounded-2xl w-fit shadow-lg shadow-blue-900/5 border border-white/50">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'sales' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {latinToCyrillic("Amaldagi sotuvlar")}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25' 
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            {latinToCyrillic("Sotuvlar tarixi")}
          </button>
        </div>

        {activeTab === 'history' && <SalesHistory />}

        {activeTab === 'sales' && (
          <div className="space-y-6 rounded-xl">
            {/* Statistika kartochkalari - Modern Design */}
            {sales.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-blue-100 bg-white/10 px-2 py-1 rounded-full">Jami</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.totalSales}</p>
                  <p className="text-sm text-blue-100 mt-1">{latinToCyrillic("ta sotuv")}</p>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-emerald-100 bg-white/10 px-2 py-1 rounded-full">USD</span>
                  </div>
                  <p className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(0)}</p>
                  <p className="text-sm text-emerald-100 mt-1">{latinToCyrillic("Daromad")}</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-amber-100 bg-white/10 px-2 py-1 rounded-full">Naqt</span>
                  </div>
                  <p className="text-3xl font-bold text-white">${stats.totalPaid.toFixed(0)}</p>
                  <p className="text-sm text-amber-100 mt-1">{latinToCyrillic("To'langan")}</p>
                </div>
                
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-5 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-rose-100 bg-white/10 px-2 py-1 rounded-full">Qarz</span>
                  </div>
                  <p className="text-3xl font-bold text-white">${stats.totalDebt.toFixed(0)}</p>
                  <p className="text-sm text-rose-100 mt-1">{latinToCyrillic("Qarzdorlik")}</p>
                </div>
              </div>
            )}

            {/* Qidiruv va filtrlash - Modern */}
            {sales.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-slate-900/5 border border-white/50">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Qidiruv */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={latinToCyrillic("Mijoz nomi yoki sotuv ID...")}
                      value={salesSearch}
                      onChange={(e) => setSalesSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                  
                  {/* Filtr tugmalari */}
                  <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    <button
                      onClick={() => setSalesFilter('all')}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        salesFilter === 'all'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:text-blue-600'
                      }`}
                    >
                      {latinToCyrillic("Barchasi")}
                    </button>
                    <button
                      onClick={() => setSalesFilter('paid')}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        salesFilter === 'paid'
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-slate-600 hover:text-emerald-600'
                      }`}
                    >
                      {latinToCyrillic("To'langan")}
                    </button>
                    <button
                      onClick={() => setSalesFilter('debt')}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        salesFilter === 'debt'
                          ? 'bg-white text-rose-600 shadow-sm'
                          : 'text-slate-600 hover:text-rose-600'
                      }`}
                    >
                      {latinToCyrillic("Qarz")}
                    </button>
                  </div>
                </div>
                
                {/* Natijalar soni */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {latinToCyrillic(`${filteredSales.length} ta sotuv topildi`)}
                  </p>
                </div>
              </div>
            )}

            {/* Sotuvlar ro'yxati - Premium Design */}
            {sales.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-900/5 p-16 text-center">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-blue-50">
                  <Receipt className="w-14 h-14 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {latinToCyrillic("Hozircha sotuvlar yo'q")}
                </h3>
                <p className="text-base text-slate-500 mb-8 max-w-md mx-auto">
                  {latinToCyrillic("Birinchi sotuvni yaratish uchun quyidagi tugmani bosing")}
                </p>
                <button
                  onClick={() => navigate('/cashier/sales/add')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold text-base transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  {latinToCyrillic("Yangi Sotuv")}
                </button>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-900/5 p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-xl font-medium text-slate-600">{latinToCyrillic("Qidiruv bo'yicha natija topilmadi")}</p>
                <p className="text-sm text-slate-400 mt-2">{latinToCyrillic("Boshqa so'z bilan qidirib ko'ring")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSales.map((sale: any, index: number) => (
                  <div 
                    key={sale.id} 
                    className="group relative bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 hover:-translate-y-2 border border-slate-100/50 overflow-hidden"
                  >
                    {/* Status belgisi va ID - Premium */}
                    <div className="relative flex items-center justify-between mb-5">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${
                        sale.debtAmount > 0
                          ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white shadow-rose-500/30'
                          : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-emerald-500/30'
                      }`}>
                        {sale.debtAmount > 0 ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            {latinToCyrillic("Qarz")}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            {latinToCyrillic("To'langan")}
                          </>
                        )}
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
                        #{sale.id.slice(0, 6).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Sana va vaqt - Enhanced */}
                    <div className="flex items-center gap-2 mb-5 text-slate-500 bg-slate-50/80 px-3 py-2 rounded-xl w-fit">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-semibold">{formatDateTime(sale.createdAt)}</p>
                    </div>
                    
                    {/* Mijoz ma'lumoti */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl mb-4 border border-slate-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{sale.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{latinToCyrillic("Mijoz")}</p>
                      </div>
                    </div>
                    
                    {/* Moliyaviy ma'lumotlar */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-600 font-medium mb-1">{latinToCyrillic("Jami summa")}</p>
                        <p className="text-lg font-bold text-slate-900">
                          ${sale.totalAmount?.toFixed(0) || '0'}
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border border-emerald-100">
                        <p className="text-xs text-emerald-600 font-medium mb-1">{latinToCyrillic("To'langan")}</p>
                        <p className="text-lg font-bold text-slate-900">
                          ${sale.paidAmount?.toFixed(0) || '0'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Qarz ma'lumoti */}
                    {sale.debtAmount > 0 && (
                      <div className="p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl mb-4 border border-rose-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {latinToCyrillic("Qarz")}
                          </span>
                          <span className="text-lg font-bold text-rose-600">
                            ${sale.debtAmount?.toFixed(0) || '0'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Mahsulotlar soni */}
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-slate-50 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-medium text-slate-600">
                        {sale.items?.length || 0} {latinToCyrillic("ta mahsulot")}
                      </p>
                    </div>
                    
                    {/* Tahrirlash tugmasi */}
                    <button
                      onClick={() => navigate('/add-sale', { state: { editSale: sale } })}
                      className="w-full mb-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {latinToCyrillic("Tahrirlash")}
                    </button>
                    
                    {/* Chek tugmasi */}
                    <button
                      onClick={() => {
                        try {
                          const userStr = localStorage.getItem('user');
                          const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
                          printSimpleReceipt(sale, sale.customer, user);
                        } catch (error) {
                          console.error('Chek chiqarishda xatolik:', error);
                          alert('Chek chiqarishda xatolik yuz berdi!');
                        }
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                    >
                      <Printer className="w-4 h-4" />
                      {latinToCyrillic("Chek chiqarish")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
