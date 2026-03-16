import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_CUSTOMER_BOT_TOKEN;
const bot = new TelegramBot(token);

async function testOrder() {
  console.log('🧪 Buyurtma berish testi...');
  
  try {
    // Test mijoz ID si (ma'lumotlar tozalganligi sababli mavjud bo'lmasligi mumkin)
    const testChatId = '-1001234567890'; // Guruh chat ID
    
    // Test xabar
    const testMessage = `🧪 **TEST BUYURTMA**

📋 **Bot holati:** ✅ Ishlayapti
📱 **Test vaqti:** ${new Date().toLocaleString('uz-UZ')}
🔧 **Xabar formati:** To'gri (Markdownsiz)

Bu xabar muvaffaqiyatli yetib bormi?`;

    await bot.sendMessage(testChatId, testMessage);
    console.log('✅ Test buyurtma xabari yuborildi!');
    
  } catch (error: any) {
    console.error('❌ Test buyurtma xatolik:', error.message);
    if (error.response) {
      console.error('🔍 Telegram API javobi:', error.response.body);
    }
  }
}

testOrder().catch(console.error);
