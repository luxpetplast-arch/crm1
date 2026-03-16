/**
 * OMBOR TIZIMI TO'LIQ TEST
 * 
 * Test qilinadigan funksiyalar:
 * 1. Mahsulot CRUD
 * 2. Ombor qo'shish/kamaytirish
 * 3. Qop va dona boshqaruvi
 * 4. Partiya qo'shish
 * 5. Ombor tarixi
 * 6. Kirim/Chiqim statistikasi
 * 7. Low stock alerts
 * 8. Audit log
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testProductId = '';
let testUserId = '';

// ANSI rang kodlari
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(testName) {
  log(`\n🧪 TEST: ${testName}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Login
async function login() {
  logSection('1. AUTENTIFIKATSIYA');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    testUserId = response.data.user.id;
    logSuccess(`Login muvaffaqiyatli! Token olindi`);
    logInfo(`User ID: ${testUserId}`);
    return true;
  } catch (error) {
    logError(`Login xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Axios instance
function getAxios() {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
}

// 1. Mahsulot yaratish
async function testCreateProduct() {
  logTest('Mahsulot yaratish');
  
  try {
    const api = getAxios();
    const response = await api.post('/products', {
      name: `Test Mahsulot ${Date.now()}`,
      bagType: '50kg',
      unitsPerBag: 50,
      pricePerBag: 100000,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 200,
      productionCost: 80000
    });
    
    testProductId = response.data.id;
    logSuccess(`Mahsulot yaratildi: ${response.data.name}`);
    logInfo(`Product ID: ${testProductId}`);
    logInfo(`Boshlang'ich stock: ${response.data.currentStock} qop`);
    return true;
  } catch (error) {
    logError(`Mahsulot yaratish xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 2. Mahsulotlarni olish
async function testGetProducts() {
  logTest('Mahsulotlar ro\'yxatini olish');
  
  try {
    const api = getAxios();
    const response = await api.get('/products');
    
    logSuccess(`${response.data.length} ta mahsulot topildi`);
    
    if (response.data.length > 0) {
      logInfo(`Birinchi mahsulot: ${response.data[0].name}`);
    }
    
    return true;
  } catch (error) {
    logError(`Mahsulotlarni olish xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 3. Qop qo'shish
async function testAddBags() {
  logTest('Qop qo\'shish (ADD)');
  
  try {
    const api = getAxios();
    
    // Oldingi holatni olish
    const beforeResponse = await api.get(`/products/${testProductId}`);
    const beforeStock = beforeResponse.data.currentStock;
    const beforeUnits = beforeResponse.data.currentUnits;
    
    logInfo(`Oldingi holat: ${beforeStock} qop, ${beforeUnits} dona`);
    
    // 20 qop qo'shish
    const response = await api.post(`/products/${testProductId}/adjust-bags`, {
      bags: 20,
      type: 'ADD',
      reason: 'Test uchun qo\'shildi',
      notes: 'Avtomatik test'
    });
    
    const newStock = response.data.product.currentStock;
    const newUnits = response.data.product.currentUnits;
    
    logSuccess(`20 qop qo'shildi`);
    logInfo(`Yangi holat: ${newStock} qop, ${newUnits} dona`);
    logInfo(`O'zgarish: +${response.data.change.bags} qop, +${response.data.change.units} dona`);
    
    // Tekshirish
    if (newStock === beforeStock + 20) {
      logSuccess('Qop soni to\'g\'ri hisoblandi');
    } else {
      logError(`Qop soni noto'g'ri: kutilgan ${beforeStock + 20}, olindi ${newStock}`);
    }
    
    return true;
  } catch (error) {
    logError(`Qop qo'shish xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 4. Dona qo'shish
async function testAddUnits() {
  logTest('Dona qo\'shish (ADD)');
  
  try {
    const api = getAxios();
    
    // Oldingi holatni olish
    const beforeResponse = await api.get(`/products/${testProductId}`);
    const beforeStock = beforeResponse.data.currentStock;
    const beforeUnits = beforeResponse.data.currentUnits;
    
    logInfo(`Oldingi holat: ${beforeStock} qop, ${beforeUnits} dona`);
    
    // 75 dona qo'shish (1.5 qop)
    const response = await api.post(`/products/${testProductId}/adjust-units`, {
      units: 75,
      type: 'ADD',
      reason: 'Test uchun dona qo\'shildi',
      notes: 'Avtomatik test'
    });
    
    const newStock = response.data.product.currentStock;
    const newUnits = response.data.product.currentUnits;
    
    logSuccess(`75 dona qo'shildi`);
    logInfo(`Yangi holat: ${newStock} qop, ${newUnits} dona`);
    logInfo(`O'zgarish: +${response.data.change.bags} qop, +${response.data.change.units} dona`);
    logInfo(`Qolgan dona: ${response.data.change.remainingUnits}`);
    
    return true;
  } catch (error) {
    logError(`Dona qo'shish xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 5. Qop kamaytirish
async function testRemoveBags() {
  logTest('Qop kamaytirish (REMOVE)');
  
  try {
    const api = getAxios();
    
    // Oldingi holatni olish
    const beforeResponse = await api.get(`/products/${testProductId}`);
    const beforeStock = beforeResponse.data.currentStock;
    const beforeUnits = beforeResponse.data.currentUnits;
    
    logInfo(`Oldingi holat: ${beforeStock} qop, ${beforeUnits} dona`);
    
    // 5 qop kamaytirish
    const response = await api.post(`/products/${testProductId}/adjust-bags`, {
      bags: 5,
      type: 'REMOVE',
      reason: 'Test uchun kamaytirildi',
      notes: 'Avtomatik test'
    });
    
    const newStock = response.data.product.currentStock;
    const newUnits = response.data.product.currentUnits;
    
    logSuccess(`5 qop kamaytirildi`);
    logInfo(`Yangi holat: ${newStock} qop, ${newUnits} dona`);
    logInfo(`O'zgarish: ${response.data.change.bags} qop, ${response.data.change.units} dona`);
    
    // Tekshirish
    if (newStock === beforeStock - 5) {
      logSuccess('Qop soni to\'g\'ri hisoblandi');
    } else {
      logError(`Qop soni noto'g'ri: kutilgan ${beforeStock - 5}, olindi ${newStock}`);
    }
    
    return true;
  } catch (error) {
    logError(`Qop kamaytirish xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 6. Dona kamaytirish
async function testRemoveUnits() {
  logTest('Dona kamaytirish (REMOVE)');
  
  try {
    const api = getAxios();
    
    // Oldingi holatni olish
    const beforeResponse = await api.get(`/products/${testProductId}`);
    const beforeStock = beforeResponse.data.currentStock;
    const beforeUnits = beforeResponse.data.currentUnits;
    
    logInfo(`Oldingi holat: ${beforeStock} qop, ${beforeUnits} dona`);
    
    // 30 dona kamaytirish
    const response = await api.post(`/products/${testProductId}/adjust-units`, {
      units: 30,
      type: 'REMOVE',
      reason: 'Test uchun dona kamaytirildi',
      notes: 'Avtomatik test'
    });
    
    const newStock = response.data.product.currentStock;
    const newUnits = response.data.product.currentUnits;
    
    logSuccess(`30 dona kamaytirildi`);
    logInfo(`Yangi holat: ${newStock} qop, ${newUnits} dona`);
    logInfo(`O'zgarish: ${response.data.change.bags} qop, ${response.data.change.units} dona`);
    
    return true;
  } catch (error) {
    logError(`Dona kamaytirish xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 7. Partiya qo'shish
async function testAddBatch() {
  logTest('Partiya qo\'shish');
  
  try {
    const api = getAxios();
    
    // Oldingi holatni olish
    const beforeResponse = await api.get(`/products/${testProductId}`);
    const beforeStock = beforeResponse.data.currentStock;
    
    logInfo(`Oldingi stock: ${beforeStock} qop`);
    
    // Partiya qo'shish
    const response = await api.post(`/products/${testProductId}/batch`, {
      quantity: 50,
      productionDate: new Date().toISOString(),
      shift: 'Kunduzgi',
      responsiblePerson: 'Test Ishchi'
    });
    
    logSuccess(`Partiya qo'shildi: ${response.data.quantity} qop`);
    logInfo(`Partiya ID: ${response.data.id}`);
    logInfo(`Smena: ${response.data.shift}`);
    
    // Yangi holatni tekshirish
    const afterResponse = await api.get(`/products/${testProductId}`);
    const afterStock = afterResponse.data.currentStock;
    
    logInfo(`Yangi stock: ${afterStock} qop`);
    
    if (afterStock === beforeStock + 50) {
      logSuccess('Partiya to\'g\'ri qo\'shildi');
    } else {
      logError(`Stock noto'g'ri: kutilgan ${beforeStock + 50}, olindi ${afterStock}`);
    }
    
    return true;
  } catch (error) {
    logError(`Partiya qo'shish xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 8. Stock movements
async function testStockMovements() {
  logTest('Stock movements tarixi');
  
  try {
    const api = getAxios();
    const response = await api.get(`/products/${testProductId}/movements`);
    
    logSuccess(`${response.data.length} ta harakat topildi`);
    
    if (response.data.length > 0) {
      logInfo('Oxirgi 3 ta harakat:');
      response.data.slice(0, 3).forEach((movement, index) => {
        console.log(`  ${index + 1}. ${movement.type} - ${movement.quantity} qop (${movement.reason})`);
      });
    }
    
    return true;
  } catch (error) {
    logError(`Stock movements xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 9. Kirim tarixi
async function testIncomeHistory() {
  logTest('Kirim tarixi');
  
  try {
    const api = getAxios();
    const response = await api.get(`/products/${testProductId}/income`);
    
    logSuccess(`${response.data.movements.length} ta kirim harakati`);
    logInfo(`Jami kirim: ${response.data.total.bags} qop, ${response.data.total.units} dona`);
    
    return true;
  } catch (error) {
    logError(`Kirim tarixi xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 10. Chiqim tarixi
async function testExpenseHistory() {
  logTest('Chiqim tarixi');
  
  try {
    const api = getAxios();
    const response = await api.get(`/products/${testProductId}/expense`);
    
    logSuccess(`${response.data.movements.length} ta chiqim harakati`);
    logInfo(`Jami chiqim: ${response.data.total.bags} qop, ${response.data.total.units} dona`);
    
    return true;
  } catch (error) {
    logError(`Chiqim tarixi xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 11. Umumiy statistika
async function testInventoryStats() {
  logTest('Ombor statistikasi');
  
  try {
    const api = getAxios();
    const response = await api.get('/products/history/stats');
    
    logSuccess('Statistika olindi');
    logInfo(`Jami kirim: ${response.data.total.income.bags} qop`);
    logInfo(`Jami chiqim: ${response.data.total.expense.bags} qop`);
    logInfo(`Sof o'zgarish: ${response.data.total.net.bags} qop`);
    logInfo(`Mahsulotlar soni: ${response.data.byProduct.length}`);
    logInfo(`Foydalanuvchilar soni: ${response.data.byUser.length}`);
    
    return true;
  } catch (error) {
    logError(`Statistika xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 12. Low stock alerts
async function testLowStockAlerts() {
  logTest('Low stock alerts');
  
  try {
    const api = getAxios();
    const response = await api.get('/products/alerts');
    
    logSuccess(`${response.data.length} ta ogohlantirish topildi`);
    
    if (response.data.length > 0) {
      logInfo('Ogohlantirishlar:');
      response.data.forEach((alert, index) => {
        const statusEmoji = alert.status === 'critical' ? '🔴' : alert.status === 'danger' ? '🟠' : '🟡';
        console.log(`  ${index + 1}. ${statusEmoji} ${alert.productName} - ${alert.currentStock} qop (${alert.status})`);
      });
    } else {
      logInfo('Ogohlantirishlar yo\'q - barcha mahsulotlar yetarli');
    }
    
    return true;
  } catch (error) {
    logError(`Low stock alerts xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 13. Audit log
async function testAuditLog() {
  logTest('Audit log');
  
  try {
    const api = getAxios();
    const response = await api.get('/products/audit/history', {
      params: {
        productId: testProductId,
        limit: 10
      }
    });
    
    logSuccess(`${response.data.length} ta audit log yozuvi`);
    
    if (response.data.length > 0) {
      logInfo('Oxirgi 3 ta audit log:');
      response.data.slice(0, 3).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.action} - ${log.userName} (${new Date(log.timestamp).toLocaleString()})`);
      });
    }
    
    return true;
  } catch (error) {
    logError(`Audit log xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 14. Mahsulot tafsilotlari
async function testProductDetails() {
  logTest('Mahsulot tafsilotlari');
  
  try {
    const api = getAxios();
    const response = await api.get(`/products/${testProductId}`);
    
    const product = response.data;
    
    logSuccess('Mahsulot tafsilotlari olindi');
    console.log('\n📦 Mahsulot ma\'lumotlari:');
    console.log(`  Nomi: ${product.name}`);
    console.log(`  Qop turi: ${product.bagType}`);
    console.log(`  Joriy stock: ${product.currentStock} qop`);
    console.log(`  Joriy dona: ${product.currentUnits} dona`);
    console.log(`  Minimal limit: ${product.minStockLimit} qop`);
    console.log(`  Optimal stock: ${product.optimalStock} qop`);
    console.log(`  Narx: ${product.pricePerBag} UZS`);
    console.log(`  Partiyalar: ${product.batches?.length || 0} ta`);
    console.log(`  Harakatlar: ${product.stockMovements?.length || 0} ta`);
    
    // Stock holati
    const percentage = (product.currentStock / product.optimalStock) * 100;
    let status = '';
    if (percentage >= 80) status = '💎 Zo\'r';
    else if (percentage >= 50) status = '✅ Yaxshi';
    else if (percentage >= 30) status = '⚠️ O\'rtacha';
    else if (percentage >= 15) status = '🔶 Past';
    else status = '❌ Juda Past';
    
    console.log(`  Holat: ${status} (${percentage.toFixed(1)}%)`);
    
    return true;
  } catch (error) {
    logError(`Mahsulot tafsilotlari xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 15. Mahsulot tahrirlash
async function testUpdateProduct() {
  logTest('Mahsulot tahrirlash');
  
  try {
    const api = getAxios();
    
    const response = await api.put(`/products/${testProductId}`, {
      pricePerBag: 120000,
      minStockLimit: 15,
      optimalStock: 60
    });
    
    logSuccess('Mahsulot tahrirlandi');
    logInfo(`Yangi narx: ${response.data.pricePerBag} UZS`);
    logInfo(`Yangi minimal limit: ${response.data.minStockLimit} qop`);
    logInfo(`Yangi optimal stock: ${response.data.optimalStock} qop`);
    
    return true;
  } catch (error) {
    logError(`Mahsulot tahrirlash xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 16. Qidiruv
async function testSearch() {
  logTest('Mahsulot qidirish');
  
  try {
    const api = getAxios();
    const response = await api.get('/products', {
      params: {
        search: 'Test'
      }
    });
    
    logSuccess(`${response.data.length} ta mahsulot topildi`);
    
    return true;
  } catch (error) {
    logError(`Qidiruv xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// 17. Low stock filter
async function testLowStockFilter() {
  logTest('Low stock filter');
  
  try {
    const api = getAxios();
    const response = await api.get('/products', {
      params: {
        lowStock: 'true'
      }
    });
    
    logSuccess(`${response.data.length} ta kam mahsulot topildi`);
    
    return true;
  } catch (error) {
    logError(`Low stock filter xatolik: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Barcha testlarni ishga tushirish
async function runAllTests() {
  logSection('OMBOR TIZIMI TO\'LIQ TEST');
  log('Test boshlandi: ' + new Date().toLocaleString(), 'bright');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Login
  if (!await login()) {
    logError('Login amalga oshmadi. Testlar to\'xtatildi.');
    return;
  }
  
  // Testlar ro'yxati
  const tests = [
    { name: 'Mahsulot yaratish', fn: testCreateProduct },
    { name: 'Mahsulotlar ro\'yxati', fn: testGetProducts },
    { name: 'Qop qo\'shish', fn: testAddBags },
    { name: 'Dona qo\'shish', fn: testAddUnits },
    { name: 'Qop kamaytirish', fn: testRemoveBags },
    { name: 'Dona kamaytirish', fn: testRemoveUnits },
    { name: 'Partiya qo\'shish', fn: testAddBatch },
    { name: 'Stock movements', fn: testStockMovements },
    { name: 'Kirim tarixi', fn: testIncomeHistory },
    { name: 'Chiqim tarixi', fn: testExpenseHistory },
    { name: 'Ombor statistikasi', fn: testInventoryStats },
    { name: 'Low stock alerts', fn: testLowStockAlerts },
    { name: 'Audit log', fn: testAuditLog },
    { name: 'Mahsulot tafsilotlari', fn: testProductDetails },
    { name: 'Mahsulot tahrirlash', fn: testUpdateProduct },
    { name: 'Qidiruv', fn: testSearch },
    { name: 'Low stock filter', fn: testLowStockFilter },
  ];
  
  // Testlarni ketma-ket ishga tushirish
  for (const test of tests) {
    results.total++;
    
    try {
      const success = await test.fn();
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      logError(`Test xatolik: ${error.message}`);
      results.failed++;
    }
    
    // Testlar orasida kichik pauza
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Yakuniy natija
  logSection('TEST NATIJALARI');
  console.log(`\nJami testlar: ${results.total}`);
  logSuccess(`Muvaffaqiyatli: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Muvaffaqiyatsiz: ${results.failed}`);
  }
  
  const percentage = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\nMuvaffaqiyat darajasi: ${percentage}%`);
  
  if (results.failed === 0) {
    log('\n🎉 BARCHA TESTLAR MUVAFFAQIYATLI O\'TDI! 🎉', 'green');
  } else {
    log('\n⚠️  BA\'ZI TESTLAR MUVAFFAQIYATSIZ BO\'LDI', 'yellow');
  }
  
  log('\nTest tugadi: ' + new Date().toLocaleString(), 'bright');
}

// Testni ishga tushirish
runAllTests().catch(error => {
  logError(`Umumiy xatolik: ${error.message}`);
  process.exit(1);
});
