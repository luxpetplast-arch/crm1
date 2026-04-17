import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ShoppingCart,
  X,
  ArrowLeft,
  Package,
  User,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import { generateSimpleReceiptHTML, convertToSimpleFormat } from '../lib/simpleReceiptPrinter';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateSale } from '../lib/professionalValidation';
import { errorHandler } from '../lib/professionalErrorHandler';

export default function AddSale() {
  const navigate = useNavigate();
  const location = useLocation();
  const editSale = location.state?.editSale;
  const isEditMode = !!editSale;
  const orderData = location.state?.orderData; // Buyurtma ma'lumotlari
  
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState('12500');
  const [activeProductCategory, setActiveProductCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  
  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    items: [] as any[],
    paidUZS: '',
    paidUSD: '',
    paidCLICK: '',
    paymentType: 'cash',
    currency: 'USD',
    isKocha: false,
    manualCustomerName: '',
    manualCustomerPhone: ''
  });

  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    quantity: '',
    pricePerBag: '',
    saleType: 'bag',
  });

  const [customerPrices, setCustomerPrices] = useState<Record<string, string>>({});
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(0);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['15gr', '20gr', '25gr']); // Default expanded groups

  const selectedCustomer = customers.find((c: any) => c.id === form.customerId);

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
    } else if (!selectedCustomer && newItem.productId) {
      const selectedProduct = products.find((p: any) => p.id === newItem.productId);
      if (selectedProduct) {
        const displayPrice = form.currency === 'UZS'
          ? (parseFloat(selectedProduct.pricePerBag) || 0) * 12500
          : parseFloat(selectedProduct.pricePerBag) || 0;
        setNewItem(prev => ({ ...prev, pricePerBag: displayPrice.toString() }));
      }
    }
  }, [form.customerId, selectedCustomer, newItem.productId, customerPrices, products, form.currency]);

  // Buyurtma ma'lumotlarini avtomatik yuklash
  useEffect(() => {
    if (orderData) {
      console.log('Buyurtma ma\'lumotlari yuklanmoqda:', orderData);
      
      // Mijoz ma'lumotlarini o'rnatish
      if (orderData.customer) {
        setForm(prev => ({
          ...prev,
          customerId: orderData.customer.id,
          customerName: orderData.customer.name,
          isKocha: false
        }));
      }
      
      // Mahsulotlarni avtomatik qo'shish
      if (orderData.items && orderData.items.length > 0) {
        const saleItems = orderData.items.map((item: any) => {
          const product = products.find((p: any) => p.id === item.productId);
          const pricePerBag = parseFloat(item.price) || 0;
          const quantity = parseFloat(item.quantityBags) || 0;
          const subtotal = quantity * pricePerBag;
          const unitsPerBag = product?.unitsPerBag || 2000;
          
          return {
            productId: item.productId,
            productName: item.productName || product?.name || 'Noma\'lum',
            quantity: quantity,
            pricePerBag: pricePerBag,
            pricePerBagDisplay: pricePerBag.toString(),
            subtotal: subtotal,
            saleType: 'bag',
            pricePerPiece: pricePerBag / unitsPerBag,
            unitsPerBag: unitsPerBag,
            warehouse: product?.warehouse,
            subType: product?.subType
          };
        });
        
        setForm(prev => ({
          ...prev,
          items: saleItems
        }));
      }
    }
  }, [orderData, products]);

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
            // Fallback customers if API returns empty
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
          // Fallback customers if API fails
          console.log('Using fallback customers due to error...');
          setCustomers([
            { id: '1', name: 'Mijoz 1', phone: '+998901234567', address: 'Toshkent' },
            { id: '2', name: 'Mijoz 2', phone: '+998907654321', address: 'Buxoro' },
            { id: '3', name: 'Mijoz 3', phone: '+998901112233', address: 'Samarqand' },
            { id: '4', name: 'Mijoz 4', phone: '+998904445566', address: 'Farg\'ona' },
            { id: '5', name: 'Mijoz 5', phone: '+998907778899', address: 'Namangan' },
            { id: '6', name: 'Mijoz 6', phone: '+998905556677', address: 'Andijon' },
            { id: '7', name: 'Mijoz 7', phone: '+998908889900', address: 'Qashqadaryo' },
            { id: '8', name: 'Mijoz 8', phone: '+998902223344', address: 'Surxondaryo' }
          ]);
        }
      } catch (error) {
        console.error('Unexpected error loading data:', error);
        errorHandler.handleError(error, { action: 'loadData' });
        
        // Fallback customers for any error
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

  const getFilteredProducts = () => {
    if (activeProductCategory === 'all') {
      return products;
    }
    return products.filter((p: any) => 
      p.warehouse === activeProductCategory || 
      p.bagType?.toLowerCase().includes(activeProductCategory)
    );
  };

  // Mahsulot turini aniqlash (gramm yoki tur bo'yicha)
  const extractProductType = (productName: string): string => {
    const name = productName.toLowerCase();
    
    // Gramajni topish (masalan: 15gr, 20gr, 15g, 20g)
    const weightMatch = name.match(/(\d+)\s*(g|gr|gram)/i);
    if (weightMatch) {
      return `${weightMatch[1]}gr`;
    }
    
    // Agar gramaj topilmasa, mahsulot turini aniqlash
    if (name.includes('krishka') || name.includes('cap')) {
      return latinToCyrillic('Krishka');
    }
    if (name.includes('ruchka') || name.includes('handle')) {
      return latinToCyrillic('Ruchka');
    }
    if (name.includes('preform') || (name.includes('g') || name.includes('gr'))) {
      return latinToCyrillic('Preform');
    }
    
    return latinToCyrillic('Boshqa');
  };

  // Mahsulotlarni tur bo'yicha guruhlash
  const groupProducts = (products: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    products.forEach((product) => {
      const groupName = extractProductType(product.name);
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(product);
    });
    
    return groups;
  };

  // Guruhni kengaytirish/yopish
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
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
    
    const selectedProduct = products.find((p: any) => p.id === newItem.productId);
    if (!selectedProduct) {
      alert(latinToCyrillic('Mahsulot topilmadi!'));
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    const pricePerBag = parseFloat(newItem.pricePerBag) || 0;
    const unitsPerBag = selectedProduct.unitsPerBag || 2000;
    const saleType = newItem.saleType || 'bag';
    
    console.log('🔍 Mahsulot qo\'shilmoqda:', {
      productName: selectedProduct.name,
      quantity,
      pricePerBag,
      unitsPerBag,
      saleType,
      currentStock: selectedProduct.currentStock,
      currentUnits: selectedProduct.currentUnits
    });
    
    // Ombor tekshiruvi - qop yoki dona bo'yicha
    const isPieceSale = saleType === 'piece';
    const currentStock = isPieceSale ? selectedProduct.currentUnits : selectedProduct.currentStock;
    const unitLabel = isPieceSale ? 'dona' : 'qop';
    
    if (quantity > currentStock) {
      alert(latinToCyrillic(`Zaxirada yetarli mahsulot yo'q! \nOmborda: ${currentStock} ${unitLabel} \nSotmoqchisiz: ${quantity} ${unitLabel}`));
      return;
    }
    
    // Narx va subtotal hisoblash
    let pricePerPiece = pricePerBag / unitsPerBag;
    let finalSubtotal = 0;
    
    if (isPieceSale) {
      // Dona savdo: quantity - dona soni, narx - dona narxi
      finalSubtotal = quantity * pricePerPiece;
      console.log('📊 Dona savdo:', {
        quantity: `${quantity} dona`,
        pricePerPiece,
        subtotal: finalSubtotal
      });
    } else {
      // Qop savdo: quantity - qop soni, narx - qop narxi
      finalSubtotal = quantity * pricePerBag;
      console.log('📊 Qop savdo:', {
        quantity: `${quantity} qop`,
        pricePerBag,
        subtotal: finalSubtotal
      });
    }
    
    const newItemToAdd = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: quantity,
      pricePerBag: pricePerBag,
      pricePerBagDisplay: pricePerBag.toString(),
      subtotal: finalSubtotal,
      saleType: saleType,
      pricePerPiece: pricePerPiece,
      unitsPerBag: unitsPerBag,
      warehouse: selectedProduct.warehouse,
      subType: selectedProduct.subType,
      // Add missing display values for cart inputs
      bagDisplayValue: quantity.toString(),
      pieceDisplayValue: (quantity * unitsPerBag).toString(),
      totalDisplayValue: (quantity * unitsPerBag).toString(),
      priceDisplayValue: isPieceSale ? pricePerPiece.toFixed(4) : pricePerBag.toFixed(2)
    };
    
    console.log('✅ Mahsulot qo\'shildi:', newItemToAdd);
    
    setForm(prev => ({ 
      ...prev, 
      items: [...prev.items, newItemToAdd] 
    }));
    
    // Yangi qo'shilgan mahsulotni avtomatik tahrirlash rejimiga o'tkazish
    setEditingItemIndex(form.items.length);
    
    setNewItem({
      productId: '',
      productName: '',
      quantity: '',
      pricePerBag: '',
      saleType: 'bag'
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

  const totalAmountInUSD = form.items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = form.currency === 'UZS' 
    ? totalAmountInUSD * 12500
    : totalAmountInUSD;
  
  const getDisplayAmount = (amount: number) => {
    if (form.currency === 'UZS') {
      return Math.round(amount).toString();
    }
    return amount.toFixed(2);
  };
  
  const getCurrencySymbol = () => form.currency === 'UZS' ? 'UZS' : '$';
  
  const calculatePaidInSelectedCurrency = () => {
    const paidUZS = parseFloat(form.paidUZS) || 0;
    const paidUSD = parseFloat(form.paidUSD) || 0;
    const paidCLICK = parseFloat(form.paidCLICK) || 0;
    
    if (form.currency === 'UZS') {
      return paidUZS + paidCLICK + (paidUSD * 12500);
    }
    return paidUSD + (paidUZS / 12500) + (paidCLICK / 12500);
  };
  
  const paidAmount = calculatePaidInSelectedCurrency();
  const debtAmount = totalAmount - paidAmount;

  const printReceipt = (sale: any, customer: any, user: any) => {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('uz-UZ');
      const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

      // Parse payment details properly
      let paymentDetails = sale?.paymentDetails;
      if (typeof paymentDetails === 'string') {
        try {
          paymentDetails = JSON.parse(paymentDetails);
        } catch (e) {
          paymentDetails = {};
        }
      }

      // Extract items with complete product information
      const receiptItems = (sale?.items || []).map((item: any) => {
        const productName = item?.product?.name || item?.productName || item?.name || 'Noma\'lum mahsulot';
        const isPieceSale = item?.saleType === 'piece';
        const pricePerBag = parseFloat(item?.pricePerBag) || 0;
        const unitsPerBag = item?.product?.unitsPerBag || item?.unitsPerBag || item?.piecesPerBag || 2000;
        const pricePerPiece = pricePerBag / unitsPerBag;
        const quantity = parseFloat(item?.quantity) || 0;
        const subtotal = parseFloat(item?.subtotal) || 0;
        
        return {
          id: item?.id || Math.random().toString(),
          name: productName,
          quantity: quantity,
          unit: isPieceSale ? 'dona' : 'qop',
          piecesPerBag: unitsPerBag,
          pricePerBag: pricePerBag,
          pricePerPiece: pricePerPiece,
          pricePerUnit: isPieceSale ? pricePerPiece : pricePerBag,
          subtotal: subtotal,
          warehouse: item?.product?.warehouse || 'other'
        };
      });

      // Calculate debt and balances correctly
      const oldDebtUZS = customer?.debtUZS || 0;
      const oldDebtUSD = customer?.debtUSD || 0;
      const totalAmount = parseFloat(sale?.totalAmount) || 0;
      const paidAmount = parseFloat(sale?.paidAmount) || 0;
      const debtAmount = sale?.debtAmount || (totalAmount - paidAmount);
      
      let newBalanceUZS = oldDebtUZS;
      let newBalanceUSD = oldDebtUSD;
      
      // Update balances based on currency
      if (sale?.currency === 'UZS') {
        newBalanceUZS = oldDebtUZS + (debtAmount > 0 ? debtAmount : 0);
      } else {
        newBalanceUSD = oldDebtUSD + (debtAmount > 0 ? debtAmount : 0);
      }

      const receiptData = {
        saleId: sale?.id || 'N/A',
        receiptNumber: sale?.receiptNumber?.toString() || sale?.id?.slice(0, 8).toUpperCase() || 'N/A',
        date: dateStr,
        time: timeStr,
        cashier: user?.name || user?.email || 'Kassir',
        currency: sale?.currency || 'USD',
        exchangeRate: parseFloat(exchangeRate) || 12500,
        customer: {
          name: sale?.manualCustomerName || customer?.name || 'Noma\'lum',
          phone: sale?.manualCustomerPhone || customer?.phone || '',
          address: customer?.address || '',
          previousBalanceUZS: oldDebtUZS > 0 ? oldDebtUZS : undefined,
          previousBalanceUSD: oldDebtUSD > 0 ? oldDebtUSD : undefined,
          newBalanceUZS: newBalanceUZS > 0 ? newBalanceUZS : undefined,
          newBalanceUSD: newBalanceUSD > 0 ? newBalanceUSD : undefined
        },
        items: receiptItems,
        subtotal: totalAmount,
        total: totalAmount,
        totalPaid: paidAmount,
        debt: debtAmount > 0 ? debtAmount : 0,
        payments: {
          uzs: parseFloat(paymentDetails?.uzs) || 0,
          usd: parseFloat(paymentDetails?.usd) || 0,
          click: parseFloat(paymentDetails?.click) || 0
        },
        companyInfo: {
          name: 'LUX PET PLAST',
          address: 'Buxoro viloyati, Vobkent tumani',
          phone: '+998 91 414 44 58, +998 91 920 07 00'
        }
      };

      console.log('📄 Receipt data prepared:', receiptData);

      const simpleReceiptData = convertToSimpleFormat(receiptData, parseFloat(exchangeRate) || 12500);
      const receiptHTML = generateSimpleReceiptHTML(simpleReceiptData);
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
      } else {
        console.error('❌ Popup oynasi ochilmadi - brauzer bloklagan bo\'lishi mumkin');
        alert('Chek chiqarish uchun popup oynalariga ruxsat bering!');
      }
    } catch (error) {
      console.error('❌ Chek chiqarishda xatolik:', error);
      alert('Chek chiqarishda xatolik yuz berdi! Konsolni tekshiring.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 SOTUV YARATISH BOSHLANDI');
    console.log('📋 Form ma\'lumotlari:', {
      customerId: form.customerId,
      isKocha: form.isKocha,
      itemsCount: form.items.length,
      currency: form.currency,
      manualCustomerName: form.manualCustomerName,
      manualCustomerPhone: form.manualCustomerPhone
    });
    
    // User ma'lumotlarini tekshirish
    const authStorage = localStorage.getItem('auth-storage');
    const userStr = localStorage.getItem('user');
    console.log('🔐 Auth storage:', authStorage ? 'Mavjud' : 'Yo\'q');
    console.log('👤 User localStorage:', userStr ? 'Mavjud' : 'Yo\'q');
    
    if (!authStorage) {
      alert('❌ Siz tizimga kirmagansiz! Iltimos, qaytadan login qiling.');
      navigate('/login');
      return;
    }
    
    let userId = null;
    try {
      const authData = JSON.parse(authStorage);
      userId = authData?.state?.user?.id;
      console.log('✅ User ID topildi:', userId);
    } catch (e) {
      console.error('❌ Auth storage parse xatosi:', e);
      alert('❌ Autentifikatsiya xatosi! Iltimos, qaytadan login qiling.');
      navigate('/login');
      return;
    }
    
    if (!userId) {
      alert('❌ User ID topilmadi! Iltimos, qaytadan login qiling.');
      navigate('/login');
      return;
    }
    
    console.log('📦 Mahsulotlar:', form.items.map((item, idx) => ({
      index: idx,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      pricePerBag: item.pricePerBag,
      pricePerPiece: item.pricePerPiece,
      subtotal: item.subtotal,
      saleType: item.saleType
    })));
    
    const saleData = {
      customerId: form.isKocha ? null : form.customerId,
      items: form.items,
      totalAmount: totalAmountInUSD,
      currency: form.currency,
      isKocha: form.isKocha,
      manualCustomerName: form.isKocha ? form.manualCustomerName : null,
      manualCustomerPhone: form.isKocha ? form.manualCustomerPhone : null
    };
    
    console.log('✅ Validatsiya uchun ma\'lumotlar:', saleData);
    
    // Ko'chaga bo'lmasa, customerId majburiy
    if (!form.isKocha && !form.customerId) {
      console.error('❌ Mijoz tanlanmagan');
      alert(latinToCyrillic('Iltimos, mijoz tanlang yoki "Ko\'chaga" tugmasini bosing!'));
      return;
    }
    
    const validation = validateSale(saleData);
    
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join('\n');
      console.error('❌ Validatsiya xatosi:', validation.errors);
      alert(latinToCyrillic(errorMessages));
      return;
    }
    
    console.log('✅ Validatsiya muvaffaqiyatli');
    
    try {
      const totalPaid = calculatePaidInSelectedCurrency();
      const debt = totalAmount - totalPaid;
      
      console.log('💰 To\'lov hisob-kitobi:', {
        totalAmount,
        totalAmountInUSD,
        totalPaid,
        debt,
        currency: form.currency,
        paidUZS: form.paidUZS,
        paidUSD: form.paidUSD,
        paidCLICK: form.paidCLICK
      });
      
      const finalSaleData: any = {
        customerId: form.isKocha ? null : form.customerId,
        items: form.items.map((item: any) => {
          const mappedItem = {
            productId: item.productId,
            quantity: parseFloat(item.quantity) || 0,
            pricePerBag: parseFloat(item.pricePerBag) || 0,
            pricePerPiece: parseFloat(item.pricePerPiece) || 0,
            subtotal: parseFloat(item.subtotal) || 0,
            saleType: item.saleType || 'bag'
          };
          console.log(`📦 Item ${item.productName}:`, mappedItem);
          return mappedItem;
        }),
        totalAmount: totalAmountInUSD,
        paidAmount: form.currency === 'USD' ? totalPaid : totalPaid,
        paymentDetails: {
          uzs: parseFloat(form.paidUZS) || 0,
          usd: parseFloat(form.paidUSD) || 0,
          click: parseFloat(form.paidCLICK) || 0
        },
        currency: form.currency,
        paymentStatus: totalPaid >= totalAmount ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'UNPAID',
        isKocha: form.isKocha,
        manualCustomerName: form.isKocha ? form.manualCustomerName : null,
        manualCustomerPhone: form.isKocha ? form.manualCustomerPhone : null
      };
      
      if (isEditMode && editSale?.id) {
        finalSaleData.saleId = editSale.id;
      }
      
      console.log('📤 Serverga yuborilayotgan ma\'lumotlar:', JSON.stringify(finalSaleData, null, 2));
      
      const response = isEditMode 
        ? await api.put(`/sales/${editSale.id}`, finalSaleData)
        : await api.post('/sales', finalSaleData);
      
      console.log('✅ Server javobi:', response.data);
      
      const createdSale = response.data;
      
      // Kassa yangilanganini tekshirish
      const automationStatus = createdSale?.automationStatus;
      console.log('📊 Avtomatlashtirish statusi:', automationStatus);
      
      if (automationStatus && !automationStatus.cashboxUpdated) {
        console.warn('⚠️ KASSA YANGILANMADI! Sotuv yaratildi, lekin pul kassaga tushmadi.');
        const shouldAddManually = confirm(latinToCyrillic('⚠️ DIQQAT: Sotuv saqlandi, lekin pul avtomatik ravishda kassaga tushmadi!\n\nKassaga qo\'lda qo\'shilsinmi?'));
        if (shouldAddManually) {
          await addToCashboxManually(createdSale);
        }
      }
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
      
      const saleWithCustomer = {
        ...createdSale,
        manualCustomerName: form.manualCustomerName,
        manualCustomerPhone: form.manualCustomerPhone
      };
      
      let updatedCustomer = null;
      if (!form.isKocha && form.customerId) {
        try {
          const customerResponse = await api.get(`/customers/${form.customerId}`);
          updatedCustomer = customerResponse.data;
          console.log('✅ Mijoz ma\'lumotlari yangilandi:', updatedCustomer);
        } catch (error) {
          console.error('⚠️ Mijoz ma\'lumotlarini yangilashda xatolik:', error);
          errorHandler.handleError(error, { action: 'updateCustomer', customerId: form.customerId });
        }
      }
      
      const customerForReceipt = form.isKocha ? {
        name: form.manualCustomerName,
        phone: form.manualCustomerPhone,
        address: '',
        debtUZS: 0,
        debtUSD: 0
      } : (updatedCustomer || selectedCustomer);
      
      console.log('🖨️ Chek chiqarish boshlandi...');
      printReceipt(saleWithCustomer, customerForReceipt, user);
      
      console.log('✅ Sotuv muvaffaqiyatli yaratildi!');
      navigate('/cashier/sales');
    } catch (error: any) {
      console.error('❌ SOTUV YARATISHDA XATOLIK:', error);
      
      // Server xatolik xabarini olish
      const serverError = error.response?.data?.error || error.response?.data?.message || 'Noma\'lum xatolik';
      const serverDetails = error.response?.data?.details || '';
      const available = error.response?.data?.available;
      const requested = error.response?.data?.requested;
      const unit = error.response?.data?.unit;
      
      console.error('🔴 SERVER XABARI:', serverError);
      console.error('🔴 BATAFSIL:', serverDetails);
      
      // Aniq xatolik xabarini tayyorlash
      let userMessage = `❌ XATOLIK:\n\n${serverError}`;
      
      if (serverDetails) {
        userMessage += `\n\n📋 Batafsil:\n${serverDetails}`;
      }
      
      // Agar omborda mahsulot yetarli bo'lmasa
      if (available !== undefined && requested !== undefined) {
        userMessage += `\n\n📊 Omborda: ${available} ${unit || 'dona'}`;
        userMessage += `\n📊 Kerak: ${requested} ${unit || 'dona'}`;
        userMessage += `\n\n💡 YECHIM: Ombordagi mahsulot miqdorini tekshiring!`;
      }
      
      // Agar mijoz yoki user topilmasa
      if (serverError.includes('topilmadi') || serverError.includes('not found') || serverError.includes('aniqlanmadi')) {
        userMessage += '\n\n💡 YECHIM:\n1. Logout qiling\n2. Qaytadan login qiling\n3. Mijozni to\'g\'ri tanlang';
      }
      
      // Agar mijoz tanlanmagan bo'lsa
      if (serverError.includes('tanlanmagan') || serverError.includes('Mijoz')) {
        userMessage += '\n\n💡 YECHIM:\nMijoz tanlang yoki "Ko\'chaga" tugmasini bosing!';
      }
      
      alert(userMessage);
      
      errorHandler.handleError(error, { 
        action: isEditMode ? 'updateSale' : 'createSale',
        isEditMode,
        saleId: editSale?.id,
        resource: 'cashier',
        url: window.location.href
      });
    }
  };

  // Qo'lda kassaga pul qo'shish (avtomatik ishlamagan bo'lsa)
  const addToCashboxManually = async (saleData: any) => {
    try {
      const paymentDetails = saleData.paymentDetails || {};
      const transactions = [];
      
      // UZS
      if (paymentDetails.uzs > 0) {
        transactions.push({
          type: 'INCOME',
          amount: paymentDetails.uzs,
          currency: 'UZS',
          paymentMethod: 'CASH',
          description: `Sotuv #${saleData.id} - Qo'lda qo'shildi (UZS)`
        });
      }
      
      // USD
      if (paymentDetails.usd > 0) {
        transactions.push({
          type: 'INCOME',
          amount: paymentDetails.usd,
          currency: 'USD',
          paymentMethod: 'CASH',
          description: `Sotuv #${saleData.id} - Qo'lda qo'shildi (USD)`
        });
      }
      
      // CLICK
      if (paymentDetails.click > 0) {
        transactions.push({
          type: 'INCOME',
          amount: paymentDetails.click,
          currency: 'UZS',
          paymentMethod: 'CLICK',
          description: `Sotuv #${saleData.id} - Qo'lda qo'shildi (CLICK)`
        });
      }
      
      for (const transaction of transactions) {
        await api.post('/cashbox', transaction);
      }
      
      alert(latinToCyrillic('✅ Kassaga pul muvaffaqiyatli qo\'shildi!'));
      return true;
    } catch (error: any) {
      console.error('Kassaga qo\'lda qo\'shishda xatolik:', error);
      alert(latinToCyrillic(`❌ Kassaga qo\'shishda xatolik: ${error.response?.data?.error || error.message}`));
      return false;
    }
  };

  return (
    <div className="modern-bg page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="glass-card p-6 mb-8 fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/cashier/sales')}
                className="btn-gradient-primary px-5 py-3 flex items-center gap-3"
              >
                <ArrowLeft className="w-5 h-5" />
                {latinToCyrillic("Orqaga")}
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-primary mb-1">
                  {isEditMode ? latinToCyrillic("Sotuvni Tahrirlash") : latinToCyrillic("Yangi Sotuv")}
                </h1>
                <p className="text-secondary font-medium">
                  {form.items.length} {latinToCyrillic("ta mahsulot tanlandi")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="toggle-modern">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, currency: 'UZS' }))}
                  className={`toggle-option ${form.currency === 'UZS' ? 'active' : ''}`}
                >
                  UZS
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, currency: 'USD' }))}
                  className={`toggle-option ${form.currency === 'USD' ? 'active' : ''}`}
                >
                  $
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="glass-card p-8 slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Mahsulotlar ustuni */}
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-primary">{latinToCyrillic("Mahsulotlar")}</h2>
                        <p className="text-secondary">{getFilteredProducts().length} {latinToCyrillic("mahsulot")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-6 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></div>
                        <label className="text-sm font-bold text-gray-700">{latinToCyrillic("Kategoriya")}</label>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1 p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-inner">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'preform', label: 'Pre' },
                          { id: 'krishka', label: 'Kri' },
                          { id: 'ruchka', label: 'Ruc' },
                          { id: 'other', label: 'Bsh' }
                        ].map((cat) => (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setActiveProductCategory(cat.id as any)}
                            className={`py-2.5 px-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                              activeProductCategory === cat.id 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                                : 'bg-transparent text-gray-600 hover:bg-white/50'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {getFilteredProducts().length === 0 ? (
                          <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Package className="w-10 h-10 text-gray-500" />
                            </div>
                            <p className="text-gray-600 font-bold text-lg">{latinToCyrillic("Mahsulot topilmadi")}</p>
                          </div>
                        ) : (
                          (() => {
                            // Mahsulotlarni turlari bo'yicha alohida guruhlash
                            const preformProducts = getFilteredProducts().filter((p: any) => 
                              p.warehouse === 'preform' || 
                              (p.name.toLowerCase().includes('g') && !p.name.toLowerCase().includes('krishka') && !p.name.toLowerCase().includes('ruchka'))
                            );
                            const krishkaProducts = getFilteredProducts().filter((p: any) => 
                              p.warehouse === 'krishka' || p.name.toLowerCase().includes('krishka') || p.name.toLowerCase().includes('cap')
                            );
                            const ruchkaProducts = getFilteredProducts().filter((p: any) => 
                              p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka') || p.name.toLowerCase().includes('handle')
                            );
                            const otherProducts = getFilteredProducts().filter((p: any) => 
                              !preformProducts.includes(p) && !krishkaProducts.includes(p) && !ruchkaProducts.includes(p)
                            );

                            const renderProductSection = (title: string, productList: any[], bgColor: string, iconColor: string) => {
                              if (productList.length === 0) return null;
                              return (
                                <div key={title} className={`border-2 border-gray-200 rounded-2xl overflow-hidden ${bgColor}`}>
                                  {/* Section header */}
                                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor} text-white shadow-md`}>
                                        <Package className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
                                        <p className="text-xs text-gray-600">
                                          {productList.length} {latinToCyrillic("ta mahsulot")}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Mahsulotlar ro'yxati */}
                                  <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                                    {productList.map((product: any) => (
                                      <div
                                        key={product.id}
                                        onClick={() => {
                                          const displayPrice = form.currency === 'UZS'
                                            ? (parseFloat(product.pricePerBag) || 0) * 12500
                                            : parseFloat(product.pricePerBag) || 0;
                                          setNewItem({
                                            productId: product.id,
                                            productName: product.name,
                                            quantity: '1',
                                            pricePerBag: displayPrice.toString(),
                                            saleType: 'bag'
                                          });
                                        }}
                                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                          newItem.productId === product.id
                                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 shadow-md'
                                            : 'bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-sm'
                                        }`}
                                      >
                                        <div className="flex justify-between items-start">
                                          <span className="font-bold text-sm truncate">{product.name}</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                          <span className="text-xs text-gray-500 font-medium">
                                            {getCurrencySymbol()}{getDisplayAmount(parseFloat(product.pricePerBag) || 0)}
                                          </span>
                                          <span className="text-xs text-gray-700">
                                            {product.currentStock || 0} {latinToCyrillic("qop")}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            };

                            return (
                              <>
                                {renderProductSection(latinToCyrillic('Preformlar'), preformProducts, 'bg-blue-50/50', 'bg-blue-500')}
                                {renderProductSection(latinToCyrillic('Qopqoqlar (Krishka)'), krishkaProducts, 'bg-green-50/50', 'bg-green-500')}
                                {renderProductSection(latinToCyrillic('Ruchkalar'), ruchkaProducts, 'bg-purple-50/50', 'bg-purple-500')}
                                {otherProducts.length > 0 && renderProductSection(latinToCyrillic('Boshqa mahsulotlar'), otherProducts, 'bg-gray-50/50', 'bg-gray-500')}
                              </>
                            );
                          })()
                        )}
                      </div>
                      
                      {newItem.productName && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl shadow-md">
                          <div className="text-sm font-bold text-blue-700 mb-2">{latinToCyrillic("Tanlangan mahsulot")}</div>
                          <div className="font-bold text-gray-800 truncate text-lg">{newItem.productName}</div>
                          <div className="text-sm font-bold text-blue-600 mt-1">
                            {getCurrencySymbol()}{newItem.pricePerBag} / {latinToCyrillic("qop")}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Qop/Dona tugmalari */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                          if (selectedProduct) {
                            const currentPricePerBag = parseFloat(newItem.pricePerBag) || 0;
                            
                            setNewItem(prev => ({ 
                              ...prev, 
                              saleType: 'bag',
                              pricePerBag: currentPricePerBag.toString()
                            }));
                          }
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all ${
                          newItem.saleType === 'bag' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {latinToCyrillic("Qop")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                          if (selectedProduct) {
                            const unitsPerBag = selectedProduct.unitsPerBag || 2000;
                            const currentPricePerBag = parseFloat(newItem.pricePerBag) || 0;
                            const pricePerPiece = currentPricePerBag / unitsPerBag;
                            
                            setNewItem(prev => ({ 
                              ...prev, 
                              saleType: 'piece',
                              pricePerBag: pricePerPiece.toString()
                            }));
                          }
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all ${
                          newItem.saleType === 'piece' 
                            ? 'bg-green-500 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {latinToCyrillic("Dona")}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {latinToCyrillic("Qop")}
                        </label>
                        <input
                          type="text"
                          placeholder="0"
                          value={(() => {
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = selectedProduct?.unitsPerBag || 2000;
                            return newItem.saleType === 'piece' ? (parseFloat(newItem.quantity || '0') / unitsPerBag).toFixed(3) : newItem.quantity;
                          })()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            const bagQuantity = parseFloat(val) || 0;
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = selectedProduct?.unitsPerBag || 2000;
                            
                            if (newItem.saleType === 'piece') {
                              const pieceQuantity = bagQuantity * unitsPerBag;
                              setNewItem(prev => ({ ...prev, quantity: pieceQuantity.toString() }));
                            } else {
                              // Qop holatida faqat qop sonini o'zgartirish
                              setNewItem(prev => ({ ...prev, quantity: val }));
                            }
                          }}
                          className="w-full h-12 px-4 text-base font-bold rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {latinToCyrillic("Dona")}
                        </label>
                        <input
                          type="text"
                          value={(() => {
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = selectedProduct?.unitsPerBag || 2000;
                            return newItem.saleType === 'piece' ? (newItem.quantity || '0').toString() : (parseFloat(newItem.quantity || '0') * unitsPerBag).toString();
                          })()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            const pieceQuantity = parseFloat(val) || 0;
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = selectedProduct?.unitsPerBag || 2000;
                            
                            if (newItem.saleType === 'piece') {
                              // Dona holatida faqat dona sonini o'zgartirish
                              setNewItem(prev => ({ ...prev, quantity: val }));
                            } else {
                              // Qop holatida donani qopga aylantirish
                              const bagQuantity = pieceQuantity / unitsPerBag;
                              setNewItem(prev => ({ ...prev, quantity: bagQuantity.toString() }));
                            }
                          }}
                          className="w-full h-12 px-4 text-base font-bold rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {latinToCyrillic("Jami (dona)")}
                        </label>
                        <input
                          type="text"
                          placeholder="0"
                          value={(() => {
                            if (!newItem.productId) return '0';
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = selectedProduct?.unitsPerBag || 2000;
                            const quantity = parseFloat(newItem.quantity || '0');
                            return newItem.saleType === 'piece' ? quantity.toString() : (quantity * unitsPerBag).toString();
                          })()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            const totalPieces = parseFloat(val) || 0;
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = selectedProduct?.unitsPerBag || 2000;
                            
                            if (newItem.saleType === 'piece') {
                              // Dona holatida to'g'ridan-to'g'ri dona sonini o'zgartirish
                              setNewItem(prev => ({ ...prev, quantity: val }));
                            } else {
                              // Qop holatida jami donani qopga aylantirish
                              const bagQuantity = totalPieces / unitsPerBag;
                              setNewItem(prev => ({ ...prev, quantity: bagQuantity.toString() }));
                            }
                          }}
                          className="w-full h-12 px-4 text-base font-bold rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {latinToCyrillic("Narx")} ({getCurrencySymbol()}/{newItem.saleType === 'piece' ? latinToCyrillic("dona") : latinToCyrillic("qop")})
                        </label>
                        <input
                          type="text"
                          placeholder={form.currency === 'UZS' ? "1000" : "0.10"}
                          value={newItem.pricePerBag}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            setNewItem(prev => ({ ...prev, pricePerBag: val }));
                          }}
                          className="w-full h-12 px-4 text-base font-bold rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addProduct}
                      disabled={!newItem.productId || !newItem.quantity}
                      className={`w-full h-14 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 ${
                        !newItem.productId || !newItem.quantity
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <Plus className="w-6 h-6" />
                      {latinToCyrillic("Qo'shish")}
                    </button>
                  </div>
                </div>

                {/* Savat ustuni */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{latinToCyrillic("Savat")}</h2>
                        <p className="text-sm text-emerald-100">{form.items.length} {latinToCyrillic("ta mahsulot")}</p>
                      </div>
                    </div>
                  </div>
                  
                  {form.items.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-gray-900">{latinToCyrillic("Savat")}</h3>
                          <button 
                            type="button" 
                            onClick={() => setForm(prev => ({ ...prev, items: [] }))} 
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            {latinToCyrillic("Tozalash")}
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {form.items.map((item: any, index: number) => (
                            <div key={index} className={`bg-gray-50 p-3 rounded-lg border ${editingItemIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{item.productName}</h4>
                                  <p className="text-xs text-gray-500">{item.unitsPerBag || 2000} dona/qop</p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => removeProduct(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title={latinToCyrillic("O'chirish")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                  {/* Qop/Dona tugmalari */}
                                  <div className="flex gap-2 mb-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                        const currentPricePerBag = parseFloat(item.pricePerBag) || 0;
                                        const quantity = parseFloat(item.quantity) || 0;
                                        
                                        // If switching from piece to bag, convert price back to bag price
                                        const bagPrice = item.saleType === 'piece' ? currentPricePerBag * unitsPerBag : currentPricePerBag;
                                        const subtotal = quantity * bagPrice;
                                        const pricePerPiece = bagPrice / unitsPerBag;
                                        
                                        // Convert quantities to bag format
                                        const pieceQuantity = parseFloat(item.quantity || '0');
                                        const bagQuantity = pieceQuantity / unitsPerBag;
                                        
                                        updateItem(index, { 
                                          saleType: 'bag', 
                                          pricePerBag: bagPrice,
                                          pricePerPiece: pricePerPiece,
                                          subtotal: subtotal,
                                          quantity: bagQuantity.toString(), // Qop formatiga o'tkazish
                                          bagDisplayValue: bagQuantity.toString(), // Qop qiymatini saqlash
                                          pieceDisplayValue: pieceQuantity.toString(), // Dona qiymatini saqlash
                                          totalDisplayValue: pieceQuantity.toString(), // Jami donani saqlash
                                          priceDisplayValue: bagPrice.toFixed(2) // Narxni saqlash
                                        });
                                        console.log('Switched to bag:', { bagPrice, pricePerPiece, subtotal });
                                      }}
                                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                        item.saleType === 'bag' 
                                          ? 'bg-blue-500 text-white shadow-md' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {latinToCyrillic("Qop")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                        const currentPricePerBag = parseFloat(item.pricePerBag) || 0;
                                        const quantity = parseFloat(item.quantity) || 0;
                                        
                                        // If switching from bag to piece, convert price to piece price
                                        const bagPrice = item.saleType === 'piece' ? currentPricePerBag * unitsPerBag : currentPricePerBag;
                                        const pricePerPiece = bagPrice / unitsPerBag;
                                        const subtotal = quantity * pricePerPiece;
                                        
                                        // Convert quantities to piece format
                                        const bagQuantity = parseFloat(item.quantity || '0');
                                        const pieceQuantity = bagQuantity * unitsPerBag;
                                        
                                        updateItem(index, { 
                                          saleType: 'piece', 
                                          pricePerBag: pricePerPiece,
                                          pricePerPiece: pricePerPiece,
                                          subtotal: subtotal,
                                          quantity: pieceQuantity.toString(), // Dona formatiga o'tkazish
                                          bagDisplayValue: bagQuantity.toString(), // Qop qiymatini saqlash
                                          pieceDisplayValue: pieceQuantity.toString(), // Dona qiymatini saqlash
                                          totalDisplayValue: pieceQuantity.toString(), // Jami donani saqlash
                                          priceDisplayValue: pricePerPiece.toFixed(4) // Narxni saqlash
                                        });
                                        console.log('Switched to piece:', { bagPrice, pricePerPiece, subtotal });
                                      }}
                                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                        item.saleType === 'piece' 
                                          ? 'bg-green-500 text-white shadow-md' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {latinToCyrillic("Dona")}
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 gap-2">
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">{latinToCyrillic("Qop")}</label>
                                      <input
                                        type="text"
                                        value={item.quantity || ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9.]/g, '');
                                          const bagQuantity = parseFloat(val) || 0;
                                          let pricePerBag = parseFloat(item.pricePerBag) || 0;
                                          let subtotal = 0;
                                          let updateData: any = {};
                                          
                                          if (item.saleType === 'piece') {
                                            const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                            const pieceQuantity = bagQuantity * unitsPerBag;
                                            const pricePerPiece = parseFloat(item.pricePerPiece) || (pricePerBag / unitsPerBag);
                                            subtotal = pieceQuantity * pricePerPiece;
                                            updateData = {
                                              quantity: val,
                                              subtotal: subtotal,
                                              bagDisplayValue: val, // Qop input qiymatini saqlash
                                              totalDisplayValue: (bagQuantity * unitsPerBag).toString() // 'Jami (dona)' ni avtomatik hisoblash
                                            };
                                            console.log('Bag quantity change (piece mode):', { bagQuantity, pieceQuantity, pricePerPiece, subtotal });
                                          } else {
                                            const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                            const pieceQuantity = bagQuantity * unitsPerBag;
                                            const pricePerPiece = pricePerBag / unitsPerBag;
                                            subtotal = bagQuantity * pricePerBag;
                                            updateData = {
                                              quantity: val,
                                              subtotal: subtotal,
                                              bagDisplayValue: val, // Qop input qiymatini saqlash
                                              totalDisplayValue: (bagQuantity * unitsPerBag).toString() // 'Jami (dona)' ni avtomatik hisoblash
                                            };
                                            console.log('Bag quantity change (bag mode):', { bagQuantity, pieceQuantity, pricePerBag, pricePerPiece, subtotal });
                                          }
                                          
                                          updateItem(index, updateData);
                                        }}
                                        className="w-full h-8 px-2 text-sm font-medium border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">{latinToCyrillic("Bir qopdagi dona")}</label>
                                      <input
                                        type="text"
                                        value={item.unitsPerBag?.toString() || '2000'}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9.]/g, '');
                                          const newPiecesPerBag = parseFloat(val) || 2000;
                                          let updateData: any = {};
                                          
                                          if (item.saleType === 'piece') {
                                            // Piece mode: Update pieces per bag and recalculate
                                            const currentTotalPieces = parseFloat(item.totalDisplayValue || '0') || 0;
                                            const newBagQuantity = currentTotalPieces / newPiecesPerBag;
                                            const pricePerPiece = parseFloat(item.pricePerPiece) || 0;
                                            const subtotal = currentTotalPieces * pricePerPiece;
                                            
                                            updateData = {
                                              unitsPerBag: newPiecesPerBag,
                                              quantity: newBagQuantity.toString(),
                                              subtotal: subtotal,
                                              pieceDisplayValue: newPiecesPerBag.toString(), // Bir qopdagi dona qiymatini saqlash
                                              bagDisplayValue: newBagQuantity.toString(), // Qop sonini yangilash
                                              totalDisplayValue: currentTotalPieces.toString() // Jami donani o'zgartirmaslik
                                            };
                                            console.log('Piece mode - pieces per bag change:', { newPiecesPerBag, currentTotalPieces, newBagQuantity, subtotal });
                                          } else {
                                            // Bag mode: Update pieces per bag and recalculate total pieces
                                            const currentBags = parseFloat(item.quantity || '0') || 0;
                                            const newTotalPieces = currentBags * newPiecesPerBag;
                                            const pricePerBag = parseFloat(item.pricePerBag) || 0;
                                            const subtotal = currentBags * pricePerBag;
                                            const pricePerPiece = pricePerBag / newPiecesPerBag;
                                            
                                            updateData = {
                                              unitsPerBag: newPiecesPerBag,
                                              pricePerPiece: pricePerPiece,
                                              subtotal: subtotal,
                                              pieceDisplayValue: newPiecesPerBag.toString(), // Bir qopdagi dona qiymatini saqlash
                                              bagDisplayValue: currentBags.toString(), // Qop sonini o'zgartirmaslik
                                              totalDisplayValue: newTotalPieces.toString() // Jami donani yangilash
                                            };
                                            console.log('Bag mode - pieces per bag change:', { newPiecesPerBag, currentBags, newTotalPieces, pricePerBag, pricePerPiece, subtotal });
                                          }
                                          
                                          updateItem(index, updateData);
                                        }}
                                        className="w-full h-8 px-2 text-sm font-medium border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">{latinToCyrillic("Jami (dona)")}</label>
                                      <input
                                        type="text"
                                        value={item.totalDisplayValue || ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9.]/g, '');
                                          const totalPieces = parseFloat(val) || 0;
                                          let updateData: any = {};
                                          
                                          if (item.saleType === 'piece') {
                                            const pricePerPiece = parseFloat(item.pricePerPiece) || 0;
                                            const subtotal = totalPieces * pricePerPiece;
                                            const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                            const bagQuantity = totalPieces / unitsPerBag;
                                            updateData = {
                                              quantity: val,
                                              subtotal: subtotal,
                                              totalDisplayValue: val, // 'Jami (dona)' input qiymatini saqlash
                                              bagDisplayValue: bagQuantity.toString() // Qop sonini yangilash
                                            };
                                            console.log('Total pieces change (piece mode):', { totalPieces, pricePerPiece, subtotal, bagQuantity });
                                          } else {
                                            const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                            const bagQuantity = totalPieces / unitsPerBag;
                                            const pricePerBag = parseFloat(item.pricePerBag) || 0;
                                            const subtotal = bagQuantity * pricePerBag;
                                            const pricePerPiece = pricePerBag / unitsPerBag;
                                            updateData = {
                                              quantity: bagQuantity.toString(),
                                              subtotal: subtotal,
                                              totalDisplayValue: val, // 'Jami (dona)' input qiymatini saqlash
                                              bagDisplayValue: bagQuantity.toString() // Qop sonini yangilash
                                            };
                                            console.log('Total pieces change (bag mode):', { totalPieces, bagQuantity, pricePerBag, pricePerPiece, subtotal });
                                          }
                                          
                                          updateItem(index, updateData);
                                        }}
                                        className="w-full h-8 px-2 text-sm font-medium border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">{latinToCyrillic("Narx")}</label>
                                      <input
                                        type="text"
                                        value={item.pricePerBag?.toString() || ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9.]/g, '');
                                          const newPrice = parseFloat(val) || 0;
                                          const quantity = parseFloat(item.quantity) || 0;
                                          let subtotal = 0;
                                          let updateData: any = {};
                                          
                                          if (item.saleType === 'piece') {
                                            const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                            updateData.pricePerPiece = newPrice;
                                            updateData.pricePerBag = newPrice * unitsPerBag;
                                            updateData.priceDisplayValue = val; // Narx input qiymatini saqlash
                                            subtotal = quantity * newPrice;
                                            console.log('Piece price update:', { newPrice, unitsPerBag, pricePerBag: newPrice * unitsPerBag, subtotal });
                                          } else {
                                            updateData.pricePerBag = newPrice;
                                            const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                            updateData.pricePerPiece = newPrice / unitsPerBag;
                                            updateData.priceDisplayValue = val; // Narx input qiymatini saqlash
                                            subtotal = quantity * newPrice;
                                            console.log('Bag price update:', { newPrice, unitsPerBag, pricePerPiece: newPrice / unitsPerBag, subtotal });
                                          }
                                          
                                          updateData.subtotal = subtotal;
                                          updateItem(index, updateData);
                                        }}
                                        className="w-full h-8 px-2 text-sm font-medium border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-2">
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">{latinToCyrillic("Jami narx")}</label>
                                      <div className="w-full h-8 px-2 flex items-center bg-white border border-gray-300 rounded text-sm font-bold text-blue-600">
                                        {getCurrencySymbol()}{getDisplayAmount(item.subtotal)}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                                    <select
                                      value={item.productId}
                                      onChange={(e) => {
                                        const newProduct = products.find((p: any) => p.id === e.target.value);
                                        if (newProduct) {
                                          const upb = newProduct.unitsPerBag || 2000;
                                          const oldQty = parseFloat(item.quantity) || 0;
                                          const newPrice = newProduct.pricePerBag || 0;
                                          updateItem(index, {
                                            productId: newProduct.id,
                                            productName: newProduct.name,
                                            pricePerBag: newPrice,
                                            pricePerBagDisplay: newPrice.toString(),
                                            unitsPerBag: upb,
                                            subtotal: oldQty * newPrice,
                                            warehouse: newProduct.warehouse,
                                            subType: newProduct.subType
                                          });
                                        }
                                      }}
                                      className="flex-1 h-8 px-2 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                    >
                                      {getFilteredProducts().map((product: any) => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">{latinToCyrillic("Jami")}:</span>
                            <span className="text-xl font-bold text-blue-600">
                              {getCurrencySymbol()}{getDisplayAmount(totalAmount)}
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

                {/* Mijoz va To'lov ustuni */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{latinToCyrillic("Mijoz va To'lov")}</h2>
                        <p className="text-sm text-purple-100">{latinToCyrillic("Sotuvni yakunlash")} ({customers.length} {latinToCyrillic("ta mijoz")})</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                      <label className="text-base font-bold text-primary">
                        {latinToCyrillic("Mijoz")} ({customers.length} ta)
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <select 
                        value={form.isKocha ? 'kocha' : form.customerId}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          
                          if (selectedValue === 'kocha') {
                            // Ko'chaga tanlandi
                            console.log('✅ Ko\'chaga tanlandi');
                            setForm(prev => ({ 
                              ...prev, 
                              customerId: '',
                              customerName: '',
                              isKocha: true,
                              manualCustomerName: '',
                              manualCustomerPhone: ''
                            }));
                          } else {
                            // Oddiy mijoz tanlandi
                            const customer = customers.find(c => c.id === selectedValue);
                            console.log('✅ Mijoz tanlandi:', customer?.name, 'ID:', selectedValue);
                            setForm(prev => ({ 
                              ...prev, 
                              customerId: selectedValue, 
                              customerName: customer?.name || '',
                              isKocha: false,
                              manualCustomerName: '',
                              manualCustomerPhone: ''
                            }));
                          }
                        }}
                        className="input-modern w-full pl-12"
                      >
                        <option value="">{latinToCyrillic("Mijozni tanlang")}</option>
                        {customers.map((customer: any) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone || 'Noma\'lum'}
                          </option>
                        ))}
                        <option value="kocha">{latinToCyrillic("Ko'chaga (qo'l mijoz)")}</option>
                      </select>
                    </div>
                    
                    {form.isKocha && (
                      <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-sm font-semibold text-yellow-800">
                          {latinToCyrillic("Mijoz ma'lumotlari")}
                        </p>
                        <input
                          type="text"
                          placeholder={latinToCyrillic("Mijoz ismi")}
                          value={form.manualCustomerName}
                          onChange={(e) => setForm(prev => ({ ...prev, manualCustomerName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
                        />
                        <input
                          type="text"
                          placeholder={latinToCyrillic("Telefon raqami")}
                          value={form.manualCustomerPhone}
                          onChange={(e) => setForm(prev => ({ ...prev, manualCustomerPhone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {form.items.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-lg font-semibold text-gray-700">
                        {latinToCyrillic("To'lov")}
                      </label>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <div>
                          <label className="block text-base font-medium text-gray-600 mb-1">
                            {latinToCyrillic("To'lov turi")}
                          </label>
                          <select 
                            value={form.paymentType} 
                            onChange={(e) => setForm(prev => ({ ...prev, paymentType: e.target.value }))} 
                            className="w-full h-12 px-3 text-base font-medium border rounded-lg bg-white"
                          >
                            <option value="cash">{latinToCyrillic("Naqd")}</option>
                            <option value="debt">{latinToCyrillic("Qarz")}</option>
                            <option value="partial">{latinToCyrillic("Qisman")}</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-base text-gray-600 font-medium">UZS</label>
                            <input 
                              type="text" 
                              inputMode="decimal" 
                              placeholder="0" 
                              value={form.paidUZS} 
                              onChange={(e) => setForm(prev => ({ ...prev, paidUZS: e.target.value.replace(/[^0-9.]/g, '') }))} 
                              className="w-full h-12 px-3 text-base font-medium border rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-base text-gray-600 font-medium">USD</label>
                            <input 
                              type="text" 
                              inputMode="decimal" 
                              placeholder="0.00" 
                              value={form.paidUSD} 
                              onChange={(e) => setForm(prev => ({ ...prev, paidUSD: e.target.value.replace(/[^0-9.]/g, '') }))} 
                              className="w-full h-12 px-3 text-base font-medium border rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-base text-gray-600 font-medium">CLICK</label>
                            <input 
                              type="text" 
                              inputMode="decimal" 
                              placeholder="0" 
                              value={form.paidCLICK} 
                              onChange={(e) => setForm(prev => ({ ...prev, paidCLICK: e.target.value.replace(/[^0-9.]/g, '') }))} 
                              className="w-full h-12 px-3 text-base font-medium border rounded-lg" 
                            />
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex justify-between text-base mb-2">
                            <span className="text-gray-500">{latinToCyrillic("Qarz")}:</span>
                            <span className="font-bold text-red-600">
                              {getCurrencySymbol()}{debtAmount.toFixed(form.currency === 'UZS' ? 0 : 2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-base">
                            <span className="text-gray-500">{latinToCyrillic("To'langan")}:</span>
                            <span className="font-bold text-green-600">
                              {getCurrencySymbol()}{paidAmount.toFixed(form.currency === 'UZS' ? 0 : 2)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-blue-600 text-white p-4 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{latinToCyrillic("JAMI")}:</span>
                            <span className="text-2xl font-bold">{getCurrencySymbol()}{getDisplayAmount(totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-amber-50 p-3 rounded border border-amber-200">
                          <label className="text-base font-medium text-amber-700">{latinToCyrillic("Kurs")}:</label>
                          <input 
                            type="text" 
                            inputMode="decimal" 
                            placeholder="12500" 
                            value={exchangeRate} 
                            onChange={(e) => setExchangeRate(e.target.value.replace(/[^0-9.]/g, ''))} 
                            className="flex-1 h-12 px-3 border rounded-lg text-base" 
                          />
                          <span className="text-amber-700 font-medium">UZS/$</span>
                        </div>

                        <button
                          type="submit"
                          className="btn-gradient-primary w-full h-16 text-lg flex items-center justify-center gap-3"
                        >
                          <ShoppingCart className="w-6 h-6" />
                          {isEditMode ? latinToCyrillic("Sotuvni saqlash") : latinToCyrillic("Sotuvni rasmiylashtirish")}
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button" 
                            onClick={() => navigate('/cashier/sales')} 
                            className="btn-gradient-danger h-14 text-base flex items-center justify-center gap-2"
                          >
                            <X className="w-5 h-5" /> {latinToCyrillic("Bekor")}
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
                                currency: form.currency, 
                                isKocha: false, 
                                manualCustomerName: '', 
                                manualCustomerPhone: '' 
                              }); 
                              setNewItem({ productId: '', productName: '', quantity: '', pricePerBag: '', saleType: 'bag' }); 
                            }} 
                            className="btn-gradient-secondary h-14 text-base flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="w-5 h-5" /> {latinToCyrillic("Tozalash")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
}
