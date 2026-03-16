import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// Test ma'lumotlari
const testData = {
  customer: {
    name: 'Test Mijoz',
    phone: '+998901234567',
    address: 'Toshkent, Chilonzor tumani',
    telegramChatId: '123456789'
  },
  driver: {
    name: 'Test Haydovchi',
    phone: '+998907654321',
    licenseNumber: 'AB1234567',
    vehicleNumber: '01A123BC',
    telegramBotToken: '8730452763:AAF0dLAfLrQvLSswh6mJjLnQlBmKZNNLiuQ'
  },
  product: {
    name: 'Test Mahsulot',
    bagType: 'KICHIK',
    unitsPerBag: 50,
    currentStock: 100,
    pricePerBag: 25000
  },
  order: {
    quantity: 5,
    pricePerBag: 25000
  }
};

async function testCompleteDriverWorkflow() {
  console.log('🚀 Haydovchi bot tizimi to\'liq test boshlandi...\n');

  try {
    // 1. Mijoz yaratish
    console.log('1️⃣ Mijoz yaratish...');
    const customerResponse = await axios.post(`${API_BASE}/customers`, testData.customer);
    const customer = customerResponse.data;
    console.log(`✅ Mijoz yaratildi: ${customer.name} (ID: ${customer.id})`);

    // 2. Mahsulot yaratish
    console.log('\n2️⃣ Mahsulot yaratish...');
    const productResponse = await axios.post(`${API_BASE}/products`, testData.product);
    const product = productResponse.data;
    console.log(`✅ Mahsulot yaratildi: ${product.name} (ID: ${product.id})`);

    // 3. Haydovchi yaratish
    console.log('\n3️⃣ Haydovchi yaratish...');
    const driverResponse = await axios.post(`${API_BASE}/drivers`, testData.driver);
    const driver = driverResponse.data;
    console.log(`✅ Haydovchi yaratildi: ${driver.name} (ID: ${driver.id})`);

    // 4. Buyurtma yaratish
    console.log('\n4️⃣ Buyurtma yaratish...');
    const orderData = {
      customerId: customer.id,
      items: [{
        productId: product.id,
        quantity: testData.order.quantity,
        pricePerBag: testData.order.pricePerBag
      }],
      telegramChatId: customer.telegramChatId
    };

    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData);
    const order = orderResponse.data;
    console.log(`✅ Buyurtma yaratildi: ${order.orderNumber} (ID: ${order.id})`);

    // 5. Haydovchiga buyurtma tayinlash
    console.log('\n5️⃣ Haydovchiga buyurtma tayinlash...');
    const assignmentResponse = await axios.post(`${API_BASE}/drivers/${driver.id}/assign-order`, {
      orderId: order.id
    });
    const assignment = assignmentResponse.data;
    console.log(`✅ Buyurtma tayinlandi: Assignment ID ${assignment.id}`);

    // 6. Haydovchi buyurtmalarini tekshirish
    console.log('\n6️⃣ Haydovchi buyurtmalarini tekshirish...');
    const assignmentsResponse = await axios.get(`${API_BASE}/drivers/${driver.id}/assignments`);
    const assignments = assignmentsResponse.data;
    console.log(`✅ Haydovchi buyurtmalari: ${assignments.length} ta`);

    // 7. Haydovchi statistikasini tekshirish
    console.log('\n7️⃣ Haydovchi statistikasi...');
    const statsResponse = await axios.get(`${API_BASE}/drivers/${driver.id}/stats`);
    const stats = statsResponse.data;
    console.log(`✅ Statistika: ${stats.totalAssignments} ta buyurtma, ${stats.completionRate}% tugallash`);

    // 8. Chat xabari yuborish
    console.log('\n8️⃣ Admin chat xabari yuborish...');
    const chatResponse = await axios.post(`${API_BASE}/drivers/${driver.id}/chat`, {
      message: 'Salom! Bu test xabari.'
    });
    console.log(`✅ Chat xabari yuborildi: ${chatResponse.data.id}`);

    // 9. Chat tarixini tekshirish
    console.log('\n9️⃣ Chat tarixini tekshirish...');
    const chatHistoryResponse = await axios.get(`${API_BASE}/drivers/${driver.id}/chat`);
    const chatHistory = chatHistoryResponse.data;
    console.log(`✅ Chat tarixi: ${chatHistory.length} ta xabar`);

    // 10. Haydovchi holatini yangilash
    console.log('\n🔟 Haydovchi holatini yangilash...');
    const statusResponse = await axios.put(`${API_BASE}/drivers/${driver.id}/status`, {
      status: 'BUSY'
    });
    console.log(`✅ Holat yangilandi: ${statusResponse.data.status}`);

    // 11. Barcha haydovchilarni ko'rish
    console.log('\n1️⃣1️⃣ Barcha haydovchilarni ko\'rish...');
    const allDriversResponse = await axios.get(`${API_BASE}/drivers`);
    const allDrivers = allDriversResponse.data;
    console.log(`✅ Jami haydovchilar: ${allDrivers.length} ta`);

    console.log('\n🎉 HAYDOVCHI BOT TIZIMI TO\'LIQ TESTI MUVAFFAQIYATLI TUGADI!');
    console.log('\n📊 TEST NATIJALARI:');
    console.log(`👤 Mijoz: ${customer.name} - ${customer.phone}`);
    console.log(`📦 Mahsulot: ${product.name} - ${product.currentStock} qop`);
    console.log(`🚗 Haydovchi: ${driver.name} - ${driver.phone}`);
    console.log(`📋 Buyurtma: ${order.orderNumber} - ${order.totalAmount} so'm`);
    console.log(`🚚 Tayinlash: ${assignment.status} - ${assignment.deliveryAddress}`);
    console.log(`📊 Statistika: ${stats.totalAssignments} buyurtma, ${stats.completionRate}% muvaffaqiyat`);

    return {
      success: true,
      data: {
        customer,
        product,
        driver,
        order,
        assignment,
        stats
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

// Telegram bot funksiyalarini test qilish
async function testTelegramBotFunctions() {
  console.log('\n🤖 TELEGRAM BOT FUNKSIYALARINI TEST QILISH...\n');

  try {
    // Bot holatini tekshirish
    console.log('1️⃣ Bot holatini tekshirish...');
    const botStatusResponse = await axios.get(`${API_BASE}/bot-api/status`);
    console.log(`✅ Bot holati: ${JSON.stringify(botStatusResponse.data, null, 2)}`);

    // Barcha botlarni ko'rish
    console.log('\n2️⃣ Barcha botlarni ko\'rish...');
    const allBotsResponse = await axios.get(`${API_BASE}/bot-api/bots`);
    console.log(`✅ Botlar: ${JSON.stringify(allBotsResponse.data, null, 2)}`);

    console.log('\n🎉 TELEGRAM BOT FUNKSIYALARI TESTI TUGADI!');

  } catch (error) {
    console.error('\n❌ BOT TEST XATOLIK:', error.response?.data || error.message);
  }
}

// Workflow simulatsiyasi
async function simulateCompleteWorkflow() {
  console.log('\n🔄 TO\'LIQ WORKFLOW SIMULATSIYASI...\n');

  try {
    // 1. Mijoz botdan buyurtma beradi (simulatsiya)
    console.log('1️⃣ Mijoz buyurtma beradi...');
    
    // 2. Tizim ombor holatini tekshiradi
    console.log('2️⃣ Ombor holati tekshirilmoqda...');
    
    // 3. Mahsulot mavjud bo'lsa, haydovchiga tayinlanadi
    console.log('3️⃣ Haydovchiga tayinlanmoqda...');
    
    // 4. Haydovchi qabul qiladi
    console.log('4️⃣ Haydovchi qabul qiladi...');
    
    // 5. Yetkazib berish boshlanadi
    console.log('5️⃣ Yetkazib berish boshlanadi...');
    
    // 6. Yetkazib berish tugaydi
    console.log('6️⃣ Yetkazib berish tugaydi...');
    
    console.log('\n✅ WORKFLOW SIMULATSIYASI TUGADI!');

  } catch (error) {
    console.error('\n❌ WORKFLOW SIMULATSIYA XATOLIK:', error.message);
  }
}

// Testni ishga tushirish
async function runAllTests() {
  console.log('🧪 HAYDOVCHI BOT TIZIMI - TO\'LIQ TEST DASTURI');
  console.log('=' .repeat(60));

  // 1. Asosiy workflow testi
  const workflowResult = await testCompleteDriverWorkflow();
  
  // 2. Telegram bot testi
  await testTelegramBotFunctions();
  
  // 3. Workflow simulatsiyasi
  await simulateCompleteWorkflow();

  console.log('\n' + '='.repeat(60));
  console.log('🏁 BARCHA TESTLAR TUGADI!');
  
  if (workflowResult.success) {
    console.log('✅ Asosiy testlar muvaffaqiyatli o\'tdi');
  } else {
    console.log('❌ Ba\'zi testlarda xatoliklar bor');
  }
}

// Testni ishga tushirish
runAllTests().catch(console.error);

export {
  testCompleteDriverWorkflow,
  testTelegramBotFunctions,
  simulateCompleteWorkflow,
  runAllTests
};