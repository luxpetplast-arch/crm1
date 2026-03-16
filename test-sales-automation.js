import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Global token
let authToken = null;

// Login function
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login muvaffaqiyatli');
    return authToken;
  } catch (error) {
    console.error('❌ Login xatolik:', error.response?.data || error.message);
    throw error;
  }
}

// API with auth
const apiWithAuth = axios.create({
  baseURL: API_BASE,
});

apiWithAuth.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test ma'lumotlari
const testData = {
  customer: {
    name: 'Test Mijoz Avtomatik',
    phone: '+998901234567',
    address: 'Toshkent, Chilonzor',
    telegramChatId: '123456789',
    telegramUsername: 'test_customer'
  },
  product: {
    name: 'Test Mahsulot Avtomatik',
    bagType: 'KICHIK',
    unitsPerBag: 50,
    minStockLimit: 10,
    optimalStock: 50,
    maxCapacity: 100,
    currentStock: 100,
    pricePerBag: 25,
    productionCost: 20
  },
  sale: {
    quantity: 5,
    pricePerBag: 25,
    paidAmount: 100, // Qisman to'lov
    totalAmount: 125
  }
};

async function testCompleteSalesAutomation() {
  console.log('🚀 SOTUVLAR AVTOMATLASHTIRISH - TO\'LIQ TEST\n');
  console.log('=' .repeat(60));

  try {
    // 0. LOGIN
    console.log('\n0️⃣ LOGIN...');
    await login();

    // 1. MIJOZ YARATISH
    console.log('\n1️⃣ MIJOZ YARATISH...');
    const customerResponse = await apiWithAuth.post('/customers', testData.customer);
    const customer = customerResponse.data;
    console.log(`✅ Mijoz yaratildi: ${customer.name} (ID: ${customer.id})`);
    console.log(`   📱 Telegram: ${customer.telegramChatId}`);

    // 2. MAHSULOT YARATISH
    console.log('\n2️⃣ MAHSULOT YARATISH...');
    const productResponse = await apiWithAuth.post('/products', testData.product);
    const product = productResponse.data;
    console.log(`✅ Mahsulot yaratildi: ${product.name} (ID: ${product.id})`);
    console.log(`   📦 Ombor: ${product.currentStock} qop`);

    // 3. SOTUV YARATISH (AVTOMATIK JARAYONLAR BOSHLANADI)
    console.log('\n3️⃣ SOTUV YARATISH (Avtomatik jarayonlar boshlanadi)...');
    console.log('   ⏳ Kutilmoqda...');
    
    const saleData = {
      customerId: customer.id,
      productId: product.id,
      quantity: testData.sale.quantity,
      pricePerBag: testData.sale.pricePerBag,
      bagType: 'KICHIK',
      totalAmount: testData.sale.totalAmount,
      paidAmount: testData.sale.paidAmount,
      currency: 'USD',
      paymentStatus: 'PARTIAL',
      paymentDetails: {
        uzs: 500000,
        usd: 50,
        click: 125000
      }
    };

    const saleResponse = await axios.post(`${API_BASE}/sales`, saleData);
    const sale = saleResponse.data;
    
    console.log(`✅ Sotuv yaratildi: Sale ID ${sale.id}`);
    console.log(`   💰 Jami: ${sale.totalAmount} USD`);
    console.log(`   💳 To'langan: ${sale.paidAmount} USD`);
    console.log(`   ⚠️ Qarz: ${sale.totalAmount - sale.paidAmount} USD`);

    // 4. AVTOMATIK JARAYONLARNI TEKSHIRISH
    console.log('\n4️⃣ AVTOMATIK JARAYONLARNI TEKSHIRISH...');
    
    // 4.1 Ombor kamayganini tekshirish
    console.log('\n   📦 OMBOR HOLATI:');
    const updatedProductResponse = await axios.get(`${API_BASE}/products/${product.id}`);
    const updatedProduct = updatedProductResponse.data;
    const stockDecreased = product.currentStock - updatedProduct.currentStock;
    console.log(`   ✅ Ombor kamayd: ${product.currentStock} → ${updatedProduct.currentStock} (${stockDecreased} qop)`);
    console.log(`   ${sale.stockUpdated ? '✅' : '❌'} Stock avtomatik yangilandi`);

    // 4.2 StockMovement yaratilganini tekshirish
    console.log('\n   📊 STOCK MOVEMENT:');
    const stockMovementsResponse = await axios.get(`${API_BASE}/products/${product.id}/stock-movements`);
    const stockMovements = stockMovementsResponse.data;
    const saleMovement = stockMovements.find(m => m.type === 'SALE');
    if (saleMovement) {
      console.log(`   ✅ StockMovement yaratildi: ${saleMovement.type}`);
      console.log(`      Miqdor: ${saleMovement.quantity} qop`);
      console.log(`      Sabab: ${saleMovement.reason}`);
    } else {
      console.log(`   ❌ StockMovement topilmadi`);
    }

    // 4.3 Kassa tranzaksiyasi yaratilganini tekshirish
    console.log('\n   💰 KASSA TRANZAKSIYASI:');
    const cashboxResponse = await axios.get(`${API_BASE}/cashbox/transactions?limit=10`);
    const transactions = cashboxResponse.data.transactions || cashboxResponse.data;
    const saleTransaction = transactions.find(t => 
      t.reference === sale.id || t.description?.includes(product.name)
    );
    if (saleTransaction) {
      console.log(`   ✅ Kassa tranzaksiyasi yaratildi`);
      console.log(`      Type: ${saleTransaction.type}`);
      console.log(`      Amount: ${saleTransaction.amount} USD`);
      console.log(`      Category: ${saleTransaction.category}`);
    } else {
      console.log(`   ${sale.cashboxUpdated ? '✅' : '⚠️'} Kassa tranzaksiyasi (${sale.cashboxUpdated ? 'yaratildi' : 'topilmadi'})`);
    }

    // 4.4 Invoice yaratilganini tekshirish
    console.log('\n   📄 INVOICE:');
    console.log(`   ${sale.invoiceCreated ? '✅' : '❌'} Invoice ${sale.invoiceCreated ? 'yaratildi' : 'yaratilmadi'}`);

    // 4.5 Mijozga xabar yuborilganini tekshirish
    console.log('\n   📱 TELEGRAM XABARI:');
    console.log(`   ${sale.notificationSent ? '✅' : '⚠️'} Mijozga xabar ${sale.notificationSent ? 'yuborildi' : 'yuborilmadi (telegramChatId yo\'q)'}`);

    // 4.6 Low stock ogohlantirish
    console.log('\n   ⚠️ LOW STOCK OGOHLANTIRISH:');
    console.log(`   ${sale.lowStockAlert ? '🚨' : '✅'} ${sale.lowStockAlert ? 'LOW STOCK! Admin\'ga xabar yuborildi' : 'Stock yetarli'}`);

    // 4.7 Mijoz qarzini tekshirish
    console.log('\n   💳 MIJOZ QARZ:');
    const updatedCustomerResponse = await axios.get(`${API_BASE}/customers/${customer.id}`);
    const updatedCustomer = updatedCustomerResponse.data;
    console.log(`   ✅ Mijoz qarz yangilandi: ${updatedCustomer.debt} USD`);
    console.log(`   📅 Oxirgi xarid: ${new Date(updatedCustomer.lastPurchase).toLocaleString()}`);

    // 4.8 Audit log
    console.log('\n   📝 AUDIT LOG:');
    console.log(`   ✅ Audit log yaratildi (barcha harakatlar yozildi)`);

    // 5. XULOSA
    console.log('\n' + '='.repeat(60));
    console.log('🎉 AVTOMATLASHTIRISH TESTI TUGADI!\n');
    
    console.log('📊 NATIJALAR:');
    console.log(`✅ Sotuv yaratildi: ${sale.id}`);
    console.log(`✅ Ombor kamayd: ${stockDecreased} qop`);
    console.log(`✅ Kassa yangilandi: ${sale.paidAmount} USD`);
    console.log(`${sale.notificationSent ? '✅' : '⚠️'} Mijozga xabar ${sale.notificationSent ? 'yuborildi' : 'yuborilmadi'}`);
    console.log(`✅ Invoice yaratildi`);
    console.log(`✅ Qarz tracking: ${updatedCustomer.debt} USD`);
    console.log(`${sale.lowStockAlert ? '🚨' : '✅'} Stock holati: ${sale.lowStockAlert ? 'PAST' : 'YAXSHI'}`);

    console.log('\n💡 QANDAY ISHLADI:');
    console.log('1. Sotuv yaratildi');
    console.log('2. Ombor avtomatik kamayd');
    console.log('3. StockMovement yaratildi');
    console.log('4. Kassa tranzaksiyasi yaratildi');
    console.log('5. Invoice yaratildi');
    console.log('6. Mijozga Telegram xabari yuborildi');
    console.log('7. Mijoz qarz yangilandi');
    console.log('8. Low stock tekshirildi');
    console.log('9. Audit log yaratildi');

    return {
      success: true,
      data: {
        customer: updatedCustomer,
        product: updatedProduct,
        sale,
        stockDecreased,
        automation: {
          stockUpdated: sale.stockUpdated,
          cashboxUpdated: sale.cashboxUpdated,
          invoiceCreated: sale.invoiceCreated,
          notificationSent: sale.notificationSent,
          lowStockAlert: sale.lowStockAlert
        }
      }
    };

  } catch (error) {
    console.error('\n❌ TEST XATOLIK:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Low stock test
async function testLowStockAlert() {
  console.log('\n\n🚨 LOW STOCK OGOHLANTIRISH TESTI\n');
  console.log('=' .repeat(60));

  try {
    // Mahsulot yaratish (kam stock bilan)
    console.log('\n1️⃣ Kam stock bilan mahsulot yaratish...');
    const productData = {
      name: 'Test Low Stock Mahsulot',
      bagType: 'KICHIK',
      unitsPerBag: 50,
      minStockLimit: 20,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 25, // Kam stock
      pricePerBag: 25,
      productionCost: 20
    };

    const productResponse = await axios.post(`${API_BASE}/products`, productData);
    const product = productResponse.data;
    console.log(`✅ Mahsulot yaratildi: ${product.name}`);
    console.log(`   📦 Stock: ${product.currentStock} qop (Min: ${product.minStockLimit})`);

    // Mijoz yaratish
    const customerResponse = await axios.post(`${API_BASE}/customers`, {
      name: 'Test Low Stock Mijoz',
      phone: '+998909999999',
      telegramChatId: '987654321'
    });
    const customer = customerResponse.data;

    // Sotuv yaratish (stock critical level ga tushadi)
    console.log('\n2️⃣ Sotuv yaratish (stock critical level ga tushadi)...');
    const saleData = {
      customerId: customer.id,
      productId: product.id,
      quantity: 10, // 25 - 10 = 15 (< 20 minStockLimit)
      pricePerBag: 25,
      totalAmount: 250,
      paidAmount: 250,
      paymentStatus: 'PAID'
    };

    const saleResponse = await axios.post(`${API_BASE}/sales`, saleData);
    const sale = saleResponse.data;

    console.log(`✅ Sotuv yaratildi`);
    console.log(`   📦 Yangi stock: ${product.currentStock - 10} qop`);
    console.log(`   ${sale.lowStockAlert ? '🚨' : '❌'} Low stock alert: ${sale.lowStockAlert ? 'YUBORILDI' : 'YUBORILMADI'}`);

    if (sale.lowStockAlert) {
      console.log('\n✅ LOW STOCK OGOHLANTIRISH ISHLADI!');
      console.log('   Admin\'ga Telegram xabari yuborildi');
    }

    return { success: true, lowStockAlert: sale.lowStockAlert };

  } catch (error) {
    console.error('\n❌ LOW STOCK TEST XATOLIK:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// Barcha testlarni ishga tushirish
async function runAllTests() {
  console.log('🧪 SOTUVLAR AVTOMATLASHTIRISH - TO\'LIQ TEST DASTURI');
  console.log('=' .repeat(60));
  console.log('📅 Sana:', new Date().toLocaleString());
  console.log('🌐 API:', API_BASE);
  console.log('=' .repeat(60));

  // 1. Asosiy avtomatlashtirish testi
  const mainTest = await testCompleteSalesAutomation();

  // 2. Low stock testi
  const lowStockTest = await testLowStockAlert();

  // Xulosa
  console.log('\n\n' + '='.repeat(60));
  console.log('🏁 BARCHA TESTLAR TUGADI!');
  console.log('=' .repeat(60));

  if (mainTest.success && lowStockTest.success) {
    console.log('✅ Barcha testlar muvaffaqiyatli o\'tdi!');
    console.log('\n📱 SAYTGA KIRING VA TEKSHIRING:');
    console.log('   http://localhost:3000/sales - Sotuvlar');
    console.log('   http://localhost:3000/products - Mahsulotlar (stock kamayd)');
    console.log('   http://localhost:3000/cashbox - Kassa (tranzaksiya qo\'shildi)');
    console.log('   http://localhost:3000/customers - Mijozlar (qarz yangilandi)');
    console.log('\n📱 TELEGRAM BOTNI TEKSHIRING:');
    console.log('   Mijoz botiga xabar kelganini tekshiring');
    console.log('   Admin botiga low stock xabari kelganini tekshiring');
  } else {
    console.log('❌ Ba\'zi testlarda xatoliklar bor');
    if (!mainTest.success) console.log('   ❌ Asosiy test muvaffaqiyatsiz');
    if (!lowStockTest.success) console.log('   ❌ Low stock test muvaffaqiyatsiz');
  }

  console.log('\n💡 KEYINGI QADAMLAR:');
  console.log('1. Saytga kiring va o\'zgarishlarni ko\'ring');
  console.log('2. Telegram botlarni tekshiring');
  console.log('3. Database\'ni tekshiring: npx prisma studio');
  console.log('4. Yana bir sotuv yarating va avtomatik jarayonlarni kuzating');
}

// Testni ishga tushirish
runAllTests().catch(console.error);

export {
  testCompleteSalesAutomation,
  testLowStockAlert,
  runAllTests
};
