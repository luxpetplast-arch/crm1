import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import CustomerSelector from '../components/CustomerSelector';
import ProductSelector from '../components/ProductSelector';
import DebugInfo from '../components/DebugInfo';
import api from '../lib/api';
import { formatDate, formatDateTime } from '../lib/dateUtils';
import { 
  Package, 
  Plus, 
  Search,
  Brain,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  DollarSign,
  AlertTriangle,
  Clock,
  Activity,
  Bot,
  X,
  AlertCircle
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
    minAmount: '',
    maxAmount: '',
    customerType: 'all' as 'all' | 'vip' | 'regular'
  });

  // Order sorting
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalAmount' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Quick actions
  const [bulkActions, setBulkActions] = useState({
    selectedOrders: [] as string[],
    showBulkActions: false
  });

  // Original filters for compatibility
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // To'lov formasi
  const [paymentForm, setPaymentForm] = useState({
    uzs: 0,
    usd: 0,
    click: 0,
    dueDate: ''
  });

  // Exchange rates for payment calculation
  const [exchangeRates, setExchangeRates] = useState({ USD_TO_UZS: 12500 });
  const [totalPaymentUSD, setTotalPaymentUSD] = useState(0);

  // Load exchange rates
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        // Mock exchange rates - in real app, get from API
        setExchangeRates({ USD_TO_UZS: 12500 });
      } catch (error) {
        console.error('Exchange rates load error:', error);
      }
    };
    loadExchangeRates();
  }, []);

  // Calculate total payment in USD when payment form changes
  useEffect(() => {
    const total = (paymentForm.uzs / exchangeRates.USD_TO_UZS) + paymentForm.usd + (paymentForm.click / exchangeRates.USD_TO_UZS);
    setTotalPaymentUSD(total);
  }, [paymentForm, exchangeRates]);

  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    items: [] as Array<{ productId: string; productName: string; quantityBags: number; quantityUnits: number }>,
    priority: 'NORMAL',
    requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ertaga
    notes: ''
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    customerId?: string;
    items?: string[];
    requestedDate?: string;
  }>({});

  // Inventory check state
  const [inventoryCheck, setInventoryCheck] = useState<any[]>([]);
  const [showInventoryWarning, setShowInventoryWarning] = useState(false);

  // Real-time form state display
  console.log('🔄 Current form state:', {
    customerId: form.customerId,
    customerName: form.customerName,
    items: form.items,
    itemsCount: form.items.length,
    priority: form.priority
  });

  // Track form items changes
  useEffect(() => {
    console.log('📋 Form items changed:', form.items);
    form.items.forEach((item, index) => {
      console.log(`📋 Item ${index}:`, item);
    });
  }, [form.items]);
  
  // Qidiruv
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearches, setProductSearches] = useState<{[key: number]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading data...');
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      
      console.log('📊 Data loaded:');
      console.log('   Orders:', ordersRes.data.length);
      console.log('   Customers:', customersRes.data.length);
      console.log('   Products:', productsRes.data.length);
      
      if (productsRes.data.length > 0) {
        console.log('📦 First product sample:', productsRes.data[0]);
      }
      
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
      
      console.log('✅ Data loaded and state updated');
    } catch (error) {
      console.error('❌ Ma\'lumotlarni yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📋 handleSubmit called');
    console.log('📋 Form state:', form);
    console.log('📋 CustomerId:', form.customerId);
    console.log('📋 Items:', form.items);
    console.log('📋 Items length:', form.items.length);
    
    // Validate form
    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }

    console.log('✅ Validation passed');

    try {
      console.log('Submitting order:', form);
      
      const response = await api.post('/orders', {
        ...form,
        items: form.items.map(item => ({
          ...item,
          quantityUnits: item.quantityUnits || 0 // Dona yo'q, faqat qop
        })),
        requestedDate: new Date(form.requestedDate).toISOString()
      });
      
      console.log('Order created successfully:', response.data);
      
      // Show inventory warnings if any
      if (response.data.inventoryCheck && response.data.inventoryCheck.some((item: any) => item.needProduction > 0)) {
        const warnings = response.data.inventoryCheck
          .filter((item: any) => item.needProduction > 0)
          .map((item: any) => `${item.productName}: ${item.needProduction} qop kerak`)
          .join('\n');
        
        alert(`✅ Buyurtma yaratildi!\n\n⚠️ Omborda yetarli mahsulot yo'q:\n${warnings}\n\nIshlab chiqarish rejasiga qo'shildi.`);
      } else {
        alert('✅ Buyurtma muvaffaqiyatli yaratildi!');
      }
      
      closeForm();
      loadData();
    } catch (error: any) {
      console.error('Buyurtma yaratish xatoliki:', error);
      
      let errorMessage = 'Noma\'lum xatolik';
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
        errorMessage = error.response.data?.error || error.response.data?.message || `Server xatolik (${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'Serverga ulanib bo\'lmadi. Internet aloqasini tekshiring.';
      } else {
        errorMessage = error.message || 'Xatolik yuz berdi';
      }
      
      alert(`❌ Buyurtma yaratilmadi!\n\nXatolik: ${errorMessage}\n\nIltimos, administrator bilan bog'laning.`);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({
      customerId: '',
      customerName: '',
      items: [],
      priority: 'NORMAL',
      requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
    setCustomerSearch('');
    setProductSearches({});
    setFormErrors({});
    setInventoryCheck([]);
    setShowInventoryWarning(false);
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productId: '', productName: '', quantityBags: 0, quantityUnits: 0 }]
    });
  };

  const initializeForm = () => {
    setForm({
      customerId: '',
      customerName: '',
      items: [{ productId: '', productName: '', quantityBags: 0, quantityUnits: 0 }], // Start with one item
      priority: 'NORMAL',
      requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
    setFormErrors({});
    setInventoryCheck([]);
    setShowInventoryWarning(false);
    setShowForm(true);
  };

  const removeItem = (index: number) => {
    const newSearches = {...productSearches};
    delete newSearches[index];
    setProductSearches(newSearches);
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    console.log('🔄 updateItem called:', { index, field, value });
    console.log('🔄 Current items before update:', form.items);
    
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    console.log('📝 Updated item:', newItems[index]);
    console.log('📝 All new items:', newItems);
    
    setForm({
      ...form,
      items: newItems
    });
    
    // Real-time inventory check
    if (field === 'productId' && value) {
      checkInventory(newItems);
    }
    
    console.log('📋 Form after setForm called');
  };

  // Real-time inventory checking
  const checkInventory = async (items: typeof form.items) => {
    const check = [];
    
    for (const item of items) {
      if (!item.productId) continue;
      
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;
      
      const inStock = product.currentStock;
      const needed = item.quantityBags || 0;
      const shortage = Math.max(0, needed - inStock);
      
      check.push({
        productId: product.id,
        productName: product.name,
        ordered: needed,
        inStock: inStock,
        needProduction: shortage,
        status: shortage > 0 ? 'NEED_PRODUCTION' : 'IN_STOCK'
      });
    }
    
    setInventoryCheck(check);
    setShowInventoryWarning(check.some(item => item.status === 'NEED_PRODUCTION'));
  };

  // Form validation
  const validateForm = () => {
    const errors: typeof formErrors = {};
    
    if (!form.customerId) {
      errors.customerId = 'Mijozni tanlang';
    }
    
    if (!form.requestedDate) {
      errors.requestedDate = 'Sana ni tanlang';
    }
    
    // Check if there are any items
    if (form.items.length === 0) {
      errors.items = ['Kamida bitta mahsulot qo\'shishingiz kerak'];
    } else {
      const itemErrors: string[] = [];
      form.items.forEach((item, index) => {
        if (!item.productId) {
          itemErrors.push(`Mahsulot #${index + 1} ni tanlang`);
        }
        if (!item.quantityBags || item.quantityBags <= 0) {
          itemErrors.push(`Mahsulot #${index + 1} uchun miqdorni kiriting`);
        }
      });
      
      if (itemErrors.length > 0) {
        errors.items = itemErrors;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const changeStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Status change error:', error);
    }
  };



  const viewDetails = async (orderId: string) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setSelectedOrder(data);
      setShowDetail(true);
    } catch (error) {
      alert('❌ Ma\'lumotlarni yuklashda xatolik');
    }
  };

  const openPaymentModal = (order: any) => {
    setSelectedOrder(order);
    setPaymentForm({
      uzs: 0,
      usd: order.totalAmount, // Default USD
      click: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 kun keyin
    });
    setShowPaymentModal(true);
  };

  const handleSellOrder = async () => {
    try {
      if (totalPaymentUSD === 0 && !paymentForm.dueDate) {
        return;
      }
      
      const response = await api.post(`/orders/${selectedOrder.id}/sell`, {
        paymentDetails: {
          uzs: paymentForm.uzs,
          usd: paymentForm.usd,
          click: paymentForm.click
        },
        dueDate: paymentForm.dueDate || null
      });
      
      console.log('✅ Savdo muvaffaqiyatli amalga oshirildi:', response.data);
      
      // Print receipt after successful sale
      try {
        const { exec } = require('child_process');
        const fs = require('fs');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        const orderData = {
          orderNumber: selectedOrder.orderNumber,
          cashier: 'Admin',
          customer: selectedOrder.customer,
          items: selectedOrder.items,
          totalAmount: selectedOrder.totalAmount,
          paymentType: 'Naqd',
          paidAmount: paymentForm.uzs + (paymentForm.usd * 12500) + paymentForm.click
        };
        
        const receipt = `
${fs.readFileSync('./src/logo-final.txt', 'utf8')}
****************************************
Сана: ${new Date().toLocaleDateString('uz-UZ')}
Вақт: ${new Date().toLocaleTimeString('uz-UZ')}
Буюртма: ${orderData.orderNumber}
Кассир: ${orderData.cashier}
========================================
МИЁЗ МАЪЛУМОТЛАРИ:
Иси: ${orderData.customer?.name || 'Номаълу'}
Телефон: ${orderData.customer?.phone || 'Мавжуд эмас'}
Манзил: ${orderData.customer?.address || 'Мавжуд эмас'}
Холати: ${orderData.customer?.category || 'Оддий миёз'}
========================================
╔════════════════════╦════╦═════╦════════╗
║     Махсулот      ║ Қоп ║ Нарх ║  Жами  ║
╠════════════════════╬════╬═════╬════════╣
${orderData.items?.map((item: any) => 
  `║ ${(item.product?.name || item.productName || 'Номаълу').substring(0, 16).padEnd(16)} ║ ${item.quantityBags.toString().padStart(2)} ║ ${item.unitPrice?.toString().padStart(4)} ║ ${(item.quantityBags * (item.unitPrice || 0)).toString().padStart(6)} ║`
).join('\n╠════════════════════╬════╬═════╬════════╣\n') || '║ Махсулотлар мавжуд эмас                     ║'}
╠════════════════════╬════╬═════╬════════╣
╚════════════════════╩════╩═════╩════════╝
Жами махсулотлар: ${orderData.items?.length || 0} та
Умумий сумма: ${orderData.totalAmount} сўм
Тўлов тури: ${orderData.paymentType}
Тўланган: ${orderData.paidAmount} сўм
Қайтим: ${orderData.paidAmount - orderData.totalAmount} сўм
========================================
МИЁЗ ҚАРЗ ҲОЛАТИ:
Жорий қарз: ${orderData.customer?.debt || 0} сўм
Бу сувддан кейин: ${(orderData.customer?.debt || 0) + (orderData.totalAmount - (orderData.paidAmount || 0))} сўм
Қарз саналари: ${orderData.customer?.debtDates ? orderData.customer.debtDates.map((date: any) => new Date(date).toLocaleDateString('uz-UZ')).join(', ') : 'Мавжуд эмас'}
Баланс: ${orderData.customer?.balance || 0} сўм
Чегирма лимити: ${orderData.customer?.discountLimit || 0} сўм
========================================
Қўшимча хизматлар:
* Қадоклаш бепул
* Етказиб бериш 2 кун
* Кафолат 1 ой
* Қарзга сотиш мавжуд
========================================
ХАРИДИНГИЗ УЧУН РАҲМАТ!
Қайтиб келишингизни кутамиз!
****************************************
ID: SLS-${selectedOrder.id}
${new Date().toLocaleString('uz-UZ')}
****************************************
        `.trim();
        
        const tempFile = `./sales-receipt-${Date.now()}.txt`;
        fs.writeFileSync(tempFile, receipt, 'utf8');
        
        await execAsync(`powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
        
        setTimeout(() => {
          try {
            fs.unlinkSync(tempFile);
          } catch (error: any) {
            console.log('Temp file cleanup error:', error.message);
          }
        }, 5000);
        
        console.log('✅ Savdo cheki chop etildi');
        
      } catch (printError) {
        console.error('❌ Chek chop etish xatolik:', printError);
        // Don't fail the sale if printing fails
      }
      
      setShowPaymentModal(false);
      setShowDetail(false);
      loadData();
    } catch (error: any) {
      console.error('Sell order error:', error);
    }
  };

  // Haydovchi bilan to'lovni olish
  const [showDriverPaymentModal, setShowDriverPaymentModal] = useState(false);
  const [driverPaymentForm, setDriverPaymentForm] = useState({
    driverId: '',
    paymentMethod: 'CASH', // CASH, TRANSFER, CLICK
    amount: 0,
    notes: ''
  });
  const [drivers, setDrivers] = useState<any[]>([]);

  // Haydovchilarni yuklash
  const loadDrivers = async () => {
    try {
      const { data } = await api.get('/drivers');
      setDrivers(data);
    } catch (error) {
      console.error('Haydovchilarni yuklashda xatolik:', error);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const openDriverPaymentModal = (order: any) => {
    setSelectedOrder(order);
    setDriverPaymentForm({
      driverId: '',
      paymentMethod: 'CASH',
      amount: order.totalAmount - (order.paidAmount || 0),
      notes: `Buyurtma #${order.orderNumber} to'lovi`
    });
    setShowDriverPaymentModal(true);
  };

  const handleDriverPayment = async () => {
    try {
      if (!driverPaymentForm.driverId) {
        alert('❌ Haydovchini tanlang!');
        return;
      }
      
      if (driverPaymentForm.amount <= 0) {
        alert('❌ To\'lov summasini kiriting!');
        return;
      }

      const { data } = await api.post(`/orders/${selectedOrder.id}/driver-payment`, driverPaymentForm);
      
      alert(data.message);
      setShowDriverPaymentModal(false);
      setShowDetail(false);
      loadData();
    } catch (error: any) {
      alert('❌ Xatolik: ' + (error.response?.data?.error || 'Haydovchi to\'lovida xatolik'));
    }
  };

  // Bulk actions handlers
  const toggleOrderSelection = (orderId: string) => {
    setBulkActions(prev => ({
      ...prev,
      selectedOrders: prev.selectedOrders.includes(orderId)
        ? prev.selectedOrders.filter(id => id !== orderId)
        : [...prev.selectedOrders, orderId]
    }));
  };

  const selectAllOrders = () => {
    setBulkActions(prev => ({
      ...prev,
      selectedOrders: filteredOrders.map(order => order.id)
    }));
  };

  const clearSelection = () => {
    setBulkActions(prev => ({
      ...prev,
      selectedOrders: []
    }));
  };

  const bulkStatusChange = async (newStatus: string) => {
    try {
      await Promise.all(
        bulkActions.selectedOrders.map(orderId => 
          api.put(`/orders/${orderId}/status`, { status: newStatus })
        )
      );
      clearSelection();
      loadData();
    } catch (error) {
      console.error('Bulk status change error:', error);
    }
  };
  const filteredOrders = orders.filter(order => {
    // Basic filters
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && order.priority !== priorityFilter) return false;
    if (searchQuery && !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !order.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Advanced filters
    if (advancedFilters.dateRange !== 'all') {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (advancedFilters.dateRange) {
        case 'today':
          if (orderDate < today) return false;
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < monthAgo) return false;
          break;
      }
    }

    if (advancedFilters.minAmount && order.totalAmount < parseFloat(advancedFilters.minAmount)) return false;
    if (advancedFilters.maxAmount && order.totalAmount > parseFloat(advancedFilters.maxAmount)) return false;
    
    if (advancedFilters.customerType !== 'all') {
      if (advancedFilters.customerType === 'vip' && order.customer?.category !== 'VIP') return false;
      if (advancedFilters.customerType === 'regular' && order.customer?.category === 'VIP') return false;
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'totalAmount':
        comparison = a.totalAmount - b.totalAmount;
        break;
      case 'priority':
        const priorityOrder = { LOW: 1, NORMAL: 2, HIGH: 3, URGENT: 4 };
        comparison = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Status bo'yicha guruhlash (Kanban) - PENDING va DELIVERED olib tashlandi
  const groupedOrders = {
    CONFIRMED: filteredOrders.filter(o => o.status === 'CONFIRMED'),
    IN_PRODUCTION: filteredOrders.filter(o => o.status === 'IN_PRODUCTION'),
    READY: filteredOrders.filter(o => o.status === 'READY'),
    SOLD: filteredOrders.filter(o => o.status === 'SOLD')
  };

  const statusConfig = {
    CONFIRMED: { label: 'Tasdiqlandi', icon: CheckCircle, color: 'blue' },
    IN_PRODUCTION: { label: 'Ishlab chiqarilmoqda', icon: Package, color: 'purple' },
    READY: { label: 'Tayyor', icon: CheckCircle, color: 'green' },
    SOLD: { label: 'Sotildi', icon: DollarSign, color: 'emerald' },
    CANCELLED: { label: 'Bekor qilindi', icon: XCircle, color: 'red' }
  };

  // Buyurtmalar statistikasi
  const orderStats = {
    total: orders.length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    inProduction: orders.filter(o => o.status === 'IN_PRODUCTION').length,
    ready: orders.filter(o => o.status === 'READY').length,
    sold: orders.filter(o => o.status === 'SOLD').length,
    fromBot: orders.filter(o => o.orderNumber.startsWith('BOT-')).length,
  };

  // Mahsulotlar bo'yicha statistika
  const productStats: any = {};
  orders.forEach(order => {
    if (order.status !== 'CANCELLED' && order.status !== 'SOLD') {
      order.items?.forEach((item: any) => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            productName: item.product?.name || 'Noma\'lum',
            totalOrdered: 0,
            inStock: 0,
            needProduction: 0
          };
        }
        productStats[item.productId].totalOrdered += item.quantityBags;
      });
    }
  });

  // Ombordagi mahsulotlar bilan solishtirish
  products.forEach(product => {
    if (productStats[product.id]) {
      productStats[product.id].inStock = product.currentStock;
      productStats[product.id].needProduction = Math.max(
        0,
        productStats[product.id].totalOrdered - product.currentStock
      );
    }
  });

  const priorityConfig = {
    LOW: { label: 'Past', color: 'gray' },
    NORMAL: { label: 'Oddiy', color: 'blue' },
    HIGH: { label: 'Yuqori', color: 'orange' },
    URGENT: { label: 'Shoshilinch', color: 'red' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <DebugInfo />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Buyurtmalar</span>
        </h1>
        <Button 
          onClick={initializeForm}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yangi Buyurtma
        </Button>
      </div>

      {/* Statistika Kartochkalari */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Jami */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-300">Jami</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{orderStats.total}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Buyurtma</p>
          </CardContent>
        </Card>

        {/* Tasdiqlandi */}
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-2 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-cyan-600 dark:text-cyan-300">Tasdiqlandi</span>
            </div>
            <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{orderStats.confirmed}</p>
            <p className="text-xs text-cyan-600 dark:text-cyan-400">Buyurtma</p>
          </CardContent>
        </Card>

        {/* Ishlab chiqarilmoqda */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-300">Ishlab chiqarilmoqda</span>
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{orderStats.inProduction}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Buyurtma</p>
          </CardContent>
        </Card>

        {/* Tayyor */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-300">Tayyor</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{orderStats.ready}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Buyurtma</p>
          </CardContent>
        </Card>

        {/* Sotildi */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-2 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">Sotildi</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{orderStats.sold}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Buyurtma</p>
          </CardContent>
        </Card>

        {/* Botdan kelgan */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-2 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">Botdan</span>
            </div>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{orderStats.fromBot}</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Buyurtma</p>
          </CardContent>
        </Card>
      </div>

      {/* Mahsulotlar bo'yicha statistika */}
      {Object.keys(productStats).length > 0 && (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-b border-orange-200 dark:border-orange-800">
            <CardTitle className="text-base sm:text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent font-bold">Mahsulotlar bo'yicha tahlil</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(productStats).map((stat: any, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
                  <h4 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">{stat.productName}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <span className="text-blue-600 dark:text-blue-300 font-medium">📋 Buyurtma:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-200">{stat.totalOrdered} qop</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <span className="text-green-600 dark:text-green-300 font-medium">✅ Tayyor:</span>
                      <span className="font-bold text-green-700 dark:text-green-200">{stat.totalReady} qop</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                      <span className="text-amber-600 dark:text-amber-300 font-medium">📦 Jami:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-200">{stat.totalReady} qop</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtrlar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Basic Search */}
            <div>
              <Input
                placeholder="Qidirish (raqam, mijoz)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Primary Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                className="px-3 py-2 bg-background border border-border rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Barcha statuslar</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 bg-background border border-border rounded-lg"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">Barcha prioritetlar</option>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 bg-background border border-border rounded-lg"
                value={advancedFilters.dateRange}
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateRange: e.target.value as any })}
              >
                <option value="all">Barcha vaqt</option>
                <option value="today">Bugun</option>
                <option value="week">Oxirgi 7 kun</option>
                <option value="month">Oxirgi 30 kun</option>
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Advanced Filters</h3>
              <button
                type="button"
                onClick={() => setBulkActions({ ...bulkActions, showBulkActions: !bulkActions.showBulkActions })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {bulkActions.showBulkActions ? 'Hide' : 'Show'} Advanced
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {bulkActions.showBulkActions && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="block text-xs font-medium mb-1">Customer Type</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    value={advancedFilters.customerType}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, customerType: e.target.value as any })}
                  >
                    <option value="all">All Customers</option>
                    <option value="vip">VIP Only</option>
                    <option value="regular">Regular Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Min Amount ($)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    value={advancedFilters.minAmount}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, minAmount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Max Amount ($)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    value={advancedFilters.maxAmount}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxAmount: e.target.value })}
                    placeholder="999999"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Sorting */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Sort by:</span>
              <select
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="createdAt">Date</option>
                <option value="totalAmount">Amount</option>
                <option value="priority">Priority</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm hover:bg-gray-100"
              >
                {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yangi Buyurtma Formasi */}
      {showForm && (
        <div className="max-h-[85vh] overflow-y-auto">
        <Card className="border-2 border-primary shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 sticky top-0 z-10 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="w-6 h-6 text-primary" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  Yangi Buyurtma - AI Rejalashtirish
                </span>
              </CardTitle>
              <Button 
                type="button" 
                onClick={closeForm} 
                variant="outline" 
                size="sm"
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Form Errors Display */}
            {formErrors.items && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 dark:text-red-300 font-bold text-lg">Xatoliklar:</p>
                </div>
                <ul className="text-red-600 dark:text-red-400 space-y-2">
                  {formErrors.items.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-sm">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mijoz - Katta va qulay */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                <label className="block text-base font-bold mb-4 flex items-center gap-3 text-blue-700 dark:text-blue-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg">1. Mijozni Tanlang</span>
                </label>
                <CustomerSelector
                  customers={customers}
                  selectedId={form.customerId}
                  searchValue={customerSearch}
                  onSearchChange={setCustomerSearch}
                  onSelect={(id, name) => {
                    setForm(prev => ({ ...prev, customerId: id, customerName: name }));
                    if (formErrors.customerId) {
                      setFormErrors(prev => ({ ...prev, customerId: undefined }));
                    }
                  }}
                />
                {formErrors.customerId && (
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.customerId}
                    </p>
                  </div>
                )}
              </div>

              {/* Mahsulotlar - Katta va qulay */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-base font-bold flex items-center gap-3 text-green-700 dark:text-green-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg">2. Mahsulotlarni Qo'shing</span>
                  </label>
                  <Button 
                    type="button" 
                    onClick={addItem} 
                    size="lg" 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Mahsulot Qo'shish
                  </Button>
                </div>
                
                {form.items.length === 0 && (
                  <div className="p-12 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">Mahsulot qo'shish uchun yuqoridagi tugmani bosing</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Kamida bitta mahsulot qo'shishingiz shart</p>
                  </div>
                )}
                
                {formErrors.items && formErrors.items.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                    <p className="text-red-600 text-sm font-semibold mb-2">❌ Xatoliklar:</p>
                    {formErrors.items.map((error, index) => (
                      <p key={index} className="text-red-500 text-sm">• {error}</p>
                    ))}
                  </div>
                )}
                
                {form.items.map((item, index) => (
                  <div key={index} className="mb-6 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 rounded-2xl border-2 border-green-300 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="font-bold text-green-700 dark:text-green-300">Mahsulot #{index + 1}</span>
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => removeItem(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        O'chirish
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Mahsulot</label>
                        <ProductSelector
                          products={products}
                          selectedId={item.productId}
                          searchValue={productSearches[index] || ''}
                          onSearchChange={(value) => {
                            setProductSearches(prev => ({ ...prev, [index]: value }));
                          }}
                          onSelect={(id, name, price) => {
                            console.log('🎯 Orders onSelect called:', { id, name, price, index });
                            try {
                              updateItem(index, 'productId', id);
                              updateItem(index, 'productName', name);
                              console.log('✅ Orders updateItem completed');
                            } catch (error) {
                              console.error('❌ Orders updateItem error:', error);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Miqdor (qop)</label>
                          <input
                            type="number"
                            value={item.quantityBags || ''}
                            onChange={(e) => updateItem(index, 'quantityBags', parseInt(e.target.value) || 0)}
                            placeholder="Necha qop?"
                            min="1"
                            required
                            className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Miqdor (dona)</label>
                          <input
                            type="number"
                            value={item.quantityUnits || ''}
                            onChange={(e) => updateItem(index, 'quantityUnits', parseInt(e.target.value) || 0)}
                            placeholder="Necha dona?"
                            min="0"
                            className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800"
                          />
                        </div>
                      </div>

                      {/* Inventory warning for this item */}
                      {item.productId && inventoryCheck.find(check => check.productId === item.productId && check.needProduction > 0) && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                          <p className="text-orange-600 text-sm font-semibold">
                            ⚠️ Omborda yetarli emas: {inventoryCheck.find(check => check.productId === item.productId)?.inStock} qop bor, 
                            {inventoryCheck.find(check => check.productId === item.productId)?.needProduction} qop kerak
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sana va Izoh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-orange-600">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    3. Yetkazish Sanasi
                  </label>
                  <input
                    type="date"
                    value={form.requestedDate}
                    onChange={(e) => {
                      setForm({ ...form, requestedDate: e.target.value });
                      if (formErrors.requestedDate) {
                        setFormErrors(prev => ({ ...prev, requestedDate: undefined }));
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800"
                  />
                  {formErrors.requestedDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.requestedDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-purple-600">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    4. Prioritet
                  </label>
                  <select
                    className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Izoh */}
              <div>
                <label className="block text-base font-semibold mb-3 flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-sm">📝</span>
                  </div>
                  5. Izoh (ixtiyoriy)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Qo'shimcha izohlar..."
                  rows={3}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Inventory Warning */}
              {showInventoryWarning && inventoryCheck.length > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200">
                  <h3 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Ombor Tekshiruvi
                  </h3>
                  <div className="space-y-2">
                    {inventoryCheck.map((item, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        item.status === 'NEED_PRODUCTION' 
                          ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/40' 
                          : 'border-green-500 bg-green-100 dark:bg-green-900/40'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.productName}</span>
                          <span className={`text-sm font-semibold ${
                            item.status === 'NEED_PRODUCTION' ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {item.status === 'NEED_PRODUCTION' 
                              ? `${item.inStock} → ${item.ordered} (-${item.needProduction})` 
                              : `✅ ${item.inStock} qop bor`
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-orange-600 mt-2">
                    💡 Ishlab chiqarish rejasi avtomatik yaratiladi
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
                <Button type="submit" className="flex-1 text-lg py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" size="lg">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Tahlil va Yaratish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {bulkActions.selectedOrders.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-blue-600">
                  {bulkActions.selectedOrders.length} orders selected
                </span>
                <Button
                  onClick={selectAllOrders}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Select All ({filteredOrders.length})
                </Button>
                <Button
                  onClick={clearSelection}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Bulk Actions:</span>
                <select
                  className="px-2 py-1 text-sm border rounded"
                  onChange={(e) => {
                    if (e.target.value) {
                      bulkStatusChange(e.target.value);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Select Action...</option>
                  <option value="CONFIRMED">Mark as Confirmed</option>
                  <option value="IN_PRODUCTION">Start Production</option>
                  <option value="READY">Mark as Ready</option>
                  <option value="CANCELLED">Cancel Orders</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board - 4 ustun */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.entries(groupedOrders).map(([status, ordersList]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const Icon = config.icon;
          
          return (
            <Card key={status} className="h-fit">
              <CardHeader className={`bg-${config.color}-50 dark:bg-${config.color}-900/20 p-4`}>
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{config.label}</span>
                  </div>
                  <span className="px-2 py-1 bg-background rounded-full text-xs flex-shrink-0">
                    {ordersList.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
                {ordersList.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox for selection */}
                      <input
                        type="checkbox"
                        checked={bulkActions.selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="mt-1 rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      {/* Order content */}
                      <div 
                        className="flex-1"
                        onClick={() => viewDetails(order.id)}
                      >
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900">#{order.orderNumber}</span>
                            <span className={`text-xs px-2 py-1 rounded text-white ${
                              order.status === 'CONFIRMED' ? 'bg-blue-500' :
                              order.status === 'IN_PRODUCTION' ? 'bg-purple-600' :
                              order.status === 'READY' ? 'bg-green-600' :
                              order.status === 'SOLD' ? 'bg-emerald-600' :
                              'bg-gray-400'
                            }`}>
                              {statusConfig[order.status as keyof typeof statusConfig].label}
                            </span>
                          </div>
                          
                          {/* Mijoz */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-blue-600 font-medium">{order.customer?.name}</span>
                            <div className="flex gap-1">
                              {order.customer?.telegramChatId && <span className="text-blue-500">📱</span>}
                              {order.customer?.category === 'VIP' && <span className="text-purple-500">👑</span>}
                            </div>
                          </div>
                          
                          {/* Mahsulotlar */}
                          <div className="text-xs text-gray-600 space-y-1">
                            {order.items?.slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span className="truncate">{item.product?.name}</span>
                                <span className="font-medium">{item.quantityBags}q {item.quantityUnits}d</span>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <div className="text-xs text-gray-400 italic">+{order.items.length - 2} ko'proq...</div>
                            )}
                          </div>
                          
                          {/* Vaqt va Summa */}
                          <div className="flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-gray-100">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.requestedDate)}
                            </span>
                            <div className="text-right">
                              <span className="font-bold text-blue-600 text-sm">${order.totalAmount?.toFixed(2)}</span>
                              {order.priority !== 'NORMAL' && (
                                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded text-white ${
                                  order.priority === 'HIGH' ? 'bg-orange-500' :
                                  order.priority === 'URGENT' ? 'bg-red-500' :
                                  'bg-gray-500'
                                }`}>
                                  {order.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowDetail(false)}
        >
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Card 
            className="max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
          >
            <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-b-2 border-primary/20 sticky top-0 z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    Buyurtma #{selectedOrder.orderNumber}
                    {selectedOrder.orderNumber.startsWith('BOT-') && (
                      <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded text-xs font-bold flex items-center gap-1">
                        🤖 BOT
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {formatDateTime(selectedOrder.createdAt)}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowDetail(false)} 
                  variant="outline" 
                  size="sm"
                  className="flex-shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <XCircle className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Yopish</span>
                </Button>
              </div>
            </CardHeader>
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* Asosiy Ma'lumotlar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    Mijoz
                  </p>
                  <p className="font-semibold text-sm sm:text-base">{selectedOrder.customer?.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedOrder.customer?.phone}</p>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    selectedOrder.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    selectedOrder.status === 'IN_PRODUCTION' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    selectedOrder.status === 'READY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    selectedOrder.status === 'SOLD' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {React.createElement(statusConfig[selectedOrder.status as keyof typeof statusConfig].icon, { className: 'w-3 h-3 sm:w-4 sm:h-4' })}
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                  </span>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Prioritet</p>
                  <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-white ${
                    selectedOrder.priority === 'LOW' ? 'bg-gray-600' :
                    selectedOrder.priority === 'NORMAL' ? 'bg-blue-600' :
                    selectedOrder.priority === 'HIGH' ? 'bg-orange-600' :
                    'bg-red-600'
                  }`}>
                    {priorityConfig[selectedOrder.priority as keyof typeof priorityConfig].label}
                  </span>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                    Jami Summa
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedOrder.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Mahsulotlar */}
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Mahsulotlar
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-gradient-to-r from-muted to-muted/50 rounded-lg flex flex-col sm:flex-row justify-between gap-2 hover:shadow-md transition-shadow border border-border/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base">{item.product?.name || 'Mahsulot'}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-blue-700 dark:text-blue-300 mr-2">
                            {item.quantityBags} qop
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 rounded text-purple-700 dark:text-purple-300">
                            {item.quantityUnits} dona
                          </span>
                        </p>
                      </div>
                      <p className="font-bold text-base sm:text-lg text-green-600 dark:text-green-400 self-end sm:self-center">
                        ${item.subtotal?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Rejasi */}
              {selectedOrder.productionPlan && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Ishlab Chiqarish Rejasi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">AI Ishonch</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedOrder.productionPlan.aiConfidence}%
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Reja Turi</p>
                      <p className="text-lg font-semibold">
                        {selectedOrder.productionPlan.planType}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold">
                        {selectedOrder.productionPlan.status}
                      </p>
                    </div>
                  </div>

                  {/* AI Tavsiyalari */}
                  {selectedOrder.productionPlan.recommendations && (
                    <div>
                      <h4 className="font-semibold mb-2">AI Tavsiyalari</h4>
                      <div className="space-y-2">
                        {JSON.parse(selectedOrder.productionPlan.recommendations).map((rec: any, index: number) => (
                          <div key={index} className={`p-3 rounded-lg border-l-4 ${
                            rec.type === 'CRITICAL' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                            rec.type === 'WARNING' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                            'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          }`}>
                            <p className="font-semibold text-sm">{rec.title}</p>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                            <p className="text-sm font-medium mt-1">💡 {rec.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t-2 border-primary/20 pt-4 sticky bottom-0 bg-background/95 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 text-sm sm:text-base">Status O'zgartirish</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedOrder.status === 'CONFIRMED' && (
                    <>
                      <Button 
                        onClick={() => {
                          changeStatus(selectedOrder.id, 'IN_PRODUCTION');
                          setShowDetail(false);
                        }} 
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Ishlab Chiqarishni Boshlash
                      </Button>
                      <Button 
                        onClick={() => {
                          changeStatus(selectedOrder.id, 'CANCELLED');
                          setShowDetail(false);
                        }} 
                        variant="destructive"
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Bekor Qilish
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === 'IN_PRODUCTION' && (
                    <>
                      <Button 
                        onClick={() => {
                          changeStatus(selectedOrder.id, 'READY');
                          setShowDetail(false);
                        }} 
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tayyor Deb Belgilash
                      </Button>
                      <Button 
                        onClick={() => {
                          changeStatus(selectedOrder.id, 'CANCELLED');
                          setShowDetail(false);
                        }} 
                        variant="destructive"
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Bekor Qilish
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === 'READY' && (
                    <>
                      <Button 
                        onClick={() => {
                          setShowDetail(false);
                          openPaymentModal(selectedOrder);
                        }} 
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Sotish va To'lov Qabul Qilish
                      </Button>
                      <Button 
                        onClick={() => {
                          changeStatus(selectedOrder.id, 'CANCELLED');
                          setShowDetail(false);
                        }} 
                        variant="destructive"
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Bekor Qilish
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === 'SOLD' && (
                    <div className="col-span-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-700 dark:text-green-300 text-center mb-2">
                        Buyurtma sotildi!
                      </p>
                      <div className="text-sm space-y-1">
                        <p>💰 To'langan: <span className="font-bold">${selectedOrder.paidAmount?.toFixed(2)}</span></p>
                        {selectedOrder.totalAmount - selectedOrder.paidAmount > 0 && (
                          <p className="text-red-600 dark:text-red-400">
                            📋 Qarz: <span className="font-bold">${(selectedOrder.totalAmount - selectedOrder.paidAmount).toFixed(2)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedOrder.status === 'DELIVERED' && (
                    <div className="col-span-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        Buyurtma muvaffaqiyatli yetkazildi!
                      </p>
                    </div>
                  )}
                  {selectedOrder.status === 'CANCELLED' && (
                    <div className="col-span-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                      <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="font-semibold text-red-700 dark:text-red-300">
                        Buyurtma bekor qilingan
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            </div>
          </Card>
          </div>
        </div>
      )}

      {/* To'lov Modali */}
      {showPaymentModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowPaymentModal(false)}
        >
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Card className="max-w-2xl w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-b-2 border-green-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      To'lov Qabul Qilish
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Buyurtma #{selectedOrder.orderNumber}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowPaymentModal(false)} 
                    variant="outline" 
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Jami summa */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-muted-foreground mb-1">Jami Summa</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${selectedOrder.totalAmount?.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ {(selectedOrder.totalAmount * exchangeRates.USD_TO_UZS).toLocaleString()} UZS
                  </p>
                </div>

                {/* To'lov inputlari */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">To'lov Turlari</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">💵 UZS (so'm)</label>
                      <Input
                        type="number"
                        value={paymentForm.uzs}
                        onChange={(e) => setPaymentForm({ ...paymentForm, uzs: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="1000"
                        className="text-right"
                      />
                      {paymentForm.uzs > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈ ${(paymentForm.uzs / exchangeRates.USD_TO_UZS).toFixed(2)} USD
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-1">💵 USD (dollar)</label>
                      <Input
                        type="number"
                        value={paymentForm.usd}
                        onChange={(e) => setPaymentForm({ ...paymentForm, usd: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="text-right"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-1">💳 Click</label>
                      <Input
                        type="number"
                        value={paymentForm.click}
                        onChange={(e) => setPaymentForm({ ...paymentForm, click: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="1000"
                        className="text-right"
                      />
                      {paymentForm.click > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈ ${(paymentForm.click / exchangeRates.USD_TO_UZS).toFixed(2)} USD
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Jami to'lov */}
                  <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Jami To'lov:</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          ${totalPaymentUSD.toFixed(2)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          ≈ {(totalPaymentUSD * exchangeRates.USD_TO_UZS).toLocaleString()} UZS
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Qarz */}
                  {(selectedOrder.totalAmount - totalPaymentUSD) > 0 && (
                    <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg border border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">Qarz:</span>
                        <div className="text-right">
                          <span className="text-xl font-bold text-red-600 dark:text-red-400">
                            ${(selectedOrder.totalAmount - totalPaymentUSD).toFixed(2)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            ≈ {((selectedOrder.totalAmount - totalPaymentUSD) * exchangeRates.USD_TO_UZS).toLocaleString()} UZS
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-red-700 dark:text-red-300">
                          📅 To'lov Sanasi (Qarz Muddati)
                        </label>
                        <Input
                          type="date"
                          value={paymentForm.dueDate}
                          onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation warning */}
                  {totalPaymentUSD === 0 && !paymentForm.dueDate && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        ⚠️ Iltimos, to'lov summasini yoki qarz muddatini kiriting
                      </p>
                    </div>
                  )}
                </div>

                {/* Mijoz ma'lumotlari */}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Mijoz</p>
                  <p className="font-semibold">{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer?.phone}</p>
                  {selectedOrder.customer?.telegramChatId && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✅ Telegram orqali chek yuboriladi
                    </p>
                  )}
                </div>

                {/* Tugmalar */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={handleSellOrder}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sotish va Saqlash
                  </Button>
                  <Button 
                    onClick={() => openDriverPaymentModal(selectedOrder)}
                    variant="outline"
                    className="flex-1"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Haydovchi to'lovi
                  </Button>
                  <Button 
                    onClick={() => setShowPaymentModal(false)}
                    variant="outline"
                  >
                    Bekor qilish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Haydovchi To'lov Modali */}
      {showDriverPaymentModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowDriverPaymentModal(false)}
        >
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Card className="max-w-2xl w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b-2 border-blue-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      Haydovchi To'lovini Qabul Qilish
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Buyurtma #{selectedOrder.orderNumber}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowDriverPaymentModal(false)} 
                    variant="outline" 
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Buyurtma ma'lumotlari */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-muted-foreground mb-1">Buyurtma Summasi</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${selectedOrder.totalAmount?.toFixed(2)}
                  </p>
                  {selectedOrder.paidAmount > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      ✅ Avval to'langan: ${selectedOrder.paidAmount?.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Haydovchi tanlash */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Haydovchini Tanlang</h3>
                  <select
                    value={driverPaymentForm.driverId}
                    onChange={(e) => setDriverPaymentForm({ ...driverPaymentForm, driverId: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Haydovchini tanlang...</option>
                    {drivers.filter(d => d.active).map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} - {driver.vehicleNumber} - ⭐ {driver.rating}/5.0
                      </option>
                    ))}
                  </select>
                </div>

                {/* To'lov usuli */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">To'lov Usuli</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDriverPaymentForm({ ...driverPaymentForm, paymentMethod: 'CASH' })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        driverPaymentForm.paymentMethod === 'CASH'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      💵 Naqd
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriverPaymentForm({ ...driverPaymentForm, paymentMethod: 'TRANSFER' })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        driverPaymentForm.paymentMethod === 'TRANSFER'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      🏦 Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriverPaymentForm({ ...driverPaymentForm, paymentMethod: 'CLICK' })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        driverPaymentForm.paymentMethod === 'CLICK'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      💳 Click
                    </button>
                  </div>
                </div>

                {/* To'lov summasi */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">To'lov Summasi</h3>
                  <Input
                    type="number"
                    value={driverPaymentForm.amount}
                    onChange={(e) => setDriverPaymentForm({ ...driverPaymentForm, amount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    placeholder="To'lov summasini kiriting..."
                    className="text-right text-lg"
                  />
                </div>

                {/* Izoh */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Izoh</h3>
                  <textarea
                    value={driverPaymentForm.notes}
                    onChange={(e) => setDriverPaymentForm({ ...driverPaymentForm, notes: e.target.value })}
                    placeholder="Qo'shimcha izoh..."
                    className="w-full p-2 border rounded-lg resize-none"
                    rows={3}
                  />
                </div>

                {/* Mijoz ma'lumotlari */}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Mijoz</p>
                  <p className="font-semibold">{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer?.phone}</p>
                </div>

                {/* Tugmalar */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={handleDriverPayment}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    To'lovni Qabul Qilish
                  </Button>
                  <div>
                    <Button 
                      onClick={() => setShowDriverPaymentModal(false)}
                      variant="outline"
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
