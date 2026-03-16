const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
let authToken = '';

// Login
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login muvaffaqiyatli');
    return true;
  } catch (error) {
    console.error('❌ Login xatosi:', error.response?.data || error.message);
    return false;
  }
}

// Mijoz yaratish
async function createCustomer() {
  try {
    const response = await axios.post(`${API_URL}/customers`, {
      name: 'Test Mijoz',
      phone: '+998901234567',
      address: 'Test manzil'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Mijoz yaratildi:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('❌ Mijoz yaratish xatosi:', error.response?.data || error.message);
    return null;
  }
}

// Mahsulot yaratish
async function createProduct() {
  try {
    const response = await axios.post(`${API_URL}/products`, {
      name: 'Test Mahsulot',
      bagType: '50kg',
      unitsPerBag: 50,
      pricePerBag: 100000,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 200,
      productionCost: 80000,
      currentStock: 100
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Mahsulot yaratildi:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('❌ Mahsulot yaratish xatosi:', error.response?.data || error.message);
    return null;
  }
}

// Buyurtma yaratish
async function createOrder(customerId, productId) {
  try {
    const response = await axios.post(`${API_URL}/orders`, {
      customerId,
      items: [
        {
          productId,
          quantityBags: 5,
          quantityUnits: 10
        }
      ],
      priority: 'NORMAL'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Buyurtma yaratildi:', response.data.orderNumber);
    console.log('   Status:', response.data.status);
    console.log('   Jami summa:', response.data.totalAmount);
    console.log('   Items:', response.data.items?.length || 0);
    return response.data;
  } catch (error) {
    console.error('❌ Buyurtma yaratish xatosi:', error.response?.data || error.message);
    return null;
  }
}

// Buyurtmani READY holatiga o'tkazish
async function setOrderReady(orderId) {
  try {
    // CONFIRMED -> IN_PRODUCTION
    await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status: 'IN_PRODUCTION'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Status: IN_PRODUCTION');

    // IN_PRODUCTION -> READY
    await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status: 'READY'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Status: READY');
    return true;
  } catch (error) {
    console.error('❌ Status o\'zgartirish xatosi:', error.response?.data || error.message);
    return false;
  }
}

// Buyurtmani sotish
async function sellOrder(orderId, customerId) {
  try {
    // Oldingi mijoz ma'lumotlarini olish
    const customerBefore = await axios.get(`${API_URL}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('\n📊 OLDINGI HOLAT:');
    console.log('   Mijoz qarzi:', customerBefore.data.debt || 0);

    // Oldingi kassa holatini olish
    const cashboxBefore = await axios.get(`${API_URL}/cashbox/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('   Kassa tranzaksiyalari:', cashboxBefore.data.length);

    // Buyurtmani sotish (qisman to'lov)
    const response = await axios.post(`${API_URL}/orders/${orderId}/sell`, {
      paymentDetails: {
        uzs: 200000,
        usd: 100,
        click: 50000
      },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('\n✅ BUYURTMA SOTILDI!');
    console.log('   Message:', response.data.message);
    console.log('   To\'langan:', response.data.totalPaid);
    console.log('   Qarz:', response.data.remainingDebt);

    // Keyingi mijoz ma'lumotlarini olish
    const customerAfter = await axios.get(`${API_URL}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('\n📊 KEYINGI HOLAT:');
    console.log('   Mijoz qarzi:', customerAfter.data.debt || 0);
    console.log('   Qarz o\'zgarishi:', (customerAfter.data.debt || 0) - (customerBefore.data.debt || 0));

    // Keyingi kassa holatini olish
    const cashboxAfter = await axios.get(`${API_URL}/cashbox/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('   Kassa tranzaksiyalari:', cashboxAfter.data.length);
    console.log('   Yangi tranzaksiyalar:', cashboxAfter.data.length - cashboxBefore.data.length);

    // Oxirgi tranzaksiyani ko'rsatish
    if (cashboxAfter.data.length > 0) {
      const lastTransaction = cashboxAfter.data[0];
      console.log('\n💰 OXIRGI KASSA TRANZAKSIYASI:');
      console.log('   Type:', lastTransaction.type);
      console.log('   Amount:', lastTransaction.amount);
      console.log('   Category:', lastTransaction.category);
      console.log('   Description:', lastTransaction.description);
    }

    return true;
  } catch (error) {
    console.error('❌ Sotish xatosi:', error.response?.data || error.message);
    return false;
  }
}

// Asosiy test
async function runTest() {
  console.log('🚀 BUYURTMA SOTISH TESTI BOSHLANDI\n');

  if (!await login()) return;

  const customerId = await createCustomer();
  if (!customerId) return;

  const productId = await createProduct();
  if (!productId) return;

  const order = await createOrder(customerId, productId);
  if (!order) return;

  if (!await setOrderReady(order.id)) return;

  await sellOrder(order.id, customerId);

  console.log('\n✅ TEST TUGADI!');
}

runTest().catch(console.error);
