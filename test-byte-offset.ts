import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_CUSTOMER_BOT_TOKEN;
const bot = new TelegramBot(token);

async function testByteOffset() {
  console.log('🧪 Byte offset testi...');
  
  try {
    // Test xabar - 168 baytga yaqin uzunlikda
    const testMessage = `🎉 BUYURTMA QABUL QILINDI!

📋 Buyurtma raqami: BOT-123456789
📅 Sana: 12.03.2026
👤 Mijoz: Test User

📦 Mahsulotlar:

1. Test Product
   📊 10 qop
   💰 500,000 so'm

💵 JAMI: 500,000 so'm

✅ Buyurtmangiz qabul qilindi va ko'rib chiqilmoqda.
📞 Tez orada operatorimiz siz bilan bog'lanadi.`;
    
    console.log(`📏 Xabar uzunligi: ${Buffer.byteLength(testMessage, 'utf8')} bayt`);
    console.log(`📝 Xabar matni:`, testMessage);
    
    // Chat ID ni o'zgartiring (o'zingizni)
    const testChatId = 'YOUR_CHAT_ID_HERE'; // O'z chat ID ingizni kiriting
    
    await bot.sendMessage(testChatId, testMessage);
    console.log('✅ Test xabar yuborildi!');
    
  } catch (error: any) {
    console.error('❌ Test xabar xatolik:', error.message);
    if (error.response) {
      console.error('🔍 Telegram API javobi:', error.response.body);
    }
  }
}

testByteOffset().catch(console.error);
