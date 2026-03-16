const https = require('https');

const BOT_TOKEN = '8708703467:AAE1QKBZsICZwzE5G1LFeiPbMyb5usdLOMs';

console.log('🤖 Super Bot Test\n');
console.log('Token:', BOT_TOKEN);
console.log('─'.repeat(60));

// 1. Bot ma'lumotlarini olish
const options = {
  hostname: 'api.telegram.org',
  path: `/bot${BOT_TOKEN}/getMe`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      console.log('\n📊 Bot Ma\'lumotlari:\n');
      
      if (response.ok) {
        console.log('✅ BOT FAOL!\n');
        console.log('  ID:', response.result.id);
        console.log('  Ism:', response.result.first_name);
        console.log('  Username:', '@' + response.result.username);
        console.log('  Link: https://t.me/' + response.result.username);
        
        console.log('\n🔍 Webhook Holatini Tekshirish...\n');
        
        // 2. Webhook holatini tekshirish
        const webhookOptions = {
          hostname: 'api.telegram.org',
          path: `/bot${BOT_TOKEN}/getWebhookInfo`,
          method: 'GET'
        };
        
        const webhookReq = https.request(webhookOptions, (webhookRes) => {
          let webhookData = '';
          
          webhookRes.on('data', (chunk) => {
            webhookData += chunk;
          });
          
          webhookRes.on('end', () => {
            try {
              const webhookResponse = JSON.parse(webhookData);
              
              if (webhookResponse.ok) {
                const info = webhookResponse.result;
                console.log('📡 Webhook Ma\'lumotlari:');
                console.log('  URL:', info.url || 'Yo\'q (Polling mode)');
                console.log('  Pending updates:', info.pending_update_count);
                console.log('  Last error:', info.last_error_message || 'Yo\'q');
                
                if (!info.url) {
                  console.log('\n✅ Bot polling mode\'da ishlayapti');
                  console.log('✅ Server ishga tushganda bot avtomatik javob beradi');
                } else {
                  console.log('\n⚠️ Bot webhook mode\'da');
                  console.log('⚠️ Polling uchun webhook\'ni o\'chirish kerak');
                }
                
                console.log('\n🚀 Keyingi Qadamlar:');
                console.log('  1. Server ishga tushiring: npm run dev');
                console.log('  2. Botga /start yuboring');
                console.log('  3. Xush kelibsiz xabari kelishi kerak');
              }
            } catch (error) {
              console.log('❌ Webhook ma\'lumotlarini parse qilishda xato');
            }
          });
        });
        
        webhookReq.on('error', (error) => {
          console.log('❌ Webhook tekshirishda xato:', error.message);
        });
        
        webhookReq.end();
        
      } else {
        console.log('❌ BOT NOFAOL!\n');
        console.log('Xato:', response.description);
      }
      
    } catch (error) {
      console.log('❌ JSON parse xatosi');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ TARMOQ XATOSI!');
  console.log('Xato:', error.message);
});

req.end();
