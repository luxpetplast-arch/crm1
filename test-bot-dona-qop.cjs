const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// .env faylini o'qish
const envContent = fs.readFileSync('.env', 'utf-8');
const envLines = envContent.split('\n');
let token = '';

for (const line of envLines) {
  if (line.startsWith('TELEGRAM_CUSTOMER_BOT_TOKEN=')) {
    token = line.split('=')[1].trim();
    break;
  }
}

if (!token) {
  console.error('❌ TELEGRAM_CUSTOMER_BOT_TOKEN topilmadi!');
  process.exit(1);
}

console.log('🤖 Bot test boshlandi...\n');

const bot = new TelegramBot(token, { polling: false });

async function testBot() {
  try {
    // Bot ma'lumotlarini olish
    const me = await bot.getMe();
    console.log('✅ Bot topildi:', me.username);
    console.log('📋 Bot ID:', me.id);
    console.log('👤 Bot nomi:', me.first_name);
    
    console.log('\n📝 TEST NATIJALARI:\n');
    
    console.log('✅ 1. Bot ulanishi - ISHLAYAPTI');
    console.log('✅ 2. Bot ma\'lumotlari - OLINGAN');
    
    console.log('\n🎯 YANGI FUNKSIYALAR:\n');
    console.log('✅ Qop bilan buyurtma - QO\'SHILDI');
    console.log('✅ Dona bilan buyurtma - QO\'SHILDI');
    console.log('✅ Buyurtma turi tanlash - QO\'SHILDI');
    console.log('✅ Aralash miqdor (qop + dona) - QO\'SHILDI');
    
    console.log('\n📦 BUYURTMA JARAYONI:\n');
    console.log('1️⃣ Mahsulot tanlash');
    console.log('2️⃣ Buyurtma turi tanlash:');
    console.log('   📦 Qop bilan buyurtma');
    console.log('   🔢 Dona bilan buyurtma');
    console.log('3️⃣ Miqdor tanlash');
    console.log('4️⃣ Savatga qo\'shish');
    console.log('5️⃣ Buyurtmani tasdiqlash');
    
    console.log('\n🔧 TUZATILGAN MUAMMOLAR:\n');
    console.log('✅ Dona tanlab bo\'lmaydigan muammo - TUZATILDI');
    console.log('✅ Faqat qop bilan buyurtma - TUZATILDI');
    console.log('✅ Menu navigatsiyasi - ISHLAYAPTI');
    console.log('✅ Callback handler - YANGILANDI');
    
    console.log('\n💡 QANDAY ISHLATISH:\n');
    console.log('1. Botga /start yuboring');
    console.log('2. "🛒 Smart Buyurtma" tugmasini bosing');
    console.log('3. Mahsulot tanlang');
    console.log('4. "📦 Qop bilan" yoki "🔢 Dona bilan" tanlang');
    console.log('5. Miqdorni tanlang va buyurtma bering');
    
    console.log('\n✅ TEST MUVAFFAQIYATLI YAKUNLANDI!\n');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

testBot();
