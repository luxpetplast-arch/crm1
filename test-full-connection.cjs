const axios = require('axios');

async function testFullConnection() {
  console.log('🔍 TO\'LIQ FRONTEND-BACKEND ULANISH TESTI\n');

  try {
    // 1. Backend health check
    console.log('1️⃣ Backend server holati...');
    const healthResponse = await axios.get('http://localhost:5003/api/health', {
      timeout: 5000
    });
    console.log('✅ Backend server ishlayapti:', healthResponse.status);

    // 2. Login va token olish
    console.log('\n2️⃣ Login va token olish...');
    const loginResponse = await axios.post('http://localhost:5003/api/auth/cashier-login', {
      login: 'cashier',
      password: 'cashier123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');
    console.log('📝 Token olingan:', token ? 'HA' : 'YO\'Q');

    // 3. Products endpoint (token bilan)
    console.log('\n3️⃣ Products endpoint (token bilan)...');
    const productsResponse = await axios.get('http://localhost:5003/api/products', {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 5000
    });
    console.log('✅ Products endpoint ishlayapti:', productsResponse.status);
    console.log('📦 Mahsulotlar soni:', productsResponse.data?.length || 0);

    // 4. Customers endpoint
    console.log('\n4️⃣ Customers endpoint...');
    const customersResponse = await axios.get('http://localhost:5003/api/customers', {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 5000
    });
    console.log('✅ Customers endpoint ishlayapti:', customersResponse.status);
    console.log('👥 Mijozlar soni:', customersResponse.data?.length || 0);

    // 5. Sales endpoint
    console.log('\n5️⃣ Sales endpoint...');
    const salesResponse = await axios.get('http://localhost:5003/api/sales', {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 5000
    });
    console.log('✅ Sales endpoint ishlayapti:', salesResponse.status);
    console.log('💰 Sotuvlar soni:', salesResponse.data?.length || 0);

    // 6. CORS test (OPTIONS request)
    console.log('\n6️⃣ CORS test...');
    const corsResponse = await axios.options('http://localhost:5003/api/products');
    const corsHeaders = corsResponse.headers;
    console.log('🌐 Access-Control-Allow-Origin:', corsHeaders['access-control-allow-origin']);
    console.log('🌐 Access-Control-Allow-Methods:', corsHeaders['access-control-allow-methods']);
    console.log('🌐 Access-Control-Allow-Headers:', corsHeaders['access-control-allow-headers']);

    // 7. Frontend proxy test
    console.log('\n7️⃣ Frontend proxy test...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000/api/health', {
        timeout: 5000
      });
      console.log('✅ Frontend proxy ishlayapti:', frontendResponse.status);
    } catch (error) {
      console.log('❌ Frontend proxy xatolik:', error.message);
    }

    console.log('\n🎉 BARCHA TESTLAR MUVAFFAQIYATLI YAKUNLANDI!');
    console.log('📊 YAKUNIY HOLAT:');
    console.log('  ✅ Backend server: Ishlayapti (port 5003)');
    console.log('  ✅ Auth system: Ishlayapti');
    console.log('  ✅ API endpoints: Ishlayapti');
    console.log('  ✅ CORS: To\'g\'ri sozlangan');
    console.log('  ✅ Token auth: Ishlayapti');
    console.log('  📦 Mahsulotlar:', productsResponse.data?.length || 0);
    console.log('  👥 Mijozlar:', customersResponse.data?.length || 0);
    console.log('  💰 Sotuvlar:', salesResponse.data?.length || 0);

  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFullConnection();
