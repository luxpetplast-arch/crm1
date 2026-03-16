/**
 * FRONTEND VA BACKEND TO'LIQ TEST
 * 
 * Bu test frontend va backend'ning to'liq ishlashini tekshiradi:
 * 1. Frontend (http://localhost:3000) - 200 OK
 * 2. Backend API (http://localhost:5000/api) - 200 OK
 * 3. Health Check - Server holati
 * 4. Bot Status - Telegram botlar holati
 * 5. Database Connection - Ma'lumotlar bazasi ulanishi
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000/api';
let authToken = '';

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

// ============================================
// 1. FRONTEND TEST
// ============================================
async function testFrontend() {
  section('1. FRONTEND TEST');
  
  try {
    info('Frontend tekshirilmoqda...');
    const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
    
    if (response.status === 200) {
      success(`Frontend ishlayapti: ${FRONTEND_URL}`);
      info(`Status: ${response.status} ${response.statusText}`);
      info(`Content-Type: ${response.headers['content-type']}`);
      return true;
    } else {
      error(`Frontend xatolik: ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`Frontend ulanish xatoligi: ${err.message}`);
    return false;
  }
}

// ============================================
// 2. BACKEND TEST
// ============================================
async function testBackend() {
  section('2. BACKEND TEST');
  
  try {
    // Health Check
    info('Backend health check...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    
    if (healthResponse.status === 200) {
      success(`Backend ishlayapti: ${BACKEND_URL}`);
      info(`Health Status: ${healthResponse.data.status}`);
      info(`Timestamp: ${healthResponse.data.timestamp}`);
    }
    
    // Authentication Test
    info('Authentication test...');
    const authResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    if (authResponse.status === 200) {
      authToken = authResponse.data.token;
      success('Authentication muvaffaqiyatli');
      info(`User: ${authResponse.data.user.name} (${authResponse.data.user.role})`);
      return true;
    }
    
  } catch (err) {
    error(`Backend xatolik: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// ============================================
// 3. DATABASE TEST
// ============================================
async function testDatabase() {
  section('3. DATABASE TEST');
  
  try {
    info('Database ulanishini tekshirish...');
    
    // Products test (database ulanishini tekshirish uchun)
    const response = await axios.get(`${BACKEND_URL}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
      success('Database ulanishi ishlayapti');
      info(`Jami mahsulotlar: ${response.data.length}`);
      return true;
    }
    
  } catch (err) {
    error(`Database xatolik: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// ============================================
// 4. TELEGRAM BOTS TEST
// ============================================
async function testTelegramBots() {
  section('4. TELEGRAM BOTS TEST');
  
  try {
    info('Telegram botlar holatini tekshirish...');
    
    const response = await axios.get(`${BACKEND_URL}/bots/status`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
      const botStatus = response.data;
      success('Bot status API ishlayapti');
      
      if (botStatus.bots && botStatus.bots.length > 0) {
        info(`Jami botlar: ${botStatus.bots.length}`);
        botStatus.bots.forEach(bot => {
          const status = bot.status === 'active' ? '🟢' : '🔴';
          info(`  ${status} ${bot.name}: ${bot.status}`);
        });
      } else {
        info('Bot ma\'lumotlari topilmadi');
      }
      
      return true;
    }
    
  } catch (err) {
    error(`Telegram bots xatolik: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// ============================================
// 5. API ENDPOINTS TEST
// ============================================
async function testAPIEndpoints() {
  section('5. API ENDPOINTS TEST');
  
  const endpoints = [
    { method: 'GET', url: '/products', name: 'Products' },
    { method: 'GET', url: '/customers', name: 'Customers' },
    { method: 'GET', url: '/sales', name: 'Sales' },
    { method: 'GET', url: '/orders', name: 'Orders' },
    { method: 'GET', url: '/cashbox/summary', name: 'Cashbox' },
    { method: 'GET', url: '/analytics', name: 'Analytics' },
    { method: 'GET', url: '/drivers', name: 'Drivers' },
    { method: 'GET', url: '/tasks', name: 'Tasks' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${BACKEND_URL}${endpoint.url}`,
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.status === 200) {
        success(`${endpoint.name}: OK`);
        passed++;
      } else {
        error(`${endpoint.name}: ${response.status}`);
        failed++;
      }
    } catch (err) {
      error(`${endpoint.name}: ${err.response?.status || 'ERROR'}`);
      failed++;
    }
  }
  
  info(`API Endpoints: ${passed}/${endpoints.length} ishlayapti`);
  return { passed, failed, total: endpoints.length };
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runFullTest() {
  console.clear();
  log('\n🧪 FRONTEND VA BACKEND TO\'LIQ TEST', 'bright');
  log('Boshlandi: ' + new Date().toLocaleString(), 'cyan');
  
  const results = {
    frontend: false,
    backend: false,
    database: false,
    bots: false,
    apiEndpoints: { passed: 0, failed: 0, total: 0 }
  };
  
  // 1. Frontend Test
  results.frontend = await testFrontend();
  
  // 2. Backend Test
  results.backend = await testBackend();
  
  if (results.backend) {
    // 3. Database Test
    results.database = await testDatabase();
    
    // 4. Telegram Bots Test
    results.bots = await testTelegramBots();
    
    // 5. API Endpoints Test
    results.apiEndpoints = await testAPIEndpoints();
  }
  
  // Final Report
  section('YAKUNIY NATIJA');
  
  log('\n📊 TEST NATIJALARI:', 'bright');
  
  // Frontend
  const frontendStatus = results.frontend ? '✅ ISHLAYAPTI' : '❌ ISHLAMAYAPTI';
  log(`Frontend (localhost:3000): ${frontendStatus}`, results.frontend ? 'green' : 'red');
  
  // Backend
  const backendStatus = results.backend ? '✅ ISHLAYAPTI' : '❌ ISHLAMAYAPTI';
  log(`Backend (localhost:5000): ${backendStatus}`, results.backend ? 'green' : 'red');
  
  // Database
  const databaseStatus = results.database ? '✅ ISHLAYAPTI' : '❌ ISHLAMAYAPTI';
  log(`Database: ${databaseStatus}`, results.database ? 'green' : 'red');
  
  // Bots
  const botsStatus = results.bots ? '✅ ISHLAYAPTI' : '❌ ISHLAMAYAPTI';
  log(`Telegram Bots: ${botsStatus}`, results.bots ? 'green' : 'red');
  
  // API Endpoints
  const apiPercentage = results.apiEndpoints.total > 0 ? 
    ((results.apiEndpoints.passed / results.apiEndpoints.total) * 100).toFixed(1) : 0;
  log(`API Endpoints: ${results.apiEndpoints.passed}/${results.apiEndpoints.total} (${apiPercentage}%)`, 
      apiPercentage == 100 ? 'green' : apiPercentage >= 80 ? 'yellow' : 'red');
  
  // Overall Status
  console.log('\n' + '='.repeat(60));
  const allWorking = results.frontend && results.backend && results.database && 
                     results.bots && (results.apiEndpoints.passed === results.apiEndpoints.total);
  
  if (allWorking) {
    log('🎉 BARCHA TIZIM KOMPONENTLARI ISHLAYAPTI!', 'green');
    log('Tizim production uchun tayyor! 🚀', 'green');
  } else {
    log('⚠️  BA\'ZI KOMPONENTLAR ISHLAMAYAPTI', 'yellow');
    log('Muammolarni tuzating va qayta test qiling.', 'yellow');
  }
  
  console.log('='.repeat(60));
  log('\nTugadi: ' + new Date().toLocaleString(), 'cyan');
}

// Run test
runFullTest().catch(err => {
  error('Umumiy xatolik: ' + err.message);
  console.error(err);
  process.exit(1);
});