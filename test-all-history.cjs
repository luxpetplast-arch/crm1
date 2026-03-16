const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test natijalarini saqlash
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// Login qilish
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    logTest('Login', true, 'Token olindi');
    return true;
  } catch (error) {
    logTest('Login', false, error.message);
    return false;
  }
}

// API so'rov yuborish
async function apiRequest(method, endpoint, data = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
}

// ==================== SAVDO TARIXI TESTLARI ====================

async function testSalesHistory() {
  console.log('\n📊 SAVDO TARIXI TESTLARI\n');
  
  try {
    // 1. Savdo tarixini olish
    const historyRes = await apiRequest('get', '/sales/audit/history');
    logTest('Savdo tarixi olish', 
      historyRes.status === 200 && Array.isArray(historyRes.data),
      `${historyRes.data.length} ta yozuv topildi`
    );
    
    // 2. Filtr bilan tarix olish
    const today = new Date().toISOString().split('T')[0];
    const filterRes = await apiRequest('get', `/sales/audit/history?startDate=${today}`);
    logTest('Filtr bilan savdo tarixi', 
      filterRes.status === 200,
      `Bugungi ${filterRes.data.length} ta yozuv`
    );
    
    // 3. Savdo statistikasi
    const statsRes = await apiRequest('get', '/sales/audit/stats');
    logTest('Savdo statistikasi', 
      statsRes.status === 200 && statsRes.data.totalActions !== undefined,
      `Jami: ${statsRes.data.totalActions} ta harakat`
    );
    
    // 4. Shubhali faoliyat
    const suspiciousRes = await apiRequest('get', '/sales/audit/suspicious-activity');
    logTest('Shubhali savdo faoliyati', 
      suspiciousRes.status === 200 && Array.isArray(suspiciousRes.data),
      `${suspiciousRes.data.length} ta shubhali faoliyat`
    );
    
    // 5. Savdo trendi
    const trendRes = await apiRequest('get', '/sales/audit/trend?days=30');
    logTest('Savdo trendi (30 kun)', 
      trendRes.status === 200 && Array.isArray(trendRes.data),
      `${trendRes.data.length} kunlik ma'lumot`
    );
    
    // 6. Limit bilan tarix
    const limitRes = await apiRequest('get', '/sales/audit/history?limit=10');
    logTest('Limit bilan savdo tarixi', 
      limitRes.status === 200 && limitRes.data.length <= 10,
      `${limitRes.data.length} ta yozuv (max 10)`
    );
    
    // 7. Action bo'yicha filtr
    const actionRes = await apiRequest('get', '/sales/audit/history?action=YARATISH');
    logTest('Action bo\'yicha filtr', 
      actionRes.status === 200,
      `${actionRes.data.length} ta YARATISH harakati`
    );
    
    // 8. Statistika tafsilotlari
    if (statsRes.data) {
      const stats = statsRes.data;
      console.log('\n   📈 Savdo Statistikasi:');
      console.log(`   - Jami harakatlar: ${stats.totalActions}`);
      console.log(`   - Yaratish: ${stats.byType.CREATE}`);
      console.log(`   - To'lovlar: ${stats.byType.PAYMENT}`);
      console.log(`   - Bekor qilish: ${stats.byType.CANCEL}`);
      console.log(`   - Jami savdo: $${stats.totalAmount.sales.toFixed(2)}`);
      console.log(`   - Jami to'lovlar: $${stats.totalAmount.payments.toFixed(2)}`);
      console.log(`   - Bekor qilingan: $${stats.totalAmount.cancelled.toFixed(2)}`);
    }
    
  } catch (error) {
    logTest('Savdo tarixi testlari', false, error.message);
  }
}

// ==================== OMBOR TARIXI TESTLARI ====================

async function testInventoryHistory() {
  console.log('\n📦 OMBOR TARIXI TESTLARI\n');
  
  try {
    // 1. Ombor tarixini olish
    const historyRes = await apiRequest('get', '/products/audit/history');
    logTest('Ombor tarixi olish', 
      historyRes.status === 200 && Array.isArray(historyRes.data),
      `${historyRes.data.length} ta yozuv topildi`
    );
    
    // 2. Filtr bilan tarix
    const today = new Date().toISOString().split('T')[0];
    const filterRes = await apiRequest('get', `/products/audit/history?startDate=${today}`);
    logTest('Filtr bilan ombor tarixi', 
      filterRes.status === 200,
      `Bugungi ${filterRes.data.length} ta yozuv`
    );
    
    // 3. Ombor statistikasi
    const statsRes = await apiRequest('get', '/products/audit/stats');
    logTest('Ombor statistikasi', 
      statsRes.status === 200 && statsRes.data.totalActions !== undefined,
      `Jami: ${statsRes.data.totalActions} ta harakat`
    );
    
    // 4. Shubhali faoliyat
    const suspiciousRes = await apiRequest('get', '/products/audit/suspicious-activity');
    logTest('Shubhali ombor faoliyati', 
      suspiciousRes.status === 200 && Array.isArray(suspiciousRes.data),
      `${suspiciousRes.data.length} ta shubhali faoliyat`
    );
    
    // 5. Limit bilan tarix
    const limitRes = await apiRequest('get', '/products/audit/history?limit=20');
    logTest('Limit bilan ombor tarixi', 
      limitRes.status === 200 && limitRes.data.length <= 20,
      `${limitRes.data.length} ta yozuv (max 20)`
    );
    
    // 6. Action bo'yicha filtr
    const actionRes = await apiRequest('get', '/products/audit/history?action=QOSHISH');
    logTest('Action bo\'yicha filtr', 
      actionRes.status === 200,
      `${actionRes.data.length} ta QOSHISH harakati`
    );
    
    // 7. Statistika tafsilotlari
    if (statsRes.data) {
      const stats = statsRes.data;
      console.log('\n   📈 Ombor Statistikasi:');
      console.log(`   - Jami harakatlar: ${stats.totalActions}`);
      console.log(`   - Qo'shildi: ${stats.byType.ADD + stats.byType.PRODUCTION}`);
      console.log(`   - Kamaytirildi: ${stats.byType.REMOVE + stats.byType.SALE}`);
      console.log(`   - Tuzatishlar: ${stats.byType.ADJUST}`);
      console.log(`   - Jami qo'shilgan: ${stats.totalQuantity.added} qop`);
      console.log(`   - Jami kamaytirilgan: ${stats.totalQuantity.removed} qop`);
      console.log(`   - Jami tuzatilgan: ${stats.totalQuantity.adjusted} qop`);
    }
    
    // 8. Mahsulot bo'yicha tarix (agar mahsulot bo'lsa)
    if (historyRes.data.length > 0) {
      const firstLog = historyRes.data[0];
      if (firstLog.details && firstLog.details.productId) {
        const productRes = await apiRequest('get', 
          `/products/audit/history?productId=${firstLog.details.productId}`
        );
        logTest('Mahsulot bo\'yicha tarix', 
          productRes.status === 200,
          `${productRes.data.length} ta yozuv`
        );
      }
    }
    
  } catch (error) {
    logTest('Ombor tarixi testlari', false, error.message);
  }
}

// ==================== KASSA TARIXI TESTLARI ====================

async function testCashboxHistory() {
  console.log('\n💰 KASSA TARIXI TESTLARI\n');
  
  try {
    // 1. Kassa tarixini olish
    const historyRes = await apiRequest('get', '/cashbox/history');
    logTest('Kassa tarixi olish', 
      historyRes.status === 200 && Array.isArray(historyRes.data),
      `${historyRes.data.length} ta yozuv topildi`
    );
    
    // 2. Filtr bilan tarix
    const today = new Date().toISOString().split('T')[0];
    const filterRes = await apiRequest('get', `/cashbox/history?startDate=${today}`);
    logTest('Filtr bilan kassa tarixi', 
      filterRes.status === 200,
      `Bugungi ${filterRes.data.length} ta yozuv`
    );
    
    // 3. Kassa statistikasi
    const statsRes = await apiRequest('get', '/cashbox/audit-stats');
    logTest('Kassa statistikasi', 
      statsRes.status === 200 && statsRes.data.totalActions !== undefined,
      `Jami: ${statsRes.data.totalActions} ta harakat`
    );
    
    // 4. Shubhali faoliyat
    const suspiciousRes = await apiRequest('get', '/cashbox/suspicious-activity');
    logTest('Shubhali kassa faoliyati', 
      suspiciousRes.status === 200 && Array.isArray(suspiciousRes.data),
      `${suspiciousRes.data.length} ta shubhali faoliyat`
    );
    
    // 5. Limit bilan tarix
    const limitRes = await apiRequest('get', '/cashbox/history?limit=15');
    logTest('Limit bilan kassa tarixi', 
      limitRes.status === 200 && limitRes.data.length <= 15,
      `${limitRes.data.length} ta yozuv (max 15)`
    );
    
    // 6. Action bo'yicha filtr
    const actionRes = await apiRequest('get', '/cashbox/history?action=KIRIM');
    logTest('Action bo\'yicha filtr', 
      actionRes.status === 200,
      `${actionRes.data.length} ta KIRIM harakati`
    );
    
    // 7. Statistika tafsilotlari
    if (statsRes.data) {
      const stats = statsRes.data;
      console.log('\n   📈 Kassa Statistikasi:');
      console.log(`   - Jami harakatlar: ${stats.totalActions}`);
      console.log(`   - Kirimlar: ${stats.byType.ADD}`);
      console.log(`   - Chiqimlar: ${stats.byType.WITHDRAW}`);
      console.log(`   - Transferlar: ${stats.byType.TRANSFER}`);
      console.log(`   - Jami kirim: $${stats.totalAmount.added.toFixed(2)}`);
      console.log(`   - Jami chiqim: $${stats.totalAmount.withdrawn.toFixed(2)}`);
      console.log(`   - Jami transfer: $${stats.totalAmount.transferred.toFixed(2)}`);
    }
    
  } catch (error) {
    logTest('Kassa tarixi testlari', false, error.message);
  }
}

// ==================== TARIX KOMPONENTLARI TESTLARI ====================

async function testHistoryComponents() {
  console.log('\n🔍 TARIX KOMPONENTLARI TESTLARI\n');
  
  try {
    // 1. Barcha tarix endpointlari mavjudligini tekshirish
    const endpoints = [
      '/sales/audit/history',
      '/sales/audit/stats',
      '/sales/audit/suspicious-activity',
      '/sales/audit/trend',
      '/products/audit/history',
      '/products/audit/stats',
      '/products/audit/suspicious-activity',
      '/cashbox/history',
      '/cashbox/audit-stats',
      '/cashbox/suspicious-activity'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const res = await apiRequest('get', endpoint);
        logTest(`Endpoint: ${endpoint}`, res.status === 200);
      } catch (error) {
        logTest(`Endpoint: ${endpoint}`, false, error.message);
      }
    }
    
    // 2. Sana oralig'i bilan test
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();
    
    const dateRangeRes = await apiRequest('get', 
      `/sales/audit/history?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
    );
    logTest('Sana oralig\'i bilan filtr', 
      dateRangeRes.status === 200,
      `7 kunlik: ${dateRangeRes.data.length} ta yozuv`
    );
    
    // 3. Bir nechta filtr birgalikda
    const multiFilterRes = await apiRequest('get', 
      `/products/audit/history?limit=5&action=QOSHISH`
    );
    logTest('Ko\'p filtr birgalikda', 
      multiFilterRes.status === 200 && multiFilterRes.data.length <= 5,
      `${multiFilterRes.data.length} ta yozuv`
    );
    
  } catch (error) {
    logTest('Tarix komponentlari testlari', false, error.message);
  }
}

// ==================== SHUBHALI FAOLIYAT TAHLILI ====================

async function testSuspiciousActivityAnalysis() {
  console.log('\n⚠️  SHUBHALI FAOLIYAT TAHLILI\n');
  
  try {
    // Barcha shubhali faoliyatlarni yig'ish
    const salesSuspicious = await apiRequest('get', '/sales/audit/suspicious-activity');
    const inventorySuspicious = await apiRequest('get', '/products/audit/suspicious-activity');
    const cashboxSuspicious = await apiRequest('get', '/cashbox/suspicious-activity');
    
    const allSuspicious = [
      ...salesSuspicious.data,
      ...inventorySuspicious.data,
      ...cashboxSuspicious.data
    ];
    
    logTest('Umumiy shubhali faoliyat', 
      true,
      `Jami: ${allSuspicious.length} ta shubhali faoliyat`
    );
    
    // Xavf darajasi bo'yicha guruhlash
    const bySeverity = {
      HIGH: allSuspicious.filter(s => s.severity === 'HIGH').length,
      MEDIUM: allSuspicious.filter(s => s.severity === 'MEDIUM').length,
      WARNING: allSuspicious.filter(s => s.severity === 'WARNING').length,
      INFO: allSuspicious.filter(s => s.severity === 'INFO').length
    };
    
    console.log('\n   🚨 Xavf Darajasi:');
    console.log(`   - Yuqori (HIGH): ${bySeverity.HIGH}`);
    console.log(`   - O'rta (MEDIUM): ${bySeverity.MEDIUM}`);
    console.log(`   - Ogohlantirish (WARNING): ${bySeverity.WARNING}`);
    console.log(`   - Ma'lumot (INFO): ${bySeverity.INFO}`);
    
    // Turi bo'yicha guruhlash
    const byType = {};
    allSuspicious.forEach(s => {
      byType[s.type] = (byType[s.type] || 0) + 1;
    });
    
    console.log('\n   📊 Turi bo\'yicha:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });
    
  } catch (error) {
    logTest('Shubhali faoliyat tahlili', false, error.message);
  }
}

// ==================== ASOSIY TEST FUNKSIYASI ====================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     BARCHA TARIX FUNKSIYALARI TO\'LIQ TESTI            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  
  // Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n❌ Login amalga oshmadi. Test to\'xtatildi.');
    return;
  }
  
  // Barcha testlarni ishga tushirish
  await testSalesHistory();
  await testInventoryHistory();
  await testCashboxHistory();
  await testHistoryComponents();
  await testSuspiciousActivityAnalysis();
  
  // Yakuniy natijalar
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                  YAKUNIY NATIJALAR                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log(`✅ O'tgan testlar: ${results.passed}`);
  console.log(`❌ Muvaffaqiyatsiz testlar: ${results.failed}`);
  console.log(`📊 Jami testlar: ${results.passed + results.failed}`);
  console.log(`⏱️  Vaqt: ${duration} soniya`);
  console.log(`📈 Muvaffaqiyat darajasi: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);
  
  // Muvaffaqiyatsiz testlar ro'yxati
  const failedTests = results.tests.filter(t => !t.passed);
  if (failedTests.length > 0) {
    console.log('❌ Muvaffaqiyatsiz testlar:');
    failedTests.forEach(t => {
      console.log(`   - ${t.name}: ${t.message}`);
    });
    console.log('');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Testlarni ishga tushirish
runAllTests().catch(error => {
  console.error('❌ Test xatosi:', error.message);
  process.exit(1);
});
