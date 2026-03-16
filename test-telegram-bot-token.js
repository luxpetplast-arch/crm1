const https = require('https');

// Test qilinadigan token
const BOT_TOKEN = '8708703467:AAE1QKBZsICZwzE5G1LFeiPbMyb5usdLOMs';

console.log('🤖 Telegram Bot Token Tekshiruvi\n');
console.log('Token:', BOT_TOKEN);
console.log('─'.repeat(60));

// Telegram API orqali bot ma'lumotlarini olish
const options = {
  hostname: 'api.telegram.org',
  path: `/bot${BOT_TOKEN}/getMe`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('\n📊 Natija:\n');
      
      if (response.ok) {
        console.log('✅ BOT ISHLAYAPTI!\n');
        console.log('Bot Ma\'lumotlari:');
        console.log('  ID:', response.result.id);
        console.log('  Ism:', response.result.first_name);
        console.log('  Username:', '@' + response.result.username);
        console.log('  Can Join Groups:', response.result.can_join_groups ? 'Ha' : 'Yo\'q');
        console.log('  Can Read Messages:', response.result.can_read_all_group_messages ? 'Ha' : 'Yo\'q');
        console.log('  Supports Inline:', response.result.supports_inline_queries ? 'Ha' : 'Yo\'q');
        
        console.log('\n✅ Token to\'g\'ri va bot faol!');
        console.log('\n📱 Bot bilan bog\'lanish:');
        console.log('  https://t.me/' + response.result.username);
        
      } else {
        console.log('❌ BOT ISHLAMAYAPTI!\n');
        console.log('Xato:', response.description);
        console.log('\nSabablari:');
        console.log('  1. Token noto\'g\'ri');
        console.log('  2. Bot o\'chirilgan');
        console.log('  3. Token muddati tugagan');
      }
      
    } catch (error) {
      console.log('❌ XATO: JSON parse qilishda muammo');
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ TARMOQ XATOSI!');
  console.log('Xato:', error.message);
  console.log('\nInternet ulanishini tekshiring!');
});

req.end();
