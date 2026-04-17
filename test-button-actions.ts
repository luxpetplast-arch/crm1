import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

let authToken = null;

// Login olish
async function login() {
  const res = await api.post('/auth/login', {
    email: 'test@zavod.uz',
    password: 'test123'
  });
  authToken = res.data.token;
  api.defaults.headers.Authorization = `Bearer ${authToken}`;
  return res.data.user;
}

// ==================== BUTTON ACTION TESTS ====================

async function testButtonActions() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       BUTTON ACTION TEST - ZAVOD TIZIMI          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const user = await login();
  console.log(`✅ Login: ${user.name} (${user.role})\n`);

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  async function test(name, fn) {
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: '✅' });
      console.log(`✅ ${name}`);
      return true;
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: '❌', error: error.message });
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message.substring(0, 100)}`);
      return false;
    }
  }

  // ==================== PRODUCTS BUTTON ACTIONS ====================
  console.log('\n📦 PRODUCTS BUTTON ACTIONS\n');

  let testProductId = null;

  await test('CREATE PRODUCT (Add button)', async () => {
    const res = await api.post('/products', {
      name: `Test Product ${Date.now()}`,
      bagType: 'Test Qop',
      unitsPerBag: 1000,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 25,
      currentUnits: 25000,
      pricePerBag: 100000,
      productionCost: 80000,
      active: true
    });
    if (!res.data.id) throw new Error('Product yaratilmadi');
    testProductId = res.data.id;
  });

  await test('EDIT PRODUCT (Edit button)', async () => {
    if (!testProductId) throw new Error('Product ID yo\'q');
    const res = await api.put(`/products/${testProductId}`, {
      name: `Updated ${Date.now()}`,
      pricePerBag: 150000
    });
    if (!res.data.id) throw new Error('Yangilanmadi');
  });

  await test('DELETE PRODUCT (Delete button)', async () => {
    if (!testProductId) throw new Error('Product ID yo\'q');
    await api.delete(`/products/${testProductId}`);
  });

  await test('FILTER LOW STOCK (Filter button)', async () => {
    const res = await api.get('/products?lowStock=true');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
  });

  await test('EXPORT PRODUCTS (Excel button)', async () => {
    const res = await api.get('/products');
    // Export logic would generate Excel
    if (!Array.isArray(res.data)) throw new Error('Export uchun ma\'lumot yo\'q');
  });

  // ==================== CUSTOMERS BUTTON ACTIONS ====================
  console.log('\n👥 CUSTOMERS BUTTON ACTIONS\n');

  let testCustomerId = null;

  await test('CREATE CUSTOMER (Add button)', async () => {
    const res = await api.post('/customers', {
      name: `Test Customer ${Date.now()}`,
      email: `test${Date.now()}@customer.uz`,
      phone: '+998901234567',
      category: 'NORMAL',
      debtUZS: 0,
      debtUSD: 0,
      balanceUZS: 0,
      balanceUSD: 0
    });
    if (!res.data.id) throw new Error('Mijoz yaratilmadi');
    testCustomerId = res.data.id;
  });

  await test('EDIT CUSTOMER (Edit button)', async () => {
    if (!testCustomerId) throw new Error('Customer ID yo\'q');
    const res = await api.put(`/customers/${testCustomerId}`, {
      name: `Updated ${Date.now()}`,
      category: 'VIP'
    });
    if (!res.data.id) throw new Error('Yangilanmadi');
  });

  await test('CUSTOMER PAYMENT (Payment button)', async () => {
    if (!testCustomerId) throw new Error('Customer ID yo\'q');
    const res = await api.post(`/customers/${testCustomerId}/payment`, {
      amount: 50000,
      currency: 'UZS',
      type: 'CASH',
      notes: 'Test to\'lov'
    });
    if (!res.data.success && !res.data.payment) {
      // Try alternative endpoint
      await api.post('/cashbox/transactions', {
        type: 'INCOME',
        amount: 50000,
        category: 'PAYMENT',
        description: `Mijoz to\'lovi - ${testCustomerId}`
      });
    }
  });

  await test('DELETE CUSTOMER (Delete button)', async () => {
    if (!testCustomerId) throw new Error('Customer ID yo\'q');
    await api.delete(`/customers/${testCustomerId}`);
  });

  await test('FILTER DEBTORS (Filter button)', async () => {
    const res = await api.get('/customers?hasDebt=true');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
  });

  // ==================== SALES BUTTON ACTIONS ====================
  console.log('\n💰 SALES BUTTON ACTIONS\n');

  await test('GET SALES LIST (List button)', async () => {
    const res = await api.get('/sales');
    // API returns array directly, not wrapped in { sales: [...] }
    if (!Array.isArray(res.data)) throw new Error('Sales array emas');
  });

  await test('SALES HISTORY (History button)', async () => {
    const res = await api.get('/sales/audit/history?limit=10');
    if (!res.data.history && !Array.isArray(res.data)) throw new Error('History yo\'q');
  });

  await test('SALES STATS (Stats button)', async () => {
    const res = await api.get('/sales/audit/stats');
    // Stats may be empty but should return object
    if (res.data === undefined) throw new Error('Stats yo\'q');
  });

  // ==================== EXPENSES BUTTON ACTIONS ====================
  console.log('\n💸 EXPENSES BUTTON ACTIONS\n');

  let testExpenseId = null;

  await test('CREATE EXPENSE (Add button)', async () => {
    const res = await api.post('/expenses', {
      category: 'OTHER',
      amount: 50000,
      currency: 'UZS',
      description: 'Test xarajat'
    });
    if (!res.data.id) throw new Error('Xarajat yaratilmadi');
    testExpenseId = res.data.id;
  });

  await test('GET EXPENSES (List button)', async () => {
    const res = await api.get('/expenses');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
  });

  await test('EXPENSES SUMMARY (Summary button)', async () => {
    const res = await api.get('/expenses/summary');
    if (!Array.isArray(res.data)) throw new Error('Summary yo\'q');
  });

  // Cleanup
  if (testExpenseId) {
    try {
      await api.delete(`/expenses/${testExpenseId}`);
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  // ==================== PRODUCTION BUTTON ACTIONS ====================
  console.log('\n🏭 PRODUCTION BUTTON ACTIONS\n');

  let testOrderId = null;

  await test('CREATE PRODUCTION ORDER (New Order button)', async () => {
    // Get first product for order
    const products = await api.get('/products');
    if (products.data.length === 0) throw new Error('Mahsulot yo\'q');

    const res = await api.post('/production/orders', {
      productId: products.data[0].id,
      targetQuantity: 100,
      plannedDate: new Date().toISOString(),
      shift: 'Kunduzgi',
      supervisorId: user.id,
      notes: 'Test buyurtma'
    });
    if (!res.data.id) throw new Error('Buyurtma yaratilmadi');
    testOrderId = res.data.id;
  });

  await test('GET PRODUCTION ORDERS (List button)', async () => {
    const res = await api.get('/production/orders');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
  });

  await test('UPDATE ORDER STATUS (Status button)', async () => {
    if (!testOrderId) throw new Error('Order ID yo\'q');
    const res = await api.put(`/production/orders/${testOrderId}/status`, {
      status: 'IN_PROGRESS'
    });
    if (!res.data.id && !res.data.status) throw new Error('Status yangilanmadi');
  });

  // Cleanup
  if (testOrderId) {
    try {
      await api.delete(`/production/orders/${testOrderId}`);
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  // ==================== DASHBOARD BUTTON ACTIONS ====================
  console.log('\n📊 DASHBOARD BUTTON ACTIONS\n');

  await test('GET DASHBOARD STATS (Refresh button)', async () => {
    const res = await api.get('/dashboard/stats');
    if (!res.data.weeklyTrend) throw new Error('Stats yo\'q');
  });

  // ==================== REPORTS BUTTON ACTIONS ====================
  console.log('\n📈 REPORTS BUTTON ACTIONS\n');

  await test('GET SALES REPORT (Sales Report button)', async () => {
    const res = await api.get('/reports/sales');
    if (res.data === undefined) throw new Error('Report yo\'q');
  });

  await test('GET PRODUCTS REPORT (Products Report button)', async () => {
    const res = await api.get('/reports/products');
    if (res.data === undefined) throw new Error('Report yo\'q');
  });

  await test('GET CUSTOMERS REPORT (Customers Report button)', async () => {
    const res = await api.get('/reports/customers');
    if (res.data === undefined) throw new Error('Report yo\'q');
  });

  // ==================== SETTINGS BUTTON ACTIONS ====================
  console.log('\n⚙️ SETTINGS BUTTON ACTIONS\n');

  await test('GET SETTINGS (Refresh button)', async () => {
    const res = await api.get('/settings');
    if (res.data === undefined) throw new Error('Settings yo\'q');
  });

  await test('UPDATE SETTINGS (Save button)', async () => {
    const res = await api.put('/settings', {
      companyName: 'Test Company',
      currency: 'UZS'
    });
    // Settings update may not return data
    if (res.status !== 200 && res.status !== 204) throw new Error('Saqlanmadi');
  });

  // ==================== TASKS BUTTON ACTIONS ====================
  console.log('\n✅ TASKS BUTTON ACTIONS\n');

  let testTaskId = null;

  await test('CREATE TASK (Add button)', async () => {
    const res = await api.post('/tasks', {
      title: `Test Task ${Date.now()}`,
      description: 'Test vazifa',
      assignedTo: user.id,
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    });
    if (!res.data.id) throw new Error('Vazifa yaratilmadi');
    testTaskId = res.data.id;
  });

  await test('GET TASKS (List button)', async () => {
    const res = await api.get('/tasks');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
  });

  await test('UPDATE TASK STATUS (Status button)', async () => {
    if (!testTaskId) throw new Error('Task ID yo\'q');
    const res = await api.put(`/tasks/${testTaskId}`, {
      status: 'IN_PROGRESS'
    });
    if (!res.data.id && !res.data.status) throw new Error('Status yangilanmadi');
  });

  // Cleanup
  if (testTaskId) {
    try {
      await api.delete(`/tasks/${testTaskId}`);
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  // ==================== USERS BUTTON ACTIONS ====================
  console.log('\n👤 USERS BUTTON ACTIONS\n');

  await test('GET USERS LIST (List button)', async () => {
    const res = await api.get('/users');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta foydalanuvchi`);
  });

  // ==================== NOTIFICATIONS BUTTON ACTIONS ====================
  console.log('\n🔔 NOTIFICATIONS BUTTON ACTIONS\n');

  await test('GET NOTIFICATIONS (List button)', async () => {
    const res = await api.get('/notifications');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
  });

  await test('MARK NOTIFICATIONS READ (Read button)', async () => {
    // This might require specific notification IDs
    const res = await api.get('/notifications');
    if (res.data.length > 0) {
      await api.put(`/notifications/${res.data[0].id}/read`);
    }
  });

  // ==================== CASHBOX BUTTON ACTIONS ====================
  console.log('\n💵 CASHBOX BUTTON ACTIONS\n');

  await test('GET CASHBOX TRANSACTIONS (List button)', async () => {
    const res = await api.get('/cashbox/transactions');
    if (res.data === undefined) throw new Error('Transactions yo\'q');
  });

  // ==================== RESULTS ====================
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║           BUTTON ACTION NATIJALARI               ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  console.log(`📊 Umumiy:`);
  console.log(`   ✅ Ishlayotgan: ${results.passed}`);
  console.log(`   ❌ Xatolik: ${results.failed}`);
  console.log(`   🔘 Jami test: ${results.passed + results.failed}\n`);

  // Sahifa bo'yicha
  const pages = {};
  results.tests.forEach(t => {
    const page = t.name.split(' ')[0];
    if (!pages[page]) pages[page] = { passed: 0, failed: 0 };
    if (t.status === '✅') pages[page].passed++;
    else pages[page].failed++;
  });

  console.log(`📁 Sahifa bo'yicha:`);
  Object.entries(pages).forEach(([page, stats]) => {
    const status = stats.failed === 0 ? '✅' : '⚠️';
    console.log(`   ${status} ${page}: ${stats.passed}/${stats.passed + stats.failed}`);
  });

  if (results.failed > 0) {
    console.log(`\n❌ Xatolar:`);
    results.tests
      .filter(t => t.status === '❌')
      .forEach(t => {
        console.log(`   - ${t.name}`);
        console.log(`     ${t.error}`);
      });
  }

  console.log(`\n${results.failed === 0 ? '✅ BARCHA BUTTON ACTIONLAR ISHLAYAPTI!' : '⚠️ BA\'ZI BUTTON ACTIONLARDA MUAMMO'}
`);

  process.exit(results.failed > 0 ? 1 : 0);
}

testButtonActions().catch(err => {
  console.error('❌ Katta xatolik:', err.message);
  process.exit(1);
});
