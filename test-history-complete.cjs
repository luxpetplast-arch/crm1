/**
 * TARIXLAR (HISTORY) TO'LIQ TEST
 * 
 * Bu test barcha tarix funksiyalarini tekshiradi:
 * 1. Sales History (Sotuvlar tarixi)
 * 2. Inventory History (Ombor tarixi)
 * 3. Cashbox History (Kassa tarixi)
 * 4. Stock Movements (Ombor harakatlari)
 * 5. Audit Logs (Audit loglar)
 * 6. Customer Purchase History (Mijoz xaridlar tarixi)
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testData = {
  productId: '',
  customerId: '',
  saleId: ''
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
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
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
// 1. AUTHENTICATION
// ============================================
async function login() {
  section('1. AUTHENTICATION');
  
  try {
    info('Login qilish...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    success('Login muvaffaqiyatli');
    return true;
  } catch (err) {
    error('Login xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 2. SETUP - Test ma'lumotlarini yaratish
// ============================================
async function setupTestData() {
  section('2. TEST MA\'LUMOTLARINI YARATISH');
  
  try {
    // Product yaratish
    info('Mahsulot yaratish...');
    const productRes = await axios.post(
      `${API_URL}/products`,
      {
        name: `Test History Product ${Date.now()}`,
        bagType: 'SMALL',
        unitsPerBag: 50,
        minStockLimit: 10,
        optimalStock: 50,
        maxCapacity: 100,
        currentStock: 100,
        pricePerBag: 100,
        productionCost: 80
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    testData.productId = productRes.data.id;
    success(`Mahsulot yaratildi: ${productRes.data.name}`);
    
    // Customer yaratish
    info('Mijoz yaratish...');
    const customerRes = await axios.post(
      `${API_URL}/customers`,
      {
        name: `Test History Customer ${Date.now()}`,
        phone: `+99890${Math.floor(Math.random() * 10000000)}`,
        category: 'NORMAL'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    testData.customerId = customerRes.data.id;
    success(`Mijoz yaratildi: ${customerRes.data.name}`);
    
    // Sale yaratish
    info('Sotuv yaratish...');
    const saleRes = await axios.post(
      `${API_URL}/sales`,
      {
        customerId: testData.customerId,
        productId: testData.productId,
        quantity: 5,
        pricePerBag: 100,
        totalAmount: 500,
        paidAmount: 300,
        currency: 'USD'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    testData.saleId = saleRes.data.id;
    success(`Sotuv yaratildi: ${saleRes.data.id}`);
    
    // Stock movement yaratish
    info('Ombor harakatini yaratish...');
    await axios.post(
      `${API_URL}/products/${testData.productId}/stock`,
      {
        quantity: 10,
        type: 'ADD',
        reason: 'Test qo\'shish'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    success('Ombor harakati yaratildi');
    
    return true;
  } catch (err) {
    error('Setup xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 3. SALES HISTORY TEST
// ============================================
async function testSalesHistory() {
  section('3. SALES HISTORY TEST');
  
  try {
    // Get all sales
    info('Barcha sotuvlarni olish...');
    const allSalesRes = await axios.get(`${API_URL}/sales`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    success(`Jami sotuvlar: ${allSalesRes.data.length}`);
    
    // Get sales by customer
    info('Mijoz bo\'yicha sotuvlarni olish...');
    const customerSalesRes = await axios.get(
      `${API_URL}/sales?customerId=${testData.customerId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    success(`Mijoz sotuvlari: ${customerSalesRes.data.length}`);
    
    // Get sales by product
    info('Mahsulot bo\'yicha sotuvlarni olish...');
    const productSalesRes = await axios.get(
      `${API_URL}/sales?productId=${testData.productId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    success(`Mahsulot sotuvlari: ${productSalesRes.data.length}`);
    
    // Get sales by date range
    info('Sana oralig\'i bo\'yicha sotuvlarni olish...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateRangeSalesRes = await axios.get(
      `${API_URL}/sales?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    success(`Bugungi sotuvlar: ${dateRangeSalesRes.data.length}`);
    
    // Get single sale details
    info('Bitta sotuvni batafsil olish...');
    const saleDetailRes = await axios.get(
      `${API_URL}/sales/${testData.saleId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    success(`Sotuv topildi: ${saleDetailRes.data.id}`);
    info(`  - Mijoz: ${saleDetailRes.data.customer?.name}`);
    info(`  - Mahsulot: ${saleDetailRes.data.product?.name}`);
    info(`  - Miqdor: ${saleDetailRes.data.quantity}`);
    info(`  - Jami: ${saleDetailRes.data.totalAmount}`);
    
    return true;
  } catch (err) {
    error('Sales History test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 4. INVENTORY HISTORY TEST
// ============================================
async function testInventoryHistory() {
  section('4. INVENTORY HISTORY TEST');
  
  try {
    // Get stock movements
    info('Ombor harakatlarini olish...');
    const movementsRes = await axios.get(
      `${API_URL}/products/${testData.productId}/movements`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (movementsRes.data && movementsRes.data.length > 0) {
      success(`Jami harakatlar: ${movementsRes.data.length}`);
      
      // Har bir harakat turini sanash
      const types = {};
      movementsRes.data.forEach(m => {
        types[m.type] = (types[m.type] || 0) + 1;
      });
      
      info('Harakat turlari:');
      Object.keys(types).forEach(type => {
        info(`  - ${type}: ${types[type]} ta`);
      });
      
      // Oxirgi harakatni ko'rsatish
      const lastMovement = movementsRes.data[0];
      info('Oxirgi harakat:');
      info(`  - Tur: ${lastMovement.type}`);
      info(`  - Miqdor: ${lastMovement.quantity}`);
      info(`  - Sabab: ${lastMovement.reason}`);
      info(`  - Oldingi stock: ${lastMovement.previousStock}`);
      info(`  - Yangi stock: ${lastMovement.newStock}`);
    } else {
      warning('Ombor harakatlari topilmadi');
    }
    
    // Get inventory audit stats
    info('Ombor audit statistikasini olish...');
    try {
      const auditStatsRes = await axios.get(
        `${API_URL}/inventory-ai/audit/stats`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      success('Audit statistikasi olindi');
      info(`  - Jami harakatlar: ${auditStatsRes.data.totalActions || 0}`);
      info(`  - Jami foydalanuvchilar: ${auditStatsRes.data.uniqueUsers || 0}`);
    } catch (auditErr) {
      warning('Audit statistikasi endpoint topilmadi');
    }
    
    return true;
  } catch (err) {
    error('Inventory History test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 5. CASHBOX HISTORY TEST
// ============================================
async function testCashboxHistory() {
  section('5. CASHBOX HISTORY TEST');
  
  try {
    // Get cashbox transactions
    info('Kassa tranzaksiyalarini olish...');
    const transactionsRes = await axios.get(
      `${API_URL}/cashbox/transactions`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    success(`Jami tranzaksiyalar: ${transactionsRes.data.length}`);
    
    if (transactionsRes.data.length > 0) {
      // Tranzaksiya turlarini sanash
      const types = {};
      const categories = {};
      
      transactionsRes.data.forEach(t => {
        types[t.type] = (types[t.type] || 0) + 1;
        categories[t.category] = (categories[t.category] || 0) + 1;
      });
      
      info('Tranzaksiya turlari:');
      Object.keys(types).forEach(type => {
        info(`  - ${type}: ${types[type]} ta`);
      });
      
      info('Tranzaksiya kategoriyalari:');
      Object.keys(categories).forEach(cat => {
        info(`  - ${cat}: ${categories[cat]} ta`);
      });
      
      // Oxirgi tranzaksiyani ko'rsatish
      const lastTrans = transactionsRes.data[0];
      info('Oxirgi tranzaksiya:');
      info(`  - Tur: ${lastTrans.type}`);
      info(`  - Kategoriya: ${lastTrans.category}`);
      info(`  - Summa: ${lastTrans.amount}`);
      info(`  - Tavsif: ${lastTrans.description}`);
    }
    
    // Get cashbox summary
    info('Kassa xulosasini olish...');
    const summaryRes = await axios.get(
      `${API_URL}/cashbox/summary`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    success('Kassa xulosasi:');
    info(`  - Jami kirim: ${summaryRes.data.totalIncome || 0}`);
    info(`  - Jami chiqim: ${summaryRes.data.totalExpense || 0}`);
    info(`  - Balans: ${summaryRes.data.balance || 0}`);
    
    return true;
  } catch (err) {
    error('Cashbox History test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 6. CUSTOMER PURCHASE HISTORY TEST
// ============================================
async function testCustomerPurchaseHistory() {
  section('6. CUSTOMER PURCHASE HISTORY TEST');
  
  try {
    // Get customer details with sales
    info('Mijoz ma\'lumotlarini olish...');
    const customerRes = await axios.get(
      `${API_URL}/customers/${testData.customerId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    success(`Mijoz: ${customerRes.data.name}`);
    info(`  - Balans: ${customerRes.data.balance}`);
    info(`  - Qarz: ${customerRes.data.debt}`);
    
    if (customerRes.data.sales && customerRes.data.sales.length > 0) {
      success(`Jami xaridlar: ${customerRes.data.sales.length}`);
      
      // Jami xarid summasini hisoblash
      const totalPurchases = customerRes.data.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalPaid = customerRes.data.sales.reduce((sum, sale) => sum + sale.paidAmount, 0);
      
      info('Xaridlar xulosasi:');
      info(`  - Jami xarid: ${totalPurchases}`);
      info(`  - To'langan: ${totalPaid}`);
      info(`  - Qarz: ${totalPurchases - totalPaid}`);
      
      // Oxirgi xaridni ko'rsatish
      const lastSale = customerRes.data.sales[0];
      info('Oxirgi xarid:');
      info(`  - Mahsulot: ${lastSale.product?.name || 'N/A'}`);
      info(`  - Miqdor: ${lastSale.quantity}`);
      info(`  - Summa: ${lastSale.totalAmount}`);
      info(`  - Sana: ${new Date(lastSale.createdAt).toLocaleString()}`);
    } else {
      warning('Mijoz xaridlari topilmadi');
    }
    
    // Get customer payments
    if (customerRes.data.payments && customerRes.data.payments.length > 0) {
      success(`Jami to'lovlar: ${customerRes.data.payments.length}`);
      
      const totalPayments = customerRes.data.payments.reduce((sum, p) => sum + p.amount, 0);
      info(`Jami to'langan: ${totalPayments}`);
    }
    
    return true;
  } catch (err) {
    error('Customer Purchase History test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 7. AUDIT LOGS TEST
// ============================================
async function testAuditLogs() {
  section('7. AUDIT LOGS TEST');
  
  try {
    // Get audit logs
    info('Audit loglarni olish...');
    try {
      const auditRes = await axios.get(
        `${API_URL}/audit-logs`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (auditRes.data && auditRes.data.length > 0) {
        success(`Jami audit loglar: ${auditRes.data.length}`);
        
        // Action turlarini sanash
        const actions = {};
        const entities = {};
        
        auditRes.data.forEach(log => {
          actions[log.action] = (actions[log.action] || 0) + 1;
          entities[log.entity] = (entities[log.entity] || 0) + 1;
        });
        
        info('Action turlari:');
        Object.keys(actions).slice(0, 5).forEach(action => {
          info(`  - ${action}: ${actions[action]} ta`);
        });
        
        info('Entity turlari:');
        Object.keys(entities).forEach(entity => {
          info(`  - ${entity}: ${entities[entity]} ta`);
        });
      } else {
        warning('Audit loglar topilmadi');
      }
    } catch (auditErr) {
      if (auditErr.response?.status === 404) {
        warning('Audit logs endpoint topilmadi');
      } else {
        throw auditErr;
      }
    }
    
    return true;
  } catch (err) {
    error('Audit Logs test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 8. PRODUCT HISTORY TEST
// ============================================
async function testProductHistory() {
  section('8. PRODUCT HISTORY TEST');
  
  try {
    // Get product details
    info('Mahsulot ma\'lumotlarini olish...');
    const productRes = await axios.get(
      `${API_URL}/products/${testData.productId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    success(`Mahsulot: ${productRes.data.name}`);
    info(`  - Joriy stock: ${productRes.data.currentStock}`);
    info(`  - Minimal limit: ${productRes.data.minStockLimit}`);
    info(`  - Optimal stock: ${productRes.data.optimalStock}`);
    
    // Get product sales history
    info('Mahsulot sotuvlar tarixini olish...');
    const productSalesRes = await axios.get(
      `${API_URL}/sales?productId=${testData.productId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (productSalesRes.data.length > 0) {
      success(`Jami sotuvlar: ${productSalesRes.data.length}`);
      
      const totalSold = productSalesRes.data.reduce((sum, sale) => sum + sale.quantity, 0);
      const totalRevenue = productSalesRes.data.reduce((sum, sale) => sum + sale.totalAmount, 0);
      
      info('Sotuvlar xulosasi:');
      info(`  - Jami sotilgan: ${totalSold} qop`);
      info(`  - Jami daromad: ${totalRevenue}`);
    }
    
    return true;
  } catch (err) {
    error('Product History test xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.clear();
  log('\n🧪 TARIXLAR (HISTORY) TO\'LIQ TEST', 'bright');
  log('Boshlandi: ' + new Date().toLocaleString(), 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  const tests = [
    { name: 'Authentication', fn: login },
    { name: 'Setup Test Data', fn: setupTestData },
    { name: 'Sales History', fn: testSalesHistory },
    { name: 'Inventory History', fn: testInventoryHistory },
    { name: 'Cashbox History', fn: testCashboxHistory },
    { name: 'Customer Purchase History', fn: testCustomerPurchaseHistory },
    { name: 'Audit Logs', fn: testAuditLogs },
    { name: 'Product History', fn: testProductHistory }
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
  
  console.log('\n' + '='.repeat(70));
  log(`Jami testlar: ${results.total}`, 'cyan');
  log(`Muvaffaqiyatli: ${results.passed}`, 'green');
  log(`Xatolik: ${results.failed}`, 'red');
  log(`Foiz: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'yellow');
  console.log('='.repeat(70));
  
  log('\nTugadi: ' + new Date().toLocaleString(), 'cyan');
  
  if (results.passed === results.total) {
    log('\n🎉 BARCHA TARIX TESTLARI MUVAFFAQIYATLI O\'TDI!', 'green');
  } else {
    log('\n⚠️  BA\'ZI TESTLAR XATOLIK BILAN TUGADI', 'yellow');
  }
}

// Run tests
runAllTests().catch(err => {
  error('Umumiy xatolik: ' + err.message);
  console.error(err);
  process.exit(1);
});
