import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SaleFormData, NewItemForm, SaleItemForm, Product, Customer } from '../types';
import {
  DEFAULT_EXCHANGE_RATE,
  getDefaultPiecePrice,
  getDefaultUnitsPerBag,
  getPiecePrice,
  getKomplektTargets,
  calculateTotal,
  calculatePaidAmount,
  calculateDebt,
  validateSaleForm,
} from '../lib/saleUtils';
import api from '../lib/professionalApi';
import { errorHandler } from '../lib/professionalErrorHandler';

export interface UseSaleFormOptions {
  editSale?: any;
  orderData?: any;
}

export const useSaleForm = (options: UseSaleFormOptions = {}) => {
  const navigate = useNavigate();
  const { editSale, orderData: initialOrderData } = options;
  const isEditMode = !!editSale;

  // Form state
  const [form, setForm] = useState<SaleFormData>({
    customerId: editSale?.customerId || '',
    customerName: editSale?.customerName || '',
    items: editSale?.items || [],
    paidUZS: editSale?.paidUZS || '',
    paidUSD: editSale?.paidUSD || '',
    paidCLICK: editSale?.paidCLICK || '',
    paymentType: editSale?.paymentType || 'cash',
    currency: editSale?.currency || 'USD',
    isKocha: editSale?.isKocha || false,
    manualCustomerName: '',
    manualCustomerPhone: '',
  });

  // New item form state
  const [newItem, setNewItem] = useState<NewItemForm>({
    productId: '',
    productName: '',
    quantity: '',
    pricePerBag: '',
    priceDisplayValue: '',
    unitsPerBag: '2000',
    saleType: 'bag',
  });

  // UI state
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'preform' | 'krishka' | 'ruchka' | 'other'>('all');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['15gr', '21gr']);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerPrices, setCustomerPrices] = useState<Record<string, string>>({});

  // Derived values
  const selectedCustomer = useMemo(() => 
    customers.find((c) => c.id === form.customerId),
    [customers, form.customerId]
  );

  const exchangeRateNum = useMemo(() => parseFloat(exchangeRate) || DEFAULT_EXCHANGE_RATE, [exchangeRate]);

  const totalAmount = useMemo(() => calculateTotal(form.items), [form.items]);

  const paidAmount = useMemo(() => 
    calculatePaidAmount(form.paidUZS, form.paidUSD, form.paidCLICK, exchangeRateNum, form.currency),
    [form.paidUZS, form.paidUSD, form.paidCLICK, exchangeRateNum, form.currency]
  );

  const debtAmount = useMemo(() => calculateDebt(totalAmount, paidAmount), [totalAmount, paidAmount]);

  // Load customer prices when customer changes
  useEffect(() => {
    if (selectedCustomer?.productPrices) {
      try {
        const prices = JSON.parse(selectedCustomer.productPrices);
        setCustomerPrices(prices);
      } catch {
        setCustomerPrices({});
      }
    } else {
      setCustomerPrices({});
    }
  }, [selectedCustomer]);

  // Load order data if available
  useEffect(() => {
    if (initialOrderData && products.length > 0) {
      // Set customer
      if (initialOrderData.customer) {
        setForm((prev) => ({
          ...prev,
          customerId: initialOrderData.customer.id,
          customerName: initialOrderData.customer.name,
          isKocha: false,
        }));
      }

      // Set items
      if (initialOrderData.items?.length > 0) {
        const saleItems: SaleItemForm[] = initialOrderData.items.map((item: any) => {
          const product = products.find((p) => p.id === item.productId);
          const pricePerBag = parseFloat(item.price) || 0;
          const quantity = parseFloat(item.quantityBags) || 0;
          const unitsPerBag = product?.unitsPerBag || 2000;

          return {
            productId: item.productId,
            productName: item.productName || product?.name || 'Nomalum',
            quantity: quantity,
            bagDisplayValue: quantity.toString(),
            pricePerBag: pricePerBag,
            pricePerPiece: pricePerBag / unitsPerBag,
            unitsPerBag: unitsPerBag,
            subtotal: quantity * pricePerBag,
            warehouse: product?.warehouse,
            subType: product?.subType,
            saleType: 'bag',
          };
        });

        setForm((prev) => ({ ...prev, items: saleItems }));
      }
    }
  }, [initialOrderData, products]);

  // Update prices when currency changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        const newPricePerBag = form.currency === 'UZS'
          ? item.pricePerBag * exchangeRateNum
          : item.pricePerBag / exchangeRateNum;
        const newSubtotal = typeof item.quantity === 'number'
          ? item.quantity * newPricePerBag
          : parseFloat(item.quantity as string || '0') * newPricePerBag;

        return {
          ...item,
          pricePerBag: newPricePerBag,
          pricePerPiece: newPricePerBag / item.unitsPerBag,
          subtotal: newSubtotal,
        };
      }),
    }));
  }, [form.currency, exchangeRateNum]);

  // Form actions
  const updateFormField = useCallback(<K extends keyof SaleFormData>(field: K, value: SaleFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateNewItemField = useCallback(<K extends keyof NewItemForm>(field: K, value: NewItemForm[K]) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  }, []);

  const selectProduct = useCallback((product: Product, _allProducts: Product[], selectedCustomer: Customer | undefined, customerPrices: Record<string, string>) => {
    let basePrice = parseFloat(product.pricePerBag?.toString() || '0') || 0;

    // Check for customer specific price
    const customerPrice = selectedCustomer && customerPrices[product.id];
    if (customerPrice) {
      basePrice = parseFloat(customerPrice) || 0;
    } else if (selectedCustomer?.pricePerBag) {
      basePrice = parseFloat(selectedCustomer.pricePerBag.toString()) || 0;
    }

    // Check for default piece price
    const defaultPiecePrice = getDefaultPiecePrice(product.name);
    const defaultUnits = getDefaultUnitsPerBag(product.name);
    const unitsPerBag = defaultUnits || product.unitsPerBag || 2000;

    let displayPrice: number;
    let piecePrice: number;

    if (defaultPiecePrice && !customerPrice && !selectedCustomer?.pricePerBag) {
      piecePrice = defaultPiecePrice;
      displayPrice = piecePrice * unitsPerBag;
    } else {
      piecePrice = basePrice / unitsPerBag;
      displayPrice = basePrice;
    }

    // Determine if preform for sale type
    const isPreform = product.warehouse === 'preform' ||
      product.name?.toLowerCase().includes('preform') ||
      /\d+\s*(gr|g|гр|г)/i.test(product.name || '');

    setNewItem({
      productId: product.id,
      productName: product.name,
      quantity: '1',
      pricePerBag: displayPrice.toString(),
      priceDisplayValue: displayPrice.toString(),
      unitsPerBag: unitsPerBag.toString(),
      saleType: isPreform ? 'komplekt' : 'bag',
    });
  }, []);

  const addItem = useCallback(() => {
    if (!newItem.productId || !newItem.quantity) return;

    const product = products.find((p) => p.id === newItem.productId);
    if (!product) return;

    const quantity = parseFloat(newItem.quantity) || 0;

    // Komplekt mode
    if (newItem.saleType === 'komplekt') {
      const { krishkaGram, ruchkaGram, needsRuchka } = getKomplektTargets(product.name);
      const pricePerBag = parseFloat(newItem.pricePerBag || '0') || product.pricePerBag || 0;
      const unitsPerBag = parseFloat(newItem.unitsPerBag || '0') || product.unitsPerBag || 2000;
      const pricePerPiece = pricePerBag / unitsPerBag;
      const subtotal = quantity * pricePerBag;

      const itemsToAdd: SaleItemForm[] = [{
        productId: newItem.productId,
        productName: product.name,
        quantity: quantity.toString(),
        bagDisplayValue: quantity.toString(),
        pricePerBag,
        pricePerPiece,
        unitsPerBag,
        subtotal,
        warehouse: product.warehouse || 'other',
        saleType: 'bag',
      }];

      const totalPieces = quantity * unitsPerBag;

      // Find krishka
      if (krishkaGram) {
        const krishkaProduct = products.find((p) => {
          const name = p.name?.toLowerCase() || '';
          const isKrishka = p.warehouse === 'krishka' || name.includes('krishka') || name.includes('qopqoq');
          return isKrishka && name.includes(krishkaGram.toString());
        });

        if (krishkaProduct) {
          const krishkaUnits = krishkaProduct.unitsPerBag || 2000;
          const krishkaPiecePrice = getPiecePrice(krishkaProduct.name) || 
            (parseFloat(krishkaProduct.pricePerBag?.toString() || '0') / krishkaUnits);
          const krishkaPrice = krishkaPiecePrice * krishkaUnits;
          const krishkaQuantity = Math.ceil(totalPieces / krishkaUnits);

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
            saleType: 'bag',
          });
        }
      }

      // Find ruchka
      if (needsRuchka && ruchkaGram) {
        const ruchkaProduct = products.find((p) => {
          const name = p.name?.toLowerCase() || '';
          const isRuchka = p.warehouse === 'ruchka' || name.includes('ruchka') || name.includes('handle');
          return isRuchka && name.includes(ruchkaGram.toString());
        });

        if (ruchkaProduct) {
          const ruchkaUnits = ruchkaProduct.unitsPerBag || 1000;
          const ruchkaPiecePrice = getPiecePrice(ruchkaProduct.name) ||
            (parseFloat(ruchkaProduct.pricePerBag?.toString() || '0') / ruchkaUnits);
          const ruchkaPrice = ruchkaPiecePrice * ruchkaUnits;
          const ruchkaQuantity = Math.ceil(totalPieces / ruchkaUnits);

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
            saleType: 'bag',
          });
        }
      }

      setForm((prev) => ({ ...prev, items: [...prev.items, ...itemsToAdd] }));
    } else {
      // Regular mode
      const existingIndex = form.items.findIndex((item) => item.productId === newItem.productId);

      const pricePerBag = parseFloat(newItem.pricePerBag || '0') || product.pricePerBag || 0;
      const unitsPerBag = parseFloat(newItem.unitsPerBag || '0') || product.unitsPerBag || 2000;
      const pricePerPiece = pricePerBag / unitsPerBag;
      const isPieceSale = newItem.saleType === 'piece';
      const subtotal = isPieceSale ? quantity * pricePerPiece : quantity * pricePerBag;

      if (existingIndex >= 0) {
        const existingItem = form.items[existingIndex];
        const newQuantity = (typeof existingItem.quantity === 'number' ? existingItem.quantity : parseFloat(existingItem.quantity || '0')) + quantity;

        const updatedItems = [...form.items];
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newQuantity.toString(),
          bagDisplayValue: newQuantity.toString(),
          pricePerBag,
          pricePerPiece,
          subtotal: newQuantity * pricePerBag,
        };
        setForm((prev) => ({ ...prev, items: updatedItems }));
      } else {
        setForm((prev) => ({
          ...prev,
          items: [...prev.items, {
            productId: newItem.productId,
            productName: product.name,
            quantity: newItem.quantity,
            bagDisplayValue: newItem.quantity,
            pricePerBag,
            pricePerPiece,
            unitsPerBag,
            subtotal,
            warehouse: product.warehouse || 'other',
            saleType: newItem.saleType,
          }],
        }));
      }
    }

    // Reset new item
    setNewItem({
      productId: '',
      productName: '',
      quantity: '',
      pricePerBag: '',
      priceDisplayValue: '',
      unitsPerBag: '2000',
      saleType: 'bag',
    });
  }, [newItem, products, form.items]);

  const updateItem = useCallback((index: number, updates: Partial<SaleItemForm>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const clearItems = useCallback(() => {
    setForm((prev) => ({ ...prev, items: [] }));
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      customerId: '',
      customerName: '',
      items: [],
      paidUZS: '',
      paidUSD: '',
      paidCLICK: '',
      paymentType: 'cash',
      currency: form.currency,
      isKocha: false,
      manualCustomerName: '',
      manualCustomerPhone: '',
    });
    setNewItem({
      productId: '',
      productName: '',
      quantity: '',
      pricePerBag: '',
      priceDisplayValue: '',
      unitsPerBag: '2000',
      saleType: 'bag',
    });
  }, [form.currency]);

  const submitSale = useCallback(async () => {
    const validationError = validateSaleForm(form.items, form.customerId, form.manualCustomerName);
    if (validationError) {
      throw new Error(validationError);
    }

    setIsSubmitting(true);

    try {
      const saleData = {
        customerId: form.customerId || null,
        customerName: form.customerName || form.manualCustomerName,
        customerPhone: form.manualCustomerPhone,
        items: form.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity || '0'),
          pricePerBag: item.pricePerBag,
          pricePerPiece: item.pricePerPiece,
          unitsPerBag: item.unitsPerBag,
          subtotal: item.subtotal,
          warehouse: item.warehouse,
          saleType: item.saleType,
        })),
        paymentDetails: {
          uzs: parseFloat(form.paidUZS || '0'),
          usd: parseFloat(form.paidUSD || '0'),
          click: parseFloat(form.paidCLICK || '0'),
        },
        paymentType: form.paymentType,
        currency: form.currency,
        isKocha: form.isKocha,
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        debtAmount: debtAmount,
        exchangeRate: exchangeRateNum,
        createdAt: new Date(),
        status: debtAmount > 0 ? 'partial' : 'completed',
      };

      await api.post('/sales', saleData);

      // Create customer if manual
      if (form.manualCustomerName && form.manualCustomerPhone) {
        await api.post('/customers', {
          name: form.manualCustomerName,
          phone: form.manualCustomerPhone,
          createdAt: new Date(),
        });
      }

      navigate('/sales');
    } catch (error) {
      errorHandler.handleError(error, { action: 'saveSale' });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, totalAmount, paidAmount, debtAmount, exchangeRateNum, navigate]);

  return {
    // State
    form,
    newItem,
    exchangeRate,
    isSubmitting,
    isEditMode,
    customerSearch,
    productSearch,
    activeCategory,
    expandedGroups,
    products,
    customers,
    selectedCustomer,
    customerPrices,

    // Derived values
    exchangeRateNum,
    totalAmount,
    paidAmount,
    debtAmount,

    // Setters
    setProducts,
    setCustomers,
    setExchangeRate,
    setCustomerSearch,
    setProductSearch,
    setActiveCategory,
    setExpandedGroups,

    // Actions
    updateFormField,
    updateNewItemField,
    selectProduct,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    resetForm,
    submitSale,
  };
};

export default useSaleForm;
