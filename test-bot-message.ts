import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBotMessage() {
  console.log('🧪 Bot xabar yuborish testi...');
  
  const token = process.env.TELEGRAM_CUSTOMER_BOT_TOKEN;
  if (!token) {
    console.log('❌ Bot token topilmadi');
    return;
  }

  const bot = new TelegramBot(token);
  
  try {
    // Test xabar yuborish
    const testMessage = `🧪 **TEST XABAR**

📋 **Bot holati:** ✅ Ishlayapti
📱 **Test vaqti:** ${new Date().toLocaleString('uz-UZ')}
🔧 **Xabar formati:** To'gri

Bu xabar muvaffaqiyatli yetib bormi?`;
    
    console.log('📤 Test xabar yuborilmoqda...');
    
    // Simple formatda yuborish (markdownsiz)
    await bot.sendMessage('-1001234567890', testMessage);
    
    console.log('✅ Test xabar muvaffaqiyatli yuborildi!');
    
  } catch (error: any) {
    console.error('❌ Bot xabar yuborishda xatolik:', error.message);
    if (error.response) {
      console.error('🔍 Telegram API javobi:', error.response.body);
    }
  }
  
  await prisma.$disconnect();
}

testBotMessage().catch(console.error);
