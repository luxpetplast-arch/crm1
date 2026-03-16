import axios from 'axios';

// Test telegram bot functionality
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

async function testTelegramBot() {
  console.log('🔍 Testing Telegram bot functionality...');
  
  try {
    // Test 1: Check bot token
    if (!BOT_TOKEN) {
      console.log('❌ Telegram bot token not configured');
      return;
    }
    
    // Test 2: Check admin chat ID
    if (!ADMIN_CHAT_ID) {
      console.log('❌ Admin chat ID not configured');
      return;
    }
    
    // Test 3: Send test message to admin
    const testMessage = '🧪 **TEST XABARI**\n\nBu test xabari.\n\nVaqt: ' + new Date().toLocaleString('uz-UZ');
    
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: ADMIN_CHAT_ID,
      text: testMessage,
      parse_mode: 'HTML'
    });
    
    console.log('✅ Test message sent successfully');
    console.log('📊 Response:', response.data);
    
    // Test 4: Check bot info
    const botInfo = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    console.log('🤖 Bot info:', botInfo.data);
    
    return true;
    
  } catch (error) {
    console.error('❌ Telegram bot test failed:', error);
    return false;
  }
}

// Test customer notifications
async function testCustomerNotifications() {
  console.log('🔍 Testing customer notifications...');
  
  const testCustomerChatId = 'TEST_CUSTOMER_CHAT_ID';
  const testOrder = {
    orderNumber: 'TEST-001',
    customer: {
      name: 'Test Mijoz',
      telegramChatId: testCustomerChatId
    }
  };
  
  try {
    // Simulate order creation notification
    const message = `🔄 **TEST BUYURTMA**\n\nBuyurtma raqami: ${testOrder.orderNumber}\nMijoz: ${testOrder.customer.name}\nTelegram Chat ID: ${testOrder.customer.telegramChatId}`;
    
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: testCustomerChatId,
      text: message,
      parse_mode: 'HTML'
    });
    
    console.log('✅ Customer notification test sent');
    console.log('📊 Response:', response.data);
    
    return true;
    
  } catch (error) {
    console.error('❌ Customer notification test failed:', error);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Telegram bot tests...\n');
  
  const botTest = await testTelegramBot();
  const customerTest = await testCustomerNotifications();
  
  console.log('\n📊 TEST NATIJALARI:');
  console.log('Bot test:', botTest ? '✅ MUVAFFAQIYATLI' : '❌ XATO');
  console.log('Customer test:', customerTest ? '✅ MUVAFFAQIYATLI' : '❌ XATO');
  
  if (botTest && customerTest) {
    console.log('\n🎉 BARCHA TESTLAR MUVAFFAQIYATLI!');
    console.log('\n📋 TAVSIYALAR:');
    console.log('1. .env faylida BOT_TOKEN va ADMIN_CHAT_ID larni tekshiring');
    console.log('2. Bot token to\'g\'ri ekanligini tekshiring');
    console.log('3. Admin chat ID to\'g\'ri ekanligini tekshiring');
    console.log('4. Test xabarlar yuborib ko\'ring');
    console.log('5. Mijozlarning telegramChatId larini tekshiring');
  } else {
    console.log('\n❌ BARCHA TESTLAR XATO!');
    console.log('\n🔧 MUAMMONI HAL QILISH:');
    console.log('1. .env faylini tekshiring');
    console.log('2. Bot tokenlarni to\'g\'ri o\'rnating');
    console.log('3. Admin chat ID larni to\'g\'ri o\'rnating');
  }
}

// Run tests
runAllTests();
