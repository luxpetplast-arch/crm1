const axios = require('axios');

async function testConnection() {
  console.log('🔍 Backend va frontend ulanishini tekshirish...\n');

  try {
    // Backend health check
    console.log('1. Backend server holati...');
    const healthResponse = await axios.get('http://localhost:5003/api/health', {
      timeout: 5000
    });
    console.log('✅ Backend server ishlayapti:', healthResponse.status);

    // Auth endpoint test
    console.log('\n2. Auth endpoint...');
    try {
      const authResponse = await axios.post('http://localhost:5003/api/auth/cashier-login', {
        login: 'cashier',
        password: 'cashier123'
      });
      console.log('✅ Auth endpoint ishlayapti:', authResponse.status);
      console.log('📝 Token:', authResponse.data.token ? 'Bor' : 'Yo\'q');
    } catch (error) {
      console.log('❌ Auth endpoint xatolik:', error.response?.data?.error || error.message);
    }

    // Products endpoint test
    console.log('\n3. Products endpoint...');
    try {
      const productsResponse = await axios.get('http://localhost:5003/api/products', {
        timeout: 5000
      });
      console.log('✅ Products endpoint ishlayapti:', productsResponse.status);
      console.log('📦 Mahsulotlar soni:', productsResponse.data?.length || 0);
    } catch (error) {
      console.log('❌ Products endpoint xatolik:', error.response?.data?.error || error.message);
    }

    // CORS headers test
    console.log('\n4. CORS headers...');
    try {
      const corsResponse = await axios.options('http://localhost:5003/api/products');
      const corsHeaders = corsResponse.headers;
      console.log('🌐 CORS Headers:');
      console.log('  - Access-Control-Allow-Origin:', corsHeaders['access-control-allow-origin'] || 'Yo\'q');
      console.log('  - Access-Control-Allow-Methods:', corsHeaders['access-control-allow-methods'] || 'Yo\'q');
      console.log('  - Access-Control-Allow-Headers:', corsHeaders['access-control-allow-headers'] || 'Yo\'q');
    } catch (error) {
      console.log('❌ CORS test xatolik:', error.message);
    }

  } catch (error) {
    console.error('❌ Umumiy ulanish xatolik:', error.message);
    console.log('\n🔧 Tavsiyalar:');
    console.log('1. Backend server ishga tushirilganligini tekshiring');
    console.log('2. Port 5003 band emasligini tekshiring');
    console.log('3. Firewall sozlamalarini tekshiring');
  }
}

testConnection();
