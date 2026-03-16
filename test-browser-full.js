#!/usr/bin/env node

/**
 * 🚀 TO'LIQ BRAUZER TEST SKRIPTI
 * 
 * Bu skript barcha sahifalarni test qiladi va xatolarni topadi
 */

const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Test ma'lumotlari
let authToken = '';
let testCustomerId = '';
let testProductId = '';
let testSaleId = '';
let testOrderId = '';

// Statistika
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('uz-UZ');
  const prefix = `[${timestamp}]`;
  
  switch(type) {
    case 'success':
      console.log(chalk.green(`✅ ${prefix} ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`❌ ${prefix} ${message}`));
      break;
    case 'warning':
      console.log(chalk.yellow(`⚠️  ${prefix} ${message}`));
      break;
    case 'info':
      console.log(chalk.blue(`ℹ️  ${prefix} ${message}`));
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

function section(title) {
  console.log('\n' + chalk.cyan.bold('='.repeat(60)));
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.cyan.bold('='.repeat(60)) + '\n');
}

async function test(name, fn) {
  stats.total++;
  try {
    await fn();
    stats.passed++;
    log(`${name}`, 'success');
  } catch (error) {
    stats.failed++;
    const errorMsg = error.response?.data?.message || error.message;
    log(`${name}: ${errorMsg}`, 'error');
    stats.errors.push({ test: name, error: errorMsg });
  }
}

// API helper
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth interceptor
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testServerHealth() {
  section('1️⃣  SERVER HEALTH CHECK');
  
  await test('Backend server ishlamoqda', async () => {
    const response = await axios.get(`${BASE_URL}/api/health`);
    if (response.status !== 200) throw new Error('Server javob bermadi');
  });
  
  await test('Frontend server ishlamoqda', async () => {
    const response = await axios.get(FRONTEND_URL);
    if (response.status !== 200) throw new Error('Frontend javob bermadi');
  });
}

async function testAuthentication() {
  section('2️⃣  AUTHENTICATION');
  
  await test('Login - Admin', async () => {
    const response = await api.post('/api/auth/login', {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    if (!response.data.token) throw new Error('Token qaytmadi');
    authToken = response.data.token;
    log(`Token olindi: ${authToken.substring(0, 20)}...`, 'info');
  });
  
  await test('Token bilan API so\'rov', async () => {
    const response = await api.get('/api/dashboard/stats');
    if (response.status !== 200) throw new Error('Dashboard stats olmadi');
  });
}

async function testDashboard() {
  section('3️⃣  DASHBOARD');
  
  await test('Dashboard statistikasi', async () => {
    const response = await api.get('/api/dashboard/stats');
    const data = response.data;
    
    if (typeof data.todayRevenue === 'undefined') throw new Error('todayRevenue yo\'q');
    if (typeof data.monthRevenue === 'undefined') throw new Error('monthRevenue yo\'q');
    if (typeof data.totalProfit === 'undefined') throw new Error('totalProfit yo\'q');
    
    log(`Bugungi daromad: ${data.todayRevenue} UZS`, 'info');
    log(`Oylik daromad: ${data.monthRevenue} UZS`, 'info');
  });
  
  await test('Top mahsulotlar', async () => {
    const response = await api.get('/api/dashboard/top-products');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
  });
  
  await test('Kam zaxira mahsulotlar', async () => {
    const response = await api.get('/api/dashboard/low-stock');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
  });
}

async function testProducts() {
  section('4️⃣  PRODUCTS MODULE');
  
  await test('Mahsulotlar ro\'yxati', async () => {
    const response = await api.get('/api/products');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
    
    if (response.data.length > 0) {
      testProductId = response.data[0].id;
      log(`Test mahsulot ID: ${testProductId}`, 'info');
    }
  });
  
  await test('Mahsulot qo\'shish', async () => {
    const response = await api.post('/api/products', {
      name: `Test Mahsulot ${Date.now()}`,
      code: `TEST-${Date.now()}`,
      category: 'PREFORM',
      unitsPerBag: 1000,
      pricePerBag: 50000,
      minStockBags: 10,
      description: 'Test uchun yaratilgan'
    });
    
    if (!response.data.id) throw new Error('ID qaytmadi');
    testProductId = response.data.id;
    log(`Yangi mahsulot yaratildi: ${testProductId}`, 'info');
  });
  
  if (testProductId) {
    await test('Mahsulot tafsilotlari', async () => {
      const response = await api.get(`/api/products/${testProductId}`);
      if (!response.data.id) throw new Error('Mahsulot topilmadi');
    });
    
    await test('Mahsulot yangilash', async () => {
      const response = await api.put(`/api/products/${testProductId}`, {
        pricePerBag: 55000
      });
      if (response.data.pricePerBag !== 55000) throw new Error('Yangilanmadi');
    });
  }
}

async function testCustomers() {
  section('5️⃣  CUSTOMERS MODULE');
  
  await test('Mijozlar ro\'yxati', async () => {
    const response = await api.get('/api/customers');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
    
    if (response.data.length > 0) {
      testCustomerId = response.data[0].id;
      log(`Test mijoz ID: ${testCustomerId}`, 'info');
    }
  });
  
  await test('Mijoz qo\'shish', async () => {
    const response = await api.post('/api/customers', {
      name: `Test Mijoz ${Date.now()}`,
      phone: `+998901234567`,
      address: 'Test manzil',
      type: 'REGULAR'
    });
    
    if (!response.data.id) throw new Error('ID qaytmadi');
    testCustomerId = response.data.id;
    log(`Yangi mijoz yaratildi: ${testCustomerId}`, 'info');
  });
  
  if (testCustomerId) {
    await test('Mijoz profili', async () => {
      const response = await api.get(`/api/customers/${testCustomerId}`);
      if (!response.data.id) throw new Error('Mijoz topilmadi');
    });
    
    await test('Mijoz sotuvlari', async () => {
      const response = await api.get(`/api/customers/${testCustomerId}/sales`);
      if (!Array.isArray(response.data)) throw new Error('Array emas');
    });
  }
}

async function testSales() {
  section('6️⃣  SALES MODULE');
  
  await test('Sotuvlar ro\'yxati', async () => {
    const response = await api.get('/api/sales');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
  });
  
  if (testCustomerId && testProductId) {
    await test('Yangi sotuv yaratish (Multi-product)', async () => {
      const response = await api.post('/api/sales', {
        customerId: testCustomerId,
        items: [
          {
            productId: testProductId,
            quantity: 5,
            pricePerBag: 50000
          }
        ],
        paymentDetails: {
          uzs: 250000,
          usd: 0,
          click: 0
        }
      });
      
      if (!response.data.id) throw new Error('ID qaytmadi');
      testSaleId = response.data.id;
      log(`Yangi sotuv yaratildi: ${testSaleId}`, 'info');
    });
  }
  
  await test('Sotuvlar statistikasi', async () => {
    const response = await api.get('/api/sales/stats');
    if (typeof response.data.totalSales === 'undefined') throw new Error('totalSales yo\'q');
  });
}

async function testOrders() {
  section('7️⃣  ORDERS MODULE');
  
  await test('Buyurtmalar ro\'yxati', async () => {
    const response = await api.get('/api/orders');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
  });
  
  if (testCustomerId && testProductId) {
    await test('Yangi buyurtma yaratish', async () => {
      const response = await api.post('/api/orders', {
        customerId: testCustomerId,
        items: [
          {
            productId: testProductId,
            quantity: 100,
            pricePerBag: 50000
          }
        ],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'MEDIUM',
        notes: 'Test buyurtma'
      });
      
      if (!response.data.id) throw new Error('ID qaytmadi');
      testOrderId = response.data.id;
      log(`Yangi buyurtma yaratildi: ${testOrderId}`, 'info');
    });
  }
  
  if (testOrderId) {
    await test('Buyurtma statusini o\'zgartirish', async () => {
      const response = await api.patch(`/api/orders/${testOrderId}/status`, {
        status: 'IN_PRODUCTION'
      });
      if (response.data.status !== 'IN_PRODUCTION') throw new Error('Status o\'zgarmadi');
    });
  }
}

async function testCashbox() {
  section('8️⃣  CASHBOX MODULE');
  
  await test('Kassa balansi', async () => {
    const response = await api.get('/api/cashbox/balance');
    if (typeof response.data.totalBalance === 'undefined') throw new Error('totalBalance yo\'q');
    log(`Jami balans: ${response.data.totalBalance} UZS`, 'info');
  });
  
  await test('Tranzaksiyalar', async () => {
    const response = await api.get('/api/cashbox/transactions');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
  });
  
  await test('Kunlik pul oqimi', async () => {
    const response = await api.get('/api/cashbox/daily-flow');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
  });
}

async function testAnalytics() {
  section('9️⃣  ANALYTICS MODULE');
  
  await test('AI Analytics', async () => {
    const response = await api.get('/api/analytics/ai-insights');
    if (!response.data) throw new Error('Ma\'lumot yo\'q');
  });
  
  await test('Mijoz segmentatsiyasi', async () => {
    const response = await api.get('/api/analytics/customer-segments');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
  });
}

async function testExpenses() {
  section('🔟 EXPENSES MODULE');
  
  await test('Xarajatlar ro\'yxati', async () => {
    const response = await api.get('/api/expenses');
    if (!Array.isArray(response.data)) throw new Error('Array emas');
  });
  
  await test('Xarajat qo\'shish', async () => {
    const response = await api.post('/api/expenses', {
      category: 'UTILITIES',
      amount: 500000,
      currency: 'UZS',
      description: 'Test xarajat',
      date: new Date().toISOString()
    });
    
    if (!response.data.id) throw new Error('ID qaytmadi');
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runAllTests() {
  console.log(chalk.bold.cyan('\n🚀 TO\'LIQ BRAUZER TEST BOSHLANDI\n'));
  console.log(chalk.gray(`Vaqt: ${new Date().toLocaleString('uz-UZ')}`));
  console.log(chalk.gray(`Backend: ${BASE_URL}`));
  console.log(chalk.gray(`Frontend: ${FRONTEND_URL}\n`));
  
  try {
    await testServerHealth();
    await testAuthentication();
    await testDashboard();
    await testProducts();
    await testCustomers();
    await testSales();
    await testOrders();
    await testCashbox();
    await testAnalytics();
    await testExpenses();
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
  }
  
  // Final report
  section('📊 YAKUNIY HISOBOT');
  
  console.log(chalk.bold(`Jami testlar: ${stats.total}`));
  console.log(chalk.green(`✅ Muvaffaqiyatli: ${stats.passed}`));
  console.log(chalk.red(`❌ Xato: ${stats.failed}`));
  console.log(chalk.blue(`📈 Muvaffaqiyat: ${((stats.passed / stats.total) * 100).toFixed(1)}%\n`));
  
  if (stats.errors.length > 0) {
    console.log(chalk.red.bold('XATOLAR RO\'YXATI:\n'));
    stats.errors.forEach((err, index) => {
      console.log(chalk.red(`${index + 1}. ${err.test}`));
      console.log(chalk.gray(`   ${err.error}\n`));
    });
  }
  
  // Exit code
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red.bold('\n💥 FATAL ERROR:\n'));
  console.error(error);
  process.exit(1);
});
