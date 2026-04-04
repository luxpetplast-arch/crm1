import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
  Plus, 
  Trash2, 
  Calculator,
  DollarSign,
  Printer,
  ShoppingCart,
  X,
  RotateCcw,
  Sparkles,
  FileText,
  User,
  Clock,
  Package
} from 'lucide-react';
import CustomerSelector from '../components/CustomerSelector';
import api from '../lib/api';
import { latinToCyrillic } from '../lib/transliterator';
import SalesHistory from '../components/SalesHistory';
import { formatDateTime } from '../lib/dateUtils';
import { generateSimpleReceiptHTML, generateDeliveryReceiptHTML } from '../lib/simpleReceiptPrinter';

export default function Sales() {
  console.log('🏪 Sales component rendering...');
  const navigate = useNavigate();
  
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [exchangeRate, setExchangeRate] = useState('12500');
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [activeTab, setActiveTab] = useState<'sales' | 'history'>('sales');
  
  // Qidiruv
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Product type grouping
  const [expandedProductGroups, setExpandedProductGroups] = useState<string[]>([]);
  const [activeProductCategory, setActiveProductCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  
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

  // Product grouping function
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
      receiptNumber: sale.receiptNumber || sale.id.slice(0, 8),
      date: formatDateTime(sale.createdAt).split(' ')[0],
      time: formatDateTime(sale.createdAt).split(' ')[1],
      cashier: user.name,
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
      receiptNumber: sale.receiptNumber || sale.id.slice(0, 8),
      date: formatDateTime(sale.createdAt).split(' ')[0],
      time: formatDateTime(sale.createdAt).split(' ')[1],
      cashier: user.name,
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
    
    // Asosiy mahsulotni qo'shish
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
    
    // Preform uchun krishka va ruchka qo'shish
    const isPreform = selectedProduct.warehouse === 'preform' || selectedProduct.name.toLowerCase().includes('g');
    
    if (isPreform) {
      const accessorySize = selectedProduct.subType || '';
      const totalUnits = quantity * unitsPerBag;
      
      // Krishka va Ruchka o'lchamlarini aniqlash
      let krishkaSize = accessorySize;
      let ruchkaSize = accessorySize;

      // Agar subType bo'lmasa, nomidan aniqlash (fallback)
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
        // Mos krishkani topish
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
            quantity: totalUnits, // Krishka donada
            pricePerBag: kPrice,
            pricePerPiece: undefined,
            subtotal: totalUnits * kPricePerPiece,
            saleType: 'piece',
            unitsPerBag: upb,
            warehouse: 'krishka'
          });
        }
        
        // Mos ruchkani topish (faqat kerak bo'lsa)
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
            quantity: totalUnits, // Ruchka donada
            pricePerBag: rPrice,
            pricePerPiece: rPricePerPiece,
            subtotal: totalUnits * rPricePerPiece,
            saleType: 'piece',
            unitsPerBag: upb,
            warehouse: 'ruchka'
          });
        }
      }
    }
    
    setForm(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
    
    // Tozalash
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
    <div className="min-h-screen w-full space-y-12 pb-20 animate-in fade-in duration-1000">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-emerald-900/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border-x border-t border-white dark:border-gray-800 rounded-b-[2rem]">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-200/10 to-orange-200/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-blue-500/25">
                <ShoppingCart className="w-3 h-3" />
                {latinToCyrillic("SAVDO VA SOTUV TIZIMI")}
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                {latinToCyrillic("Savdo")} <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">{latinToCyrillic("Bo'limi")}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md text-base leading-relaxed">
                {latinToCyrillic("Mijozlar bilan savdo jarayonlarini boshqarish va chek chiqarish")}
              </p>
            </div>
            
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              {/* Valyuta kursi - Enhanced */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-6 py-4 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 shadow-lg shadow-amber-500/10 backdrop-blur-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-600">1 USD =</span>
                  <div className="relative">
                    <Input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-28 h-10 text-base font-black text-amber-700 border-amber-300/50 bg-white/80 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      min="1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-600">UZS</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/cashier/sales/add')} 
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-500 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  {latinToCyrillic("Yangi Sotuv")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Premium Style */}
      <div className="flex p-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-x border-white dark:border-gray-800 shadow-xl rounded-2xl mx-4">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 px-8 py-4 rounded-xl font-black text-sm tracking-wider transition-all duration-500 flex items-center justify-center gap-2 ${
            activeTab === 'sales' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {latinToCyrillic("AMALDAGI SOTUVLAR")}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-8 py-4 rounded-xl font-black text-sm tracking-wider transition-all duration-500 flex items-center justify-center gap-2 ${
            activeTab === 'history' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          {latinToCyrillic("SOTUVLAR TARIXI")}
        </button>
      </div>

      {activeTab === 'history' && <SalesHistory />}

      {activeTab === 'sales' && (
        <div className="p-0 w-full">
          {/* Sotuvlar ro'yxati */}
          {sales.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 mb-4">Hozircha sotuvlar yo'q</p>
                <Button onClick={() => navigate('/cashier/sales/add')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Birinchi Sotuvni Qo'shing
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {sales.map((sale: any, index: number) => (
                  <Card key={sale.id} className="group relative overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 rounded-3xl">
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    
                    <CardHeader className="relative pb-4">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                      <CardTitle className="text-lg flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            #{index + 1}
                          </div>
                          <span className="font-black text-gray-800 dark:text-white">{sale.id.slice(0, 8)}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                          {formatDateTime(sale.createdAt)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">Mijoz:</span>
                          </div>
                          <span className="font-bold text-gray-800 dark:text-white">{sale.customer?.name || 'N/A'}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <span className="text-xs font-medium text-emerald-600 block mb-1">Jami</span>
                            <span className="text-xl font-black text-emerald-700">
                              ${sale.totalAmount?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <span className="text-xs font-medium text-blue-600 block mb-1">To'landi</span>
                            <span className="text-xl font-black text-blue-700">
                              ${sale.paidAmount?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                        
                        {sale.debtAmount > 0 && (
                          <div className="p-3 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-red-600">Qarz:</span>
                              <span className="text-lg font-black text-red-700">
                                ${sale.debtAmount?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <Package className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">
                            {sale.items?.length || 0} ta mahsulot
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2 space-y-2">
                        <Button
                          variant="outline"
                          size="lg"
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
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 border-0 font-bold"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Printer className="w-5 h-5" />
                            <span>Chekni chiqarish</span>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            try {
                              const userStr = localStorage.getItem('user');
                              const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
                              printDeliveryReceipt(sale, sale.customer, user);
                            } catch (error) {
                              console.error('Yuk xati chiqarishda xatolik:', error);
                              alert('Yuk xati chiqarishda xatolik yuz berdi!');
                            }
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 border-0 font-bold"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="w-5 h-5" />
                            <span>Yuk xatini chiqarish</span>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
