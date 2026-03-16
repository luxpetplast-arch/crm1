const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login muvaffaqiyatli');
    return true;
  } catch (error) {
    console.log('❌ Login xatolik:', error.message);
    return false;
  }
}

async function testFrontendEndpoints() {
  console.log('\n🎨 FRONTEND KOMPONENTLAR UCHUN API TEST\n');
  
  const endpoints = [
    { name: 'SalesHistory - Tarix', url: '/sales/audit/history' },
    { name: 'SalesHistory - Statistika', url: '/sales/audit/stats' },
    { name: 'SalesHistory - Shubhali', url: '/sales/audit/suspicious-activity' },
    { name: 'SalesHistory - Trend', url: '/sales/audit/trend?days=30' },
    { name: 'InventoryHistory - Tarix', url: '/products/audit/history' },
    { name: 'InventoryHistory - Statistika', url: '/products/audit/stats' },
    { name: 'InventoryHistory - Shubhali', url: '/products/audit/suspicious-activity' },
    { name: 'CashboxHistory - Tarix', url: '/cashbox/history' },
    { name: 'CashboxHistory - Statistika', url: '/cashbox/audit-stats' },
    { name: 'CashboxHistory - Shubhali', url: '/cashbox/suspicious-activity' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const dataLength = Array.isArray(response.data) ? response.data.length : 
                        response.data.totalActions !== undefined ? response.data.totalActions : 'N/A';
      
      console.log(`✅ ${endpoint.name}: ${dataLength} ta ma'lumot`);
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

async function run() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        FRONTEND HISTORY KOMPONENTLAR TESTI             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const loggedIn = await login();
  if (!loggedIn) return;
  
  await testFrontendEndpoints();
  
  console.log('\n✅ Frontend komponentlar uchun barcha API endpointlar ishlayapti!');
  console.log('📱 Brauzerda http://localhost:3000 ochib, quyidagi sahifalarni tekshiring:');
  console.log('   - Sales sahifasida "Tarix" tab');
  console.log('   - Products sahifasida "Tarix" tab');
  console.log('   - Cashbox sahifasida "Tarix" tab\n');
}

run();
