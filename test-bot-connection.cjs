const TelegramBot = require('node-telegram-bot-api');

// Token to'g'ridan-to'g'ri
const BOT_TOKEN = '8708703467:AAE1QKBZsICZwzE5G1LFeiPbMyb5usdLOMs';

console.log('🤖 Bot ulanishini tekshirish...\n');
console.log('Token:', BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : 'YO\'Q');

if (!BOT_TOKEN) {
  console.error('❌ Bot token topilmadi!');
  process.exit(1);
}

async function testBot() {
  try {
    console.log('\n1️⃣ Bot obyektini yaratish...');
    const bot = new TelegramBot(BOT_TOKEN, { polling: false });
    
    console.log('2️⃣ Bot ma\'lumotlarini olish...');
    const botInfo = await bot.getMe();
    
    console.log('\n✅ BOT MUVAFFAQIYATLI ULANDI!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Bot Username:', `@${botInfo.username}`);
    console.log('🆔 Bot ID:', botInfo.id);
    console.log('👤 Bot Nomi:', botInfo.first_name);
    console.log('🤖 Bot turi:', botInfo.is_bot ? 'Bot' : 'Foydalanuvchi');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('3️⃣ Webhook holatini tekshirish...');
    const webhookInfo = await bot.getWebHookInfo();
    
    if (webhookInfo.url) {
      console.log('⚠️ Webhook faol:', webhookInfo.url);
      console.log('💡 Polling ishlatish uchun webhookni o\'chiring:');
      console.log('   await bot.deleteWebHook()');
    } else {
      console.log('✅ Webhook o\'chirilgan - Polling ishlatish mumkin');
    }
    
    console.log('\n4️⃣ Bot buyruqlarini tekshirish...');
    const commands = await bot.getMyCommands();
    
    if (commands.length > 0) {
      console.log(`✅ ${commands.length} ta buyruq topildi:`);
      commands.forEach(cmd => {
        console.log(`   /${cmd.command} - ${cmd.description}`);
      });
    } else {
      console.log('⚠️ Hech qanday buyruq sozlanmagan');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 BARCHA TESTLAR MUVAFFAQIYATLI O\'TDI!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📝 KEYINGI QADAMLAR:');
    console.log('1. Serverni ishga tushiring: npm run dev');
    console.log('2. Telegram\'da botni toping: @' + botInfo.username);
    console.log('3. /start buyrug\'ini yuboring');
    console.log('4. Botdan foydalaning!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ XATOLIK YUZAGA KELDI!\n');
    console.error('Xatolik:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 YECHIM:');
      console.log('Bot token noto\'g\'ri yoki yaroqsiz.');
      console.log('1. BotFather\'dan yangi token oling');
      console.log('2. .env faylida TELEGRAM_CUSTOMER_BOT_TOKEN ni yangilang');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 YECHIM:');
      console.log('Internet ulanishi yoki Telegram API ga kirish muammosi.');
      console.log('1. Internet ulanishini tekshiring');
      console.log('2. VPN ishlatib ko\'ring (Telegram bloklangan bo\'lishi mumkin)');
      console.log('3. Proxy sozlang');
    } else {
      console.log('\n💡 Batafsil xatolik:');
      console.error(error);
    }
    
    process.exit(1);
  }
}

testBot();
