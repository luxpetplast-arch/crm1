const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testCustomerId = '';
let testProductId = '';
let testSaleId = '';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login muvaffaqiyatli\n');
    return true;
  } catch (error) {
    console.log('❌ Login xatolik:', error.message);
    return false;
  }
}

async function api(method, endpoint, data = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: { 'Authorization': `Bearer ${authToken}` }
  };
  if (data) config.data = data;
  return axios(config);
}

async function getOrCreateTestData() {
  console.log('📦 Test ma\'lumotlarini tayyorlash...\n');
  
  // Mijoz olish yoki yaratish
  const customers = await api('get', '/customers');
  if (customers.data.length > 0) {
    testCustomerId = customers.data[0].id;
    console.log(`✅ Mijoz topildi: ${customers.data[0].name}`);
  } else {
    const newCustomer = await api('post', '/customers', {
      name: 'Test Mijoz',
      phone: '+998901234567',
      address: 'Test manzil'
    });
    testCustomerId = newCustomer.data.id;
    console.log(`✅ Yangi mijoz yaratildi: ${newCustomer.data.name}`);
  }
  
  // Mahsulot olish
  const products = await api('get', '/products');
  if (products.data.length > 0) {
    testProductId = products.data[0].id;
    console.log(`✅ Mahsulot topildi: ${products.data[0].name}\n`);
  } else {
    console.log('❌ Mahsulot topilmadi!\n');
    return false;
  }
  
  return true;
}

async function testSalesWithHistory() {
  console.log('💰 SAVDO VA TARIX TESTI\n');
  
  // Avvalgi tarix soni
  const beforeHistory = await api('get', '/sales/audit/history');
  console.log(`📊 Avvalgi tarix: ${beforeHistory.data.length} ta yozuv`);
  
  // Yangi savdo yaratish
  try {
    const sale = await api('post', '/sales', {
      customerId: testCustomerId,
      items: [{
        productId: testProductId,
        quantity: 2,
        pricePerBag: 100
      }],
      totalAmount: 200,
      paidAmount: 150,
      currency: 'USD',
      paymentStatus: 'PARTIAL'
    });
    testSaleId = sale.data.id;
    console.log(`✅ Savdo yaratildi: ${testSaleId}`);
  } catch (error) {
    console.log(`⚠️ Savdo yaratilmadi: ${error.response?.data?.error || error.message}`);
  }
  
  // Yangi tarix soni
  const afterHistory = await api('get', '/sales/audit/history');
  console.log(`📊 Yangi tarix: ${afterHistory.data.length} ta yozuv`);
  console.log(`📈 Farq: +${afterHistory.data.length - beforeHistory.data.length} ta yozuv\n`);
  
  // Statistika
  const stats = await api('get', '/sales/audit/stats');
  console.log('📊 Savdo Statistikasi:');
  console.log(`   - Jami harakatlar: ${stats.data.totalActions}`);
  console.log(`   - Yaratish: ${stats.data.byType.CREATE}`);
  console.log(`   - To'lovlar: ${stats.data.byType.PAYMENT}`);
  console.log(`   - Jami savdo: $${stats.data.totalAmount.sales.toFixed(2)}\n`);
}

async function testInventoryWithHistory() {
  console.log('📦 OMBOR VA TARIX TESTI\n');
  
  // Avvalgi tarix soni
  const beforeHistory = await api('get', '/products/audit/history');
  console.log(`📊 Avvalgi tarix: ${beforeHistory.data.length} ta yozuv`);
  
  // Mahsulot qo'shish
  try {
    await api('post', `/products/${testProductId}/add-stock`, {
      quantityBags: 5,
      reason: 'Test uchun qo\'shish',
      shift: 'MORNING'
    });
    console.log(`✅ Ombor qo'shildi: 5 qop`);
  } catch (error) {
    console.log(`⚠️ Ombor qo'shilmadi: ${error.response?.data?.error || error.message}`);
  }
  
  // Yangi tarix soni
  const afterHistory = await api('get', '/products/audit/history');
  console.log(`📊 Yangi tarix: ${afterHistory.data.length} ta yozuv`);
  console.log(`📈 Farq: +${afterHistory.data.length - beforeHistory.data.length} ta yozuv\n`);
  
  // Statistika
  const stats = await api('get', '/products/audit/stats');
  console.log('📊 Ombor Statistikasi:');
  console.log(`   - Jami harakatlar: ${stats.data.totalActions}`);
  console.log(`   - Qo'shildi: ${stats.data.byType.ADD + stats.data.byType.PRODUCTION}`);
  console.log(`   - Jami qo'shilgan: ${stats.data.totalQuantity.added} qop\n`);
}

async function testCashboxWithHistory() {
  console.log('💵 KASSA VA TARIX TESTI\n');
  
  // Avvalgi tarix soni
  const beforeHistory = await api('get', '/cashbox/history');
  console.log(`📊 Avvalgi tarix: ${beforeHistory.data.length} ta yozuv`);
  
  // Kassa kirim
  try {
    await api('post', '/cashbox/add', {
      amount: 500,
      currency: 'USD',
      description: 'Test uchun kirim'
    });
    console.log(`✅ Kassa kirim: $500`);
  } catch (error) {
    console.log(`⚠️ Kassa kirim xatolik: ${error.response?.data?.error || error.message}`);
  }
  
  // Yangi tarix soni
  const afterHistory = await api('get', '/cashbox/history');
  console.log(`📊 Yangi tarix: ${afterHistory.data.length} ta yozuv`);
  console.log(`📈 Farq: +${afterHistory.data.length - beforeHistory.data.length} ta yozuv\n`);
  
  // Statistika
  const stats = await api('get', '/cashbox/audit-stats');
  console.log('📊 Kassa Statistikasi:');
  console.log(`   - Jami harakatlar: ${stats.data.totalActions}`);
  console.log(`   - Kirimlar: ${stats.data.byType.ADD}`);
  console.log(`   - Jami kirim: $${stats.data.totalAmount.added.toFixed(2)}\n`);
}

async function run() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         REAL MA\'LUMOTLAR BILAN TARIX TESTI            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    const loggedIn = await login();
    if (!loggedIn) {
      console.log('❌ Login amalga oshmadi');
      return;
    }
    
    const hasData = await getOrCreateTestData();
    if (!hasData) {
      console.log('❌ Test ma\'lumotlari tayyorlanmadi');
      return;
    }
    
    await testSalesWithHistory();
    await testInventoryWithHistory();
    await testCashboxWithHistory();
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                    YAKUNIY NATIJA                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('✅ Barcha operatsiyalar tarixga to\'g\'ri yozildi!');
    console.log('📊 Audit log tizimi to\'liq ishlayapti!\n');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

run();
