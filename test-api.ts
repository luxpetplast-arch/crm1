import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

const results = { passed: 0, failed: 0, tests: [] };

async function test(name, fn) {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

const api = axios.create({ baseURL: API_BASE, timeout: 10000, headers: { 'Content-Type': 'application/json' } });
let authToken = null;

async function testAuth() {
  console.log('\n🔐 AUTH TESTS\n');
  await test('Login - admin', async () => {
    const res = await api.post('/auth/login', { email: 'test@zavod.uz', password: 'test123' });
    if (!res.data.token) throw new Error('Token qaytmadi');
    authToken = res.data.token;
    api.defaults.headers.Authorization = `Bearer ${authToken}`;
    console.log(`   Token: ${authToken.substring(0, 30)}...`);
    console.log(`   User: ${res.data.user.name} (${res.data.user.role})`);
  });
  await test('Health check', async () => {
    const res = await api.get('/health');
    if (res.data.status !== 'ok') throw new Error('Health failed');
    console.log(`   Status: ${res.data.status}`);
  });
  await test('Auth verify', async () => {
    const res = await api.get('/test-auth');
    if (!res.data.valid) throw new Error('Auth failed');
  });
}

async function testProducts() {
  console.log('\n📦 PRODUCTS\n');
  await test('GET /products', async () => {
    const res = await api.get('/products');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta mahsulot`);
  });
  await test('GET /products/audit/stats', async () => {
    const res = await api.get('/products/audit/stats');
    console.log(`   Stats olindi`);
  });
  await test('GET /products/low-stock', async () => {
    const res = await api.get('/products?lowStock=true');
    console.log(`   ${res.data.length} ta kam qolgan`);
  });
}

async function testCustomers() {
  console.log('\n👥 CUSTOMERS\n');
  await test('GET /customers', async () => {
    const res = await api.get('/customers');
    if (!Array.isArray(res.data)) throw new Error('Array emas');
    console.log(`   ${res.data.length} ta mijoz`);
  });
  await test('GET /customers with debts', async () => {
    const res = await api.get('/customers?hasDebt=true');
    console.log(`   ${res.data.length} ta qarzdor mijoz`);
  });
}

async function testSales() {
  console.log('\n💰 SALES\n');
  await test('GET /sales', async () => {
    const res = await api.get('/sales');
    console.log(`   ${res.data.sales?.length || 0} ta sotuv`);
  });
  await test('GET /sales/audit/history', async () => {
    const res = await api.get('/sales/audit/history?limit=5');
    console.log(`   ${res.data.history?.length || 0} ta tarix`);
  });
}

async function testDashboard() {
  console.log('\n📊 DASHBOARD\n');
  await test('GET /dashboard/stats', async () => {
    const res = await api.get('/dashboard/stats');
    if (!res.data.weeklyTrend) throw new Error('weeklyTrend yoq');
    console.log(`   Weekly trend: ${res.data.weeklyTrend.length} kun`);
    console.log(`   KPIs mavjud: ${!!res.data.kpis}`);
  });
}

async function testExpenses() {
  console.log('\n💸 EXPENSES\n');
  await test('GET /expenses', async () => {
    const res = await api.get('/expenses');
    console.log(`   ${res.data.length} ta xarajat`);
  });
  await test('GET /expenses/summary', async () => {
    const res = await api.get('/expenses/summary');
    console.log(`   ${res.data.length} ta kategoriya`);
  });
}

async function testProduction() {
  console.log('\n🏭 PRODUCTION\n');
  await test('GET /production/orders', async () => {
    const res = await api.get('/production/orders');
    console.log(`   ${res.data.length} ta buyurtma`);
  });
}

async function runTests() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║      API TEST - ZAVOD TIZIMI         ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`URL: ${API_BASE}\n`);
  const start = Date.now();
  
  await testAuth();
  await testProducts();
  await testCustomers();
  await testSales();
  await testDashboard();
  await testExpenses();
  await testProduction();
  
  const duration = Date.now() - start;
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║           NATIJALAR                  ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`✅ O'tgan: ${results.passed}`);
  console.log(`❌ O'tmagan: ${results.failed}`);
  console.log(`⏱️  Vaqt: ${duration}ms\n`);
  
  if (results.failed > 0) {
    console.log('❌ Xatolar:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => console.log(`   ${t.name}: ${t.error}`));
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests();
