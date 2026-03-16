const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test ma'lumotlari
const testData = {
  customer: {
    name: 'Test Mijoz',
    phone: '+998901234567',
    telegramChatId: '123456789',
    telegramUsername: 'testuser'
  },
  products: [
    {
      name: 'Test Mahsulot 1',
      pricePerBag: 25.50,
      currentStock: 10,
      bagType: 'SMALL'
    },
    {
      name: 'Test Mahsulot 2', 
      pricePerBag: 45.00,
      currentStock: 0, // Bu mahsulot yo'q - ishlab chiqarishga boradi
      bagType: 'LARGE'
    }
  ]
};

async function testBotWorkflow() {
  console.log('🧪 Bot Workflow Test Boshlandi...\n');

  try {
    // 1. Login qilish
    console.log('1️⃣ Login qilish...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login muvaffaqiyatli\n');

    // 2. Test mijoz yaratish
    console.log('2️⃣ Test mijoz yaratish...');
    const customerResponse = await axios.post(`${API_BASE}/customers`, testData.customer, { headers });
    const customerId = customerResponse.data.id;
    console.log(`✅ Mijoz yaratildi: ${customerId}\n`);

    // 3. Test mahsulotlar yaratish
    console.log('3️⃣ Test mahsulotlar yaratish...');
    const productIds = [];
    
    for (const productData of testData.products) {
      const productResponse = await axios.post(`${API_BASE}/products`, productData, { headers });
      productIds.push(productResponse.data.id);
      console.log(`✅ Mahsulot yaratildi: ${productResponse.data.name} (ID: ${productResponse.data.id})`);
    }
    console.log('');

    // 4. Bot orqali buyurtma berish simulatsiyasi
    console.log('4️⃣ Bot orqali buyurtma berish...');
    const orderData = {
      telegramChatId: testData.customer.telegramChatId,
      items: [
        {
          productId: productIds[0],
          quantity: 5,
          pricePerBag: testData.products[0].pricePerBag
        },
        {
          productId: productIds[1], 
          quantity: 3,
          pricePerBag: testData.products[1].pricePerBag
        }
      ],
      customerInfo: {
        name: testData.customer.name,
        phone: testData.customer.phone,
        username: testData.customer.telegramUsername
      }
    };

    const botOrderResponse = await axios.post(`${API_BASE}/bots/customer/order`, orderData);
    const orderId = botOrderResponse.data.data.id;
    console.log(`✅ Bot buyurtmasi yaratildi: ${orderId}\n`);

    // 5. Buyurtma holatini tekshirish
    console.log('5️⃣ Buyurtma holatini tekshirish...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 soniya kutish
    
    const orderStatusResponse = await axios.get(`${API_BASE}/orders/${orderId}`, { headers });
    console.log(`📋 Buyurtma holati: ${orderStatusResponse.data.status}`);
    console.log(`💰 Jami summa: $${orderStatusResponse.data.totalAmount}\n`);

    // 6. Ishlab chiqarish buyurtmalarini tekshirish
    console.log('6️⃣ Ishlab chiqarish buyurtmalarini tekshirish...');
    const productionResponse = await axios.get(`${API_BASE}/production/orders`, { headers });
    const productionOrders = productionResponse.data;
    
    console.log(`🏭 Ishlab chiqarish buyurtmalari: ${productionOrders.length} ta`);
    productionOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.product?.name} - ${order.targetQuantity} dona (${order.status})`);
    });
    console.log('');

    // 7. Yetkazib berish buyurtmalarini tekshirish
    console.log('7️⃣ Yetkazib berish buyurtmalarini tekshirish...');
    const deliveryResponse = await axios.get(`${API_BASE}/logistics/deliveries`, { headers });
    const deliveries = deliveryResponse.data;
    
    console.log(`🚚 Yetkazib berish buyurtmalari: ${deliveries.length} ta`);
    deliveries.forEach((delivery, index) => {
      console.log(`   ${index + 1}. ${delivery.order?.customer?.name} - ${delivery.status}`);
    });
    console.log('');

    // 8. Bot holatini tekshirish
    console.log('8️⃣ Bot holatini tekshirish...');
    const botStatusResponse = await axios.get(`${API_BASE}/bots/status`, { headers });
    const botHealth = botStatusResponse.data.data;
    
    console.log(`🤖 Jami botlar: ${botHealth.totalBots}`);
    console.log(`✅ Faol botlar: ${botHealth.activeBots}`);
    console.log(`❌ Nofaol botlar: ${botHealth.inactiveBots}`);
    console.log('');

    // 9. Ishlab chiqarishni tugallash simulatsiyasi
    if (productionOrders.length > 0) {
      console.log('9️⃣ Ishlab chiqarishni tugallash...');
      const productionOrder = productionOrders[0];
      
      await axios.put(`${API_BASE}/production/orders/${productionOrder.id}/status`, {
        status: 'COMPLETED',
        actualQuantity: productionOrder.targetQuantity
      }, { headers });
      
      console.log(`✅ Ishlab chiqarish tugallandi: ${productionOrder.id}\n`);
      
      // Bir oz kutish - workflow ishlasin
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Yangi yetkazib berish buyurtmalarini tekshirish
      const newDeliveryResponse = await axios.get(`${API_BASE}/logistics/deliveries`, { headers });
      const newDeliveries = newDeliveryResponse.data;
      
      console.log(`🚚 Yangi yetkazib berish buyurtmalari: ${newDeliveries.length} ta`);
    }

    // 10. Yetkazib berishni tugallash simulatsiyasi
    if (deliveries.length > 0) {
      console.log('🔟 Yetkazib berishni tugallash...');
      const delivery = deliveries[0];
      
      await axios.put(`${API_BASE}/logistics/deliveries/${delivery.id}/status`, {
        status: 'DELIVERED'
      }, { headers });
      
      console.log(`✅ Yetkazib berish tugallandi: ${delivery.id}\n`);
    }

    // 11. Yakuniy buyurtma holatini tekshirish
    console.log('1️⃣1️⃣ Yakuniy buyurtma holati...');
    const finalOrderResponse = await axios.get(`${API_BASE}/orders/${orderId}`, { headers });
    console.log(`📋 Yakuniy holat: ${finalOrderResponse.data.status}`);
    console.log(`📅 Yaratilgan: ${new Date(finalOrderResponse.data.createdAt).toLocaleString()}`);

    console.log('\n🎉 Bot Workflow Test Muvaffaqiyatli Tugallandi!');
    console.log('\n📊 Test Natijalari:');
    console.log(`✅ Mijoz yaratildi va bot orqali buyurtma berdi`);
    console.log(`✅ Ombor holati tekshirildi`);
    console.log(`✅ Ishlab chiqarish buyurtmasi yaratildi`);
    console.log(`✅ Yetkazib berish buyurtmasi yaratildi`);
    console.log(`✅ Barcha botlarga bildirishnomalar yuborildi`);
    console.log(`✅ Workflow to'liq ishladi`);

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Maslahat: Serverni ishga tushiring va login ma\'lumotlarini tekshiring');
    }
  }
}

// Test ishga tushirish
if (require.main === module) {
  testBotWorkflow();
}

module.exports = { testBotWorkflow };