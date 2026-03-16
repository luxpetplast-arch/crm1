/**
 * BARCHA API ENDPOINT'LARNI TO'LIQ TEST
 * 
 * Bu test barcha API endpoint'larni tekshiradi va ishlayotgan/ishlamayotganini aniqlaydi
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testData = {
  productId: '',
  customerId: '',
  saleId: '',
  orderId: '',
  driverId: '',
  expenseId: '',
  supplierId: '',
  rawMaterialId: ''
};

// ANSI rang kodlari
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
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

// Test helper
async function testEndpoint(method, url, data = null, description = '') {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: { Authorization: `Bearer ${authToken}` }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    success(`${method.toUpperCase()} ${url} - ${description || 'OK'}`);
    return { success: true, data: response.data, status: response.status };
  } catch (err) {
    if (err.response) {
      error(`${method.toUpperCase()} ${url} - ${err.response.status} ${err.response.statusText}`);
      return { success: false, status: err.response.status, error: err.response.data };
    } else {
      error(`${method.toUpperCase()} ${url} - ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

// ============================================
// 1. AUTHENTICATION APIs
// ============================================
async function testAuthAPIs() {
  section('1. AUTHENTICATION APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // Login
  results.total++;
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    success('POST /auth/login - Login successful');
    results.passed++;
  } catch (err) {
    error('POST /auth/login - Failed');
    results.failed++;
  }
  
  // Get current user
  results.total++;
  const meResult = await testEndpoint('get', '/auth/me', null, 'Get current user');
  if (meResult.success) results.passed++; else results.failed++;
  
  return results;
}

// ============================================
// 2. PRODUCTS APIs
// ============================================
async function testProductsAPIs() {
  section('2. PRODUCTS APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET all products
  results.total++;
  const listResult = await testEndpoint('get', '/products', null, 'Get all products');
  if (listResult.success) results.passed++; else results.failed++;
  
  // POST create product
  results.total++;
  const createResult = await testEndpoint('post', '/products', {
    name: `API Test Product ${Date.now()}`,
    bagType: 'SMALL',
    unitsPerBag: 50,
    minStockLimit: 10,
    optimalStock: 50,
    maxCapacity: 100,
    currentStock: 50,
    pricePerBag: 100,
    productionCost: 80
  }, 'Create product');
  if (createResult.success) {
    results.passed++;
    testData.productId = createResult.data.id;
  } else {
    results.failed++;
  }
  
  // GET single product
  if (testData.productId) {
    results.total++;
    const getResult = await testEndpoint('get', `/products/${testData.productId}`, null, 'Get single product');
    if (getResult.success) results.passed++; else results.failed++;
  }
  
  // PUT update product
  if (testData.productId) {
    results.total++;
    const updateResult = await testEndpoint('put', `/products/${testData.productId}`, {
      pricePerBag: 110
    }, 'Update product');
    if (updateResult.success) results.passed++; else results.failed++;
  }
  
  // POST stock update
  if (testData.productId) {
    results.total++;
    const stockResult = await testEndpoint('post', `/products/${testData.productId}/stock`, {
      quantity: 5,
      type: 'ADD',
      reason: 'API Test'
    }, 'Update stock');
    if (stockResult.success) results.passed++; else results.failed++;
  }
  
  // GET stock movements
  if (testData.productId) {
    results.total++;
    const movementsResult = await testEndpoint('get', `/products/${testData.productId}/movements`, null, 'Get stock movements');
    if (movementsResult.success) results.passed++; else results.failed++;
  }
  
  return results;
}

// ============================================
// 3. CUSTOMERS APIs
// ============================================
async function testCustomersAPIs() {
  section('3. CUSTOMERS APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET all customers
  results.total++;
  const listResult = await testEndpoint('get', '/customers', null, 'Get all customers');
  if (listResult.success) results.passed++; else results.failed++;
  
  // POST create customer
  results.total++;
  const createResult = await testEndpoint('post', '/customers', {
    name: `API Test Customer ${Date.now()}`,
    phone: `+99890${Math.floor(Math.random() * 10000000)}`,
    category: 'NORMAL'
  }, 'Create customer');
  if (createResult.success) {
    results.passed++;
    testData.customerId = createResult.data.id;
  } else {
    results.failed++;
  }
  
  // GET single customer
  if (testData.customerId) {
    results.total++;
    const getResult = await testEndpoint('get', `/customers/${testData.customerId}`, null, 'Get single customer');
    if (getResult.success) results.passed++; else results.failed++;
  }
  
  // PUT update customer
  if (testData.customerId) {
    results.total++;
    const updateResult = await testEndpoint('put', `/customers/${testData.customerId}`, {
      category: 'VIP'
    }, 'Update customer');
    if (updateResult.success) results.passed++; else results.failed++;
  }
  
  // GET customer alerts
  results.total++;
  const alertsResult = await testEndpoint('get', '/customers/alerts/overdue', null, 'Get overdue alerts');
  if (alertsResult.success) results.passed++; else results.failed++;
  
  return results;
}

// ============================================
// 4. SALES APIs
// ============================================
async function testSalesAPIs() {
  section('4. SALES APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET all sales
  results.total++;
  const listResult = await testEndpoint('get', '/sales', null, 'Get all sales');
  if (listResult.success) results.passed++; else results.failed++;
  
  // POST create sale
  if (testData.customerId && testData.productId) {
    results.total++;
    const createResult = await testEndpoint('post', '/sales', {
      customerId: testData.customerId,
      productId: testData.productId,
      quantity: 2,
      pricePerBag: 100,
      totalAmount: 200,
      paidAmount: 150,
      currency: 'USD'
    }, 'Create sale');
    if (createResult.success) {
      results.passed++;
      testData.saleId = createResult.data.id;
    } else {
      results.failed++;
    }
  }
  
  // GET single sale
  if (testData.saleId) {
    results.total++;
    const getResult = await testEndpoint('get', `/sales/${testData.saleId}`, null, 'Get single sale');
    if (getResult.success) results.passed++; else results.failed++;
  }
  
  // GET sales by customer
  if (testData.customerId) {
    results.total++;
    const customerSalesResult = await testEndpoint('get', `/sales?customerId=${testData.customerId}`, null, 'Get sales by customer');
    if (customerSalesResult.success) results.passed++; else results.failed++;
  }
  
  // GET sales by product
  if (testData.productId) {
    results.total++;
    const productSalesResult = await testEndpoint('get', `/sales?productId=${testData.productId}`, null, 'Get sales by product');
    if (productSalesResult.success) results.passed++; else results.failed++;
  }
  
  return results;
}

// ============================================
// 5. ORDERS APIs
// ============================================
async function testOrdersAPIs() {
  section('5. ORDERS APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET all orders
  results.total++;
  const listResult = await testEndpoint('get', '/orders', null, 'Get all orders');
  if (listResult.success) results.passed++; else results.failed++;
  
  // POST create order
  if (testData.customerId && testData.productId) {
    results.total++;
    const createResult = await testEndpoint('post', '/orders', {
      customerId: testData.customerId,
      requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'NORMAL',
      items: [{
        productId: testData.productId,
        quantity: 3,
        pricePerBag: 100
      }]
    }, 'Create order');
    if (createResult.success) {
      results.passed++;
      testData.orderId = createResult.data.id;
    } else {
      results.failed++;
    }
  }
  
  // GET single order
  if (testData.orderId) {
    results.total++;
    const getResult = await testEndpoint('get', `/orders/${testData.orderId}`, null, 'Get single order');
    if (getResult.success) results.passed++; else results.failed++;
  }
  
  // PUT update order status
  if (testData.orderId) {
    results.total++;
    const updateResult = await testEndpoint('put', `/orders/${testData.orderId}/status`, {
      status: 'CONFIRMED'
    }, 'Update order status');
    if (updateResult.success) results.passed++; else results.failed++;
  }
  
  return results;
}

// ============================================
// 6. CASHBOX APIs
// ============================================
async function testCashboxAPIs() {
  section('6. CASHBOX APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET summary
  results.total++;
  const summaryResult = await testEndpoint('get', '/cashbox/summary', null, 'Get cashbox summary');
  if (summaryResult.success) results.passed++; else results.failed++;
  
  // GET transactions
  results.total++;
  const transactionsResult = await testEndpoint('get', '/cashbox/transactions', null, 'Get transactions');
  if (transactionsResult.success) results.passed++; else results.failed++;
  
  return results;
}

// ============================================
// 7. EXPENSES APIs
// ============================================
async function testExpensesAPIs() {
  section('7. EXPENSES APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET all expenses
  results.total++;
  const listResult = await testEndpoint('get', '/expenses', null, 'Get all expenses');
  if (listResult.success) results.passed++; else results.failed++;
  
  // POST create expense
  results.total++;
  const createResult = await testEndpoint('post', '/expenses', {
    category: 'OTHER',
    amount: 100,
    currency: 'USD',
    description: 'API Test Expense'
  }, 'Create expense');
  if (createResult.success) {
    results.passed++;
    testData.expenseId = createResult.data.id;
  } else {
    results.failed++;
  }
  
  return results;
}

// ============================================
// 8. DRIVERS APIs
// ============================================
async function testDriversAPIs() {
  section('8. DRIVERS APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET all drivers
  results.total++;
  const listResult = await testEndpoint('get', '/drivers', null, 'Get all drivers');
  if (listResult.success) results.passed++; else results.failed++;
  
  // POST create driver
  results.total++;
  const createResult = await testEndpoint('post', '/drivers', {
    name: `API Test Driver ${Date.now()}`,
    phone: `+99890${Math.floor(Math.random() * 10000000)}`,
    licenseNumber: `AB${Math.floor(Math.random() * 1000000)}`,
    vehicleNumber: `01A${Math.floor(Math.random() * 1000)}AA`
  }, 'Create driver');
  if (createResult.success) {
    results.passed++;
    testData.driverId = createResult.data.id;
  } else {
    results.failed++;
  }
  
  // GET single driver
  if (testData.driverId) {
    results.total++;
    const getResult = await testEndpoint('get', `/drivers/${testData.driverId}`, null, 'Get single driver');
    if (getResult.success) results.passed++; else results.failed++;
  }
  
  return results;
}

// ============================================
// 9. ANALYTICS APIs
// ============================================
async function testAnalyticsAPIs() {
  section('9. ANALYTICS APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET dashboard stats
  results.total++;
  const dashboardResult = await testEndpoint('get', '/dashboard/stats', null, 'Get dashboard stats');
  if (dashboardResult.success) results.passed++; else results.failed++;
  
  // GET analytics
  results.total++;
  const analyticsResult = await testEndpoint('get', '/analytics', null, 'Get analytics');
  if (analyticsResult.success) results.passed++; else results.failed++;
  
  return results;
}

// ============================================
// 10. CUSTOMER CHAT APIs
// ============================================
async function testCustomerChatAPIs() {
  section('10. CUSTOMER CHAT APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // GET conversations
  results.total++;
  const conversationsResult = await testEndpoint('get', '/customer-chat/conversations', null, 'Get conversations');
  if (conversationsResult.success) results.passed++; else results.failed++;
  
  // GET messages
  if (testData.customerId) {
    results.total++;
    const messagesResult = await testEndpoint('get', `/customer-chat/conversations/${testData.customerId}/messages`, null, 'Get messages');
    if (messagesResult.success) results.passed++; else results.failed++;
  }
  
  return results;
}

// ============================================
// 11. ADDITIONAL APIs
// ============================================
async function testAdditionalAPIs() {
  section('11. ADDITIONAL APIs');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // Suppliers
  results.total++;
  const suppliersResult = await testEndpoint('get', '/suppliers', null, 'Get suppliers');
  if (suppliersResult.success) results.passed++; else results.failed++;
  
  // Raw Materials
  results.total++;
  const rawMaterialsResult = await testEndpoint('get', '/raw-materials', null, 'Get raw materials');
  if (rawMaterialsResult.success) results.passed++; else results.failed++;
  
  // Production
  results.total++;
  const productionResult = await testEndpoint('get', '/production', null, 'Get production orders');
  if (productionResult.success) results.passed++; else results.failed++;
  
  // Tasks
  results.total++;
  const tasksResult = await testEndpoint('get', '/tasks', null, 'Get tasks');
  if (tasksResult.success) results.passed++; else results.failed++;
  
  // Settings
  results.total++;
  const settingsResult = await testEndpoint('get', '/settings', null, 'Get settings');
  if (settingsResult.success) results.passed++; else results.failed++;
  
  // Reports
  results.total++;
  const reportsResult = await testEndpoint('get', '/reports/sales', null, 'Get sales report');
  if (reportsResult.success) results.passed++; else results.failed++;
  
  // Forecast
  results.total++;
  const forecastResult = await testEndpoint('get', '/forecast', null, 'Get forecast');
  if (forecastResult.success) results.passed++; else results.failed++;
  
  // Bots
  results.total++;
  const botsResult = await testEndpoint('get', '/bots/status', null, 'Get bots status');
  if (botsResult.success) results.passed++; else results.failed++;
  
  return results;
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.clear();
  log('\n🧪 BARCHA API ENDPOINT\'LARNI TO\'LIQ TEST', 'bright');
  log('Boshlandi: ' + new Date().toLocaleString(), 'cyan');
  
  const allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    categories: []
  };
  
  const tests = [
    { name: 'Authentication', fn: testAuthAPIs },
    { name: 'Products', fn: testProductsAPIs },
    { name: 'Customers', fn: testCustomersAPIs },
    { name: 'Sales', fn: testSalesAPIs },
    { name: 'Orders', fn: testOrdersAPIs },
    { name: 'Cashbox', fn: testCashboxAPIs },
    { name: 'Expenses', fn: testExpensesAPIs },
    { name: 'Drivers', fn: testDriversAPIs },
    { name: 'Analytics', fn: testAnalyticsAPIs },
    { name: 'Customer Chat', fn: testCustomerChatAPIs },
    { name: 'Additional APIs', fn: testAdditionalAPIs }
  ];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      allResults.total += result.total;
      allResults.passed += result.passed;
      allResults.failed += result.failed;
      allResults.categories.push({
        name: test.name,
        ...result
      });
    } catch (err) {
      error(`${test.name} test xatolik: ${err.message}`);
    }
  }
  
  // Final Report
  section('YAKUNIY NATIJA');
  
  log('\n📊 KATEGORIYA BO\'YICHA NATIJALAR:', 'bright');
  allResults.categories.forEach(cat => {
    const percentage = cat.total > 0 ? ((cat.passed / cat.total) * 100).toFixed(1) : 0;
    const status = percentage == 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
    log(`${status} ${cat.name}: ${cat.passed}/${cat.total} (${percentage}%)`, 
        percentage == 100 ? 'green' : percentage >= 80 ? 'yellow' : 'red');
  });
  
  console.log('\n' + '='.repeat(80));
  log(`Jami API endpoint'lar: ${allResults.total}`, 'cyan');
  log(`Ishlayapti: ${allResults.passed}`, 'green');
  log(`Ishlamayapti: ${allResults.failed}`, 'red');
  log(`Foiz: ${((allResults.passed / allResults.total) * 100).toFixed(1)}%`, 'yellow');
  console.log('='.repeat(80));
  
  log('\nTugadi: ' + new Date().toLocaleString(), 'cyan');
  
  if (allResults.passed === allResults.total) {
    log('\n🎉 BARCHA API ENDPOINT\'LAR ISHLAYAPTI!', 'green');
  } else if (allResults.passed / allResults.total >= 0.9) {
    log('\n✅ KO\'PCHILIK API ENDPOINT\'LAR ISHLAYAPTI!', 'green');
  } else {
    log('\n⚠️  BA\'ZI API ENDPOINT\'LAR ISHLAMAYAPTI', 'yellow');
  }
}

// Run tests
runAllTests().catch(err => {
  error('Umumiy xatolik: ' + err.message);
  console.error(err);
  process.exit(1);
});
