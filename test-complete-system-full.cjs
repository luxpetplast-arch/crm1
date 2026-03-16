/**
 * BUTUN TIZIMNI TO'LIQ TEST QILISH
 * 
 * Bu test barcha asosiy funksiyalarni tekshiradi:
 * 1. Authentication (Login/Logout)
 * 2. Products (CRUD)
 * 3. Customers (CRUD + Telegram ID)
 * 4. Sales (Create + Automation)
 * 5. Cashbox (Transactions)
 * 6. Orders (Workflow)
 * 7. Drivers (Management)
 * 8. Customer Chat
 * 9. Telegram ID Linking
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testData = {
  userId: '',
  productId: '',
  customerId: '',
  saleId: '',
  orderId: '',
  driverId: '',
  telegramCustomerId: ''
};

// ANSI rang kodlari
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// ============================================
// 1. AUTHENTICATION TEST
// ============================================
async function testAuthentication() {
  section('1. AUTHENTICATION TEST');
  
  try {
    info('Login qilish...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    testData.userId = response.data.user.id;
    
    success('Login muvaffaqiyatli');
    info(`User: ${response.data.user.name} (${response.data.user.role})`);
    return true;
  } catch (err) {
    error('Login xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 2. PRODUCTS TEST
// ============================================
async function testProducts() {
  section('2. PRODUCTS TEST');
  
  try {
    // Create Product
    info('Mahsulot yaratish...');
    const createRes = await axios.post(
      `${API_URL}/products`,
      {
        name: `Test Product ${Date.now()}`,
        bagType: 'SMALL',
        unitsPerBag: 50,
        minStockLimit: 10,
        optimalStock: 50,
        maxCapacity: 100,
        currentStock: 20,
        pricePerBag: 100,
        productionCost: 80
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.productId = createRes.data.id;
    success(`Mahsulot yaratildi: ${createRes.data.name}`);
    
    // Get Products
    info('Mahsulotlar ro\'yxatini olish...');
    const listRes = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Jami mahsulotlar: ${listRes.data.length}`);
    
    // Get Single Product
    info('Bitta mahsulotni olish...');
    const getRes = await axios.get(`${API_URL}/products/${testData.productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Mahsulot topildi: ${getRes.data.name}`);
    
    // Update Stock
    info('Ombor yangilash...');
    await axios.post(
      `${API_URL}/products/${testData.productId}/stock`,
      {
        quantity: 5,
        type: 'ADD',
        reason: 'Test qo\'shish'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    success('Ombor yangilandi');
    
    return true;
  } catch (err) {
    error('Products test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 3. CUSTOMERS TEST
// ============================================
async function testCustomers() {
  section('3. CUSTOMERS TEST');
  
  try {
    // Create Customer
    info('Mijoz yaratish...');
    const createRes = await axios.post(
      `${API_URL}/customers`,
      {
        name: `Test Customer ${Date.now()}`,
        phone: `+99890${Math.floor(Math.random() * 10000000)}`,
        email: `test${Date.now()}@example.com`,
        category: 'NORMAL'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.customerId = createRes.data.id;
    success(`Mijoz yaratildi: ${createRes.data.name}`);
    
    // Get Customers
    info('Mijozlar ro\'yxatini olish...');
    const listRes = await axios.get(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Jami mijozlar: ${listRes.data.length}`);
    
    // Get Single Customer
    info('Bitta mijozni olish...');
    const getRes = await axios.get(`${API_URL}/customers/${testData.customerId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Mijoz topildi: ${getRes.data.name}`);
    info(`Balans: ${getRes.data.balance}, Qarz: ${getRes.data.debt}`);
    
    return true;
  } catch (err) {
    error('Customers test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 4. TELEGRAM ID LINKING TEST
// ============================================
async function testTelegramIdLinking() {
  section('4. TELEGRAM ID LINKING TEST');
  
  try {
    // Get all customers with Telegram
    info('Telegram mijozlarni olish...');
    const customersRes = await axios.get(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const telegramCustomers = customersRes.data.filter(c => c.telegramChatId);
    
    if (telegramCustomers.length > 0) {
      success(`Telegram mijozlar: ${telegramCustomers.length}`);
      
      const firstCustomer = telegramCustomers[0];
      const uniqueId = firstCustomer.id.slice(-8).toUpperCase();
      
      info(`Test uchun ID: ${uniqueId}`);
      info(`Mijoz: ${firstCustomer.name}`);
      info(`Chat ID: ${firstCustomer.telegramChatId}`);
      
      // Try to create customer with this ID (should update existing)
      info('Telegram ID bilan mijoz bog\'lash...');
      try {
        const linkRes = await axios.post(
          `${API_URL}/customers`,
          {
            name: 'Yangi Test Mijoz',
            phone: '+998901111111',
            category: 'NORMAL',
            telegramId: uniqueId
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        success('Telegram ID muvaffaqiyatli bog\'landi');
        info(`Bog\'langan mijoz: ${linkRes.data.name}`);
      } catch (linkErr) {
        if (linkErr.response?.status === 400) {
          warning('ID allaqachon bog\'langan (kutilgan xatolik)');
        } else {
          throw linkErr;
        }
      }
      
      // Test with invalid ID
      info('Noto\'g\'ri ID bilan test...');
      try {
        await axios.post(
          `${API_URL}/customers`,
          {
            name: 'Invalid Test',
            phone: '+998902222222',
            category: 'NORMAL',
            telegramId: 'INVALID1'
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        error('Noto\'g\'ri ID qabul qilindi (xatolik!)');
      } catch (invalidErr) {
        if (invalidErr.response?.status === 404) {
          success('Noto\'g\'ri ID rad etildi (to\'g\'ri)');
        }
      }
      
    } else {
      warning('Telegram mijozlar yo\'q. Botga /start yuboring.');
    }
    
    return true;
  } catch (err) {
    error('Telegram ID test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 5. SALES TEST
// ============================================
async function testSales() {
  section('5. SALES TEST');
  
  try {
    // Create Sale
    info('Sotuv yaratish...');
    const createRes = await axios.post(
      `${API_URL}/sales`,
      {
        customerId: testData.customerId,
        productId: testData.productId,
        quantity: 2,
        pricePerBag: 100,
        totalAmount: 200, // quantity * pricePerBag
        paidAmount: 150,
        currency: 'USD',
        paymentDetails: JSON.stringify({
          uzs: 0,
          usd: 150,
          click: 0
        })
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.saleId = createRes.data.id;
    success(`Sotuv yaratildi: ${createRes.data.id}`);
    info(`Jami: ${createRes.data.totalAmount}, To'langan: ${createRes.data.paidAmount}`);
    
    // Check automation flags
    if (createRes.data.automationStatus) {
      const status = createRes.data.automationStatus;
      info('Avtomatlashtirish:');
      info(`  - Ombor: ${status.stockDeducted ? '✅' : '❌'}`);
      info(`  - Kassa: ${status.cashboxUpdated ? '✅' : '❌'}`);
      info(`  - Invoice: ${status.invoiceGenerated ? '✅' : '❌'}`);
      info(`  - Telegram: ${status.telegramSent ? '✅' : '❌'}`);
    }
    
    // Get Sales
    info('Sotuvlar ro\'yxatini olish...');
    const listRes = await axios.get(`${API_URL}/sales`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Jami sotuvlar: ${listRes.data.length}`);
    
    return true;
  } catch (err) {
    error('Sales test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 6. CASHBOX TEST
// ============================================
async function testCashbox() {
  section('6. CASHBOX TEST');
  
  try {
    // Get Cashbox Summary
    info('Kassa xulosasini olish...');
    const summaryRes = await axios.get(`${API_URL}/cashbox/summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    success('Kassa xulosasi:');
    info(`  - Jami kirim: ${summaryRes.data.totalIncome || 0}`);
    info(`  - Jami chiqim: ${summaryRes.data.totalExpense || 0}`);
    info(`  - Balans: ${summaryRes.data.balance || 0}`);
    
    // Get Transactions
    info('Tranzaksiyalar ro\'yxatini olish...');
    const transRes = await axios.get(`${API_URL}/cashbox/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Jami tranzaksiyalar: ${transRes.data.length}`);
    
    return true;
  } catch (err) {
    error('Cashbox test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 7. ORDERS TEST
// ============================================
async function testOrders() {
  section('7. ORDERS TEST');
  
  try {
    // Create Order
    info('Buyurtma yaratish...');
    const createRes = await axios.post(
      `${API_URL}/orders`,
      {
        customerId: testData.customerId,
        requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: 'NORMAL',
        items: [
          {
            productId: testData.productId,
            quantity: 5,
            pricePerBag: 100
          }
        ]
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.orderId = createRes.data.id;
    success(`Buyurtma yaratildi: ${createRes.data.orderNumber}`);
    info(`Status: ${createRes.data.status}`);
    
    // Get Orders
    info('Buyurtmalar ro\'yxatini olish...');
    const listRes = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Jami buyurtmalar: ${listRes.data.length}`);
    
    return true;
  } catch (err) {
    error('Orders test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 8. DRIVERS TEST
// ============================================
async function testDrivers() {
  section('8. DRIVERS TEST');
  
  try {
    // Create Driver
    info('Haydovchi yaratish...');
    const createRes = await axios.post(
      `${API_URL}/drivers`,
      {
        name: `Test Driver ${Date.now()}`,
        phone: `+99890${Math.floor(Math.random() * 10000000)}`,
        licenseNumber: `AB${Math.floor(Math.random() * 1000000)}`,
        vehicleNumber: `01A${Math.floor(Math.random() * 1000)}AA`
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.driverId = createRes.data.id;
    success(`Haydovchi yaratildi: ${createRes.data.name}`);
    
    // Get Drivers
    info('Haydovchilar ro\'yxatini olish...');
    const listRes = await axios.get(`${API_URL}/drivers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Jami haydovchilar: ${listRes.data.length}`);
    
    return true;
  } catch (err) {
    error('Drivers test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 9. CUSTOMER CHAT TEST
// ============================================
async function testCustomerChat() {
  section('9. CUSTOMER CHAT TEST');
  
  try {
    // Get Conversations
    info('Suhbatlar ro\'yxatini olish...');
    const convRes = await axios.get(`${API_URL}/customer-chat/conversations`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Jami suhbatlar: ${convRes.data.length}`);
    
    if (convRes.data.length > 0) {
      const firstConv = convRes.data[0];
      info(`Birinchi suhbat: ${firstConv.customerName}`);
      
      // Get Messages
      info('Xabarlarni olish...');
      const msgRes = await axios.get(
        `${API_URL}/customer-chat/conversations/${firstConv.customerId}/messages`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      success(`Jami xabarlar: ${msgRes.data.length}`);
    } else {
      warning('Suhbatlar yo\'q');
    }
    
    return true;
  } catch (err) {
    error('Customer Chat test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 10. ANALYTICS TEST
// ============================================
async function testAnalytics() {
  section('10. ANALYTICS TEST');
  
  try {
    // Get Dashboard Stats
    info('Dashboard statistikasini olish...');
    const dashRes = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    success('Dashboard statistikasi:');
    info(`  - Jami sotuvlar: ${dashRes.data.totalSales || 0}`);
    info(`  - Jami mijozlar: ${dashRes.data.totalCustomers || 0}`);
    info(`  - Jami mahsulotlar: ${dashRes.data.totalProducts || 0}`);
    
    return true;
  } catch (err) {
    error('Analytics test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.clear();
  log('\n🚀 BUTUN TIZIMNI TO\'LIQ TEST QILISH', 'bright');
  log('Boshlandi: ' + new Date().toLocaleString(), 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Products', fn: testProducts },
    { name: 'Customers', fn: testCustomers },
    { name: 'Telegram ID Linking', fn: testTelegramIdLinking },
    { name: 'Sales', fn: testSales },
    { name: 'Cashbox', fn: testCashbox },
    { name: 'Orders', fn: testOrders },
    { name: 'Drivers', fn: testDrivers },
    { name: 'Customer Chat', fn: testCustomerChat },
    { name: 'Analytics', fn: testAnalytics }
  ];
  
  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
        results.tests.push({ name: test.name, status: 'PASSED' });
      } else {
        results.failed++;
        results.tests.push({ name: test.name, status: 'FAILED' });
      }
    } catch (err) {
      results.failed++;
      results.tests.push({ name: test.name, status: 'ERROR', error: err.message });
      error(`${test.name} test xatolik: ${err.message}`);
    }
  }
  
  // Final Report
  section('YAKUNIY NATIJA');
  
  log('\n📊 TEST NATIJALARI:', 'bright');
  results.tests.forEach(test => {
    if (test.status === 'PASSED') {
      success(`${test.name}: PASSED`);
    } else if (test.status === 'FAILED') {
      error(`${test.name}: FAILED`);
    } else {
      error(`${test.name}: ERROR - ${test.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  log(`Jami testlar: ${results.total}`, 'cyan');
  log(`Muvaffaqiyatli: ${results.passed}`, 'green');
  log(`Xatolik: ${results.failed}`, 'red');
  log(`Foiz: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'yellow');
  console.log('='.repeat(60));
  
  log('\nTugadi: ' + new Date().toLocaleString(), 'cyan');
  
  if (results.passed === results.total) {
    log('\n🎉 BARCHA TESTLAR MUVAFFAQIYATLI O\'TDI!', 'green');
  } else {
    log('\n⚠️  BA\'ZI TESTLAR XATOLIK BILAN TUGADI', 'yellow');
  }
  
  // Test Data Summary
  section('TEST MA\'LUMOTLARI');
  info('Yaratilgan ma\'lumotlar:');
  console.log(JSON.stringify(testData, null, 2));
}

// Run tests
runAllTests().catch(err => {
  error('Umumiy xatolik: ' + err.message);
  console.error(err);
  process.exit(1);
});
