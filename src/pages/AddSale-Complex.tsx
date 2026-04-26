import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  DollarSign,
  ShoppingCart,
  X,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Package,
  User,
  CheckCircle2,
  ChevronDown,
  Layers
} from 'lucide-react';
import CustomerSelector from '../components/CustomerSelector';
import api from '../lib/professionalApi';
import { latinToCyrillic } from '../lib/transliterator';
import { generateSimpleReceiptHTML } from '../lib/simpleReceiptPrinter';
import { generateImprovedReceiptHTML, convertToImprovedFormat } from '../lib/improvedReceiptPrinter';
import { formatDateTime } from '../lib/dateUtils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfessionalApi } from '../hooks/useProfessionalApi';
import { validateSale } from '../lib/professionalValidation';
import { errorHandler } from '../lib/professionalErrorHandler';
import { CurrencyUtils, DateUtils } from '../lib/professionalUtils';
import { ProfessionalButton, ProfessionalCard, ProfessionalInput } from '../components/ProfessionalComponents';
import { currencyManager, Currency, convertCurrency, formatCurrency } from '../lib/professionalCurrency';
import { accountingManager, createJournalEntry, AccountingEntryType } from '../lib/professionalAccounting';

export default function AddSale() {
  const navigate = useNavigate();
  const location = useLocation();
  const editSale = location.state?.editSale;
  const isEditMode = !!editSale;
  
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState('12500');
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500, EUR_TO_UZS: 13500 });
  const [customerSearch, setCustomerSearch] = useState('');
  const [expandedProductGroups, setExpandedProductGroups] = useState<string[]>([]);
  const [activeProductCategory, setActiveProductCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState<string | null>(null);
  const [showKomplektSelector, setShowKomplektSelector] = useState<{itemIndex: string, krishkaOptions: any[], ruchkaOptions: any[]} | null>(null);
  
  const [form, setForm] = useState<{
    customerId: string;
    customerName: string;
    items: any[];
    paidUZS: string;
    paidUSD: string;
    paidCLICK: string;
    paymentType: string;
    currency: string;
    isKocha: boolean;
    manualCustomerName: string;
    manualCustomerPhone: string;
  }>(() => {
    // Tahrirlash rejimi bo'lsa, sotuv ma'lumotlarini oldindan to'ldirish
    if (editSale) {
      return {
        customerId: editSale.customerId || '',
        customerName: editSale.customer?.name || '',
        items: (editSale.items || []).map((item: any, index: number) => ({
          productId: item.productId || item.product?.id || '',
          productName: item.product?.name || item.productName || '',
          quantity: item.quantity || 0,
          pricePerBag: item.pricePerBag || item.pricePerUnit || 0,
          pricePerBagDisplay: (item.pricePerBag || item.pricePerUnit || 0).toString(),
          pricePerPiece: (item.pricePerBag || item.pricePerUnit || 0) / (item.product?.unitsPerBag || item.unitsPerBag || 2000),
          unitsPerBag: item.product?.unitsPerBag || item.unitsPerBag || 2000,
          subtotal: item.subtotal || 0,
          warehouse: item.product?.warehouse || 'other',
          saleType: item.saleType || 'bag',
          priceMode: item.saleType === 'piece' ? 'piece' : 'bag',
          originalIndex: index
        })),
        paidUZS: (editSale.paymentDetails?.uzs || 0).toString(),
        paidUSD: (editSale.paymentDetails?.usd || 0).toString(),
        paidCLICK: (editSale.paymentDetails?.click || 0).toString(),
        paymentType: editSale.paymentType || 'cash',
        currency: editSale.currency || 'USD',
        isKocha: editSale.isKocha || false,
        manualCustomerName: editSale.manualCustomerName || '',
        manualCustomerPhone: editSale.manualCustomerPhone || ''
      };
    }
    return {
      customerId: '',
      customerName: '',
      items: [],
      paidUZS: '',
      paidUSD: '',
      paidCLICK: '',
      paymentType: 'cash',
      currency: 'USD',
      isKocha: false,
      manualCustomerName: '',
      manualCustomerPhone: ''
    };
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
    } else if (!selectedCustomer && newItem.productId) {
      // Mijoz tanlanmagan bo'lsa, mahsulotning asl narxini olish
      const selectedProduct = products.find(p => p.id === newItem.productId);
      if (selectedProduct) {
        const displayPrice = form.currency === 'UZS'
          ? (parseFloat(selectedProduct.pricePerBag) || 0) * exchangeRates.USD_TO_UZS
          : parseFloat(selectedProduct.pricePerBag) || 0;
        setNewItem(prev => ({ ...prev, pricePerBag: displayPrice.toString() }));
      }
    }
  }, [form.customerId, selectedCustomer, newItem.productId, customerPrices, products, form.currency, exchangeRates.USD_TO_UZS]);

  // Valyutani o'zgartirganda narxni avtomatik konvertatsiya qilish
  useEffect(() => {
    if (newItem.productId && newItem.pricePerBag) {
      const selectedProduct = products.find(p => p.id === newItem.productId);
      if (selectedProduct) {
        const basePrice = parseFloat(selectedProduct.pricePerBag) || 0;
        const fromCurrency = Currency.USD;
        const toCurrency = form.currency === 'UZS' ? Currency.UZS : Currency.USD;
        
        const conversion = convertCurrency(basePrice, fromCurrency, toCurrency);
        const displayPrice = conversion ? conversion.convertedAmount : basePrice;
        
        setNewItem(prev => ({ ...prev, pricePerBag: displayPrice.toString() }));
      }
    }
  }, [form.currency, newItem.productId, products]);

  useEffect(() => {
    const { execute: loadProducts } = useProfessionalApi(
      () => api.get('/products'),
      { cache: true, cacheTTL: 300000 }
    );

    const { execute: loadCustomers } = useProfessionalApi(
      () => api.get('/customers'),
      { cache: true, cacheTTL: 300000 }
    );

    const loadData = async () => {
      try {
        const productsData = await loadProducts();
        const customersData = await loadCustomers();
        
        if (productsData) setProducts(productsData);
        if (customersData) setCustomers(customersData);
      } catch (error) {
        errorHandler.handleError(error, { action: 'loadData' });
      }
    };

    loadData();
  }, []);

  const showProductTypeSelector = (itemIndex: string) => {
    setShowTypeSelector(itemIndex);
  };

  const replaceProductType = (itemIndex: string, newType: string) => {
    const item = form.items.find(item => item.originalIndex === itemIndex);
    if (!item) return;

    // Yangi tur uchun mahsulot topish
    const newProduct = products.find(p => p.warehouse === newType);
    if (!newProduct) {
      alert(latinToCyrillic("Bu tur uchun mahsulot topilmadi!"));
      return;
    }
    // Mahsulotni yangilash
    updateItem(parseInt(itemIndex), {
      productId: newProduct.id,
      productName: newProduct.name,
      warehouse: newProduct.warehouse,
      unitsPerBag: newProduct.unitsPerBag || 2000,
      pricePerBag: newProduct.pricePerBag || 0,
      pricePerBagDisplay: (newProduct.pricePerBag || 0).toString(),
      pricePerPiece: (newProduct.pricePerBag || 0) / (newProduct.unitsPerBag || 2000)
    });

    setShowTypeSelector(null);
  };

  const showKomplektOptions = (itemIndex: string) => {
    const item = form.items.find(item => item.originalIndex === itemIndex);
    if (!item || item.warehouse !== 'preform') return;

    // Preform hajmiga qarab mos krishka va ruchkalarni topish
    const nameMatch = item.productName.match(/(\d+)/);
    const weight = nameMatch ? parseInt(nameMatch[1]) : 0;
    
    let accessorySize = item.subType || '';
    if (!accessorySize) {
      if ([15, 21, 26, 30].includes(weight)) {
        accessorySize = '28';
      } else if ([52, 70].includes(weight)) {
        accessorySize = '38';
      } else if ([75, 80, 85, 86, 175].includes(weight)) {
        accessorySize = '48';
      }
    }

    // Barcha krishka va ruchkalarni olish
    const krishkaOptions = products.filter(p => 
      (p.warehouse === 'krishka' || p.name.toLowerCase().includes('krishka')) && 
      p.active !== false
    );

    const ruchkaOptions = products.filter(p => 
      (p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka')) && 
      p.active !== false
    );

    setShowKomplektSelector({
      itemIndex,
      krishkaOptions,
      ruchkaOptions
    });
  };

  const updateKomplektItems = (selectedKrishka: any, selectedRuchka: any) => {
    if (!showKomplektSelector) return;

    const itemIndex = showKomplektSelector.itemIndex;
    const item = form.items.find(item => item.originalIndex === itemIndex);
    if (!item) return;

    const totalUnits = item.quantity * (item.unitsPerBag || 2000);

    // Krishkani yangilash
    if (selectedKrishka) {
      const krishkaIndex = form.items.findIndex(i => 
        i.warehouse === 'krishka' && 
        i.originalIndex !== itemIndex &&
        Math.abs(i.originalIndex - parseInt(itemIndex)) < 5
      );

      if (krishkaIndex >= 0) {
        const upb = Number(selectedKrishka.unitsPerBag) || 1000;
        const kPrice = Number(selectedKrishka.pricePerBag) || 0;
        const kPricePerPiece = upb > 0 ? kPrice / upb : 0;

        updateItem(krishkaIndex, {
          productId: selectedKrishka.id,
          productName: selectedKrishka.name,
          pricePerBag: kPrice,
          pricePerBagDisplay: kPrice.toString(),
          pricePerPiece: kPricePerPiece,
          unitsPerBag: upb,
          warehouse: 'krishka'
        });
      }
    }

    // Ruchkani yangilash
    if (selectedRuchka) {
      const ruchkaIndex = form.items.findIndex(i => 
        i.warehouse === 'ruchka' && 
        i.originalIndex !== itemIndex &&
        Math.abs(i.originalIndex - parseInt(itemIndex)) < 5
      );

      if (ruchkaIndex >= 0) {
        const upb = Number(selectedRuchka.unitsPerBag) || 1000;
        const rPrice = Number(selectedRuchka.pricePerBag) || 0;
        const rPricePerPiece = upb > 0 ? rPrice / upb : 0;

        updateItem(ruchkaIndex, {
          productId: selectedRuchka.id,
          productName: selectedRuchka.name,
          pricePerBag: rPrice,
          pricePerBagDisplay: rPrice.toString(),
          pricePerPiece: rPricePerPiece,
          unitsPerBag: upb,
          warehouse: 'ruchka'
        });
      }
    }

    setShowKomplektSelector(null);
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
    
    // Zaxirani tekshirish
    const currentStock = selectedProduct.currentStock || 0;
    if (quantity > currentStock) {
      alert(latinToCyrillic(`Zaxirada yetarli mahsulot yo'q! \nOmborda: ${currentStock} qop \nSotmoqchisiz: ${quantity} qop`));
      return;
    }
    
    const newItems: any[] = [{
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: quantity,
      pricePerBag: pricePerBag,
      pricePerBagDisplay: pricePerBag.toString(),
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
      
      // Dona bo'yicha zaxirani tekshirish
      const currentUnits = selectedProduct.currentUnits || (selectedProduct.currentStock || 0) * unitsPerBag;
      if (totalUnits > currentUnits) {
        alert(latinToCyrillic(`Zaxirada yetarli mahsulot yo'q! \nOmborda: ${currentUnits.toLocaleString()} dona \nSotmoqchisiz: ${totalUnits.toLocaleString()} dona`));
        return;
      }
      
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
          // Krishka zaxirasini tekshirish
          const krishkaStock = krishka.currentUnits || (krishka.currentStock || 0) * (krishka.unitsPerBag || 1);
          if (totalUnits > krishkaStock) {
            alert(latinToCyrillic(`Krishka zaxirasi yetarli emas! \nOmborda: ${krishkaStock.toLocaleString()} dona \nKerak: ${totalUnits.toLocaleString()} dona`));
            return;
          }
          
          const kPrice = krishka.pricePerPiece || 0;
          const kPricePerPiece = kPrice;
          
          newItems.push({
            productId: krishka.id,
            productName: krishka.name,
            quantity: totalUnits,
            pricePerBag: kPrice,
            pricePerBagDisplay: kPrice.toString(),
            subtotal: totalUnits * kPricePerPiece,
            saleType: 'piece',
            unitsPerBag: 1,
            warehouse: 'krishka'
          });
        }
        
        const ruchka = products.find(p => 
          (p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka')) && 
          p.name.includes(ruchkaSize) && 
          p.active !== false
        );
        
        if (ruchka) {
          // Ruchka zaxirasini tekshirish
          const ruchkaStock = ruchka.currentUnits || (ruchka.currentStock || 0) * (ruchka.unitsPerBag || 1);
          if (totalUnits > ruchkaStock) {
            alert(latinToCyrillic(`Ruchka zaxirasi yetarli emas! \nOmborda: ${ruchkaStock.toLocaleString()} dona \nKerak: ${totalUnits.toLocaleString()} dona`));
            return;
          }
          
          const rPrice = ruchka.pricePerPiece || 0;
          const rPricePerPiece = rPrice;
          
          newItems.push({
            productId: ruchka.id,
            productName: ruchka.name,
            quantity: totalUnits,
            pricePerBag: rPrice,
            pricePerBagDisplay: rPrice.toString(),
            subtotal: totalUnits * rPricePerPiece,
            saleType: 'piece',
            unitsPerBag: 1,
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

  const totalAmountInUSD = form.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Tanlangan valyutaga qarab jami summani konvertatsiya qilish
  const totalAmount = form.currency === 'UZS' 
    ? totalAmountInUSD * exchangeRates.USD_TO_UZS
    : totalAmountInUSD;
  
  // Convert amount based on selected currency
  const getDisplayAmount = (amount: number) => {
    if (form.currency === 'UZS') {
      // UZS da qiymatlar allaqachon so'm da saqlangan
      return Math.round(amount).toString();
    }
    // USD da 2 xonali kasr
    return amount.toFixed(2);
  };
  
  const getCurrencySymbol = () => form.currency === 'UZS' ? 'UZS' : '$';
  
  const calculatePaidInSelectedCurrency = () => {
    const paidUZS = parseFloat(form.paidUZS) || 0;
    const paidUSD = parseFloat(form.paidUSD) || 0;
    const paidCLICK = parseFloat(form.paidCLICK) || 0;
    
    if (form.currency === 'UZS') {
      // UZS da hamma to'lovlar so'mda qo'shiladi
      return paidUZS + paidCLICK + (paidUSD * exchangeRates.USD_TO_UZS);
    }
    // USD da dollar sifatida yig'iladi
    return paidUSD + (paidUZS / exchangeRates.USD_TO_UZS) + (paidCLICK / exchangeRates.USD_TO_UZS);
  };
  
  const paidAmount = calculatePaidInSelectedCurrency();
  const debtAmount = totalAmount - paidAmount;

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

      // Valyuta konvertatsiyasi uchun
      const isUZS = sale?.currency === 'UZS';
      // Valyutani o'zgartirmasdan, shu valyutada qoldirish
      const convertAmount = (amount: number) => amount;

      // Ensure items have correct structure
      const receiptItems = (sale?.items || []).map((item: any) => {
        // Try multiple possible field names for product name
        // Server returns: item.product?.name (from Prisma relation)
        const productName = item?.product?.name || item?.productName || item?.name || 'Noma\'lum';
        
        const isPieceSale = item?.saleType === 'piece';
        const pricePerBag = item?.pricePerBag || item?.pricePerUnit || 0;
        const unitsPerBag = item?.product?.unitsPerBag || item?.unitsPerBag || item?.piecesPerBag || 2000;
        const pricePerPiece = pricePerBag / unitsPerBag;
        
        return {
          name: productName,
          quantity: item?.quantity || 0,
          unit: isPieceSale ? 'dona' : 'qop',
          piecesPerBag: unitsPerBag,
          pricePerUnit: isPieceSale ? convertAmount(pricePerPiece) : convertAmount(pricePerBag),
          subtotal: convertAmount(item?.subtotal || 0)
        };
      });

      // Mijoz balansini valyutaga qarab hisoblash
      const oldDebtUZS = customer?.debtUZS || 0;
      const oldDebtUSD = customer?.debtUSD || 0;
      const newDebt = sale?.debtAmount || 0;
      
      // Yangi balansni hisoblash
      let newBalanceUZS = oldDebtUZS;
      let newBalanceUSD = oldDebtUSD;
      
      if (isUZS) {
        // UZS savdo - so'mga qo'shiladi
        newBalanceUZS = oldDebtUZS + newDebt;
      } else {
        // USD savdo - dollarga qo'shiladi
        newBalanceUSD = oldDebtUSD + newDebt;
      }

      const receiptData = {
        saleId: sale?.id || 'N/A',
        receiptNumber: sale?.receiptNumber?.toString() || sale?.id?.slice(0, 8)?.toUpperCase() || 'N/A',
        date: dateStr,
        time: timeStr,
        cashier: user?.name || 'Kassir',
        currency: sale?.currency || 'UZS',
        customer: {
          name: sale?.manualCustomerName || customer?.name || 'Noma\'lum',
          phone: sale?.manualCustomerPhone || customer?.phone || '',
          address: customer?.address || '',
          previousBalanceUZS: oldDebtUZS,
          previousBalanceUSD: oldDebtUSD,
          newBalanceUZS: newBalanceUZS,
          newBalanceUSD: newBalanceUSD
        },
        items: receiptItems,
        subtotal: convertAmount(sale?.totalAmount || 0),
        total: convertAmount(sale?.totalAmount || 0),
        totalPaid: convertAmount(sale?.paidAmount || 0),
        debt: convertAmount(newDebt),
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

      // Use improved receipt printer for better design and accuracy
      const improvedReceiptData = convertToImprovedFormat(receiptData, parseFloat(exchangeRate) || 12500);
      const receiptHTML = generateImprovedReceiptHTML(improvedReceiptData);
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
    
    // Professional validation
    const saleData = {
      customerId: form.isKocha ? null : form.customerId,
      items: form.items,
      totalAmount: totalAmountInUSD,
      currency: form.currency,
      isKocha: form.isKocha,
      manualCustomerName: form.isKocha ? form.manualCustomerName : null,
      manualCustomerPhone: form.isKocha ? form.manualCustomerPhone : null
    };
    
    const validation = validateSale(saleData);
    
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join('\n');
      alert(latinToCyrillic(errorMessages));
      return;
    }
    
    try {
      // Tanlangan valyutaga qarab to'lovni hisoblash
      const totalPaid = calculatePaidInSelectedCurrency();
      
      const debt = totalAmount - totalPaid;
      
      const saleData: any = {
        customerId: form.isKocha ? null : form.customerId,
        items: form.items.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity) || 0,
          pricePerBag: parseFloat(item.pricePerBag) || 0,
          subtotal: parseFloat(item.subtotal) || 0
        })),
        totalAmount: totalAmountInUSD, // Serverga har doim USD da yuboramiz
        paidAmount: totalPaid,
        debtAmount: debt > 0 ? debt : 0,
        paymentDetails: {
          uzs: form.paidUZS,
          usd: form.paidUSD,
          click: form.paidCLICK
        },
        currency: form.currency,
        isKocha: form.isKocha,
        manualCustomerName: form.isKocha ? form.manualCustomerName : null,
        manualCustomerPhone: form.isKocha ? form.manualCustomerPhone : null
      };
      
      // Tahrirlash rejimida saleId qo'shish
      if (isEditMode && editSale?.id) {
        saleData.saleId = editSale.id;
      }
      
      // Tahrirlash rejimi bo'lsa PUT, aks holda POST
      try {
        const response = isEditMode 
          ? await api.put(`/sales/${editSale.id}`, saleData)
          : await api.post('/sales', saleData);
        const createdSale = response.data;
        
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { name: 'Kassir' };
        
        // Ko'cha savdoda manual mijoz ma'lumotlarini yaratish
        const saleWithCustomer = {
          ...createdSale,
          manualCustomerName: form.manualCustomerName,
          manualCustomerPhone: form.manualCustomerPhone
        };
        
        // Serverdan kelgan yangilangan mijoz ma'lumotlarini olish
        let updatedCustomer = null;
        if (!form.isKocha && form.customerId) {
          try {
            const customerResponse = await api.get(`/customers/${form.customerId}`);
            updatedCustomer = customerResponse.data;
          } catch (error) {
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
        
        printSimpleReceipt(saleWithCustomer, customerForReceipt, user);
        
        // Kassa balansini yangilash
        try {
          const paidUZS = parseFloat(form.paidUZS) || 0;
          const paidUSD = parseFloat(form.paidUSD) || 0;
          const paidCLICK = parseFloat(form.paidCLICK) || 0;
          
          // Har bir valyutani alohida kassaga qo'shish
          if (paidUZS > 0) {
            await api.post('/cashbox/transactions', {
              type: 'sale',
              amount: paidUZS,
              currency: 'UZS',
              paymentDetails: { uzs: paidUZS, usd: 0, click: 0 },
              description: `Sotuv: ${form.items.length} mahsulot (UZS)`,
              saleId: createdSale.id
            });
          }
          
          if (paidUSD > 0) {
            await api.post('/cashbox/transactions', {
              type: 'sale',
              amount: paidUSD,
              currency: 'USD',
              paymentDetails: { uzs: 0, usd: paidUSD, click: 0 },
              description: `Sotuv: ${form.items.length} mahsulot (USD)`,
              saleId: createdSale.id
            });
          }
          
          if (paidCLICK > 0) {
            await api.post('/cashbox/transactions', {
              type: 'sale',
              amount: paidCLICK,
              currency: 'UZS',
              paymentDetails: { uzs: 0, usd: 0, click: paidCLICK },
              description: `Sotuv: ${form.items.length} mahsulot (CLICK)`,
              saleId: createdSale.id
            });
          }
          
        } catch (cashboxError) {
          errorHandler.handleError(cashboxError, { action: 'updateCashbox', saleId: createdSale.id });
        }
        
        // Mijoz ro'yxatini yangilash
        if (!form.isKocha && updatedCustomer) {
          setCustomers(prev => {
            const updated = prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
            return updated;
          });
        }
        
        navigate('/cashier/sales');
      } catch (error: any) {
        const professionalError = errorHandler.handleError(error, { 
          action: isEditMode ? 'updateSale' : 'createSale',
          isEditMode,
          saleId: editSale?.id
        });
        
        const errorMsg = professionalError.userMessage || professionalError.message;
        alert(isEditMode ? 'Sotuvni tahrirlashda xatolik: ' + errorMsg : 'Sotuvni yaratishda xatolik: ' + errorMsg);
      }
    } catch (validationError) {
      errorHandler.handleError(validationError, { action: 'validation' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/cashier/sales')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl font-medium text-sm text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {latinToCyrillic("Orqaga")}
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {isEditMode ? latinToCyrillic("Sotuvni Tahrirlash") : latinToCyrillic("Yangi Sotuv")}
              </h1>
              <p className="text-xs text-gray-500">
                {form.items.length} {latinToCyrillic("ta mahsulot tanlandi")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, currency: 'UZS' }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.currency === 'UZS'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                UZS
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, currency: 'USD' }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.currency === 'USD'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                $
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1-USTUN: Mahsulotlar */}
                <div className="space-y-5 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{latinToCyrillic("Mahsulotlar")}</h2>
                      <p className="text-sm text-gray-500">{form.items.length} {latinToCyrillic("tanlandi")}</p>
                    </div>
                  </div>

                  {selectedCustomer && (
                    <ProfessionalButton
                      type="button"
                      variant="outline"
                      onClick={() => setShowPriceModal(true)}
                      className="w-full text-blue-600 hover:bg-blue-50 border-blue-200 py-3 rounded-lg font-medium text-sm transition-all"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {latinToCyrillic("Narx Belgilash")}
                    </ProfessionalButton>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
                        <label className="text-sm font-medium text-gray-700">{latinToCyrillic("Kategoriya")}</label>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1 p-1 bg-gray-100 rounded-lg">
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
                            className={`py-2 px-1 rounded-md text-sm font-medium transition-all ${
                              activeProductCategory === cat.id 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'bg-transparent text-gray-600 hover:bg-white'
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
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 rotate-180' : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600'}`}>
                                    <ChevronDown className="w-5 h-5" />
                                  </div>
                                </button>
                                
                                <div className={`${isExpanded ? 'block' : 'hidden'}`}>
                                  <div className="p-2 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                    {groupProducts.map((product) => (
                                      <div
                                        key={product.id}
                                        onClick={() => {
                                          // UZS da narxni so'm da ko'rsatish
                                          const displayPrice = form.currency === 'UZS'
                                            ? (parseFloat(product.pricePerBag) || 0) * exchangeRates.USD_TO_UZS
                                            : parseFloat(product.pricePerBag) || 0;
                                          setNewItem({
                                            productId: product.id,
                                            productName: product.name,
                                            quantity: '1',
                                            pricePerBag: displayPrice.toString()
                                          });
                                        }}
                                        className={`group relative p-4 rounded-2xl cursor-pointer text-sm transition-all duration-300 overflow-hidden ${
                                          newItem.productId === product.id
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                                            : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5'
                                        }`}
                                      >
                                        {/* Selected indicator */}
                                        {newItem.productId === product.id && (
                                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                          </div>
                                        )}

                                        <div className="flex justify-between items-start pr-8">
                                          <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                              newItem.productId === product.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white'
                                            } transition-all duration-300`}>
                                              <Package className="w-4 h-4" />
                                            </div>
                                            <span className={`font-bold truncate pr-2 max-w-[140px] ${
                                              newItem.productId === product.id ? 'text-blue-900' : 'text-gray-800 dark:text-gray-200'
                                            }`}>{product.name}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                          <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">{latinToCyrillic("Narx")}</span>
                                            <span className={`font-bold text-base ${
                                              newItem.productId === product.id ? 'text-blue-600' : 'text-emerald-600'
                                            }`}>{getCurrencySymbol()}{getDisplayAmount(parseFloat(product.pricePerBag) || 0)}</span>
                                          </div>
                                          <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">{latinToCyrillic("Zaxira")}</span>
                                            <div className="flex items-center gap-1">
                                              <span className={`font-semibold ${
                                                (product.currentStock || 0) > 10 ? 'text-gray-600' : 'text-amber-600'
                                              }`}>{product.currentStock || 0} {latinToCyrillic("qop")}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">({((product.currentStock || 0) * (product.unitsPerBag || 2000)).toLocaleString()} {latinToCyrillic("dona")})</span>
                                          </div>
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
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm text-blue-600 font-medium mb-1">{latinToCyrillic("Tanlangan")}</div>
                          <div className="font-medium text-gray-800 truncate">{newItem.productName}</div>
                          <div className="text-sm text-blue-600 font-medium">{getCurrencySymbol()}{newItem.pricePerBag} / {latinToCyrillic("qop")}</div>
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
                          className="w-full h-12 px-4 text-base font-semibold rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 uppercase">{latinToCyrillic("Narx")} ({getCurrencySymbol()}/{latinToCyrillic("qop")})</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder={form.currency === 'UZS' ? "0" : "0.00"}
                          value={newItem.pricePerBag}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            setNewItem(prev => ({ ...prev, pricePerBag: val }));
                          }}
                          className="w-full h-12 px-4 text-base font-semibold rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        />
                      </div>
                    </div>

                    <ProfessionalButton
                      type="button"
                      onClick={addProduct}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-medium text-sm transition-all"
                      disabled={!newItem.productId || !newItem.quantity}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {latinToCyrillic("Qo'shish")}
                    </ProfessionalButton>
                  </div>
                </div>

                {/* 2-USTUN: Savat */}
                <div className="space-y-5 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{latinToCyrillic("Savat")}</h2>
                      <p className="text-sm text-gray-500">{form.items.length} {latinToCyrillic("ta mahsulot")}</p>
                    </div>
                  </div>
                  
                  {form.items.length > 0 && (
                    <div className="space-y-4">
                      {/* Savat Summary - Simplified */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-gray-900 dark:text-white">{latinToCyrillic("Savat")}</h3>
                          <button 
                            type="button" 
                            onClick={() => setForm(prev => ({ ...prev, items: [] }))} 
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            {latinToCyrillic("Tozalash")}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">{latinToCyrillic("Dona")}</div>
                            <div className="font-bold text-gray-900 dark:text-white">{form.items.reduce((sum, item) => sum + (item.quantity * (item.unitsPerBag || 2000)), 0).toLocaleString()}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">{latinToCyrillic("Narx")}</div>
                            <div className="font-bold text-gray-900 dark:text-white">{getCurrencySymbol()}{form.items.length > 0 ? getDisplayAmount(form.items.reduce((sum, item) => sum + item.subtotal, 0) / form.items.reduce((sum, item) => sum + item.quantity, 0)) : '0.00'}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">{latinToCyrillic("Jami")}</div>
                            <div className="font-bold text-blue-600">{getCurrencySymbol()}{getDisplayAmount(totalAmount)}</div>
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
                            
                            if (isPreform) {
                              const preformQtyInPieces = item.quantity * (item.unitsPerBag || 2000);

                              // 26g preformmi tekshirish
                              const is26gPreform = nameLower.includes('26g') ||
                                                   nameLower.includes('26г') ||
                                                   nameLower.includes('26 g');

                              const krishkaIndex = items.findIndex((i, idx) =>
                                !usedIndices.has(idx) && idx !== index &&
                                (i.productName.toLowerCase().includes('krishka') ||
                                 i.productName.toLowerCase().includes('крышка') ||
                                 i.productName.toLowerCase().includes('galuboy') ||
                                 i.productName.toLowerCase().includes('голубой')) &&
                                i.quantity === preformQtyInPieces
                              );

                              // 26g preform uchun ruchka kerak emas, faqat preform + krishka
                              if (is26gPreform) {
                                if (krishkaIndex !== -1) {
                                  komplekts.push({
                                    type: 'komplekt-26g',
                                    preform: { ...item, originalIndex: index },
                                    krishka: { ...items[krishkaIndex], originalIndex: krishkaIndex },
                                    ruchka: null,
                                    totalSubtotal: item.subtotal + items[krishkaIndex].subtotal
                                  });
                                  usedIndices.add(index);
                                  usedIndices.add(krishkaIndex);
                                }
                              } else {
                                // Oddiy preform uchun 3 ta komplekt (preform + krishka + ruchka)
                                const ruchkaIndex = items.findIndex((i, idx) =>
                                  !usedIndices.has(idx) && idx !== index && idx !== krishkaIndex &&
                                  (i.productName.toLowerCase().includes('ruchka') ||
                                   i.productName.toLowerCase().includes('ручка') ||
                                   i.productName.toLowerCase().includes('qora') ||
                                   i.productName.toLowerCase().includes('черная')) &&
                                  i.quantity === preformQtyInPieces
                                );

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
                            }
                          );
                          
                          const remainingItems = items.map((item, index) => ({ ...item, originalIndex: index }))
                            .filter((_, index) => !usedIndices.has(index));
                          
                          return (
                            <>
                              {/* Komplekt kartalar - Simplified */}
                              {komplekts.map((komplekt, idx) => (
                                <div key={`komplekt-${idx}`} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 shadow-sm hover:shadow-md transition-all duration-300">
                                  {/* Header */}
                                  <div className="bg-gray-700 p-4">
                                    <div className="flex justify-between items-center relative">
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                                          <Package className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                          <h4 className="font-bold text-white text-base tracking-wide">{latinToCyrillic("Komplekt")}</h4>
                                          <p className="text-indigo-100 text-xs font-medium">{komplekt.preform.quantity} {latinToCyrillic("qop")} {komplekt.ruchka ? '× 3' : '× 2'} (Preform + Krishka{komplekt.ruchka ? ' + Ruchka' : ''})</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-bold text-white text-xl">{getCurrencySymbol()}{getDisplayAmount(komplekt.totalSubtotal)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="p-4 space-y-3">
                                    {/* Preform, Krishka, Ruchka - premium cards */}
                                    <div className="space-y-3">
                                      {/* Preform - Card */}
                                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                                              <span className="text-white text-xs font-bold">P</span>
                                            </div>
                                            <span className="font-bold text-gray-800 text-sm">{komplekt.preform.productName}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeProduct(komplekt.preform.originalIndex)}
                                            className="w-7 h-7 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                                            aria-label="Remove product"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <select
                                          value={komplekt.preform.productId}
                                          aria-label="Select preform product"
                                          onChange={(e) => {
                                            const newProduct = products.find(p => p.id === e.target.value);
                                            if (newProduct) {
                                              const upb = newProduct.unitsPerBag || 2000;
                                              const oldQty = komplekt.preform.quantity;
                                              const newPrice = newProduct.pricePerBag || 0;
                                              updateItem(komplekt.preform.originalIndex, {
                                                productId: newProduct.id,
                                                productName: newProduct.name,
                                                pricePerBag: newPrice,
                                                pricePerBagDisplay: newPrice.toString(),
                                                pricePerPiece: newPrice / upb,
                                                unitsPerBag: upb,
                                                subtotal: oldQty * newPrice
                                              });
                                            }
                                          }}
                                          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white w-full mb-3 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none font-medium"
                                        >
                                          {products.filter(p => p.warehouse === 'preform' || p.name.toLowerCase().includes('g')).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                          ))}
                                        </select>
                                        <div className="flex gap-2 mb-3 p-1 bg-white rounded-lg">
                                          <button
                                            type="button"
                                            onClick={() => { 
                                              const upb = komplekt.preform.unitsPerBag || 2000; 
                                              const currentPricePerPiece = komplekt.preform.pricePerPiece || komplekt.preform.pricePerBag / upb; 
                                              const newPricePerBag = currentPricePerPiece * upb;
                                              updateItem(komplekt.preform.originalIndex, { 
                                                priceMode: 'bag', 
                                                pricePerBag: newPricePerBag, 
                                                pricePerBagDisplay: newPricePerBag.toString(),
                                                pricePerPiece: currentPricePerPiece 
                                              }); 
                                            }}
                                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-lg transition-all ${!komplekt.preform.priceMode || komplekt.preform.priceMode === 'bag' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                          >
                                            {latinToCyrillic("Qop")}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => { 
                                              const upb = komplekt.preform.unitsPerBag || 2000; 
                                              const currentPricePerBag = komplekt.preform.pricePerBag || 0;
                                              const newPricePerPiece = currentPricePerBag / upb;
                                              updateItem(komplekt.preform.originalIndex, { 
                                                priceMode: 'piece', 
                                                pricePerPiece: newPricePerPiece, 
                                                pricePerBag: currentPricePerBag,
                                                pricePerBagDisplay: newPricePerPiece.toString()
                                              }); 
                                            }}
                                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-lg transition-all ${komplekt.preform.priceMode === 'piece' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                          >
                                            {latinToCyrillic("Dona")}
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                          <div>
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">{latinToCyrillic("Miqdor")}</label>
                                            <input type="text" inputMode="decimal" value={String(komplekt.preform.quantity ?? '')} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.preform.unitsPerBag || 2000; const price = komplekt.preform.priceMode === 'piece' ? (komplekt.preform.pricePerPiece || komplekt.preform.pricePerBag / upb) : komplekt.preform.pricePerBag; updateItem(komplekt.preform.originalIndex, { quantity: v, subtotal: komplekt.preform.priceMode === 'piece' ? v * upb * price : v * price }); }} className="w-full h-9 px-3 text-sm font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white" placeholder="0" />
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">{latinToCyrillic("Narx")}</label>
                                            <input type="text" inputMode="decimal" value={komplekt.preform.pricePerBagDisplay ?? komplekt.preform.pricePerBag} onChange={(e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); const v = parseFloat(val) || 0; const upb = komplekt.preform.unitsPerBag || 2000; if (!komplekt.preform.priceMode || komplekt.preform.priceMode === 'bag') { updateItem(komplekt.preform.originalIndex, { pricePerBag: v, pricePerBagDisplay: val, pricePerPiece: v / upb, subtotal: komplekt.preform.quantity * v }); } else { updateItem(komplekt.preform.originalIndex, { pricePerPiece: v, pricePerBag: v * upb, pricePerBagDisplay: val, subtotal: komplekt.preform.quantity * upb * v }); } }} onBlur={(e) => { const v = parseFloat(e.target.value) || 0; updateItem(komplekt.preform.originalIndex, { pricePerBagDisplay: v.toString() }); }} className="w-full h-9 px-3 text-sm font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white" placeholder="0" />
                                          </div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-700 text-right bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">{getCurrencySymbol()}{getDisplayAmount(komplekt.preform.subtotal)}</div>
                                      </div>
                                      {/* Krishka - Card */}
                                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                                              <span className="text-white text-xs font-bold">K</span>
                                            </div>
                                            <span className="font-bold text-gray-800 text-sm">{komplekt.krishka.productName}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeProduct(komplekt.krishka.originalIndex)}
                                            className="w-7 h-7 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                                            aria-label="Remove krishka product"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <select
                                          aria-label="Select krishka product"
                                          value={komplekt.krishka.productId}
                                          onChange={(e) => {
                                            const newProduct = products.find(p => p.id === e.target.value);
                                            if (newProduct) {
                                              const upb = newProduct.unitsPerBag || 1000;
                                              const oldQty = komplekt.krishka.quantity;
                                              const newPrice = newProduct.pricePerBag || 0;
                                              updateItem(komplekt.krishka.originalIndex, {
                                                productId: newProduct.id,
                                                productName: newProduct.name,
                                                pricePerBag: newPrice,
                                                pricePerBagDisplay: newPrice.toString(),
                                                pricePerPiece: newPrice / upb,
                                                unitsPerBag: upb,
                                                subtotal: oldQty * (newPrice / upb)
                                              });
                                            }
                                          }}
                                          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white w-full mb-3 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none font-medium"
                                        >
                                          {products.filter(p => p.warehouse === 'krishka' || p.name.toLowerCase().includes('krishka')).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                          ))}
                                        </select>
                                        <div className="flex gap-2 mb-3 p-1 bg-white rounded-lg">
                                          <button
                                            type="button"
                                            onClick={() => { 
                                              const upb = komplekt.krishka.unitsPerBag || 1000; 
                                              const currentPricePerPiece = komplekt.krishka.pricePerPiece || komplekt.krishka.pricePerBag / upb; 
                                              const newPricePerBag = currentPricePerPiece * upb;
                                              updateItem(komplekt.krishka.originalIndex, { 
                                                priceMode: 'bag', 
                                                pricePerBag: newPricePerBag, 
                                                pricePerBagDisplay: newPricePerBag.toString(),
                                                pricePerPiece: currentPricePerPiece 
                                              }); 
                                            }}
                                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-lg transition-all ${!komplekt.krishka.priceMode || komplekt.krishka.priceMode === 'bag' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                          >
                                            {latinToCyrillic("Qop")}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => { 
                                              const upb = komplekt.krishka.unitsPerBag || 1000; 
                                              const currentPricePerBag = komplekt.krishka.pricePerBag || 0;
                                              const newPricePerPiece = currentPricePerBag / upb;
                                              updateItem(komplekt.krishka.originalIndex, { 
                                                priceMode: 'piece', 
                                                pricePerPiece: newPricePerPiece, 
                                                pricePerBag: currentPricePerBag,
                                                pricePerBagDisplay: newPricePerPiece.toString()
                                              }); 
                                            }}
                                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-lg transition-all ${komplekt.krishka.priceMode === 'piece' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                          >
                                            {latinToCyrillic("Dona")}
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                          <div>
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">{latinToCyrillic("Miqdor")}</label>
                                            <input type="text" inputMode="decimal" value={String(komplekt.krishka.quantity ?? '')} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.krishka.unitsPerBag || 1000; const price = komplekt.krishka.priceMode === 'piece' ? (komplekt.krishka.pricePerPiece || komplekt.krishka.pricePerBag / upb) : komplekt.krishka.pricePerBag; updateItem(komplekt.krishka.originalIndex, { quantity: v, subtotal: komplekt.krishka.priceMode === 'piece' ? v * price : v * price }); }} className="w-full h-9 px-3 text-sm font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white" placeholder="0" />
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">{latinToCyrillic("Narx")}</label>
                                            <input type="text" inputMode="decimal" value={komplekt.krishka.pricePerBagDisplay ?? komplekt.krishka.pricePerBag} onChange={(e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); const v = parseFloat(val) || 0; const upb = komplekt.krishka.unitsPerBag || 1000; if (!komplekt.krishka.priceMode || komplekt.krishka.priceMode === 'bag') { const pricePerPiece = v / upb; updateItem(komplekt.krishka.originalIndex, { pricePerBag: v, pricePerBagDisplay: val, pricePerPiece: pricePerPiece, subtotal: komplekt.krishka.quantity * pricePerPiece }); } else { updateItem(komplekt.krishka.originalIndex, { pricePerPiece: v, pricePerBag: v * upb, pricePerBagDisplay: val, subtotal: komplekt.krishka.quantity * v }); } }} onBlur={(e) => { const v = parseFloat(e.target.value) || 0; updateItem(komplekt.krishka.originalIndex, { pricePerBagDisplay: v.toString() }); }} className="w-full h-9 px-3 text-sm font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white" placeholder="0" />
                                          </div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-700 text-right bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">{getCurrencySymbol()}{getDisplayAmount(komplekt.krishka.subtotal)}</div>
                                      </div>
                                      {/* Ruchka - Card */}
                                      {komplekt.ruchka && (
                                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                                              <span className="text-white text-xs font-bold">R</span>
                                            </div>
                                            <span className="font-bold text-gray-800 text-sm">{komplekt.ruchka.productName}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeProduct(komplekt.ruchka.originalIndex)}
                                            aria-label="Remove handle product"
                                            className="w-7 h-7 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <select
                                          aria-label="Select handle product"
                                          value={komplekt.ruchka.productId}
                                          onChange={(e) => {
                                            const newProduct = products.find(p => p.id === e.target.value);
                                            if (newProduct) {
                                              const upb = newProduct.unitsPerBag || 1000;
                                              const oldQty = komplekt.ruchka.quantity;
                                              const newPrice = newProduct.pricePerBag || 0;
                                              updateItem(komplekt.ruchka.originalIndex, {
                                                productId: newProduct.id,
                                                productName: newProduct.name,
                                                pricePerBag: newPrice,
                                                pricePerBagDisplay: newPrice.toString(),
                                                pricePerPiece: newPrice / upb,
                                                unitsPerBag: upb,
                                                subtotal: oldQty * (newPrice / upb)
                                              });
                                            }
                                          }}
                                          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white w-full mb-3 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none font-medium"
                                        >
                                          {products.filter(p => p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka')).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                          ))}
                                        </select>
                                        <div className="flex gap-2 mb-3 p-1 bg-white rounded-lg">
                                          <button
                                            type="button"
                                            onClick={() => { 
                                              const upb = komplekt.ruchka.unitsPerBag || 1000; 
                                              const currentPricePerPiece = komplekt.ruchka.pricePerPiece || komplekt.ruchka.pricePerBag / upb; 
                                              const newPricePerBag = currentPricePerPiece * upb;
                                              updateItem(komplekt.ruchka.originalIndex, { 
                                                priceMode: 'bag', 
                                                pricePerBag: newPricePerBag, 
                                                pricePerBagDisplay: newPricePerBag.toString(),
                                                pricePerPiece: currentPricePerPiece 
                                              }); 
                                            }}
                                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-lg transition-all ${!komplekt.ruchka.priceMode || komplekt.ruchka.priceMode === 'bag' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                          >
                                            {latinToCyrillic("Qop")}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => { 
                                              const upb = komplekt.ruchka.unitsPerBag || 1000; 
                                              const currentPricePerBag = komplekt.ruchka.pricePerBag || 0;
                                              const newPricePerPiece = currentPricePerBag / upb;
                                              updateItem(komplekt.ruchka.originalIndex, { 
                                                priceMode: 'piece', 
                                                pricePerPiece: newPricePerPiece, 
                                                pricePerBag: currentPricePerBag,
                                                pricePerBagDisplay: newPricePerPiece.toString()
                                              }); 
                                            }}
                                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase rounded-lg transition-all ${komplekt.ruchka.priceMode === 'piece' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                          >
                                            {latinToCyrillic("Dona")}
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                          <div>
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">{latinToCyrillic("Miqdor")}</label>
                                            <input type="text" inputMode="decimal" value={String(komplekt.ruchka.quantity ?? '')} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = komplekt.ruchka.unitsPerBag || 1000; const price = komplekt.ruchka.priceMode === 'piece' ? (komplekt.ruchka.pricePerPiece || komplekt.ruchka.pricePerBag / upb) : komplekt.ruchka.pricePerBag; updateItem(komplekt.ruchka.originalIndex, { quantity: v, subtotal: komplekt.ruchka.priceMode === 'piece' ? v * price : v * price }); }} className="w-full h-9 px-3 text-sm font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white" placeholder="0" />
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">{latinToCyrillic("Narx")}</label>
                                            <input type="text" inputMode="decimal" value={komplekt.ruchka.pricePerBagDisplay ?? komplekt.ruchka.pricePerBag} onChange={(e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); const v = parseFloat(val) || 0; const upb = komplekt.ruchka.unitsPerBag || 1000; if (!komplekt.ruchka.priceMode || komplekt.ruchka.priceMode === 'bag') { const pricePerPiece = v / upb; updateItem(komplekt.ruchka.originalIndex, { pricePerBag: v, pricePerBagDisplay: val, pricePerPiece: pricePerPiece, subtotal: komplekt.ruchka.quantity * pricePerPiece }); } else { updateItem(komplekt.ruchka.originalIndex, { pricePerPiece: v, pricePerBag: v * upb, pricePerBagDisplay: val, subtotal: komplekt.ruchka.quantity * v }); } }} onBlur={(e) => { const v = parseFloat(e.target.value) || 0; updateItem(komplekt.ruchka.originalIndex, { pricePerBagDisplay: v.toString() }); }} className="w-full h-9 px-3 text-sm font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white" placeholder="0" />
                                          </div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-700 text-right bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">{getCurrencySymbol()}{getDisplayAmount(komplekt.ruchka.subtotal)}</div>
                                      </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="px-4 pb-4">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const indices = komplekt.ruchka
                                          ? [komplekt.preform.originalIndex, komplekt.krishka.originalIndex, komplekt.ruchka.originalIndex].sort((a,b) => b-a)
                                          : [komplekt.preform.originalIndex, komplekt.krishka.originalIndex].sort((a,b) => b-a);
                                        setForm(prev => ({...prev, items: prev.items.filter((_,i) => !indices.includes(i))}));
                                      }}
                                      className="w-full bg-red-500 hover:bg-red-600 text-white h-11 rounded-lg font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      {latinToCyrillic("Komplektni o'chirish")}
                                    </button>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Alohida mahsulotlar */}
                              {remainingItems.map((item) => (
                                <div key={item.originalIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3 shadow-sm">
                                  {/* Header */}
                                  <div className="bg-gray-700 p-3">
                                    <div className="flex justify-between items-center relative">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                                          <Package className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                          <h4 className="font-bold text-white text-sm tracking-wide uppercase">{item.productName}</h4>
                                          <span className="text-xs text-blue-200 font-medium">{item.unitsPerBag || 2000} dona/qop</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => removeProduct(item.originalIndex)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-colors" aria-label="Mahsulotni o'chirish">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="relative">
                                          <button 
                                            type="button" 
                                            onClick={() => setExpandedDropdown(expandedDropdown === item.originalIndex ? null : item.originalIndex)}
                                            className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
                                            aria-label="Ko'proq ko'rsatish"
                                          >
                                            <ChevronDown className="w-4 h-4" />
                                          </button>
                                          
                                          {/* Dropdown menyu */}
                                          {expandedDropdown === item.originalIndex && (
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                              <div className="py-1">
                                                {item.warehouse === 'preform' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setExpandedDropdown(null);
                                                    showKomplektOptions(item.originalIndex);
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                >
                                                  <Layers className="w-4 h-4" />
                                                  {latinToCyrillic("Komplektni tahrirlash")}
                                                </button>
                                                )}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setExpandedDropdown(null);
                                                    // Mahsulot turlarini ko'rsatish
                                                    showProductTypeSelector(item.originalIndex);
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                >
                                                  <Package className="w-4 h-4" />
                                                  {latinToCyrillic("Almashtirish")}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setExpandedDropdown(null);
                                                    // Narxni yangilash logikasi
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                >
                                                  <DollarSign className="w-4 h-4" />
                                                  {latinToCyrillic("Narxni yangilash")}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setExpandedDropdown(null);
                                                    // Miqdorni o'zgartirish logikasi
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                >
                                                  <Plus className="w-4 h-4" />
                                                  {latinToCyrillic("Miqdorni o'zgartirish")}
                                                </button>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setExpandedDropdown(null);
                                                    removeProduct(item.originalIndex);
                                                  }}
                                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                  {latinToCyrillic("O'chirish")}
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 space-y-3">
                                    {/* Qop / Dona toggle buttons */}
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const upb = item.unitsPerBag || 2000;
                                          const currentPricePerPiece = item.pricePerPiece || item.pricePerBag / upb;
                                          const newPricePerBag = currentPricePerPiece * upb;
                                          updateItem(item.originalIndex, {
                                            priceMode: 'bag',
                                            pricePerBag: newPricePerBag,
                                            pricePerBagDisplay: newPricePerBag.toString(),
                                            pricePerPiece: currentPricePerPiece
                                          });
                                        }}
                                        className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                                          !item.priceMode || item.priceMode === 'bag'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {latinToCyrillic("Qop")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const upb = item.unitsPerBag || 2000;
                                          const currentPricePerBag = item.pricePerBag || 0;
                                          const newPricePerPiece = currentPricePerBag / upb;
                                          updateItem(item.originalIndex, {
                                            priceMode: 'piece',
                                            pricePerPiece: newPricePerPiece,
                                            pricePerBag: currentPricePerBag,
                                            pricePerBagDisplay: newPricePerPiece.toString()
                                          });
                                        }}
                                        className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                                          item.priceMode === 'piece'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {latinToCyrillic("Dona")}
                                      </button>
                                    </div>

                                    {/* Input fields */}
                                    <div className="grid grid-cols-4 gap-2">
                                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <label className="text-xs font-medium text-gray-500 uppercase block mb-1">{!item.priceMode || item.priceMode === 'bag' ? latinToCyrillic("Qop") : latinToCyrillic("Dona")}</label>
                                        <input type="text" inputMode="decimal" value={String(item.quantity ?? '')} onChange={(e) => { const v = parseFloat(e.target.value) || 0; const upb = item.unitsPerBag || 2000; const price = !item.priceMode || item.priceMode === 'bag' ? item.pricePerBag : (item.pricePerPiece || item.pricePerBag / upb); updateItem(item.originalIndex, { quantity: v, subtotal: v * price }); }} className="w-full h-8 px-2 text-sm font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
                                      </div>
                                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <label className="text-xs font-medium text-gray-500 uppercase block mb-1">{!item.priceMode || item.priceMode === 'bag' ? latinToCyrillic("Dona") : latinToCyrillic("Qop")}</label>
                                        <div className="h-8 flex items-center text-sm font-bold text-gray-700">{!item.priceMode || item.priceMode === 'bag' ? (item.quantity * (item.unitsPerBag || 2000)).toLocaleString() : (item.quantity / (item.unitsPerBag || 2000)).toFixed(2)}</div>
                                      </div>
                                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <label className="text-xs font-medium text-gray-500 uppercase block mb-1">{latinToCyrillic("Narx")}</label>
                                        <input type="text" inputMode="decimal" value={item.pricePerBagDisplay ?? item.pricePerBag} onChange={(e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); const v = parseFloat(val) || 0; const upb = item.unitsPerBag || 2000; if (!item.priceMode || item.priceMode === 'bag') { updateItem(item.originalIndex, { pricePerBag: v, pricePerBagDisplay: val, pricePerPiece: v / upb, subtotal: item.quantity * v }); } else { updateItem(item.originalIndex, { pricePerPiece: v, pricePerBag: v * upb, pricePerBagDisplay: val, subtotal: item.quantity * v }); } }} onBlur={(e) => { const v = parseFloat(e.target.value) || 0; updateItem(item.originalIndex, { pricePerBagDisplay: v.toString() }); }} className="w-full h-8 px-2 text-sm font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
                                      </div>
                                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                                        <label className="text-xs font-medium text-blue-600 uppercase block mb-1">{latinToCyrillic("Jami")}</label>
                                        <div className="h-8 flex items-center text-sm font-bold text-blue-700">{getCurrencySymbol()}{getDisplayAmount(item.subtotal)}</div>
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
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{latinToCyrillic("Mijoz va To'lov")}</h2>
                      <p className="text-sm text-gray-500">{latinToCyrillic("Sotuvni yakunlash")}</p>
                    </div>
                  </div>

                  {/* Mijoz tanlash - 2 qator layout */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* 1-qator: Mijoz selector */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <label className="block text-base font-bold text-gray-600 mb-2 uppercase">{latinToCyrillic("Mijoz")}</label>
                      <CustomerSelector
                        customers={customers}
                        selectedId={form.customerId}
                        onSelect={(id, name, isKocha) => setForm(prev => ({ 
                          ...prev, 
                          customerId: id, 
                          customerName: name,
                          isKocha: isKocha || false,
                          manualCustomerName: isKocha ? prev.manualCustomerName : '',
                          manualCustomerPhone: isKocha ? prev.manualCustomerPhone : ''
                        }))}
                        searchValue={customerSearch}
                        onSearchChange={setCustomerSearch}
                        manualName={form.manualCustomerName}
                        manualPhone={form.manualCustomerPhone}
                        onManualNameChange={(value) => setForm(prev => ({ ...prev, manualCustomerName: value }))}
                        onManualPhoneChange={(value) => setForm(prev => ({ ...prev, manualCustomerPhone: value }))}
                      />
                    </div>
                    
                    {/* 2-qator: Tanlangan mijoz info */}
                    {selectedCustomer && !form.isKocha && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium text-lg">
                            {selectedCustomer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{selectedCustomer.name}</h4>
                            <p className="text-sm text-blue-600">{selectedCustomer.phone}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-2 gap-2 text-center">
                          <div className="bg-white p-2 rounded-lg">
                            <div className="text-xs text-gray-500 font-medium">{latinToCyrillic("Qarz UZS")}</div>
                            <div className="text-sm font-medium text-red-600">{(selectedCustomer.debtUZS || 0).toLocaleString()} UZS</div>
                          </div>
                          <div className="bg-white p-2 rounded-lg">
                            <div className="text-xs text-gray-500 font-medium">{latinToCyrillic("Qarz USD")}</div>
                            <div className="text-sm font-medium text-red-600">${(selectedCustomer.debtUSD || 0).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Ko'cha savdo info */}
                    {form.isKocha && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white font-medium text-lg">🛣️</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">{latinToCyrillic("Ko'cha savdo")}</h4>
                            <p className="text-sm text-gray-600">{form.manualCustomerName || latinToCyrillic("Noma'lum mijoz")}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {form.items.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-lg font-semibold text-gray-700">
                        💳 {latinToCyrillic("To'lov")}
                      </label>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <div>
                          <label htmlFor="paymentType" className="block text-base font-bold text-gray-600 mb-1">{latinToCyrillic("To'lov turi")}</label>
                          <select id="paymentType" value={form.paymentType} onChange={(e) => setForm(prev => ({ ...prev, paymentType: e.target.value }))} className="w-full h-12 px-3 text-base font-bold border rounded bg-white">
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

                        <div className="bg-blue-600 text-white p-4 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{latinToCyrillic("JAMI")}:</span>
                            <span className="text-2xl font-bold">{getCurrencySymbol()}{getDisplayAmount(totalAmount)}</span>
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
                        <ProfessionalButton type="button" onClick={() => { const rate = parseFloat(exchangeRate) || 12500; const totalUZS = totalAmount * rate; setForm(prev => ({ ...prev, paidUZS: totalUZS.toFixed(0), paidUSD: totalAmount.toFixed(2) })); }} className="h-12 px-4 bg-amber-500 hover:bg-amber-600 text-white text-base font-bold">
                          UZS/$</ProfessionalButton>
                      </div>

                      <ProfessionalButton 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-lg font-semibold text-lg transition-all"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {isEditMode ? latinToCyrillic("Sotuvni saqlash") : latinToCyrillic("Sotuvni rasmiylashtirish")}
                      </ProfessionalButton>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <ProfessionalButton 
                          type="button" 
                          variant="outline" 
                          onClick={() => navigate('/cashier/sales')} 
                          className="h-14 border-red-200 text-red-600 hover:bg-red-50 font-bold text-base rounded-xl"
                        >
                          <X className="w-5 h-5 mr-2" /> {latinToCyrillic("Bekor")}
                        </ProfessionalButton>
                        <ProfessionalButton 
                          type="button" 
                          variant="outline" 
                          onClick={() => { const currentCurrency = form.currency; setForm({ customerId: '', customerName: '', items: [], paymentType: 'cash', paidUZS: '', paidUSD: '', paidCLICK: '', currency: currentCurrency, isKocha: false, manualCustomerName: '', manualCustomerPhone: '' }); setNewItem({ productId: '', productName: '', quantity: '', pricePerBag: '' }); }} 
                          className="h-14 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-base rounded-xl"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" /> {latinToCyrillic("Tozalash")}
                        </ProfessionalButton>
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
              <button type="button" onClick={() => setShowPriceModal(false)} className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 text-gray-500 hover:text-red-500" aria-label="Yopish">
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
              <ProfessionalButton type="button" variant="outline" onClick={() => setShowPriceModal(false)} className="flex-1 h-12 border-gray-200 font-bold text-base">
                {latinToCyrillic("Bekor")}
              </ProfessionalButton>
              <ProfessionalButton type="button" onClick={async () => { try { await api.put(`/customers/${selectedCustomer.id}`, { productPrices: JSON.stringify(customerPrices) }); setShowPriceModal(false); const res = await api.get('/customers'); setCustomers(res.data); } catch (err) { console.error(err); } }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12 font-bold text-base">
                {latinToCyrillic("Saqlash")}
              </ProfessionalButton>
            </div>
          </div>
        </div>
      )}

      {/* Mahsulot turi tanlash modal */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {latinToCyrillic("Mahsulot turini tanlang")}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => replaceProductType(showTypeSelector, 'preform')}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 font-medium transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">P</div>
                {latinToCyrillic("Preforma")}
              </button>
              <button
                onClick={() => replaceProductType(showTypeSelector, 'krishka')}
                className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-orange-700 font-medium transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm">K</div>
                {latinToCyrillic("Qopqoq (Krishka)")}
              </button>
              <button
                onClick={() => replaceProductType(showTypeSelector, 'ruchka')}
                className="w-full text-left px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-700 font-medium transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">R</div>
                {latinToCyrillic("Ruchka")}
              </button>
              <button
                onClick={() => replaceProductType(showTypeSelector, 'other')}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center text-white text-sm">?</div>
                {latinToCyrillic("Boshqa")}
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTypeSelector(null)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {latinToCyrillic("Bekor qilish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Komplekt tanlash modal */}
      {showKomplektSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {latinToCyrillic("Komplekt uchun krishka va ruchkani tanlang")}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Krishka tanlash */}
              <div>
                <h4 className="text-md font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs">K</div>
                  {latinToCyrillic("Qopqoq (Krishka)")}
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-orange-200 rounded-lg p-3 bg-orange-50">
                  {showKomplektSelector.krishkaOptions.map((krishka) => (
                    <label key={krishka.id} className="flex items-center gap-3 p-2 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="krishka"
                        value={krishka.id}
                        onChange={() => {
                          const ruchkaRadio = document.querySelector('input[name="ruchka"]:checked') as HTMLInputElement;
                          const ruchka = ruchkaRadio ? showKomplektSelector.ruchkaOptions.find(r => r.id === ruchkaRadio.value) : null;
                          updateKomplektItems(krishka, ruchka);
                        }}
                        className="w-4 h-4 text-orange-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{krishka.name}</div>
                        <div className="text-sm text-gray-500">
                          ${(krishka.pricePerBag || 0).toFixed(2)} / {krishka.unitsPerBag || 1000} dona
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ruchka tanlash */}
              <div>
                <h4 className="text-md font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-white text-xs">R</div>
                  {latinToCyrillic("Ruchka")}
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-emerald-200 rounded-lg p-3 bg-emerald-50">
                  {showKomplektSelector.ruchkaOptions.map((ruchka) => (
                    <label key={ruchka.id} className="flex items-center gap-3 p-2 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="ruchka"
                        value={ruchka.id}
                        onChange={() => {
                          const krishkaRadio = document.querySelector('input[name="krishka"]:checked') as HTMLInputElement;
                          const krishka = krishkaRadio ? showKomplektSelector.krishkaOptions.find(k => k.id === krishkaRadio.value) : null;
                          updateKomplektItems(krishka, ruchka);
                        }}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{ruchka.name}</div>
                        <div className="text-sm text-gray-500">
                          ${(ruchka.pricePerBag || 0).toFixed(2)} / {ruchka.unitsPerBag || 1000} dona
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowKomplektSelector(null)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {latinToCyrillic("Bekor qilish")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
