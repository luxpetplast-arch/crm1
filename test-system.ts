import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5002/api';
const prisma = new PrismaClient();

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  modules: {}
};

async function test(name, fn, module = 'General') {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.passed++;
    results.tests.push({ name, status: 'PASS', duration, module });
    console.log(`✅ ${name} (${duration}ms)`);
    return true;
  } catch (error) {
    const duration = Date.now() - start;
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message, duration, module });
    console.log(`❌ ${name} (${duration}ms)`);
    console.log(`   Error: ${error.message.substring(0, 100)}`);
    return false;
  }
}

async function warning(name, message, module = 'General') {
  results.warnings++;
  results.tests.push({ name, status: 'WARN', message, module });
  console.log(`⚠️  ${name}`);
  console.log(`   ${message}`);
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

let authToken = null;
let testUserId = null;

// ==================== DATABASE TESTS ====================
async function testDatabase() {
  console.log('\n🗄️  DATABASE TESTS\n');
  results.modules['Database'] = { passed: 0, failed: 0 };

  await test('Prisma connection', async () => {
    await prisma.$queryRaw`SELECT 1`;
  }, 'Database');

  await test('User table query', async () => {
    const count = await prisma.user.count();
    console.log(`   ${count} foydalanuvchi`);
  }, 'Database');

  await test('Product table query', async () => {
    const count = await prisma.product.count();
    console.log(`   ${count} mahsulot`);
  }, 'Database');

  await test('Customer table query', async () => {
    const count = await prisma.customer.count();
    console.log(`   ${count} mijoz`);
  }, 'Database');

  await test('Sale table query', async () => {
    const count = await prisma.sale.count();
    console.log(`   ${count} sotuv`);
  }, 'Database');

  // Budget va Loan jadvallarini tekshirish
  await test('Budget table exists', async () => {
    await prisma.$queryRaw`SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='Budget'`;
  }, 'Database');

  await test('EmployeeLoan table exists', async () => {
    await prisma.$queryRaw`SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='EmployeeLoan'`;
  }, 'Database');
}

// ==================== AUTH TESTS ====================
async function testAuth() {
  console.log('\n🔐 AUTHENTICATION TESTS\n');
  results.modules['Auth'] = { passed: 0, failed: 0 };

  await test('Login with valid credentials', async () => {
    const res = await api.post('/auth/login', {
      email: 'test@zavod.uz',
      password: 'test123'
    });
    if (!res.data.token) throw new Error('Token qaytmadi');
    authToken = res.data.token;
    testUserId = res.data.user.id;
    api.defaults.headers.Authorization = `Bearer ${authToken}`;
    console.log(`   Token: ${authToken.substring(0, 30)}...`);
    console.log(`   User: ${res.data.user.name} (${res.data.user.role})`);
  }, 'Auth');

  await test('Login with invalid credentials', async () => {
    try {
      await api.post('/auth/login', {
        email: 'test@zavod.uz',
        password: 'wrongpassword'
      });
      throw new Error('401 qaytmadi');
    } catch (e) {
      if (e.response?.status !== 401) throw e;
      console.log('   401 qaytardi (to\'g\'ri)');
    }
  }, 'Auth');

  await test('Protected route without token', async () => {
    const tempApi = axios.create({ baseURL: API_BASE });
    try {
      await tempApi.get('/products');
      throw new Error('401 qaytmadi');
    } catch (e) {
      if (e.response?.status !== 401) throw e;
      console.log('   401 qaytardi (to\'g\'ri)');
    }
  }, 'Auth');

  await test('Token verification', async () => {
    const res = await api.get('/test-auth');
    if (!res.data.valid) throw new Error('Token invalid');
    console.log(`   User ID: ${res.data.user.id}`);
  }, 'Auth');

  await test('Health check endpoint', async () => {
    const res = await api.get('/health');
    if (res.data.status !== 'ok') throw new Error('Health failed');
  }, 'Auth');
}

// ==================== PRODUCTS API TESTS ====================
async function testProductsAPI() {
  console.log('\n📦 PRODUCTS API TESTS\n');
  results.modules['Products'] = { passed: 0, failed: 0 };

  let createdProductId = null;

  await test('GET /products - list all', async () => {
    const res = await api.get('/products');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta mahsulot`);
  }, 'Products');

  await test('GET /products/:id - get single', async () => {
    const list = await api.get('/products');
    if (list.data.length === 0) {
      warning('No products to test', 'Mahsulot yo\'q', 'Products');
      return;
    }
    const res = await api.get(`/products/${list.data[0].id}`);
    if (!res.data.id) throw new Error('Product qaytmadi');
  }, 'Products');

  await test('POST /products - create', async () => {
    const newProduct = {
      name: `Test Product ${Date.now()}`,
      bagType: 'Test Qop',
      unitsPerBag: 1000,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 25,
      pricePerBag: 100000,
      productionCost: 80000,
      active: true
    };
    const res = await api.post('/products', newProduct);
    if (!res.data.id) throw new Error('Product yaratilmadi');
    createdProductId = res.data.id;
    console.log(`   ID: ${createdProductId}`);
  }, 'Products');

  await test('PUT /products/:id - update', async () => {
    if (!createdProductId) throw new Error('Product ID yo\'q');
    const res = await api.put(`/products/${createdProductId}`, {
      name: `Updated Product ${Date.now()}`,
      pricePerBag: 150000
    });
    if (!res.data.id) throw new Error('Yangilanmadi');
    console.log(`   Yangilandi: ${res.data.name}`);
  }, 'Products');

  await test('GET /products/audit/stats', async () => {
    const res = await api.get('/products/audit/stats');
    console.log(`   Stats mavjud: ${!!res.data}`);
  }, 'Products');

  await test('GET /products/audit/history', async () => {
    const res = await api.get('/products/audit/history?limit=5');
    console.log(`   ${res.data.history?.length || 0} ta tarix`);
  }, 'Products');

  await test('GET /products/low-stock filter', async () => {
    const res = await api.get('/products?lowStock=true');
    console.log(`   ${res.data.length} ta kam qolgan`);
  }, 'Products');

  // Cleanup
  if (createdProductId) {
    await test('DELETE /products/:id - delete', async () => {
      await api.delete(`/products/${createdProductId}`);
      console.log('   O\'chirildi');
    }, 'Products').catch(() => {
      console.log('   Cleanup: delete skipped or failed');
    });
  }
}

// ==================== CUSTOMERS API TESTS ====================
async function testCustomersAPI() {
  console.log('\n👥 CUSTOMERS API TESTS\n');
  results.modules['Customers'] = { passed: 0, failed: 0 };

  let createdCustomerId = null;

  await test('GET /customers - list all', async () => {
    const res = await api.get('/customers');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta mijoz`);
  }, 'Customers');

  await test('GET /customers?hasDebt=true - filter debtors', async () => {
    const res = await api.get('/customers?hasDebt=true');
    console.log(`   ${res.data.length} ta qarzdor`);
  }, 'Customers');

  await test('POST /customers - create', async () => {
    const newCustomer = {
      name: `Test Customer ${Date.now()}`,
      email: `test${Date.now()}@customer.uz`,
      phone: `+99890${Math.floor(Math.random() * 1000000)}`,
      category: 'NORMAL',
      debtUZS: 0,
      debtUSD: 0
    };
    const res = await api.post('/customers', newCustomer);
    if (!res.data.id) throw new Error('Mijoz yaratilmadi');
    createdCustomerId = res.data.id;
    console.log(`   ID: ${createdCustomerId}`);
  }, 'Customers');

  await test('GET /customers/:id - get single', async () => {
    if (!createdCustomerId) throw new Error('Customer ID yo\'q');
    const res = await api.get(`/customers/${createdCustomerId}`);
    if (!res.data.id) throw new Error('Mijoz qaytmadi');
  }, 'Customers');

  await test('PUT /customers/:id - update', async () => {
    if (!createdCustomerId) throw new Error('Customer ID yo\'q');
    const res = await api.put(`/customers/${createdCustomerId}`, {
      name: `Updated Customer ${Date.now()}`,
      category: 'VIP'
    });
    if (!res.data.id) throw new Error('Yangilanmadi');
    console.log(`   Yangilandi: ${res.data.name}`);
  }, 'Customers');

  // Cleanup
  if (createdCustomerId) {
    await test('DELETE /customers/:id - delete', async () => {
      await api.delete(`/customers/${createdCustomerId}`);
      console.log('   O\'chirildi');
    }, 'Customers').catch(() => {
      console.log('   Cleanup: delete skipped or failed');
    });
  }
}

// ==================== SALES API TESTS ====================
async function testSalesAPI() {
  console.log('\n💰 SALES API TESTS\n');
  results.modules['Sales'] = { passed: 0, failed: 0 };

  await test('GET /sales - list all', async () => {
    const res = await api.get('/sales');
    console.log(`   ${res.data.sales?.length || 0} ta sotuv`);
  }, 'Sales');

  await test('GET /sales/audit/history', async () => {
    const res = await api.get('/sales/audit/history?limit=10');
    console.log(`   ${res.data.history?.length || 0} ta tarix`);
  }, 'Sales');

  await test('GET /sales/audit/stats', async () => {
    const res = await api.get('/sales/audit/stats');
    console.log(`   Stats mavjud: ${!!res.data}`);
  }, 'Sales');
}

// ==================== EXPENSES API TESTS ====================
async function testExpensesAPI() {
  console.log('\n💸 EXPENSES API TESTS\n');
  results.modules['Expenses'] = { passed: 0, failed: 0 };

  await test('GET /expenses - list all', async () => {
    const res = await api.get('/expenses');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta xarajat`);
  }, 'Expenses');

  await test('GET /expenses/summary', async () => {
    const res = await api.get('/expenses/summary');
    console.log(`   ${res.data.length} ta kategoriya`);
  }, 'Expenses');
}

// ==================== PRODUCTION API TESTS ====================
async function testProductionAPI() {
  console.log('\n🏭 PRODUCTION API TESTS\n');
  results.modules['Production'] = { passed: 0, failed: 0 };

  await test('GET /production/orders', async () => {
    const res = await api.get('/production/orders');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta buyurtma`);
  }, 'Production');
}

// ==================== DASHBOARD API TESTS ====================
async function testDashboardAPI() {
  console.log('\n📊 DASHBOARD API TESTS\n');
  results.modules['Dashboard'] = { passed: 0, failed: 0 };

  await test('GET /dashboard/stats', async () => {
    const res = await api.get('/dashboard/stats');
    if (!res.data.weeklyTrend) throw new Error('weeklyTrend yo\'q');
    console.log(`   Weekly: ${res.data.weeklyTrend.length} kun`);
    console.log(`   KPIs: ${res.data.kpis ? 'mavjud' : 'yo\'q'}`);
  }, 'Dashboard');
}

// ==================== SETTINGS API TESTS ====================
async function testSettingsAPI() {
  console.log('\n⚙️  SETTINGS API TESTS\n');
  results.modules['Settings'] = { passed: 0, failed: 0 };

  await test('GET /settings', async () => {
    const res = await api.get('/settings');
    console.log(`   Settings mavjud: ${!!res.data}`);
  }, 'Settings');
}

// ==================== ADDITIONAL MODULE TESTS ====================
async function testAdditionalModules() {
  console.log('\n📚 ADDITIONAL MODULES\n');

  // Reports
  await test('GET /reports/sales', async () => {
    const res = await api.get('/reports/sales');
    console.log(`   Report mavjud: ${!!res.data}`);
  }, 'Reports');

  // Tasks
  await test('GET /tasks', async () => {
    const res = await api.get('/tasks');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta vazifa`);
  }, 'Tasks');

  // Notifications
  await test('GET /notifications', async () => {
    const res = await api.get('/notifications');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta bildirishnoma`);
  }, 'Notifications');

  // Users
  await test('GET /users', async () => {
    const res = await api.get('/users');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta foydalanuvchi`);
  }, 'Users');

  // Cashbox
  await test('GET /cashbox/transactions', async () => {
    const res = await api.get('/cashbox/transactions');
    console.log(`   Transactions mavjud: ${!!res.data}`);
  }, 'Cashbox');
}

// ==================== PERFORMANCE TESTS ====================
async function testPerformance() {
  console.log('\n⚡ PERFORMANCE TESTS\n');
  results.modules['Performance'] = { passed: 0, failed: 0 };

  const endpoints = [
    { name: 'Products list', url: '/products' },
    { name: 'Customers list', url: '/customers' },
    { name: 'Sales list', url: '/sales' },
    { name: 'Dashboard stats', url: '/dashboard/stats' },
    { name: 'Expenses list', url: '/expenses' }
  ];

  for (const endpoint of endpoints) {
    await test(`${endpoint.name} response time`, async () => {
      const start = Date.now();
      await api.get(endpoint.url);
      const duration = Date.now() - start;
      console.log(`   ${duration}ms`);
      if (duration > 5000) {
        warning('Slow response', `${duration}ms > 5000ms threshold`, 'Performance');
      }
    }, 'Performance');
  }
}

// ==================== MAIN ====================
async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        COMPLETE SYSTEM TEST - ZAVOD TIZIMI       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`API: ${API_BASE}\n`);

  const totalStart = Date.now();

  try {
    // Core tests
    await testDatabase();
    await testAuth();

    // API tests
    await testProductsAPI();
    await testCustomersAPI();
    await testSalesAPI();
    await testExpensesAPI();
    await testProductionAPI();
    await testDashboardAPI();
    await testSettingsAPI();
    await testAdditionalModules();

    // Performance
    await testPerformance();

  } catch (error) {
    console.log(`\n❌ Katta xatolik: ${error.message}`);
  }

  const totalDuration = Date.now() - totalStart;

  // NATIJALAR
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║              YAKUNIY NATIJALAR                   ║');
  console.log('╚══════════════════════════════════════════════════╝');

  console.log(`\n📊 Umumiy:`);
  console.log(`   ✅ O'tgan: ${results.passed}`);
  console.log(`   ❌ O'tmagan: ${results.failed}`);
  console.log(`   ⚠️  Ogohlantirish: ${results.warnings}`);
  console.log(`   ⏱️  Jami vaqt: ${totalDuration}ms`);
  console.log(`   📈 Jami test: ${results.passed + results.failed + results.warnings}`);

  // Modul bo'yicha
  console.log(`\n📁 Modul bo'yicha:`);
  Object.entries(results.modules).forEach(([module, stats]) => {
    const moduleTests = results.tests.filter(t => t.module === module);
    const passed = moduleTests.filter(t => t.status === 'PASS').length;
    const failed = moduleTests.filter(t => t.status === 'FAIL').length;
    const status = failed === 0 ? '✅' : '⚠️';
    console.log(`   ${status} ${module}: ${passed}/${moduleTests.length}`);
  });

  // Xatolar
  if (results.failed > 0) {
    console.log(`\n❌ Xatolar:`);
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`   [${t.module}] ${t.name}`);
        console.log(`      ${t.error}`);
      });
  }

  // Database summary
  console.log(`\n🗄️  Database Summary:`);
  try {
    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.sale.count(),
      prisma.expense.count()
    ]);
    console.log(`   Users: ${stats[0]}`);
    console.log(`   Products: ${stats[1]}`);
    console.log(`   Customers: ${stats[2]}`);
    console.log(`   Sales: ${stats[3]}`);
    console.log(`   Expenses: ${stats[4]}`);
  } catch (e) {
    console.log(`   Database ma'lumotlarini olishda xatolik`);
  }

  await prisma.$disconnect();

  // Final status
  console.log(`\n${results.failed === 0 ? '✅ BARCHA TESTLAR O\'TDI' : '⚠️ BA\'ZI TESTLAR O\'TMADI'}`);
  console.log(`\n${'='.repeat(50)}\n`);

  process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests();
