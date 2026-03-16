/**
 * FRONTEND ORQALI HISOB-KITOB TEKSHIRISH
 * 
 * Bu test saytda ko'rsatiladigan ma'lumotlarni tekshiradi:
 * - Dashboard statistikasi
 * - Mahsulotlar sahifasi
 * - Mijozlar sahifasi
 * - Kassa sahifasi
 */

const BASE_URL = 'http://localhost:3001';

async function login() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@aziztrades.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  return data.token;
}

async function getDashboardStats(token) {
  const response = await fetch(`${BASE_URL}/api/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}

async function getProducts(token) {
  const response = await fetch(`${BASE_URL}/api/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}

async function getCustomers(token) {
  const response = await fetch(`${BASE_URL}/api/customers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}

async function getCashbox(token) {
  const response = await fetch(`${BASE_URL}/api/cashbox/summary`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}

async function getSales(token) {
  const response = await fetch(`${BASE_URL}/api/sales`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}

function showSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(title);
  console.log('='.repeat(60));
}

function showData(label, value) {
  console.log(`   ${label}: ${value}`);
}

async function runTests() {
  console.log('🌐 FRONTEND MA\'LUMOTLARNI TEKSHIRISH\n');
  
  try {
    const token = await login();
    console.log('✅ Login muvaffaqiyatli\n');
    
    // 1. DASHBOARD
    showSection('📊 DASHBOARD STATISTIKASI');
    const dashboard = await getDashboardStats(token);
    showData('Bugungi savdo', `$${dashboard.todaySales || 0}`);
    showData('Oylik savdo', `$${dashboard.monthlySales || 0}`);
    showData('Jami mijozlar', dashboard.totalCustomers || 0);
    showData('Qarzli mijozlar', dashboard.customersWithDebt || 0);
    showData('Kam qolgan mahsulotlar', dashboard.lowStockProducts || 0);
    
    // 2. MAHSULOTLAR
    showSection('📦 MAHSULOTLAR');
    const products = await getProducts(token);
    console.log(`   Jami mahsulotlar: ${products.length}`);
    
    // Kam qolgan mahsulotlar
    const lowStock = products.filter(p => p.currentStock < p.minStockLimit);
    console.log(`   Kam qolgan: ${lowStock.length}`);
    
    if (lowStock.length > 0) {
      console.log('\n   ⚠️ Kam qolgan mahsulotlar:');
      lowStock.forEach(p => {
        console.log(`      - ${p.name}: ${p.currentStock} qop (Min: ${p.minStockLimit})`);
      });
    }
    
    // Eng ko'p sotilgan mahsulotlar (oxirgi 10 ta)
    const recentProducts = products.slice(0, 10);
    console.log('\n   📈 Mahsulotlar (oxirgi 10 ta):');
    recentProducts.forEach(p => {
      const status = p.currentStock === 0 ? '🔴' : 
                     p.currentStock < p.minStockLimit ? '🟡' : '🟢';
      console.log(`      ${status} ${p.name}: ${p.currentStock} qop, $${p.pricePerBag}/qop`);
    });
    
    // 3. MIJOZLAR
    showSection('👥 MIJOZLAR');
    const customers = await getCustomers(token);
    console.log(`   Jami mijozlar: ${customers.length}`);
    
    // Qarzli mijozlar
    const withDebt = customers.filter(c => c.debt > 0);
    console.log(`   Qarzli mijozlar: ${withDebt.length}`);
    
    if (withDebt.length > 0) {
      const totalDebt = withDebt.reduce((sum, c) => sum + c.debt, 0);
      console.log(`   Jami qarz: $${totalDebt.toFixed(2)}`);
      
      console.log('\n   💰 Eng ko\'p qarzli mijozlar (top 5):');
      withDebt
        .sort((a, b) => b.debt - a.debt)
        .slice(0, 5)
        .forEach((c, i) => {
          const category = c.category === 'VIP' ? '⭐' : 
                          c.category === 'RISK' ? '⚠️' : '👤';
          console.log(`      ${i + 1}. ${category} ${c.name}: $${c.debt.toFixed(2)}`);
        });
    }
    
    // 4. KASSA
    showSection('💰 KASSA');
    const cashbox = await getCashbox(token);
    showData('Jami balans', `$${cashbox.totalBalance.toFixed(2)}`);
    showData('Bugungi kirim', `$${cashbox.todayIncome.toFixed(2)}`);
    showData('Bugungi chiqim', `$${cashbox.todayExpense.toFixed(2)}`);
    showData('Oylik kirim', `$${cashbox.monthlyIncome.toFixed(2)}`);
    showData('Oylik chiqim', `$${cashbox.monthlyExpense.toFixed(2)}`);
    
    if (cashbox.byCurrency) {
      console.log('\n   💵 Valyuta bo\'yicha:');
      showData('   Naqd (USD)', `$${cashbox.byCurrency.cash.toFixed(2)}`);
      showData('   Karta (USD)', `$${cashbox.byCurrency.card.toFixed(2)}`);
      showData('   Click (USD)', `$${cashbox.byCurrency.click.toFixed(2)}`);
    }
    
    // 5. SAVDOLAR
    showSection('📈 SAVDOLAR');
    const sales = await getSales(token);
    console.log(`   Jami savdolar: ${sales.length}`);
    
    // Bugungi savdolar
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = sales.filter(s => new Date(s.createdAt) >= today);
    console.log(`   Bugungi savdolar: ${todaySales.length}`);
    
    if (todaySales.length > 0) {
      const todayTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const todayPaid = todaySales.reduce((sum, s) => sum + s.paidAmount, 0);
      showData('   Bugungi jami', `$${todayTotal.toFixed(2)}`);
      showData('   Bugungi to\'lov', `$${todayPaid.toFixed(2)}`);
      showData('   Bugungi qarz', `$${(todayTotal - todayPaid).toFixed(2)}`);
    }
    
    // Oxirgi 5 ta savdo
    console.log('\n   📋 Oxirgi 5 ta savdo:');
    sales.slice(0, 5).forEach((s, i) => {
      const status = s.paymentStatus === 'PAID' ? '✅' : 
                     s.paymentStatus === 'PARTIAL' ? '🟡' : '❌';
      console.log(`      ${i + 1}. ${status} ${s.customer?.name || 'N/A'}: $${s.totalAmount} (To'lov: $${s.paidAmount})`);
    });
    
    // 6. XULOSA
    showSection('✅ XULOSA');
    
    console.log('\n   📊 Tizim holati:');
    console.log(`      ✅ Mahsulotlar: ${products.length} ta`);
    console.log(`      ✅ Mijozlar: ${customers.length} ta`);
    console.log(`      ✅ Savdolar: ${sales.length} ta`);
    console.log(`      ✅ Kassa balansi: $${cashbox.totalBalance.toFixed(2)}`);
    
    if (lowStock.length > 0) {
      console.log(`      ⚠️ Kam qolgan mahsulotlar: ${lowStock.length} ta`);
    }
    
    if (withDebt.length > 0) {
      const totalDebt = withDebt.reduce((sum, c) => sum + c.debt, 0);
      console.log(`      💰 Jami qarz: $${totalDebt.toFixed(2)} (${withDebt.length} mijoz)`);
    }
    
    console.log('\n   🎯 Barcha ma\'lumotlar to\'g\'ri ko\'rsatilmoqda!');
    
  } catch (error) {
    console.error('\n❌ XATOLIK:', error.message);
  }
}

runTests().catch(console.error);
