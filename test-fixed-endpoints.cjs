/**
 * TUZATILGAN ENDPOINT'LARNI TEST QILISH
 * 
 * Bu test tuzatilgan endpoint'larni tekshiradi:
 * 1. GET /drivers/:id - 404 Not Found (TUZATILDI)
 * 2. GET /analytics - 404 Not Found (MAVJUD)
 * 3. GET /auth/me - Xatolik (TUZATILDI)
 * 4. GET /production - 404 Not Found (MAVJUD)
 * 5. GET /tasks - 500 Internal Server Error (TUZATILDI)
 * 6. GET /reports/sales - 404 Not Found (MAVJUD)
 * 7. GET /forecast - 404 Not Found (MAVJUD)
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testData = {
  driverId: ''
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
    success(`${method.toUpperCase()} ${url} - ${description || 'OK'} (${response.status})`);
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
// 2. TUZATILGAN ENDPOINT'LARNI TEST QILISH
// ============================================
async function testFixedEndpoints() {
  section('2. TUZATILGAN ENDPOINT\'LAR TESTI');
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  // 1. GET /auth/me - Tuzatildi
  results.total++;
  info('1. GET /auth/me - Current user ma\'lumotlarini olish...');
  const meResult = await testEndpoint('get', '/auth/me', null, 'Get current user');
  if (meResult.success) {
    results.passed++;
    info(`   User: ${meResult.data.name} (${meResult.data.role})`);
  } else {
    results.failed++;
  }
  
  // 2. GET /analytics - Mavjud
  results.total++;
  info('2. GET /analytics - Analytics ma\'lumotlarini olish...');
  const analyticsResult = await testEndpoint('get', '/analytics', null, 'Get analytics');
  if (analyticsResult.success) {
    results.passed++;
    info(`   Analytics ma'lumotlari olindi`);
  } else {
    results.failed++;
  }
  
  // 3. GET /tasks - Tuzatildi
  results.total++;
  info('3. GET /tasks - Vazifalar ro\'yxatini olish...');
  const tasksResult = await testEndpoint('get', '/tasks', null, 'Get tasks');
  if (tasksResult.success) {
    results.passed++;
    info(`   Jami vazifalar: ${tasksResult.data.length}`);
  } else {
    results.failed++;
  }
  
  // 4. GET /production - Mavjud
  results.total++;
  info('4. GET /production - Ishlab chiqarish buyurtmalarini olish...');
  const productionResult = await testEndpoint('get', '/production', null, 'Get production orders');
  if (productionResult.success) {
    results.passed++;
    info(`   Jami ishlab chiqarish buyurtmalari: ${productionResult.data.length}`);
  } else {
    results.failed++;
  }
  
  // 5. GET /reports/sales - Mavjud
  results.total++;
  info('5. GET /reports/sales - Sotuvlar hisobotini olish...');
  const reportsResult = await testEndpoint('get', '/reports/sales', null, 'Get sales report');
  if (reportsResult.success) {
    results.passed++;
    info(`   Sotuvlar hisoboti olindi`);
  } else {
    results.failed++;
  }
  
  // 6. GET /forecast - Mavjud
  results.total++;
  info('6. GET /forecast - Prognoz ma\'lumotlarini olish...');
  const forecastResult = await testEndpoint('get', '/forecast', null, 'Get forecast');
  if (forecastResult.success) {
    results.passed++;
    info(`   Prognoz ma'lumotlari: ${forecastResult.data.length} mahsulot`);
  } else {
    results.failed++;
  }
  
  // 7. Haydovchi yaratish va GET by ID test qilish
  results.total++;
  info('7. POST /drivers - Haydovchi yaratish...');
  const createDriverResult = await testEndpoint('post', '/drivers', {
    name: `Test Driver ${Date.now()}`,
    phone: `+99890${Math.floor(Math.random() * 10000000)}`,
    licenseNumber: `AB${Math.floor(Math.random() * 1000000)}`,
    vehicleNumber: `01A${Math.floor(Math.random() * 1000)}AA`
  }, 'Create driver');
  
  if (createDriverResult.success) {
    results.passed++;
    testData.driverId = createDriverResult.data.id;
    info(`   Haydovchi yaratildi: ${createDriverResult.data.name}`);
    
    // 8. GET /drivers/:id - Tuzatildi
    results.total++;
    info('8. GET /drivers/:id - Bitta haydovchini olish...');
    const getDriverResult = await testEndpoint('get', `/drivers/${testData.driverId}`, null, 'Get single driver');
    if (getDriverResult.success) {
      results.passed++;
      info(`   Haydovchi topildi: ${getDriverResult.data.name}`);
    } else {
      results.failed++;
    }
  } else {
    results.failed++;
    
    // Mavjud haydovchilar bilan test qilish
    results.total++;
    info('8. GET /drivers - Mavjud haydovchilarni olish...');
    const driversListResult = await testEndpoint('get', '/drivers', null, 'Get all drivers');
    if (driversListResult.success && driversListResult.data.length > 0) {
      const firstDriverId = driversListResult.data[0].id;
      info(`   Birinchi haydovchi ID: ${firstDriverId}`);
      
      const getDriverResult = await testEndpoint('get', `/drivers/${firstDriverId}`, null, 'Get single driver');
      if (getDriverResult.success) {
        results.passed++;
        info(`   Haydovchi topildi: ${getDriverResult.data.name}`);
      } else {
        results.failed++;
      }
    } else {
      results.failed++;
      info('   Haydovchilar yo\'q, GET by ID test qilib bo\'lmaydi');
    }
  }
  
  return results;
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runTest() {
  console.clear();
  log('\n🔧 TUZATILGAN ENDPOINT\'LAR TESTI', 'bright');
  log('Boshlandi: ' + new Date().toLocaleString(), 'cyan');
  
  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    error('Login amalga oshmadi. Test to\'xtatildi.');
    return;
  }
  
  // Test fixed endpoints
  const results = await testFixedEndpoints();
  
  // Final Report
  section('YAKUNIY NATIJA');
  
  console.log('\n' + '='.repeat(60));
  log(`Jami testlar: ${results.total}`, 'cyan');
  log(`Muvaffaqiyatli: ${results.passed}`, 'green');
  log(`Xatolik: ${results.failed}`, 'red');
  log(`Foiz: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'yellow');
  console.log('='.repeat(60));
  
  log('\nTugadi: ' + new Date().toLocaleString(), 'cyan');
  
  if (results.passed === results.total) {
    log('\n🎉 BARCHA TUZATISHLAR MUVAFFAQIYATLI!', 'green');
  } else if (results.passed / results.total >= 0.8) {
    log('\n✅ KO\'PCHILIK TUZATISHLAR MUVAFFAQIYATLI!', 'green');
  } else {
    log('\n⚠️  BA\'ZI ENDPOINT\'LAR HALI HAM ISHLAMAYAPTI', 'yellow');
  }
}

// Run test
runTest().catch(err => {
  error('Umumiy xatolik: ' + err.message);
  console.error(err);
  process.exit(1);
});