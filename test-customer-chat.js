import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// Test ma'lumotlari
const testData = {
  customer: {
    name: 'Test Mijoz Chat',
    phone: '+998901234567',
    address: 'Toshkent, Chilonzor',
    telegramChatId: '987654321',
    telegramUsername: 'test_customer'
  },
  messages: [
    'Assalomu alaykum!',
    'Mahsulot haqida ma\'lumot bera olasizmi?',
    'Narxi qancha?',
    'Yetkazib berish bepulmi?'
  ]
};

async function testCustomerChatSystem() {
  console.log('🚀 MIJOZ CHAT TIZIMI TESTI BOSHLANDI...\n');

  try {
    // 1. Mijoz yaratish
    console.log('1️⃣ Mijoz yaratish...');
    const customerResponse = await axios.post(`${API_BASE}/customers`, testData.customer);
    const customer = customerResponse.data;
    console.log(`✅ Mijoz yaratildi: ${customer.name} (ID: ${customer.id})`);

    // 2. Mijozdan xabar yuborish (simulatsiya)
    console.log('\n2️⃣ Mijozdan xabarlar yuborish (simulatsiya)...');
    for (const message of testData.messages) {
      await axios.post(`${API_BASE}/customer-chat/${customer.id}/send`, {
        message,
        messageType: 'TEXT'
      });
      console.log(`📨 Mijoz xabari: "${message}"`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. Suhbatlar ro'yxatini olish
    console.log('\n3️⃣ Suhbatlar ro\'yxatini olish...');
    const conversationsResponse = await axios.get(`${API_BASE}/customer-chat/conversations`);
    const conversations = conversationsResponse.data;
    console.log(`✅ Jami suhbatlar: ${conversations.length} ta`);
    
    if (conversations.length > 0) {
      const conv = conversations[0];
      console.log(`   - ${conv.customerName}: ${conv.unreadCount} o'qilmagan xabar`);
    }

    // 4. Bitta mijoz bilan chat tarixini olish
    console.log('\n4️⃣ Chat tarixini olish...');
    const messagesResponse = await axios.get(`${API_BASE}/customer-chat/${customer.id}/messages`);
    const messages = messagesResponse.data;
    console.log(`✅ Jami xabarlar: ${messages.length} ta`);
    
    messages.forEach((msg, index) => {
      const sender = msg.senderType === 'CUSTOMER' ? '👤 Mijoz' : '👨‍💼 Admin';
      console.log(`   ${index + 1}. ${sender}: ${msg.message}`);
    });

    // 5. Admin javob yuborish
    console.log('\n5️⃣ Admin javob yuborish...');
    const adminMessages = [
      'Assalomu alaykum! Sizga qanday yordam bera olaman?',
      'Mahsulotlarimiz haqida batafsil ma\'lumot berishga tayyorman.',
      'Narxlar 25,000 so\'mdan boshlanadi.',
      'Ha, yetkazib berish bepul!'
    ];

    for (const message of adminMessages) {
      await axios.post(`${API_BASE}/customer-chat/${customer.id}/send`, {
        message,
        messageType: 'TEXT'
      });
      console.log(`✅ Admin javobi: "${message}"`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 6. Yangilangan chat tarixini olish
    console.log('\n6️⃣ Yangilangan chat tarixini olish...');
    const updatedMessagesResponse = await axios.get(`${API_BASE}/customer-chat/${customer.id}/messages`);
    const updatedMessages = updatedMessagesResponse.data;
    console.log(`✅ Jami xabarlar: ${updatedMessages.length} ta`);

    // 7. O'qilmagan xabarlar sonini olish
    console.log('\n7️⃣ O\'qilmagan xabarlar sonini tekshirish...');
    const unreadResponse = await axios.get(`${API_BASE}/customer-chat/unread-count`);
    console.log(`✅ O'qilmagan xabarlar: ${unreadResponse.data.count} ta`);

    // 8. Barcha xabarlarni o'qilgan deb belgilash
    console.log('\n8️⃣ Barcha xabarlarni o\'qilgan deb belgilash...');
    await axios.put(`${API_BASE}/customer-chat/${customer.id}/read-all`);
    console.log('✅ Barcha xabarlar o\'qilgan deb belgilandi');

    // 9. O'qilmagan xabarlar sonini qayta tekshirish
    console.log('\n9️⃣ O\'qilmagan xabarlar sonini qayta tekshirish...');
    const unreadResponse2 = await axios.get(`${API_BASE}/customer-chat/unread-count`);
    console.log(`✅ O'qilmagan xabarlar: ${unreadResponse2.data.count} ta`);

    console.log('\n🎉 MIJOZ CHAT TIZIMI TESTI MUVAFFAQIYATLI TUGADI!');
    console.log('\n📊 TEST NATIJALARI:');
    console.log(`👤 Mijoz: ${customer.name} - ${customer.phone}`);
    console.log(`📱 Telegram: @${customer.telegramUsername}`);
    console.log(`💬 Jami xabarlar: ${updatedMessages.length} ta`);
    console.log(`📨 Mijoz xabarlari: ${testData.messages.length} ta`);
    console.log(`📩 Admin javoblari: ${adminMessages.length} ta`);

    return {
      success: true,
      data: {
        customer,
        totalMessages: updatedMessages.length,
        conversations: conversations.length
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

// Real-time chat simulatsiyasi
async function simulateRealTimeChat() {
  console.log('\n🔄 REAL-TIME CHAT SIMULATSIYASI...\n');

  try {
    // Mijoz yaratish
    const customerResponse = await axios.post(`${API_BASE}/customers`, {
      name: 'Real-time Test Mijoz',
      phone: '+998909999999',
      telegramChatId: '111222333',
      telegramUsername: 'realtime_test'
    });
    const customer = customerResponse.data;
    console.log(`✅ Mijoz yaratildi: ${customer.name}`);

    // Suhbat simulatsiyasi
    const conversation = [
      { sender: 'CUSTOMER', message: 'Salom!' },
      { sender: 'ADMIN', message: 'Assalomu alaykum! Sizga qanday yordam bera olaman?' },
      { sender: 'CUSTOMER', message: 'Mahsulot bor mi?' },
      { sender: 'ADMIN', message: 'Ha, barcha mahsulotlar mavjud. Qaysi mahsulot kerak?' },
      { sender: 'CUSTOMER', message: 'Kichik qop' },
      { sender: 'ADMIN', message: 'Kichik qop 25,000 so\'m. Nechta kerak?' },
      { sender: 'CUSTOMER', message: '5 ta' },
      { sender: 'ADMIN', message: 'Jami: 125,000 so\'m. Buyurtma berasizmi?' },
      { sender: 'CUSTOMER', message: 'Ha, buyurtma beraman' },
      { sender: 'ADMIN', message: 'Ajoyib! Buyurtmangiz qabul qilindi. Tez orada yetkazib beramiz!' }
    ];

    console.log('\n💬 SUHBAT BOSHLANDI:\n');
    for (const msg of conversation) {
      await axios.post(`${API_BASE}/customer-chat/${customer.id}/send`, {
        message: msg.message,
        messageType: 'TEXT'
      });

      const emoji = msg.sender === 'CUSTOMER' ? '👤' : '👨‍💼';
      const label = msg.sender === 'CUSTOMER' ? 'Mijoz' : 'Admin';
      console.log(`${emoji} ${label}: ${msg.message}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ SUHBAT TUGADI!');

  } catch (error) {
    console.error('\n❌ SIMULATSIYA XATOLIK:', error.message);
  }
}

// Testni ishga tushirish
async function runAllTests() {
  console.log('🧪 MIJOZ CHAT TIZIMI - TO\'LIQ TEST DASTURI');
  console.log('=' .repeat(60));

  // 1. Asosiy chat testi
  const chatResult = await testCustomerChatSystem();
  
  // 2. Real-time simulatsiya
  await simulateRealTimeChat();

  console.log('\n' + '='.repeat(60));
  console.log('🏁 BARCHA TESTLAR TUGADI!');
  
  if (chatResult.success) {
    console.log('✅ Barcha testlar muvaffaqiyatli o\'tdi');
    console.log('\n📱 SAYTGA KIRING:');
    console.log('   http://localhost:3000/customer-chat');
    console.log('\n💡 QANDAY ISHLAYDI:');
    console.log('   1. Mijoz botga xabar yozadi');
    console.log('   2. Xabar saytda ko\'rinadi');
    console.log('   3. Siz saytdan javob yozasiz');
    console.log('   4. Javob mijozga Telegram orqali boradi');
  } else {
    console.log('❌ Ba\'zi testlarda xatoliklar bor');
  }
}

// Testni ishga tushirish
runAllTests().catch(console.error);

export {
  testCustomerChatSystem,
  simulateRealTimeChat,
  runAllTests
};
