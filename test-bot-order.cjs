const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testBotOrder() {
  console.log('🧪 BOT BUYURTMA TEST\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login muvaffaqiyatli\n');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Mijozlarni olish
    console.log('2️⃣ Mijozlarni olish...');
    const customersRes = await axios.get(`${API_URL}/customers`, { headers });
    const customers = customersRes.data;
    console.log(`✅ ${customers.length} ta mijoz topildi\n`);
    
    // Telegram ID'si bor mijozni topish
    const telegramCustomer = customers.find(c => c.telegramChatId);
    if (!telegramCustomer) {
      console.log('❌ Telegram ID\'si bor mijoz topilmadi!');
      console.log('💡 Botda /start bosing va ro\'yxatdan o\'ting\n');
      return;
    }
    
    console.log('👤 Telegram mijoz:', telegramCustomer.name);
    console.log('📱 Telegram ID:', telegramCustomer.telegramChatId);
    console.log('🆔 Customer ID:', telegramCustomer.id, '\n');
    
    // 3. Mahsulotlarni olish
    console.log('3️⃣ Mahsulotlarni olish...');
    const productsRes = await axios.get(`${API_URL}/products`, { headers });
    const products = productsRes.data.filter(p => p.currentStock > 0);
    
    if (products.length === 0) {
      console.log('❌ Omborda mahsulot yo\'q!\n');
      return;
    }
    
    console.log(`✅ ${products.length} ta mahsulot mavjud\n`);
    
    // 4. Buyurtmalarni olish (botdan oldingi holat)
    console.log('4️⃣ Hozirgi buyurtmalar...');
    const ordersBeforeRes = await axios.get(`${API_URL}/orders`, { headers });
    const ordersBefore = ordersBeforeRes.data;
    const botOrdersBefore = ordersBefore.filter(o => o.orderNumber.startsWith('BOT-'));
    console.log(`📦 Jami buyurtmalar: ${ordersBefore.length}`);
    console.log(`🤖 BOT buyurtmalar: ${botOrdersBefore.length}\n`);
    
    // 5. Botdan buyurtma yaratish (simulyatsiya)
    console.log('5️⃣ Botdan buyurtma yaratish...');
    const product = products[0];
    const orderData = {
      customerId: telegramCustomer.id,
      items: [
        {
          productId: product.id,
          quantityBags: 5,
          quantityUnits: 0
        }
      ],
      priority: 'NORMAL',
      requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      source: 'BOT' // BOT prefiksi uchun
    };
    
    const createOrderRes = await axios.post(`${API_URL}/orders`, orderData, { headers });
    const newOrder = createOrderRes.data.order;
    
    console.log('✅ Buyurtma yaratildi!');
    console.log('📋 Buyurtma raqami:', newOrder.orderNumber);
    console.log('👤 Mijoz:', telegramCustomer.name);
    console.log('📦 Mahsulot:', product.name);
    console.log('📊 Miqdor:', orderData.items[0].quantityBags, 'qop');
    console.log('💰 Summa:', newOrder.totalAmount, 'USD');
    
    if (newOrder.orderNumber.startsWith('BOT-')) {
      console.log('🤖 BOT prefiksi: ✅');
    } else {
      console.log('⚠️ BOT prefiksi: ❌ (', newOrder.orderNumber, ')');
    }
    console.log();
    
    // 6. Buyurtmalarni qayta olish
    console.log('6️⃣ Yangilangan buyurtmalar...');
    const ordersAfterRes = await axios.get(`${API_URL}/orders`, { headers });
    const ordersAfter = ordersAfterRes.data;
    const botOrdersAfter = ordersAfter.filter(o => o.orderNumber.startsWith('BOT-'));
    
    console.log(`📦 Jami buyurtmalar: ${ordersAfter.length}`);
    console.log(`🤖 BOT buyurtmalar: ${botOrdersAfter.length}\n`);
    
    // 7. Oxirgi buyurtmani ko'rsatish
    console.log('7️⃣ Oxirgi buyurtma tafsilotlari:');
    const lastOrder = ordersAfter[0];
    console.log('📋 Raqam:', lastOrder.orderNumber);
    console.log('👤 Mijoz:', lastOrder.customer?.name);
    console.log('📱 Telegram:', lastOrder.customer?.telegramChatId ? '✅' : '❌');
    console.log('📊 Status:', lastOrder.status);
    console.log('💰 Summa:', lastOrder.totalAmount, 'USD');
    console.log('📅 Sana:', new Date(lastOrder.createdAt).toLocaleString('uz-UZ'));
    
    if (lastOrder.orderNumber.startsWith('BOT-')) {
      console.log('🤖 Bu BOT buyurtma!');
    }
    
    console.log('\n✅ TEST MUVAFFAQIYATLI!');
    console.log('\n💡 Saytni oching: http://localhost:3000');
    console.log('💡 Orders sahifasiga o\'ting');
    console.log('💡 🤖 BOT belgisini qidiring');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
  }
}

testBotOrder();
