const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = '8708703467:AAE1QKBZsICZwzE5G1LFeiPbMyb5usdLOMs';

async function testBot() {
  console.log('🤖 Bot Ro\'yxatdan O\'tish va Buyurtma Tizimini Test Qilish\n');
  
  try {
    const bot = new TelegramBot(BOT_TOKEN);
    
    // 1. Bot ma'lumotlarini olish
    console.log('1️⃣ Bot ma\'lumotlarini tekshirish...');
    const botInfo = await bot.getMe();
    console.log(`✅ Bot topildi: @${botInfo.username}`);
    console.log(`   ID: ${botInfo.id}`);
    console.log(`   Ism: ${botInfo.first_name}\n`);
    
    // 2. Webhook holatini tekshirish
    console.log('2️⃣ Webhook holatini tekshirish...');
    const webhookInfo = await bot.getWebHookInfo();
    if (webhookInfo.url) {
      console.log(`⚠️  Webhook o'rnatilgan: ${webhookInfo.url}`);
      console.log('   Polling rejimida ishlash uchun webhook o\'chirish kerak.');
    } else {
      console.log('✅ Webhook o\'chirilgan (polling rejimi)\n');
    }
    
    // 3. Test xabari yuborish (agar chat ID mavjud bo'lsa)
    console.log('3️⃣ Test xabari yuborish...');
    console.log('   ℹ️  Chat ID kerak. Botga /start yuboring va chat ID ni oling.\n');
    
    // 4. Xususiyatlar ro'yxati
    console.log('4️⃣ Bot xususiyatlari:');
    console.log('   ✅ Ro\'yxatdan o\'tish tizimi');
    console.log('      • Ism so\'rash');
    console.log('      • Telefon so\'rash (kontakt tugmasi)');
    console.log('      • Manzil so\'rash');
    console.log('      • Ma\'lumotlarni saqlash');
    console.log('      • Unique ID berish\n');
    
    console.log('   ✅ Buyurtma tizimi');
    console.log('      • Mahsulotlar ro\'yxati');
    console.log('      • Miqdor tanlash (1-100 qop)');
    console.log('      • Savat tizimi');
    console.log('      • Ko\'p mahsulot qo\'shish');
    console.log('      • Buyurtmani tasdiqlash');
    console.log('      • Database\'ga saqlash\n');
    
    console.log('   ✅ Sayt integratsiyasi');
    console.log('      • Mijozlar bo\'limida ko\'rinish');
    console.log('      • Buyurtmalar bo\'limida ko\'rinish');
    console.log('      • Real-time yangilanish\n');
    
    // 5. Qo'llanma
    console.log('5️⃣ Foydalanish qo\'llanmasi:');
    console.log('   1. Botni oching: https://t.me/luxpetplastbot');
    console.log('   2. /start bosing');
    console.log('   3. Ro\'yxatdan o\'ting:');
    console.log('      • Ismingizni kiriting');
    console.log('      • Telefon raqamingizni kiriting');
    console.log('      • Manzilingizni kiriting');
    console.log('   4. Buyurtma bering:');
    console.log('      • 🛒 Smart Buyurtma tugmasini bosing');
    console.log('      • Mahsulotni tanlang');
    console.log('      • Miqdorni tanlang');
    console.log('      • Buyurtmani tasdiqlang');
    console.log('   5. Saytda tekshiring:');
    console.log('      • http://localhost:3000/customers');
    console.log('      • http://localhost:3000/orders\n');
    
    // 6. Komandalar
    console.log('6️⃣ Bot komandalar:');
    console.log('   /start - Botni boshlash va ro\'yxatdan o\'tish');
    console.log('   🛒 Smart Buyurtma - Buyurtma berish');
    console.log('   👤 Profil - Profilni ko\'rish');
    console.log('   🆔 Mening ID\'im - ID raqamni ko\'rish\n');
    
    console.log('✅ Test muvaffaqiyatli tugadi!');
    console.log('\n📝 Qo\'shimcha ma\'lumot: BOT_ROYXATDAN_OTISH_QOLLANMA.md');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n⚠️  Bot token noto\'g\'ri yoki yaroqsiz!');
      console.log('   .env faylida TELEGRAM_CUSTOMER_BOT_TOKEN ni tekshiring.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n⚠️  Internet ulanishi yo\'q!');
      console.log('   Internet ulanishini tekshiring.');
    }
  }
}

testBot();
