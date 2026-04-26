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
  const [productSearch, setProductSearch] = useState('');
  
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    quantity: '',
    pricePerBag: '',
    priceDisplayValue: '',
    unitsPerBag: '2000',
    saleType: 'bag',
  });

  const [customerPrices, setCustomerPrices] = useState<Record<string, string>>({});
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(0);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['15gr', '21gr']); // Default: only 15gr and 21gr expanded
  const [customerSearch, setCustomerSearch] = useState('');

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

  // Mahsulotlar ro'yxatini yangilash - har 30 sekundda bir marta
  useEffect(() => {
    const refreshProducts = async () => {
      try {
        const productsResponse = await api.get('/products');
        if (productsResponse.data) {
          setProducts(productsResponse.data);
          console.log('🔄 Mahsulotlar ro\'yxati yangilandi:', productsResponse.data?.length || 0);
        }
      } catch (error) {
        console.error('Mahsulotlarni yangilashda xatolik:', error);
      }
    };

    // Har 30 sekundda mahsulotlarni yangilash
    const interval = setInterval(refreshProducts, 30000);
    
    // Component unmount bo'lganda intervalni to'xtatish
    return () => clearInterval(interval);
  }, []);

  // Mijoz narxini yuklash - faqat mijoz o'zgarganda ishlaydi, mahsulot o'zgarganda emas
  useEffect(() => {
    // Agar mahsulot tanlanmagan bo'lsa, narxni yangilash shart emas
    if (!newItem.productId) return;
    
    // Agar mijoz tanlangan bo'lsa va mijozning maxsus narxi bo'lsa
    if (selectedCustomer) {
      const productPrice = customerPrices[newItem.productId];
      if (productPrice) {
        setNewItem(prev => ({ ...prev, pricePerBag: productPrice, priceDisplayValue: productPrice }));
      } else if (selectedCustomer.pricePerBag) {
        const price = selectedCustomer.pricePerBag.toString();
        setNewItem(prev => ({ ...prev, pricePerBag: price, priceDisplayValue: price }));
      }
    }
    // Mijoz tanlanmagan bo'lsa, ombor narxini qo'llash (mahsulot tanlanganda onClick da o'rnatiladi)
  }, [form.customerId, selectedCustomer, customerPrices]);

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

  // Valyuta o'zgarganda barcha mahsulotlarni konvertatsiya qilish
  useEffect(() => {
    const exchangeRateNum = parseFloat(exchangeRate) || 12500;
    
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        const newPricePerBag = form.currency === 'UZS' 
          ? item.pricePerBag * exchangeRateNum 
          : item.pricePerBag / exchangeRateNum;
        const newSubtotal = item.quantity * newPricePerBag;
        
        return {
          ...item,
          pricePerBag: newPricePerBag,
          pricePerPiece: newPricePerBag / (item.unitsPerBag || 2000),
          subtotal: newSubtotal
        };
      })
    }));
  }, [form.currency]);

  const getCurrencySymbol = () => form.currency === 'UZS' ? 'UZS ' : '$';

  const getDisplayAmount = (amount: number) => {
    if (form.currency === 'UZS') {
      return Math.round(amount).toString();
    }
    return amount.toFixed(2);
  };

  // Calculate totals
  const totalAmount = form.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const exchangeRateNum = parseFloat(exchangeRate) || 12500;
  const paidUZS = parseFloat(form.paidUZS) || 0;
  const paidUSD = parseFloat(form.paidUSD) || 0;
  const paidCLICK = parseFloat(form.paidCLICK) || 0;
  const paidAmount = form.currency === 'UZS' 
    ? paidUZS + (paidUSD * exchangeRateNum) + paidCLICK
    : paidUZS / exchangeRateNum + paidUSD + (paidCLICK / exchangeRateNum);
  const debtAmount = Math.max(0, totalAmount - paidAmount);

  const getFilteredProducts = () => {
    let filtered = products;
    
    // Kategoriya bo'yicha filter
    if (activeProductCategory !== 'all') {
      filtered = filtered.filter((p: any) => {
        if (activeProductCategory === 'preform') {
          return p.warehouse === 'preform' || p.name.toLowerCase().includes('gr');
        }
        if (activeProductCategory === 'krishka') {
          return p.warehouse === 'krishka' || p.name.toLowerCase().includes('krishka');
        }
        if (activeProductCategory === 'ruchka') {
          return p.warehouse === 'ruchka' || p.name.toLowerCase().includes('ruchka');
        }
        return p.warehouse !== 'preform' && p.warehouse !== 'krishka' && p.warehouse !== 'ruchka';
      });
    }
    
    // Qidiruv bo'yicha filter
    if (productSearch) {
      const search = productSearch.toLowerCase();
      filtered = filtered.filter((p: any) => 
        p.name?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  useEffect(() => {
    loadData();
    
    // Sahifa fokus bo'lganda mahsulotlarni qayta yuklash
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Sahifa fokuslandi - mahsulotlarni yangilash');
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
          // Barcha mahsulotlarni konsolga chiqarish
          console.log('📋 BARCHA MAHSULOTLAR:');
          productsResponse.data.forEach((p: any, idx: number) => {
            console.log(`${idx + 1}. ${p.name} - $${p.pricePerBag || 0} (1 qopda: ${p.unitsPerBag || 0} dona)`);
          });
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

  // ...

  // Update a specific item in the items array
  const updateItem = (index: number, updates: any) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    }));
  };

  // Remove a product from the items array
  const removeProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Add a product to the items array
  const addProduct = () => {
    if (!newItem.productId || !newItem.quantity) {
      return;
    }

    const product = products.find((p: any) => p.id === newItem.productId);
    if (!product) return;

    const quantity = parseFloat(newItem.quantity) || 0;

    // Komplekt rejimida - preform + krishka + ruchka qo'shish
    if (newItem.saleType === 'komplekt') {
      console.log('🔄 KOMPLEKT REJIMI:', product.name, 'soni:', quantity);
      
      // Maxsus narxlar funksiyasi (komplekt uchun)
      const getPiecePrice = (productName: string, gramSize: number | null = null) => {
        const name = productName?.toLowerCase() || '';
        // 48 krishka - $0.012
        if (name.includes('48') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
          return 0.012;
        }
        // 48 ruchka - $0.016
        if (name.includes('48') && (name.includes('ruchka') || name.includes('handle'))) {
          return 0.016;
        }
        // 28 ruchka - $0.007
        if (name.includes('28') && (name.includes('ruchka') || name.includes('handle'))) {
          return 0.007;
        }
        // 28 krishka - $0.007 (36 preform uchun)
        if (name.includes('28') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
          // 28 dkm krishka uchun $0.0012
          if (name.includes('dkm')) {
            return 0.0012;
          }
          return 0.007;
        }
        // 38 krishka - $0.012 (dkm krishka)
        if (name.includes('38') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
          return 0.012;
        }
        return null;
      };
      
      const getUnitsPerBag = (productName: string) => {
        const name = productName?.toLowerCase() || '';
        if (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap')) {
          return 2000;
        }
        if (name.includes('ruchka') || name.includes('handle')) {
          return 1000;
        }
        return 2000;
      };
      
      // Preformni qo'shish
      const pricePerBag = parseFloat(newItem.pricePerBag || '0') || product.pricePerBag || 0;
      const unitsPerBag = parseFloat(newItem.unitsPerBag || '0') || product.unitsPerBag || 2000;
      const pricePerPiece = pricePerBag / unitsPerBag;
      const subtotal = quantity * pricePerBag;

      const preformItem = {
        productId: newItem.productId,
        productName: product.name,
        quantity: newItem.quantity,
        bagDisplayValue: newItem.quantity,
        pricePerBag,
        pricePerPiece,
        unitsPerBag,
        subtotal,
        warehouse: product.warehouse || 'other',
        saleType: 'bag'  // Savatda to'g'ri ko'rsatish uchun bag rejimi
      };

      // Krishka va ruchkalarni topish - MAXSUS QOIDALAR BO'YICHA
      const gramMatch = product.name?.match(/(\d+)\s*(gr|g|гр|г)/i);
      const gramSize = gramMatch ? parseInt(gramMatch[1]) : null;
      console.log('🔍 Gram size:', gramSize, 'from name:', product.name);

      // QOIDALAR:
      // 15, 21, 26, 30 → 28 krishka (faqat krishka)
      // 36 → 28 krishka + 28 ruchka (maxsus narxlar)
      // 52, 70 → 38 krishka + ruchka
      // 75, 80, 85, 86, 135 → 48 krishka + ruchka
      
      let targetKrishkaGram: number | null = null;
      let targetRuchkaGram: number | null = null;
      let needsRuchka = false;

      if (gramSize) {
        if ([15, 21, 26, 30].includes(gramSize)) {
          targetKrishkaGram = 28;
          needsRuchka = false;
          console.log('✅ Qoida 1: 15/21/26/30 → 28 krishka');
        } else if (gramSize === 36) {
          // 36 preform uchun maxsus qoida: 28 krishka + 28 ruchka
          targetKrishkaGram = 28;
          targetRuchkaGram = 28;
          needsRuchka = true;
          console.log('✅ Qoida 2: 36 → 28 krishka + 28 ruchka (maxsus narxlar: ruchka $0.006, krishka $0.007)');
        } else if ([52, 70].includes(gramSize)) {
          targetKrishkaGram = 38;
          targetRuchkaGram = 38;
          needsRuchka = true;
          console.log('✅ Qoida 3: 52/70 → 38 krishka + ruchka');
        } else if ([75, 80, 85, 86, 135].includes(gramSize)) {
          targetKrishkaGram = 48;
          targetRuchkaGram = 48;
          needsRuchka = true;
          console.log('✅ Qoida 4: 75/80/85/86/135 → 48 krishka + ruchka');
        } else {
          console.log('❌ Gram size mos kelmedi:', gramSize);
        }
      }

      console.log('🎯 Target krishka gram:', targetKrishkaGram, 'Ruchka kerakmi:', needsRuchka);

      // Mos keluvchi krishkani topish
      let krishkaProduct = null;
      let ruchkaProduct = null;

      if (targetKrishkaGram) {
        // Maqsadli gramli krishkani qidirish
        krishkaProduct = products.find((p: any) => {
          const name = p.name?.toLowerCase() || '';
          const isKrishka = p.warehouse === 'krishka' || name.includes('krishka') || name.includes('qopqoq') || name.includes('cap') || name.includes('крышка');
          const hasGram = name.includes(targetKrishkaGram!.toString()) || 
                         name.includes(targetKrishkaGram + 'gr') || 
                         name.includes(targetKrishkaGram + 'g') ||
                         name.includes(targetKrishkaGram + ' гр') ||
                         name.includes(targetKrishkaGram + ' г');
          return isKrishka && hasGram;
        });
        console.log('🔍 Krishka qidirilmoqda:', targetKrishkaGram, 'Topildi:', krishkaProduct?.name || 'YOQ');

        // Ruchka kerak bo'lsa, shu gramli ruchkani qidirish
        if (needsRuchka && targetRuchkaGram) {
          ruchkaProduct = products.find((p: any) => {
            const name = p.name?.toLowerCase() || '';
            const isRuchka = p.warehouse === 'ruchka' || name.includes('ruchka') || name.includes('handle') || name.includes('ручка');
            const hasGram = name.includes(targetRuchkaGram!.toString()) || 
                           name.includes(targetRuchkaGram + 'gr') || 
                           name.includes(targetRuchkaGram + 'g') ||
                           name.includes(targetRuchkaGram + ' гр') ||
                           name.includes(targetRuchkaGram + ' г');
            return isRuchka && hasGram;
          });
          console.log('🔍 Ruchka qidirilmoqda:', targetRuchkaGram, 'Topildi:', ruchkaProduct?.name || 'YOQ');
        }
      }
      

      // Agar mos krishka topilmasa, umumiy krishkani olish
      if (!krishkaProduct && targetKrishkaGram) {
        krishkaProduct = products.find((p: any) => {
          const name = p.name?.toLowerCase() || '';
          return (p.warehouse === 'krishka' || name.includes('krishka') || name.includes('qopqoq') || name.includes('cap')) &&
                 name.includes(targetKrishkaGram.toString());
        });
        if (krishkaProduct) {
          console.log('🔍 Umumiy krishka topildi:', krishkaProduct.name);
        }
      }

      // Agar mos ruchka topilmasa, targetRuchkaGram bo'yicha qidirish
      if (!ruchkaProduct && needsRuchka && targetRuchkaGram) {
        ruchkaProduct = products.find((p: any) => {
          const name = p.name?.toLowerCase() || '';
          const isRuchka = p.warehouse === 'ruchka' || name.includes('ruchka') || name.includes('handle');
          const hasGram = name.includes(targetRuchkaGram.toString());
          return isRuchka && hasGram;
        });
        if (ruchkaProduct) {
          console.log('🔍 Target ruchka topildi:', ruchkaProduct.name);
        }
      }
      
      // Agar hamon topilmasa, umumiy ruchkani olish
      if (!ruchkaProduct && needsRuchka) {
        ruchkaProduct = products.find((p: any) => {
          const name = p.name?.toLowerCase() || '';
          return p.warehouse === 'ruchka' || name.includes('ruchka') || name.includes('handle');
        });
        if (ruchkaProduct) {
          console.log('🔍 Umumiy ruchka topildi:', ruchkaProduct.name);
        }
      }

      // Barcha mahsulotlarni bir vaqtda qo'shish
      const itemsToAdd = [preformItem];
      console.log('📦 Preform qoshildi:', preformItem.productName, 'soni:', quantity, 'qop,', quantity * unitsPerBag, 'dona');

      // Jami dona sonini hisoblash
      const totalPieces = quantity * unitsPerBag;
      console.log('🔢 Jami dona soni:', totalPieces);

      if (krishkaProduct) {
        const krishkaUnits = getUnitsPerBag(krishkaProduct.name);
        const krishkaPiecePrice = getPiecePrice(krishkaProduct.name) || (parseFloat(krishkaProduct.pricePerBag) || 0) / krishkaUnits;
        const krishkaPrice = krishkaPiecePrice * krishkaUnits; // Qop narxi
        
        // Jami dona soniga mos keladigan krishka qop soni
        const krishkaQuantity = Math.ceil(totalPieces / krishkaUnits);
        
        console.log('🧮 Krishka hisoblash:', totalPieces, 'dona /', krishkaUnits, 'dona/qop =', krishkaQuantity, 'qop, narx:', krishkaPrice);
        
        itemsToAdd.push({
          productId: krishkaProduct.id,
          productName: krishkaProduct.name,
          quantity: krishkaQuantity.toString(),
          bagDisplayValue: krishkaQuantity.toString(),
          pricePerBag: krishkaPrice,
          pricePerPiece: krishkaPiecePrice,
          unitsPerBag: krishkaUnits,
          subtotal: krishkaQuantity * krishkaPrice,
          warehouse: krishkaProduct.warehouse || 'krishka',
          saleType: 'bag'
        });
      }

      if (ruchkaProduct) {
        const ruchkaUnits = getUnitsPerBag(ruchkaProduct.name);
        const ruchkaPiecePrice = getPiecePrice(ruchkaProduct.name) || (parseFloat(ruchkaProduct.pricePerBag) || 0) / ruchkaUnits;
        const ruchkaPrice = ruchkaPiecePrice * ruchkaUnits; // Qop narxi
        
        // Jami dona soniga mos keladigan ruchka qop soni
        const ruchkaQuantity = Math.ceil(totalPieces / ruchkaUnits);
        
        console.log('🧮 Ruchka hisoblash:', totalPieces, 'dona /', ruchkaUnits, 'dona/qop =', ruchkaQuantity, 'qop, narx:', ruchkaPrice);
        
        itemsToAdd.push({
          productId: ruchkaProduct.id,
          productName: ruchkaProduct.name,
          quantity: ruchkaQuantity.toString(),
          bagDisplayValue: ruchkaQuantity.toString(),
          pricePerBag: ruchkaPrice,
          pricePerPiece: ruchkaPiecePrice,
          unitsPerBag: ruchkaUnits,
          subtotal: ruchkaQuantity * ruchkaPrice,
          warehouse: ruchkaProduct.warehouse || 'ruchka',
          saleType: 'bag'
        });
      }

      setForm(prev => ({ ...prev, items: [...prev.items, ...itemsToAdd] }));
      console.log('✅ KOMPLEKT QOSHILDI (bag rejimi):', itemsToAdd.map(i => `${i.productName} (${i.quantity} qop)`).join(', '));
    } else {
      // Oddiy rejim - faqat bitta mahsulot qo'shish
      const existingItemIndex = form.items.findIndex((item: any) => item.productId === newItem.productId);
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = form.items[existingItemIndex];
        const additionalQuantity = quantity;
        const newQuantity = existingItem.quantity + additionalQuantity;
        const pricePerBag = parseFloat(newItem.pricePerBag || '0') || existingItem.pricePerBag;
        const isPieceSale = newItem.saleType === 'piece';
        const unitsPerBag = parseFloat(newItem.unitsPerBag || '0') || product.unitsPerBag || 2000;
        const pricePerPiece = pricePerBag / unitsPerBag;
        const subtotal = isPieceSale ? newQuantity * pricePerPiece : newQuantity * pricePerBag;

        updateItem(existingItemIndex, {
          quantity: newQuantity.toString(),
          bagDisplayValue: newQuantity.toString(),
          pricePerBag,
          pricePerPiece,
          subtotal
        });
      } else {
        // Add new item
        const pricePerBag = parseFloat(newItem.pricePerBag || '0') || product.pricePerBag || 0;
        const unitsPerBag = parseFloat(newItem.unitsPerBag || '0') || product.unitsPerBag || 2000;
        const pricePerPiece = pricePerBag / unitsPerBag;
        const isPieceSale = newItem.saleType === 'piece';
        const subtotal = isPieceSale ? quantity * pricePerPiece : quantity * pricePerBag;

        const newItemData = {
          productId: newItem.productId,
          productName: product.name,
          quantity: newItem.quantity,
          bagDisplayValue: newItem.quantity,
          pricePerBag,
          pricePerPiece,
          unitsPerBag,
          subtotal,
          warehouse: product.warehouse || 'other',
          saleType: newItem.saleType || 'bag'
        };

        setForm(prev => ({ ...prev, items: [...prev.items, newItemData] }));
      }
    }

    // Reset newItem state
    setNewItem({
      productId: '',
      productName: '',
      quantity: '',
      pricePerBag: '',
      priceDisplayValue: '',
      unitsPerBag: '2000',
      saleType: 'bag'
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // 🔒 Double submitdan himoya

    try {
      setIsSubmitting(true);
      // Validation
      if (form.items.length === 0) {
        console.error('Kamida bitta mahsulot qoshish kerak');
        return;
      }

      if (!form.customerId && !form.manualCustomerName) {
        console.error('Mijoz tanlash yoki yangi mijoz qoshish kerak');
        return;
      }

      // Prepare sale data
      const saleData = {
        customerId: form.customerId || null,
        customerName: form.customerName || form.manualCustomerName,
        customerPhone: form.manualCustomerPhone,
        items: form.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          pricePerBag: item.pricePerBag,
          pricePerPiece: item.pricePerPiece,
          unitsPerBag: item.unitsPerBag,
          subtotal: item.subtotal,
          warehouse: item.warehouse,
          saleType: item.saleType
        })),
        paymentDetails: {
          uzs: parseFloat(form.paidUZS || '0'),
          usd: parseFloat(form.paidUSD || '0'),
          click: parseFloat(form.paidCLICK || '0')
        },
        paymentType: form.paymentType,
        currency: form.currency,
        isKocha: form.isKocha,
        total: totalAmount,
        paid: paidAmount,
        debt: debtAmount,
        exchangeRate: parseFloat(exchangeRate),
        createdAt: new Date(),
        status: debtAmount > 0 ? 'partial' : 'completed'
      };

      // Save sale
      const response = await api.post('/sales', saleData);

      // Update customer if manual
      if (form.manualCustomerName && form.manualCustomerPhone) {
        await api.post('/customers', {
          name: form.manualCustomerName,
          phone: form.manualCustomerPhone,
          createdAt: new Date()
        });
      }

      console.log('Sale saved successfully:', response.data);
      navigate('/sales');

    } catch (error) {
      errorHandler.handleError(error, { action: 'saveSale' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modern-bg page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="glass-card p-4 mb-4 fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/cashier/sales')}
                className="btn-gradient-primary px-4 py-2 flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {latinToCyrillic("Orqaga")}
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-primary mb-0.5">
                  {isEditMode ? latinToCyrillic("Sotuvni Tahrirlash") : latinToCyrillic("Yangi Sotuv")}
                </h1>
                <p className="text-secondary text-sm font-medium">
                  {form.items.length} {latinToCyrillic("ta mahsulot tanlandi")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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
        <div className="glass-card p-5 slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Mahsulotlar ustuni */}
                <div className="space-y-3">
                  <div className="glass-card p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-primary">{latinToCyrillic("Mahsulotlar")}</h2>
                        <p className="text-sm text-secondary">{getFilteredProducts().length} {latinToCyrillic("mahsulot")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-2">
                      {/* Mahsulot qidiruv inputi */}
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          placeholder={latinToCyrillic("Mahsulot qidirish...")}
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="input-modern w-full pl-12"
                        />
                      </div>

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

                      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                        {getFilteredProducts().length === 0 ? (
                          <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Package className="w-10 h-10 text-gray-500" />
                            </div>
                            <p className="text-gray-600 font-bold text-lg">{latinToCyrillic("Mahsulot topilmadi")}</p>
                          </div>
                        ) : (
                          (() => {
                            // Avval barcha preformlarni aniqlash (warehouse yoki nom bo'yicha)
                            const allPreforms = getFilteredProducts().filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              const warehouse = p.warehouse?.toLowerCase() || '';
                              return warehouse === 'preform' || 
                                     name.includes('preform') || 
                                     name.includes('преформ') ||
                                     /\d+\s*(gr|g|гр|г)/.test(name); // raqam + gr/g/гр/г
                            });
                            
                            // Preformlarni gram bo'yicha alohida guruhlash
                            const preform15 = allPreforms.filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              return name.includes('15') || name.includes('15gr') || name.includes('15g') || name.includes('15 g') || name.includes('15гр') || name.includes('15г');
                            });
                            const preform21 = allPreforms.filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              return name.includes('21') || name.includes('21gr') || name.includes('21g') || name.includes('21 g') || name.includes('21гр') || name.includes('21г');
                            });
                            const preform28 = allPreforms.filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              return name.includes('28') || name.includes('28gr') || name.includes('28g') || name.includes('28 g') || name.includes('28гр') || name.includes('28г');
                            });
                            const preform32 = allPreforms.filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              return name.includes('32') || name.includes('32gr') || name.includes('32g') || name.includes('32 g') || name.includes('32гр') || name.includes('32г');
                            });
                            const preform38 = allPreforms.filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              return name.includes('38') || name.includes('38gr') || name.includes('38g') || name.includes('38 g') || name.includes('38гр') || name.includes('38г');
                            });
                            const preform43 = allPreforms.filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              return name.includes('43') || name.includes('43gr') || name.includes('43g') || name.includes('43 g') || name.includes('43гр') || name.includes('43г');
                            });
                            const preform48 = allPreforms.filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              return name.includes('48') || name.includes('48gr') || name.includes('48g') || name.includes('48 g') || name.includes('48гр') || name.includes('48г');
                            });
                            
                            // Boshqa preformlar (grami aniq bo'lmagan preformlar)
                            const preformBoshqa = allPreforms.filter((p: any) => 
                              !preform15.includes(p) && !preform21.includes(p) && !preform28.includes(p) &&
                              !preform32.includes(p) && !preform38.includes(p) && !preform43.includes(p) && !preform48.includes(p)
                            );
                            
                            const krishkaProducts = getFilteredProducts().filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              const warehouse = p.warehouse?.toLowerCase() || '';
                              return warehouse === 'krishka' || 
                                     name.includes('krishka') || 
                                     name.includes('qopqoq') || 
                                     name.includes('cap') ||
                                     name.includes('kryshka') ||
                                     name.includes('крышка');
                            });
                            const ruchkaProducts = getFilteredProducts().filter((p: any) => {
                              const name = p.name?.toLowerCase() || '';
                              const warehouse = p.warehouse?.toLowerCase() || '';
                              return warehouse === 'ruchka' || 
                                     name.includes('ruchka') || 
                                     name.includes('uchka') || 
                                     name.includes('handle') ||
                                     name.includes('ручка');
                            });
                            const otherProducts = getFilteredProducts().filter((p: any) => 
                              !allPreforms.includes(p) &&
                              !krishkaProducts.includes(p) && 
                              !ruchkaProducts.includes(p)
                            );

                            const renderProductSection = (groupId: string, title: string, productList: any[], bgColor: string, iconColor: string) => {
                              if (productList.length === 0) return null;
                              const isExpanded = expandedGroups.includes(groupId);
                              const totalStock = productList.reduce((sum, p) => sum + (p.currentStock || 0), 0);
                              return (
                                <div key={groupId} className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-gray-300/30 border border-gray-100">
                                  {/* Section header - clickable */}
                                  <div
                                    onClick={() => {
                                      setExpandedGroups(prev => 
                                        prev.includes(groupId) 
                                          ? prev.filter(g => g !== groupId)
                                          : [...prev, groupId]
                                      );
                                    }}
                                    className={`flex items-center justify-between p-3 cursor-pointer transition-all duration-300 ${isExpanded ? `${iconColor} text-white shadow-lg` : 'bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 border-b border-gray-100'}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExpanded ? 'bg-white/25 backdrop-blur-sm shadow-lg' : iconColor + ' shadow-lg'} text-white transition-all duration-300`}>
                                        <Package className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <h4 className={`font-bold text-base ${isExpanded ? 'text-white drop-shadow-sm' : 'text-gray-900'}`}>{title}</h4>
                                        <p className={`text-xs ${isExpanded ? 'text-white/90' : 'text-gray-500'} font-medium`}>
                                          {productList.length} {latinToCyrillic("ta")} • {totalStock} {latinToCyrillic("qop")}
                                        </p>
                                      </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-white/25 backdrop-blur-sm rotate-90 shadow-lg' : 'bg-gray-100 shadow-md group-hover:bg-blue-100'}`}>
                                      <ChevronRight className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-gray-600'}`} />
                                    </div>
                                  </div>

                                  {/* Mahsulotlar ro'yxati */}
                                  <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-3 grid grid-cols-2 gap-3 bg-gradient-to-b from-gray-100/50 via-white to-white">
                                    {productList.map((product: any, idx: number) => (
                                      <div
                                        key={product.id}
                                        onClick={() => {
                                          // Maxsus narxlar funksiyasi
                                          const getDefaultPricePerPiece = (productName: string) => {
                                            const name = productName?.toLowerCase() || '';
                                            const gramMatch = name.match(/(\d+)\s*(gr|g|гр|г)/);
                                            const gramSize = gramMatch ? parseInt(gramMatch[1]) : null;
                                            
                                            // 75gr: 4000 dona, $0.14325
                                            if (gramSize === 75) {
                                              return 0.14325;
                                            }
                                            // 80gr: 4000 dona, $0.152
                                            if (gramSize === 80) {
                                              return 0.152;
                                            }
                                            // 85gr: 4000 dona, $0.172
                                            if (gramSize === 85) {
                                              return 0.172;
                                            }
                                            // 86gr: 4000 dona, $0.1745
                                            if (gramSize === 86) {
                                              return 0.1745;
                                            }
                                            // 135gr: 2500 dona, $0.258
                                            if (gramSize === 135) {
                                              return 0.258;
                                            }
                                            // 48 krishka - $0.012
                                            if (name.includes('48') && (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap'))) {
                                              return 0.012;
                                            }
                                            // 48 ruchka - $0.016
                                            if (name.includes('48') && (name.includes('ruchka') || name.includes('handle'))) {
                                              return 0.016;
                                            }
                                            return null;
                                          };
                                          
                                          // Maxsus dona soni funksiyasi
                                          const getDefaultUnitsPerBag = (productName: string) => {
                                            const name = productName?.toLowerCase() || '';
                                            const gramMatch = name.match(/(\d+)\s*(gr|g|гр|г)/);
                                            const gramSize = gramMatch ? parseInt(gramMatch[1]) : null;
                                            
                                            // 75, 80, 85, 86gr - 4000 dona
                                            if ([75, 80, 85, 86].includes(gramSize || 0)) {
                                              return 4000;
                                            }
                                            // 135gr - 2500 dona
                                            if (gramSize === 135) {
                                              return 2500;
                                            }
                                            // Krishka - 2000 dona/qop
                                            if (name.includes('krishka') || name.includes('qopqoq') || name.includes('cap')) {
                                              return 2000;
                                            }
                                            // Ruchka - 1000 dona/qop
                                            if (name.includes('ruchka') || name.includes('handle')) {
                                              return 1000;
                                            }
                                            return null;
                                          };
                                          
                                          // Narxni aniqlash - mijoz narxi > maxsus narx > ombor narxi
                                          let basePrice: number;
                                          const customerPrice = selectedCustomer && customerPrices[product.id];
                                          
                                          if (customerPrice) {
                                            // Mijozning maxsus narxi
                                            basePrice = parseFloat(customerPrice) || 0;
                                          } else if (selectedCustomer?.pricePerBag) {
                                            // Mijozning umumiy narxi
                                            basePrice = parseFloat(selectedCustomer.pricePerBag) || 0;
                                          } else {
                                            // Mahsulotning asosiy narxi - har doim eng yangi narxni olish
                                            basePrice = parseFloat(product.pricePerBag) || 0;
                                            
                                            // Mahsulotni qayta yuklab, eng yangi narxni olish
                                            const refreshProductPrice = async () => {
                                              try {
                                                const productResponse = await api.get(`/products/${product.id}`);
                                                if (productResponse.data && productResponse.data.pricePerBag) {
                                                  const latestPrice = parseFloat(productResponse.data.pricePerBag);
                                                  if (latestPrice !== basePrice) {
                                                    basePrice = latestPrice;
                                                    console.log(`🔄 ${product.name} narxi yangilandi: $${latestPrice}`);
                                                  }
                                                }
                                              } catch (error) {
                                                console.error('Mahsulot narxini yangilashda xatolik:', error);
                                              }
                                            };
                                            
                                            // Narxni real-time yangilash
                                            refreshProductPrice();
                                          }
                                          
                                          // Maxsus narxni tekshirish (komplekt uchun)
                                          const defaultPiecePrice = getDefaultPricePerPiece(product.name);
                                          // Ma'lumotlar bazasidagi unitsPerBag qiymatini ishlatish
                                          const unitsPerBag = product.unitsPerBag || 2000;
                                          
                                          let displayPrice: number;
                                          let piecePrice: number;
                                          
                                          if (defaultPiecePrice && !customerPrice && !selectedCustomer?.pricePerBag) {
                                            // Faqat maxsus narx bo'lsa va mijoz narxi bo'lmasa
                                            piecePrice = defaultPiecePrice;
                                            displayPrice = piecePrice * unitsPerBag;
                                          } else {
                                            // Mijoz narxi yoki ombor narxi
                                            piecePrice = basePrice / unitsPerBag;
                                            displayPrice = basePrice;
                                          }
                                          
                                          if (form.currency === 'UZS' && displayPrice > 0) {
                                            displayPrice = displayPrice * 12500;
                                          }
                                          
                                          const priceStr = displayPrice > 0 ? displayPrice.toString() : '';
                                          
                                          // Preform ekanligini tekshirish
                                          const isPreform = product.warehouse === 'preform' || 
                                                           product.name?.toLowerCase().includes('preform') ||
                                                           /\d+\s*(gr|g|гр|г)/i.test(product.name || '');
                                          
                                          setNewItem({
                                            productId: product.id,
                                            productName: product.name,
                                            quantity: '1',
                                            pricePerBag: priceStr,
                                            priceDisplayValue: priceStr,
                                            unitsPerBag: unitsPerBag.toString(),
                                            saleType: isPreform ? 'komplekt' : 'bag'
                                          });
                                        }}
                                        className={`group p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 relative overflow-hidden ${
                                          newItem.productId === product.id
                                            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-blue-400 shadow-xl shadow-blue-500/30 scale-[1.02]'
                                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1'
                                        }`}
                                      >
                                        {/* Quick Add Button Overlay */}
                                        <div className="absolute top-1 right-1 z-10">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Avtomatik tanlash va qo'shish
                                              // Mijozning maxsus narxini tekshirish
                                              let basePrice: number;
                                              const customerPrice = selectedCustomer && customerPrices[product.id];
                                              
                                              if (customerPrice) {
                                                // Mijozning maxsus narxi
                                                basePrice = parseFloat(customerPrice) || 0;
                                              } else if (selectedCustomer?.pricePerBag) {
                                                // Mijozning umumiy narxi
                                                basePrice = parseFloat(selectedCustomer.pricePerBag) || 0;
                                              } else {
                                                // Mahsulotning asosiy narxi
                                                basePrice = parseFloat(product.pricePerBag) || 0;
                                              }
                                              
                                              const unitsPerBag = product.unitsPerBag || 2000;
                                              let displayPrice = basePrice;
                                              if (form.currency === 'UZS' && displayPrice > 0) {
                                                displayPrice = displayPrice * 12500;
                                              }
                                              
                                              const isPreform = product.warehouse === 'preform' || 
                                                               product.name?.toLowerCase().includes('preform') ||
                                                               /\d+\s*(gr|g|гр|г)/i.test(product.name || '');
                                              
                                              // Auto add with quantity 1
                                              setNewItem({
                                                productId: product.id,
                                                productName: product.name,
                                                quantity: '1',
                                                pricePerBag: displayPrice.toString(),
                                                priceDisplayValue: displayPrice.toString(),
                                                unitsPerBag: unitsPerBag.toString(),
                                                saleType: isPreform ? 'komplekt' : 'bag'
                                              });
                                              
                                              // Auto add to cart after small delay
                                              setTimeout(() => {
                                                addProduct();
                                              }, 100);
                                            }}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                              newItem.productId === product.id 
                                                ? 'bg-white/30 text-white hover:bg-white/50' 
                                                : 'bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white'
                                            }`}
                                          >
                                            <Plus className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="pr-10">
                                          <span className={`font-bold text-sm line-clamp-2 leading-snug ${newItem.productId === product.id ? 'text-white drop-shadow-sm' : 'text-gray-800'}`}>
                                            {product.name}
                                          </span>
                                          <div className="flex items-center gap-2 mt-2">
                                            {product.bagType && (
                                              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md shadow-sm ${newItem.productId === product.id ? 'bg-white/25 text-white backdrop-blur-sm' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                {product.bagType}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/40">
                                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                            newItem.productId === product.id 
                                              ? 'bg-white/20 text-white backdrop-blur-sm' 
                                              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                                          }`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {product.currentStock || 0} {latinToCyrillic("qop")}
                                          </div>
                                          <span className={`text-sm font-bold ${newItem.productId === product.id ? 'text-white drop-shadow-sm' : 'text-blue-600'}`}>
                                            {getCurrencySymbol()}{getDisplayAmount(parseFloat(product.pricePerBag) || 0)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            };

                            return (
                              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-4 bg-gradient-to-b from-gray-50/30 to-transparent rounded-2xl">
                                {/* Preformlar bo'limi sarlavhasi */}
                                {preform15.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">15 GRAM</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('15gr', latinToCyrillic('15 gr Preformlar'), preform15, 'bg-blue-50/50', 'bg-gradient-to-br from-blue-500 to-blue-600')}
                                
                                {preform21.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">21 GRAM</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('21gr', latinToCyrillic('21 gr Preformlar'), preform21, 'bg-indigo-50/50', 'bg-gradient-to-br from-indigo-500 to-indigo-600')}
                                
                                {preform28.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-bold rounded-full">28 GRAM</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-sky-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('28gr', latinToCyrillic('28 gr Preformlar'), preform28, 'bg-sky-50/50', 'bg-gradient-to-br from-sky-500 to-sky-600')}
                                
                                {preform32.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-bold rounded-full">32 GRAM</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('32gr', latinToCyrillic('32 gr Preformlar'), preform32, 'bg-cyan-50/50', 'bg-gradient-to-br from-cyan-500 to-cyan-600')}
                                
                                {preform38.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">38 GRAM</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('38gr', latinToCyrillic('38 gr Preformlar'), preform38, 'bg-teal-50/50', 'bg-gradient-to-br from-teal-500 to-teal-600')}
                                
                                {preform43.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">43 GRAM</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('43gr', latinToCyrillic('43 gr Preformlar'), preform43, 'bg-emerald-50/50', 'bg-gradient-to-br from-emerald-500 to-emerald-600')}
                                
                                {preform48.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">48 GRAM</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('48gr', latinToCyrillic('48 gr Preformlar'), preform48, 'bg-green-50/50', 'bg-gradient-to-br from-green-500 to-green-600')}
                                
                                {preformBoshqa.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">BOSHQA</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('boshqa-preform', latinToCyrillic('Boshqa Preformlar'), preformBoshqa, 'bg-slate-50/50', 'bg-gradient-to-br from-slate-500 to-slate-600')}
                                
                                {krishkaProducts.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">KRISHKA</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('krishka', latinToCyrillic('Krishka'), krishkaProducts, 'bg-purple-50/50', 'bg-gradient-to-br from-purple-500 to-purple-600')}
                                
                                {ruchkaProducts.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold rounded-full">RUCHKA</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent"></div>
                                  </div>
                                )}
                                {renderProductSection('ruchka', latinToCyrillic('Ruchka'), ruchkaProducts, 'bg-pink-50/50', 'bg-gradient-to-br from-pink-500 to-pink-600')}
                                
                                {otherProducts.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-1.5 mt-3">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">BOSHQA</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                                  </div>
                                )}
                                {otherProducts.length > 0 && renderProductSection('other', latinToCyrillic('Boshqa'), otherProducts, 'bg-gray-50/50', 'bg-gradient-to-br from-gray-500 to-gray-600')}
                              </div>
                            );
                          })()
                        )}
                      </div>
                      
                      {newItem.productName && (
                        <div className="p-2.5 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl shadow-md">
                          <div className="text-xs font-bold text-blue-700 mb-1">{latinToCyrillic("Tanlangan")}</div>
                          <div className="font-bold text-gray-800 truncate text-sm">{newItem.productName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {(() => {
                              const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                              return selectedProduct?.bagType ? (
                                <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 text-[10px] font-bold rounded">
                                  {selectedProduct.bagType}
                                </span>
                              ) : null;
                            })()}
                            <span className="text-xs font-bold text-blue-600">
                              {getCurrencySymbol()}{newItem.pricePerBag}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Qop/Dona tugmalari - narxni avtomatik hisoblaydi */}
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const currentPrice = parseFloat(newItem.pricePerBag || '0') || 0;
                          const upb = parseFloat(newItem.unitsPerBag || '2000') || 2000;
                          
                          // Agar hozir dona bo'lsa, qopga o'tishda narxni ko'paytirish
                          let newPrice = currentPrice;
                          if (newItem.saleType === 'piece' && currentPrice > 0) {
                            newPrice = currentPrice * upb;
                          }
                          
                          setNewItem(prev => ({ 
                            ...prev, 
                            saleType: 'bag',
                            pricePerBag: newPrice > 0 ? newPrice.toString() : prev.pricePerBag,
                            priceDisplayValue: newPrice > 0 ? newPrice.toString() : prev.priceDisplayValue
                          }));
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                          newItem.saleType !== 'piece'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {latinToCyrillic("Qop")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const currentPrice = parseFloat(newItem.pricePerBag || '0') || 0;
                          const upb = parseFloat(newItem.unitsPerBag || '2000') || 2000;
                          
                          // Agar hozir qop bo'lsa, donaga o'tishda narxni bo'lish
                          let newPrice = currentPrice;
                          if (newItem.saleType !== 'piece' && currentPrice > 0) {
                            newPrice = currentPrice / upb;
                          }
                          
                          setNewItem(prev => ({ 
                            ...prev, 
                            saleType: 'piece',
                            pricePerBag: newPrice > 0 ? newPrice.toString() : prev.pricePerBag,
                            priceDisplayValue: newPrice > 0 ? newPrice.toString() : prev.priceDisplayValue
                          }));
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                          newItem.saleType === 'piece'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {latinToCyrillic("Dona")}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {latinToCyrillic("Qop")}
                        </label>
                        <input
                          type="text"
                          placeholder="0"
                          value={newItem.quantity || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            setNewItem(prev => ({ ...prev, quantity: val }));
                          }}
                          className="w-full h-10 px-3 text-sm font-bold rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {latinToCyrillic("1 qopda")}
                        </label>
                        <input
                          type="text"
                          value={(newItem.unitsPerBag || '2000').toString()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            setNewItem(prev => ({ ...prev, unitsPerBag: val || '2000' }));
                          }}
                          className="w-full h-10 px-3 text-sm font-bold rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {latinToCyrillic("Jami (dona)")}
                        </label>
                        <div className="w-full h-10 px-3 flex items-center bg-gray-50 rounded-xl border-2 border-gray-300 text-sm font-bold text-gray-700">
                          {(() => {
                            if (!newItem.productId) return '0';
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = parseFloat(newItem.unitsPerBag || '0') || selectedProduct?.unitsPerBag || 2000;
                            const bagQuantity = parseFloat(newItem.quantity || '0') || 0;
                            return (bagQuantity * unitsPerBag).toLocaleString();
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {newItem.saleType === 'piece'
                            ? `${latinToCyrillic("Narx")} (${getCurrencySymbol()}/${latinToCyrillic("dona")})`
                            : `${latinToCyrillic("Narx")} (${getCurrencySymbol()}/${latinToCyrillic("qop")})`}
                        </label>
                        <input
                          type="text"
                          placeholder={form.currency === 'UZS' ? "1000" : "0.10"}
                          value={newItem.priceDisplayValue || newItem.pricePerBag || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = parseFloat(newItem.unitsPerBag || '0') || selectedProduct?.unitsPerBag || 2000;
                            
                            if (newItem.saleType === 'piece') {
                              // Dona narxi kiritildi - qop narxini hisoblash
                              const pricePerPiece = parseFloat(val) || 0;
                              const pricePerBag = pricePerPiece * unitsPerBag;
                              setNewItem(prev => ({
                                ...prev,
                                pricePerBag: pricePerBag.toString(),
                                priceDisplayValue: val
                              }));
                            } else {
                              // Qop narxi kiritildi
                              setNewItem(prev => ({
                                ...prev,
                                pricePerBag: val,
                                priceDisplayValue: val
                              }));
                            }
                          }}
                          className="w-full h-10 px-3 text-sm font-bold rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Real vaqt jami narx */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-700">{latinToCyrillic("Jami")}:</span>
                        <span className="text-lg font-bold text-blue-800">
                          {(() => {
                            const bagQuantity = parseFloat(newItem.quantity || '0') || 0;
                            const selectedProduct = products.find((p: any) => p.id === newItem.productId);
                            const unitsPerBag = parseFloat(newItem.unitsPerBag || '0') || selectedProduct?.unitsPerBag || 2000;
                            const pricePerBag = parseFloat(newItem.pricePerBag || '0') || 0;
                            
                            if (newItem.saleType === 'piece') {
                              // Dona rejimi: dona narxi * umumiy donalar
                              const totalPieces = bagQuantity * unitsPerBag;
                              const pricePerPiece = pricePerBag / unitsPerBag;
                              const subtotal = totalPieces * pricePerPiece;
                              return getCurrencySymbol() + subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            } else {
                              // Qop rejimi: qop narxi * qop soni
                              const subtotal = bagQuantity * pricePerBag;
                              return getCurrencySymbol() + subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            }
                          })()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addProduct}
                      disabled={!newItem.productId || !newItem.quantity}
                      className={`w-full h-11 rounded-xl font-bold text-base transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${
                        !newItem.productId || !newItem.quantity
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      {latinToCyrillic("Qo'shish")}
                    </button>
                  </div>
                </div>

                {/* Savat ustuni */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-lg">
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
                                  {/* Mahsulotni o'zgartirish uchun select */}
                                  <select
                                    value={item.productId}
                                    onChange={(e) => {
                                      const newProductId = e.target.value;
                                      const newProduct = products.find((p: any) => p.id === newProductId);
                                      if (newProduct) {
                                        const unitsPerBag = newProduct.unitsPerBag || 2000;
                                        const quantity = parseFloat(item.quantity) || 0;
                                        
                                        // Maxsus narxlar funksiyasi
                                        const getPiecePrice = (productName: string) => {
                                          const name = productName?.toLowerCase() || '';
                                          if (name.includes('48') && (name.includes('krishka') || name.includes('qopqoq'))) return 0.012;
                                          if (name.includes('48') && name.includes('ruchka')) return 0.016;
                                          if (name.includes('28') && name.includes('ruchka')) return 0.007;
                                          if (name.includes('28') && name.includes('krishka')) {
                                            if (name.includes('dkm')) return 0.0012;
                                            return 0.007;
                                          }
                                          if (name.includes('38') && name.includes('krishka')) return 0.012;
                                          return null;
                                        };
                                        
                                        const piecePrice = getPiecePrice(newProduct.name);
                                        const pricePerBag = piecePrice ? piecePrice * unitsPerBag : (parseFloat(newProduct.pricePerBag) || 0);
                                        const pricePerPiece = piecePrice || (pricePerBag / unitsPerBag);
                                        
                                        const subtotal = item.saleType === 'piece' 
                                          ? quantity * unitsPerBag * pricePerPiece 
                                          : quantity * pricePerBag;
                                        
                                        updateItem(index, {
                                          productId: newProductId,
                                          productName: newProduct.name,
                                          unitsPerBag: unitsPerBag,
                                          pricePerBag: pricePerBag,
                                          pricePerPiece: pricePerPiece,
                                          priceDisplayValue: pricePerBag.toString(),
                                          bagDisplayValue: item.bagDisplayValue || item.quantity,
                                          subtotal: subtotal,
                                          warehouse: newProduct.warehouse || 'other'
                                        });
                                      }
                                    }}
                                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                  >
                                    {products.map((p: any) => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                  </select>
                                  <div className="flex items-center gap-2 mt-1">
                                    {(() => {
                                      const cartProduct = products.find((p: any) => p.id === item.productId);
                                      return cartProduct?.bagType ? (
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                                          {cartProduct.bagType}
                                        </span>
                                      ) : null;
                                    })()}
                                    <span className="text-xs text-gray-500">{item.unitsPerBag || 2000} dona/qop</span>
                                  </div>
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
                                  {/* Qop/Dona tugmalari - narxni avtomatik hisoblaydi */}
                                  <div className="flex gap-2 mb-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentPrice = parseFloat(item.pricePerBag || '0') || 0;
                                        const upb = parseFloat(item.unitsPerBag || '2000') || 2000;
                                        
                                        // Agar hozir dona bo'lsa, qopga o'tishda narxni ko'paytirish
                                        let newPrice = currentPrice;
                                        if (item.saleType === 'piece' && currentPrice > 0) {
                                          newPrice = currentPrice * upb;
                                        }
                                        
                                        updateItem(index, { 
                                          saleType: 'bag',
                                          pricePerBag: newPrice > 0 ? newPrice.toString() : item.pricePerBag,
                                          priceDisplayValue: newPrice > 0 ? newPrice.toString() : item.priceDisplayValue
                                        });
                                      }}
                                      className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-all ${
                                        item.saleType !== 'piece'
                                          ? 'bg-blue-500 text-white' 
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {latinToCyrillic("Qop")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentPrice = parseFloat(item.pricePerBag || '0') || 0;
                                        const upb = parseFloat(item.unitsPerBag || '2000') || 2000;
                                        
                                        // Agar hozir qop bo'lsa, donaga o'tishda narxni bo'lish
                                        let newPrice = currentPrice;
                                        if (item.saleType !== 'piece' && currentPrice > 0) {
                                          newPrice = currentPrice / upb;
                                        }
                                        
                                        updateItem(index, { 
                                          saleType: 'piece',
                                          pricePerBag: newPrice > 0 ? newPrice.toString() : item.pricePerBag,
                                          priceDisplayValue: newPrice > 0 ? newPrice.toString() : item.priceDisplayValue
                                        });
                                      }}
                                      className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-all ${
                                        item.saleType === 'piece' 
                                          ? 'bg-green-500 text-white' 
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
                                        value={item.bagDisplayValue || item.quantity || ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9.]/g, '');
                                          if (val === '') {
                                            updateItem(index, {
                                              quantity: '',
                                              bagDisplayValue: '',
                                              subtotal: 0
                                            });
                                            return;
                                          }
                                          const bagQuantity = parseFloat(val) || 0;
                                          const unitsPerBag = parseFloat(item.unitsPerBag) || 2000;
                                          const pricePerBag = parseFloat(item.pricePerBag) || 0;
                                          const pricePerPiece = parseFloat(item.pricePerPiece) || (pricePerBag / unitsPerBag);
                                          const totalPieces = bagQuantity * unitsPerBag;
                                          
                                          // Dona rejimida narxni qayta hisoblash
                                          let subtotal;
                                          if (item.saleType === 'piece') {
                                            // Dona narxi * umumiy donalar
                                            subtotal = totalPieces * pricePerPiece;
                                          } else {
                                            // Qop narxi * qop soni
                                            subtotal = bagQuantity * pricePerBag;
                                          }
                                          
                                          updateItem(index, {
                                            quantity: val,
                                            bagDisplayValue: val,
                                            totalDisplayValue: totalPieces.toString(),
                                            subtotal: subtotal
                                          });
                                        }}
                                        className="w-full h-8 px-2 text-sm font-medium border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">{latinToCyrillic("1 qopda")}</label>
                                      <input
                                        type="text"
                                        value={item.unitsPerBag ?? '2000'}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9.]/g, '');
                                          if (val === '') {
                                            updateItem(index, { unitsPerBag: '' });
                                            return;
                                          }
                                          const newUnitsPerBag = parseFloat(val) || 0;
                                          const bagQuantity = parseFloat(item.bagDisplayValue || item.quantity || '0') || 0;
                                          const pricePerBag = parseFloat(item.pricePerBag) || 0;
                                          const pricePerPiece = parseFloat(item.pricePerPiece) || (pricePerBag / newUnitsPerBag);
                                          const totalPieces = bagQuantity * newUnitsPerBag;
                                          
                                          // Dona rejimida narxni qayta hisoblash
                                          let subtotal;
                                          if (item.saleType === 'piece') {
                                            // Dona narxi * umumiy donalar
                                            subtotal = totalPieces * pricePerPiece;
                                          } else {
                                            // Qop narxi * qop soni
                                            subtotal = bagQuantity * pricePerBag;
                                          }
                                          
                                          updateItem(index, {
                                            unitsPerBag: newUnitsPerBag,
                                            totalDisplayValue: totalPieces.toString(),
                                            subtotal: subtotal
                                          });
                                        }}
                                        className="w-full h-8 px-2 text-sm font-medium border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">{latinToCyrillic("Jami dona")}</label>
                                      <div className="w-full h-8 px-2 flex items-center bg-gray-50 border border-gray-300 rounded text-sm">
                                        {(() => {
                                          const bags = parseFloat(item.bagDisplayValue || item.quantity || '0') || 0;
                                          const unitsPerBag = parseFloat(item.unitsPerBag || '2000') || 2000;
                                          return (bags * unitsPerBag).toLocaleString();
                                        })()}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">
                                        {item.saleType === 'piece' ? latinToCyrillic("Narx ($/dona)") : latinToCyrillic("Narx ($/qop)")}
                                      </label>
                                      <input
                                        type="text"
                                        value={item.saleType === 'piece' 
                                          ? (item.priceDisplayValue || item.pricePerPiece || '') 
                                          : (item.priceDisplayValue || item.pricePerBag || '')}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9.]/g, '');
                                          if (val === '') {
                                            updateItem(index, {
                                              pricePerBag: '',
                                              pricePerPiece: '',
                                              priceDisplayValue: '',
                                              subtotal: 0
                                            });
                                            return;
                                          }
                                          const newPrice = parseFloat(val) || 0;
                                          const bagQuantity = parseFloat(item.bagDisplayValue || item.quantity || '0') || 0;
                                          const unitsPerBag = parseFloat(item.unitsPerBag || '2000') || 2000;
                                          
                                          let updateData: any = { priceDisplayValue: val };
                                          
                                          if (item.saleType === 'piece') {
                                            // Dona narxi o'zgardi
                                            updateData.pricePerPiece = newPrice;
                                            updateData.pricePerBag = newPrice * unitsPerBag;
                                            // Jami narx = dona narx * umumiy donalar
                                            const totalPieces = bagQuantity * unitsPerBag;
                                            updateData.subtotal = totalPieces * newPrice;
                                          } else {
                                            // Qop narxi o'zgardi
                                            updateData.pricePerBag = newPrice;
                                            updateData.pricePerPiece = newPrice / unitsPerBag;
                                            updateData.subtotal = bagQuantity * newPrice;
                                          }
                                          
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
                    
                    {/* Mijoz qidiruv inputi */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        placeholder={latinToCyrillic("Mijoz qidirish...")}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="input-modern w-full pl-12"
                      />
                    </div>
                    
                    {/* Filterlangan mijozlar ro'yxati */}
                    <div className="mt-3 max-h-[200px] overflow-y-auto space-y-2">
                      {customers
                        .filter(c => {
                          if (!customerSearch) return true;
                          const search = customerSearch.toLowerCase();
                          return (c.name?.toLowerCase().includes(search) || 
                                  c.phone?.includes(search));
                        })
                        .map((customer: any) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ 
                              ...prev, 
                              customerId: customer.id, 
                              customerName: customer.name,
                              isKocha: false,
                              manualCustomerName: '',
                              manualCustomerPhone: ''
                            }));
                            setCustomerSearch('');
                          }}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                            form.customerId === customer.id
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
                    
                    {/* Ko'chaga tanlash tugmasi */}
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ 
                          ...prev, 
                          customerId: '',
                          customerName: '',
                          isKocha: true,
                          manualCustomerName: '',
                          manualCustomerPhone: ''
                        }));
                      }}
                      className={`w-full mt-3 p-3 rounded-xl border-2 text-left transition-all ${
                        form.isKocha
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.isKocha ? 'bg-orange-500' : 'bg-gray-400'} text-white`}>
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-900">{latinToCyrillic("Ko'chaga (qo'l mijoz)")}</span>
                      </div>
                    </button>
                    
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
                            <span className="text-2xl font-bold">{getCurrencySymbol()}{getDisplayAmount(form.items.reduce((sum, item) => sum + (item.subtotal || 0), 0))}</span>
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
                          disabled={isSubmitting}
                          className={`btn-gradient-primary w-full h-16 text-lg flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              {latinToCyrillic("Saqlanmoqda...")}
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-6 h-6" />
                              {isEditMode ? latinToCyrillic("Sotuvni saqlash") : latinToCyrillic("Sotuvni rasmiylashtirish")}
                            </>
                          )}
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
                              setNewItem({ productId: '', productName: '', quantity: '', pricePerBag: '', priceDisplayValue: '', unitsPerBag: '2000', saleType: 'bag' }); 
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
