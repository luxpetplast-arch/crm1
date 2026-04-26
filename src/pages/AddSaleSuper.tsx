import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  DollarSign,
  ArrowLeft,
  Package,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Calculator,
  CreditCard,
  Smartphone,
  Banknote,
  Star,
  CheckCircle,
  AlertCircle,
  Barcode,
  Settings,
  RefreshCw
} from 'lucide-react';
import api from '../lib/professionalApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfessionalApi } from '../hooks/useProfessionalApi';
import { errorHandler } from '../lib/professionalErrorHandler';
import { validateSale } from '../lib/professionalValidation';
import { Currency, formatCurrency, convertCurrency } from '../lib/professionalCurrency';
import { createJournalEntry, AccountingEntryType } from '../lib/professionalAccounting';

export default function AddSaleSuper() {
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
  const [showTypeSelector, setShowTypeSelector] = useState<string | null>(null);
  
  // Yangi state variables for super interface
  const [activeStep, setActiveStep] = useState<'customer' | 'products' | 'payment' | 'review'>('customer');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSavedSale, setLastSavedSale] = useState<any>(null);
  
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
          pricePerPiece: (item.pricePerBag || item.pricePerUnit || 0) / (item.product?.unitsPerBag || item.unitsPerBag || 1000),
          unitsPerBag: item.product?.unitsPerBag || item.unitsPerBag || 1000,
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
    saleType: 'bag' as 'bag' | 'piece',
    priceMode: 'bag' as 'bag' | 'piece',
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
      const selectedProduct = products.find(p => p.id === newItem.productId);
      if (selectedProduct) {
        const displayPrice = form.currency === 'UZS'
          ? (parseFloat(selectedProduct.pricePerBag) || 0) * exchangeRates.USD_TO_UZS
          : parseFloat(selectedProduct.pricePerBag) || 0;
        setNewItem(prev => ({ ...prev, pricePerBag: displayPrice.toString() }));
      }
    }
  }, [form.customerId, selectedCustomer, newItem.productId, customerPrices, products, form.currency, exchangeRates.USD_TO_UZS]);

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

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = form.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalPaid = parseFloat(form.paidUZS || '0') + (parseFloat(form.paidUSD || '0') * parseFloat(exchangeRate || '12500')) + parseFloat(form.paidCLICK || '0');
    const debt = Math.max(0, subtotal - totalPaid);
    
    return {
      subtotal,
      totalPaid,
      debt,
      totalItems: form.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  const totals = calculateTotals();

  // Quick add functions
  const quickAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Mahsulot turini aniqlash
    const isPreform = product.name.toLowerCase().includes('preform') || 
                      product.name.toLowerCase().includes('pref') ||
                      product.warehouse === 'preform';
    
    const isKrishka = product.warehouse === 'caps' || 
                      product.name.toLowerCase().includes('qopqoq') ||
                      product.name.toLowerCase().includes('krishka');
    
    const isRuchka = product.warehouse === 'handles' || 
                     product.name.toLowerCase().includes('ruchka');

    // Add main product
    const existingItem = form.items.find(item => item.productId === productId);
    let currentItems = [...form.items];
    const pricePerBag = parseFloat(product.pricePerBag) || 0;
    const unitsPerBag = product.unitsPerBag || 1000;
    const pricePerPiece = pricePerBag / unitsPerBag;
    
    if (existingItem) {
      updateItemQuantity(existingItem.originalIndex.toString(), existingItem.quantity + 1);
      return;
    } else {
      // Add the product directly
      const newItemData = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        pricePerBag,
        pricePerBagDisplay: pricePerBag.toString(),
        pricePerPiece,
        unitsPerBag,
        subtotal: pricePerBag,
        warehouse: product.warehouse || 'other',
        saleType: 'bag' as 'bag' | 'piece',
        priceMode: 'bag' as 'bag' | 'piece',
        originalIndex: form.items.length
      };
      currentItems.push(newItemData);
      
      // Komplekt logikasi - preform uchun krishka va ruchka qo'shish
      if (isPreform) {
        const nameMatch = product.name.match(/(\d+)/);
        const weight = nameMatch ? parseInt(nameMatch[1]) : 0;
        let krishkaSize = '';
        let ruchkaSize = '';
        
        if ([15, 21, 26, 30].includes(weight)) {
          krishkaSize = '28';
          ruchkaSize = '28';
        } else if ([52, 70].includes(weight)) {
          krishkaSize = '38';
          ruchkaSize = '38';
        } else if ([75, 80, 85, 86, 135].includes(weight)) {
          krishkaSize = '48';
          ruchkaSize = '48';
        }
        
        const totalUnits = 1 * unitsPerBag;
        
        // Krishka qo'shish
        if (krishkaSize) {
          const krishka = products.find(p => {
            const pIsKrishka = p.warehouse === 'caps' || 
                               p.name.toLowerCase().includes('qopqoq') ||
                               p.name.toLowerCase().includes('krishka');
            const pNumber = p.name.match(/(\d+)/);
            return pIsKrishka && pNumber && pNumber[1] === krishkaSize;
          });
          
          if (krishka) {
            const krishkaUnitsPerBag = krishka.unitsPerBag || 1000;
            const krishkaPricePerBag = parseFloat(krishka.pricePerBag) || 0;
            const krishkaPricePerPiece = krishkaPricePerBag / krishkaUnitsPerBag;
            const krishkaBags = Math.ceil(totalUnits / krishkaUnitsPerBag);
            
            const krishkaItem = {
              productId: krishka.id,
              productName: krishka.name,
              quantity: krishkaBags,
              pricePerBag: krishkaPricePerBag,
              pricePerBagDisplay: krishkaPricePerBag.toString(),
              pricePerPiece: krishkaPricePerPiece,
              unitsPerBag: krishkaUnitsPerBag,
              subtotal: krishkaPricePerBag * krishkaBags,
              warehouse: krishka.warehouse || 'caps',
              saleType: 'bag' as 'bag' | 'piece',
              priceMode: 'bag' as 'bag' | 'piece',
              originalIndex: currentItems.length,
              isAutoAdded: true
            };
            currentItems.push(krishkaItem);
          }
        }
        
        // Ruchka qo'shish (faqat katta o'lchamlar uchun)
        if (ruchkaSize && ![15, 21, 26, 30].includes(weight)) {
          const ruchka = products.find(p => {
            const pIsRuchka = p.warehouse === 'handles' || p.name.toLowerCase().includes('ruchka');
            const pNumber = p.name.match(/(\d+)/);
            return pIsRuchka && pNumber && pNumber[1] === ruchkaSize;
          });
          
          if (ruchka) {
            const ruchkaUnitsPerBag = ruchka.unitsPerBag || 1000;
            const ruchkaPricePerBag = parseFloat(ruchka.pricePerBag) || 0;
            const ruchkaPricePerPiece = ruchkaPricePerBag / ruchkaUnitsPerBag;
            const ruchkaBags = Math.ceil(totalUnits / ruchkaUnitsPerBag);
            
            const ruchkaItem = {
              productId: ruchka.id,
              productName: ruchka.name,
              quantity: ruchkaBags,
              pricePerBag: ruchkaPricePerBag,
              pricePerBagDisplay: ruchkaPricePerBag.toString(),
              pricePerPiece: ruchkaPricePerPiece,
              unitsPerBag: ruchkaUnitsPerBag,
              subtotal: ruchkaPricePerBag * ruchkaBags,
              warehouse: ruchka.warehouse || 'handles',
              saleType: 'bag' as 'bag' | 'piece',
              priceMode: 'bag' as 'bag' | 'piece',
              originalIndex: currentItems.length,
              isAutoAdded: true
            };
            currentItems.push(ruchkaItem);
          }
        }
      }
      
      setForm(prev => ({ ...prev, items: currentItems }));
    }
  };

  const quickAddCustomer = (customerId: string) => {
    setForm(prev => ({ ...prev, customerId }));
    setActiveStep('products');
  };

  const quickPayment = (amount: number, method: 'UZS' | 'USD' | 'CLICK') => {
    if (method === 'UZS') {
      setForm(prev => ({ ...prev, paidUZS: (parseFloat(prev.paidUZS || '0') + amount).toString() }));
    } else if (method === 'USD') {
      setForm(prev => ({ ...prev, paidUSD: (parseFloat(prev.paidUSD || '0') + amount).toString() }));
    } else {
      setForm(prev => ({ ...prev, paidCLICK: (parseFloat(prev.paidCLICK || '0') + amount).toString() }));
    }
  };

  // Step navigation
  const nextStep = () => {
    if (activeStep === 'customer' && !form.customerId && !form.manualCustomerName) {
      return; // Require customer selection
    }
    if (activeStep === 'products' && form.items.length === 0) {
      return; // Require at least one item
    }
    
    const steps: Array<'customer' | 'products' | 'payment' | 'review'> = ['customer', 'products', 'payment', 'review'];
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Array<'customer' | 'products' | 'payment' | 'review'> = ['customer', 'products', 'payment', 'review'];
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
    }
  };


  const replaceProductType = (itemIndex: string, newType: string) => {
    const item = form.items.find(item => item.originalIndex === itemIndex);
    if (!item) return;

    let newProduct = null;
    if (newType === 'preform') {
      newProduct = products.find(p => 
        p.name.toLowerCase().includes('preform') || 
        p.name.toLowerCase().includes('pref')
      );
    } else if (newType === 'krishka') {
      newProduct = products.find(p => 
        p.name.toLowerCase().includes('krishka') || 
        p.name.toLowerCase().includes('qopqoq')
      );
    } else if (newType === 'ruchka') {
      newProduct = products.find(p => 
        p.name.toLowerCase().includes('ruchka') || 
        p.name.toLowerCase().includes('qopqoq')
      );
    }

    if (newProduct) {
      const updatedItems = form.items.map(i => {
        if (i.originalIndex === itemIndex) {
          return {
            ...i,
            productId: newProduct.id,
            productName: newProduct.name,
            pricePerBag: parseFloat(newProduct.pricePerBag),
            pricePerBagDisplay: newProduct.pricePerBag,
            pricePerPiece: parseFloat(newProduct.pricePerBag) / (newProduct.unitsPerBag || 1000),
            unitsPerBag: newProduct.unitsPerBag || 1000,
            warehouse: newProduct.warehouse || 'other',
            subtotal: i.quantity * (i.saleType === 'piece' || i.priceMode === 'piece' ? i.pricePerPiece : parseFloat(newProduct.pricePerBag))
          };
        }
        return i;
      });
      setForm(prev => ({ ...prev, items: updatedItems }));
    }
    setShowTypeSelector(null);
  };

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.pricePerBag) {
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    if (!product) return;

    const existingItem = form.items.find(item => item.productId === newItem.productId);
    
    if (existingItem) {
      updateItemQuantity(existingItem.originalIndex.toString(), existingItem.quantity + parseInt(newItem.quantity));
    } else {
      const quantity = parseInt(newItem.quantity);
      const pricePerBag = parseFloat(newItem.pricePerBag);
      const pricePerPiece = pricePerBag / (product.unitsPerBag || 1000);
      const isPieceSale = newItem.saleType === 'piece' || newItem.priceMode === 'piece';
      const subtotal = quantity * (isPieceSale ? pricePerPiece : pricePerBag);

      const newItemData = {
        productId: newItem.productId,
        productName: product.name,
        quantity,
        pricePerBag,
        pricePerBagDisplay: newItem.pricePerBag,
        pricePerPiece: pricePerBag / (product.unitsPerBag || 1000),
        unitsPerBag: product.unitsPerBag || 1000,
        subtotal,
        warehouse: product.warehouse || 'other',
        saleType: newItem.saleType || 'bag',
        priceMode: newItem.priceMode || 'bag',
        originalIndex: form.items.length
      };

      setForm(prev => ({ ...prev, items: [...prev.items, newItemData] }));
    }

    setNewItem({ productId: '', productName: '', quantity: '', pricePerBag: '', saleType: 'bag', priceMode: 'bag' });
  };

  const removeItem = (index: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.originalIndex !== parseInt(index))
    }));
  };

  const updateItemQuantity = (index: string, quantity: number) => {
    if (quantity < 1) return;

    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.originalIndex === parseInt(index)) {
          const isPieceSale = item.saleType === 'piece' || item.priceMode === 'piece';
          const newSubtotal = quantity * (isPieceSale ? item.pricePerPiece : item.pricePerBag);
          return { ...item, quantity, subtotal: newSubtotal };
        }
        return item;
      })
    }));
  };

  const updateItemPrice = (index: string, price: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.originalIndex === parseInt(index)) {
          const isPieceSale = item.saleType === 'piece' || item.priceMode === 'piece';
          const newSubtotal = item.quantity * (isPieceSale ? price / item.unitsPerBag : price);
          return { 
            ...item, 
            pricePerBag: price, 
            pricePerBagDisplay: price.toString(),
            pricePerPiece: price / item.unitsPerBag,
            subtotal: newSubtotal 
          };
        }
        return item;
      })
    }));
  };

  // Filter products by category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                        product.code?.toLowerCase().includes(productSearchQuery.toLowerCase());
    
    if (activeProductCategory === 'all') return matchesSearch;
    if (activeProductCategory === 'preform') {
      return matchesSearch && (product.name.toLowerCase().includes('preform') || product.name.toLowerCase().includes('pref'));
    }
    if (activeProductCategory === 'krishka') {
      return matchesSearch && (product.name.toLowerCase().includes('krishka') || product.name.toLowerCase().includes('qopqoq'));
    }
    if (activeProductCategory === 'ruchka') {
      return matchesSearch && (product.name.toLowerCase().includes('ruchka'));
    }
    return matchesSearch;
  });

  // Group products by category
  const groupedProducts = filteredProducts.reduce((groups, product) => {
    let category = 'other';
    if (product.name.toLowerCase().includes('preform') || product.name.toLowerCase().includes('pref')) {
      category = 'preform';
    } else if (product.name.toLowerCase().includes('krishka') || product.name.toLowerCase().includes('qopqoq')) {
      category = 'krishka';
    } else if (product.name.toLowerCase().includes('ruchka')) {
      category = 'ruchka';
    }
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, any[]>);

  const toggleProductGroup = (category: string) => {
    setExpandedProductGroups(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validation
      const validation = validateSale(form);
      if (!validation.isValid) {
        Object.values(validation.errors).forEach(error => {
          console.error(error);
        });
        setIsProcessing(false);
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
        total: totals.subtotal,
        paid: totals.totalPaid,
        debt: totals.debt,
        exchangeRate: parseFloat(exchangeRate),
        createdAt: new Date(),
        status: totals.debt > 0 ? 'partial' : 'completed'
      };

      // Save sale
      const response = isEditMode 
        ? await api.put(`/sales/${editSale.id}`, saleData)
        : await api.post('/sales', saleData);

      // Create accounting entry
      if (response.data) {
        await createJournalEntry({
          date: new Date(),
          reference: response.data.id,
          description: `Sale to ${form.customerName || form.manualCustomerName}`,
          entries: [
            {
              id: '',
              accountId: '4010',
              entryId: '',
              type: AccountingEntryType.INCOME,
              amount: totals.subtotal,
              currency: form.currency as Currency,
              description: 'Sales Revenue',
              date: new Date(),
              balance: 0,
              reconciled: false
            }
          ],
          status: 'posted',
          createdBy: 'system',
          metadata: { saleId: response.data.id }
        });
      }

      // Update customer if manual
      if (form.manualCustomerName && form.manualCustomerPhone) {
        await api.post('/customers', {
          name: form.manualCustomerName,
          phone: form.manualCustomerPhone,
          createdAt: new Date()
        });
      }

      setLastSavedSale(response.data);
      setShowSuccessModal(true);

    } catch (error) {
      errorHandler.handleError(error, { action: 'saveSale' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { id: 'customer', label: 'Mijoz', icon: User },
      { id: 'products', label: 'Mahsulotlar', icon: Package },
      { id: 'payment', label: 'To\'lov', icon: CreditCard },
      { id: 'review', label: 'Tekshirish', icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              activeStep === step.id 
                ? 'border-blue-500 bg-blue-500 text-white' 
                : steps.findIndex(s => s.id === activeStep) > index 
                  ? 'border-gray-300 bg-white text-gray-400'
                  : 'border-green-500 bg-green-500 text-white'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <span className={`ml-2 text-sm font-medium ${
              activeStep === step.id ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-4 ${
                steps.findIndex(s => s.id === activeStep) > index 
                  ? 'bg-gray-300' 
                  : 'bg-green-500'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render customer step
  const renderCustomerStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Mijozni tanlang</h3>
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Zap className="w-4 h-4" />
          Tezkor amallar
        </button>
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Tezkor mijozlar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {customers.slice(0, 6).map(customer => (
              <button
                key={customer.id}
                onClick={() => quickAddCustomer(customer.id)}
                className="flex items-center gap-2 p-2 bg-white hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.phone}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Customer Search */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Mijozlarni qidirish..."
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers
          .filter(customer => 
            customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            customer.phone?.includes(customerSearch)
          )
          .map(customer => (
            <button
              key={customer.id}
              onClick={() => setForm(prev => ({ ...prev, customerId: customer.id, customerName: customer.name }))}
              className={`p-4 border rounded-lg transition-all ${
                form.customerId === customer.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                  {customer.totalPurchases > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-500">
                        {formatCurrency(customer.totalPurchases, Currency.UZS)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>

      {/* Manual Customer */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Yangi mijoz qo'shish</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
            <input
              type="text"
              value={form.manualCustomerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, manualCustomerName: e.target.value }))}
              placeholder="Mijoz ismi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="text"
              value={form.manualCustomerPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, manualCustomerPhone: e.target.value }))}
              placeholder="+998 XX XXX XX XX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render products step
  const renderProductsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Mahsulotlarni tanlang</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProductSearch(!showProductSearch)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
            Qidirish
          </button>
          <button
            onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Barcode className="w-4 h-4" />
            Barcode
          </button>
        </div>
      </div>

      {/* Product Search */}
      {showProductSearch && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Mahsulotlarni qidirish..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveProductCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeProductCategory === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Barchasi
        </button>
        <button
          onClick={() => setActiveProductCategory('preform')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeProductCategory === 'preform' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Preformalar
        </button>
        <button
          onClick={() => setActiveProductCategory('krishka')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeProductCategory === 'krishka' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Qopqoqlar
        </button>
        <button
          onClick={() => setActiveProductCategory('ruchka')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeProductCategory === 'ruchka' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Ruchkalar
        </button>
      </div>

      {/* Product Groups */}
      <div className="space-y-4">
        {(Object.entries(groupedProducts) as [string, any[]][]).map(([category, categoryProducts]) => (
          <div key={category} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleProductGroup(category)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedProductGroups.includes(category) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 capitalize">
                  {category === 'preform' ? 'Preformalar' : 
                   category === 'krishka' ? 'Qopqoqlar' : 
                   category === 'ruchka' ? 'Ruchkalar' : 'Boshqa'}
                </span>
                <span className="text-sm text-gray-500">({categoryProducts.length})</span>
              </div>
            </button>
            
            {expandedProductGroups.includes(category) && (
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {categoryProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => quickAddProduct(product.id)}
                      className="flex items-center justify-between p-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.code}</p>
                        <p className="text-sm font-medium text-blue-600">
                          {formatCurrency(parseFloat(product.pricePerBag), Currency.UZS)}
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-blue-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart Items */}
      {form.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Savatdagi mahsulotlar</h4>
          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div key={item.originalIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} {item.saleType === 'piece' || item.priceMode === 'piece' ? 'dona' : 'qop'} × {formatCurrency(item.saleType === 'piece' || item.priceMode === 'piece' ? item.pricePerPiece : item.pricePerBag, Currency.UZS)} = {formatCurrency(item.subtotal, Currency.UZS)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateItemQuantity(item.originalIndex.toString(), item.quantity - 1)}
                    className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.originalIndex.toString(), item.quantity + 1)}
                    className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.originalIndex.toString())}
                    className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center"
                    title="O'chirish"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render payment step
  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">To'lov ma'lumotlari</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Kalkulyator
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-4">Buyurtma xulosasi</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Mahsulotlar soni:</span>
            <span className="font-medium">{totals.totalItems} ta</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jami summa:</span>
            <span className="font-medium text-blue-600">{formatCurrency(totals.subtotal, Currency.UZS)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To'langan:</span>
            <span className="font-medium text-green-600">{formatCurrency(totals.totalPaid, Currency.UZS)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-medium">Qarz:</span>
            <span className={`font-bold ${totals.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totals.debt, Currency.UZS)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Naqd pul (UZS)</label>
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-600" />
            <input
              type="text"
              inputMode="decimal"
              value={form.paidUZS || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
                setForm(prev => ({ ...prev, paidUZS: val }));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => quickPayment(100000, 'UZS')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              100k
            </button>
            <button
              onClick={() => quickPayment(500000, 'UZS')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              500k
            </button>
            <button
              onClick={() => quickPayment(1000000, 'UZS')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              1M
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Naqd pul (USD)</label>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <input
              type="text"
              inputMode="decimal"
              value={form.paidUSD || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
                setForm(prev => ({ ...prev, paidUSD: val }));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => quickPayment(10, 'USD')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              $10
            </button>
            <button
              onClick={() => quickPayment(50, 'USD')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              $50
            </button>
            <button
              onClick={() => quickPayment(100, 'USD')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              $100
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Click</label>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            <input
              type="text"
              inputMode="decimal"
              value={form.paidCLICK || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
                setForm(prev => ({ ...prev, paidCLICK: val }));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => quickPayment(50000, 'CLICK')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              50k
            </button>
            <button
              onClick={() => quickPayment(100000, 'CLICK')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              100k
            </button>
            <button
              onClick={() => quickPayment(200000, 'CLICK')}
              className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              200k
            </button>
          </div>
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">Valyuta kursi</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">1 USD =</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="12500"
              aria-label="Valyuta kursi"
              value={exchangeRate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value.replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
                setExchangeRate(val);
              }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">UZS</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render review step
  const renderReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Sotuvni tasdiqlash</h3>
      
      {/* Customer Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Mijoz ma'lumotlari</h4>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {form.customerName || form.manualCustomerName}
            </p>
            <p className="text-sm text-gray-500">{form.manualCustomerPhone}</p>
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Mahsulotlar ({form.items.length} ta)</h4>
        <div className="space-y-2">
          {form.items.map((item) => (
            <div key={item.originalIndex} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} {item.saleType === 'piece' || item.priceMode === 'piece' ? 'dona' : 'qop'} × {formatCurrency(item.saleType === 'piece' || item.priceMode === 'piece' ? item.pricePerPiece : item.pricePerBag, Currency.UZS)}
                </p>
              </div>
              <p className="font-medium text-gray-900">{formatCurrency(item.subtotal, Currency.UZS)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">To'lov xulosasi</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Jami summa:</span>
            <span className="font-medium">{formatCurrency(totals.subtotal, Currency.UZS)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To'langan (UZS):</span>
            <span className="font-medium">{formatCurrency(parseFloat(form.paidUZS || '0'), Currency.UZS)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To'langan (USD):</span>
            <span className="font-medium">{formatCurrency(parseFloat(form.paidUSD || '0') * parseFloat(exchangeRate), Currency.UZS)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To'langan (Click):</span>
            <span className="font-medium">{formatCurrency(parseFloat(form.paidCLICK || '0'), Currency.UZS)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-medium">Qarz:</span>
            <span className={`font-bold text-lg ${totals.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totals.debt, Currency.UZS)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">E'tibor bering</p>
            <p className="text-sm text-yellow-700">
              Sotuvni tasdiqlashdan oldin barcha ma'lumotlarni tekshiring. 
              {totals.debt > 0 && ' Qarzli sotuv bo\'ladi.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/sales')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Orqaga"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Sotuvni tahrirlash' : 'Yangi sotuv'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Jami summa</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totals.subtotal, Currency.UZS)}</p>
              </div>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Sozlamalar"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeStep === 'customer' && renderCustomerStep()}
          {activeStep === 'products' && renderProductsStep()}
          {activeStep === 'payment' && renderPaymentStep()}
          {activeStep === 'review' && renderReviewStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={activeStep === 'customer'}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </button>

          {activeStep === 'review' ? (
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {isProcessing ? 'Saqlanmoqda...' : 'Sotuvni tasdiqlash'}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Keyingisi
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && lastSavedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              Sotuv muvaffaqiyatli amalga oshirildi!
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Sotuv #{lastSavedSale.id.slice(-8)} saqlandi
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/sales');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Ro'yxatga qaytish
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form for new sale
                  setForm({
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
                  });
                  setActiveStep('customer');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
              Yangi sotuv
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
