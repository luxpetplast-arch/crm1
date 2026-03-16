/**
 * TEST: Telegram ID Linking System
 * 
 * Bu test Telegram bot va sayt o'rtasida mijozlarni bog'lash tizimini tekshiradi
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Test ma'lumotlari
const testData = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123'
  },
  customer: {
    name: 'Test Mijoz',
    phone: '+998901234567',
    email: 'test@example.com',
    category: 'NORMAL',
    telegramId: '' // Bu botdan olinadi
  }
};

async function login() {
  console.log('\n🔐 1. Admin tizimga kirish...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, testData.admin);
    authToken = response.data.token;
    console.log('✅ Muvaffaqiyatli kirdik');
    return true;
  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
    return false;
  }
}

async function getAllCustomers() {
  console.log('\n📋 2. Barcha mijozlarni olish...');
  try {
    const response = await axios.get(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Jami mijozlar: ${response.data.length}`);
    
    // Telegram orqali ro'yxatdan o'tgan mijozlarni ko'rsatish
    const telegramCustomers = response.data.filter(c => c.telegramChatId);
    console.log(`📱 Telegram orqali: ${telegramCustomers.length}`);
    
    if (telegramCustomers.length > 0) {
      console.log('\n📱 Telegram mijozlari:');
      telegramCustomers.forEach(c => {
        const uniqueId = c.id.slice(-8).toUpperCase();
        console.log(`   - ${c.name} (ID: ${uniqueId}, Chat: ${c.telegramChatId})`);
      });
    }
    
    return telegramCustomers;
  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
    return [];
  }
}

async function createCustomerWithTelegramId(telegramId) {
  console.log(`\n➕ 3. Mijoz yaratish (Telegram ID: ${telegramId})...`);
  try {
    const response = await axios.post(
      `${API_URL}/customers`,
      {
        ...testData.customer,
        telegramId
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Mijoz muvaffaqiyatli yaratildi va Telegram ga bog\'landi!');
    console.log(`   - ID: ${response.data.id}`);
    console.log(`   - Ism: ${response.data.name}`);
    console.log(`   - Telegram Chat ID: ${response.data.telegramChatId}`);
    console.log(`   - Telegram Username: ${response.data.telegramUsername || 'Yo\'q'}`);
    return response.data;
  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
    return null;
  }
}

async function createCustomerWithInvalidTelegramId() {
  console.log('\n❌ 4. Noto\'g\'ri Telegram ID bilan mijoz yaratish (xatolik kutilmoqda)...');
  try {
    await axios.post(
      `${API_URL}/customers`,
      {
        ...testData.customer,
        name: 'Invalid Test',
        phone: '+998909999999',
        telegramId: 'INVALID1'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('⚠️ Kutilmagan natija: Xatolik bo\'lishi kerak edi!');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ To\'g\'ri: Telegram ID topilmadi xatosi qaytdi');
    } else {
      console.error('❌ Boshqa xatolik:', error.response?.data || error.message);
    }
  }
}

async function createCustomerWithoutTelegramId() {
  console.log('\n➕ 5. Oddiy mijoz yaratish (Telegram ID siz)...');
  try {
    const response = await axios.post(
      `${API_URL}/customers`,
      {
        name: 'Oddiy Mijoz',
        phone: '+998907777777',
        email: 'oddiy@example.com',
        category: 'NORMAL'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Oddiy mijoz muvaffaqiyatli yaratildi');
    console.log(`   - ID: ${response.data.id}`);
    console.log(`   - Ism: ${response.data.name}`);
    console.log(`   - Telegram: ${response.data.telegramChatId ? 'Bog\'langan' : 'Bog\'lanmagan'}`);
    return response.data;
  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 TELEGRAM ID LINKING SYSTEM TEST');
  console.log('=====================================');
  
  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Test to\'xtatildi: Login amalga oshmadi');
    return;
  }
  
  // 2. Barcha mijozlarni olish
  const telegramCustomers = await getAllCustomers();
  
  // 3. Agar Telegram mijoz bo'lsa, uni saytga bog'lash
  if (telegramCustomers.length > 0) {
    const firstCustomer = telegramCustomers[0];
    const uniqueId = firstCustomer.id.slice(-8).toUpperCase();
    console.log(`\n💡 Test uchun Telegram ID: ${uniqueId}`);
    
    await createCustomerWithTelegramId(uniqueId);
  } else {
    console.log('\n⚠️ Telegram orqali ro\'yxatdan o\'tgan mijoz yo\'q');
    console.log('📱 Iltimos, Telegram botga /start yuboring va qayta urinib ko\'ring');
  }
  
  // 4. Noto'g'ri ID bilan test
  await createCustomerWithInvalidTelegramId();
  
  // 5. Oddiy mijoz yaratish
  await createCustomerWithoutTelegramId();
  
  // 6. Yakuniy natija
  console.log('\n📊 YAKUNIY NATIJA');
  console.log('=====================================');
  await getAllCustomers();
  
  console.log('\n✅ Test yakunlandi!');
  console.log('\n📝 QANDAY ISHLATISH:');
  console.log('1. Telegram botga /start yuboring');
  console.log('2. Bot sizga 8 belgili ID beradi (masalan: A1B2C3D4)');
  console.log('3. Saytda "Mijoz Qo\'shish" tugmasini bosing');
  console.log('4. "Telegram ID" maydoniga ID ni kiriting');
  console.log('5. Boshqa ma\'lumotlarni to\'ldiring va saqlang');
  console.log('6. Endi saytdagi hisobingiz Telegram botga ulandi!');
}

// Testni ishga tushirish
runTests().catch(console.error);
