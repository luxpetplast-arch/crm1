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
    console.log('✅ Login successful');
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

async function testSalesTime() {
  console.log('🕒 SAVDO PAYTI XATOLIKNI TEKSHIRISH\n');
  
  try {
    await login();
    
    // 1. Create test customer
    console.log('1️⃣ Mijoz yaratish...');
    const customerResponse = await apiWithAuth.post('/customers', {
      name: `Test Mijoz ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Toshkent, Test manzil',
      telegramChatId: `${Date.now()}`
    });
    const customer = customerResponse.data;
    console.log(`✅ Mijoz yaratildi: ${customer.name} (ID: ${customer.id})`);

    // 2. Create test product
    console.log('2️⃣ Mahsulot yaratish...');
    const productResponse = await apiWithAuth.post('/products', {
      name: `Test Mahsulot ${Date.now()}`,
      bagType: 'KICHIK',
      unitsPerBag: 50,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 100,
      pricePerBag: 25,
      productionCost: 20
    });
    const product = productResponse.data;
    console.log(`✅ Mahsulot yaratildi: ${product.name} (ID: ${product.id})`);

    // 3. Create sale and check time
    console.log('3️⃣ Sotuv yaratish va vaqtni tekshirish...');
    const beforeSaleTime = new Date();
    console.log(`   🕐 Sotuv oldin: ${beforeSaleTime.toISOString()}`);
    
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
      paidAmount: 100,
      currency: 'USD',
      paymentStatus: 'PARTIAL'
    };

    const saleResponse = await apiWithAuth.post('/sales', saleData);
    const sale = saleResponse.data;
    
    const afterSaleTime = new Date();
    console.log(`   🕐 Sotuv keyin: ${afterSaleTime.toISOString()}`);
    console.log(`   🕐 Sotuv createdAt: ${sale.createdAt}`);
    
    // Check time differences
    const saleCreatedTime = new Date(sale.createdAt);
    const timeDiff1 = Math.abs(saleCreatedTime.getTime() - beforeSaleTime.getTime());
    const timeDiff2 = Math.abs(afterSaleTime.getTime() - saleCreatedTime.getTime());
    
    console.log(`   ⏱️ Vaqt farqi (sale vs before): ${timeDiff1}ms`);
    console.log(`   ⏱️ Vaqt farqi (after vs sale): ${timeDiff2}ms`);
    
    if (timeDiff1 > 5000 || timeDiff2 > 5000) {
      console.log(`   🚨 XATOLIK: Vaqt farqi juda katta!`);
      console.log(`   📍 Muammo: Sotuv vaqti noto'g'ri yozilmoqda`);
      return {
        success: false,
        timeError: true,
        timeDiff1,
        timeDiff2,
        saleCreatedAt: sale.createdAt,
        expectedTime: beforeSaleTime.toISOString()
      };
    } else {
      console.log(`   ✅ Vaqt to'g'ri yozilgan`);
      return {
        success: true,
        timeError: false,
        timeDiff1,
        timeDiff2,
        saleCreatedAt: sale.createdAt
      };
    }

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

testSalesTime().then(result => {
  console.log('\n📊 NATIJA:');
  console.log(JSON.stringify(result, null, 2));
}).catch(console.error);
