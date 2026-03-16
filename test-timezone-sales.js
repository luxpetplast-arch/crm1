import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

const apiWithAuth = axios.create({
  baseURL: API_BASE,
});

apiWithAuth.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function testTimezoneIssue() {
  console.log('🌍 SAVDO PAYTI TIMEZONE MUAMMOSINI TEKSHIRISH\n');
  
  try {
    await login();
    
    // 1. Create test data
    const customerResponse = await apiWithAuth.post('/customers', {
      name: `Timezone Test Mijoz ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Toshkent, Timezone test'
    });
    const customer = customerResponse.data;

    const productResponse = await apiWithAuth.post('/products', {
      name: `Timezone Test Mahsulot ${Date.now()}`,
      bagType: 'KICHIK',
      unitsPerBag: 50,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 100,
      pricePerBag: 25
    });
    const product = productResponse.data;

    // 2. Create sale
    const saleData = {
      customerId: customer.id,
      items: [
        {
          productId: product.id,
          quantity: 5,
          pricePerBag: 25
        }
      ],
      totalAmount: 125,
      paidAmount: 125,
      currency: 'USD',
      paymentStatus: 'PAID'
    };

    const saleResponse = await apiWithAuth.post('/sales', saleData);
    const sale = saleResponse.data;
    
    // 3. Check different time formats
    const createdAt = new Date(sale.createdAt);
    const now = new Date();
    
    console.log('📅 VAQT Tahlili:');
    console.log(`   Server createdAt (ISO): ${sale.createdAt}`);
    console.log(`   Local time (ISO): ${now.toISOString()}`);
    console.log(`   Parsed createdAt: ${createdAt.toISOString()}`);
    console.log(`   Server timezone offset: ${createdAt.getTimezoneOffset()} minutes`);
    console.log(`   Local timezone offset: ${now.getTimezoneOffset()} minutes`);
    
    // 4. Test frontend formatting
    console.log('\n🎨 Frontend Formatlash:');
    console.log(`   toLocaleDateString('uz-UZ'): ${createdAt.toLocaleDateString('uz-UZ')}`);
    console.log(`   toLocaleTimeString('uz-UZ'): ${createdAt.toLocaleTimeString('uz-UZ')}`);
    console.log(`   toLocaleString('uz-UZ'): ${createdAt.toLocaleString('uz-UZ')}`);
    
    // 5. Test correct formatting
    console.log('\n✅ To\'g\'ri Formatlash:');
    const year = createdAt.getFullYear();
    const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
    const day = createdAt.getDate().toString().padStart(2, '0');
    const hours = createdAt.getHours().toString().padStart(2, '0');
    const minutes = createdAt.getMinutes().toString().padStart(2, '0');
    const seconds = createdAt.getSeconds().toString().padStart(2, '0');
    
    console.log(`   Manual format: ${day}.${month}.${year} ${hours}:${minutes}:${seconds}`);
    
    // 6. Check if there's a significant time difference
    const timeDiff = Math.abs(now.getTime() - createdAt.getTime());
    console.log(`\n⏱️ Vaqt farqi: ${timeDiff}ms (${Math.floor(timeDiff/1000)} sekund)`);
    
    if (timeDiff > 60000) { // More than 1 minute
      console.log('🚨 XATOLIK: Vaqt farqi juda kulti!');
      console.log('   Sabab: Timezone mos kelmasligi mumkin');
      return {
        success: false,
        timezoneError: true,
        serverTime: sale.createdAt,
        localTime: now.toISOString(),
        timeDiff
      };
    }
    
    console.log('✅ Vaqt to\'g\'ri ko\'rsatilmoqda');
    return {
      success: true,
      timezoneError: false,
      serverTime: sale.createdAt,
      localTime: now.toISOString(),
      timeDiff
    };
    
  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

testTimezoneIssue().then(result => {
  console.log('\n📊 NATIJA:');
  console.log(JSON.stringify(result, null, 2));
}).catch(console.error);
