#!/usr/bin/env node

/**
 * 🤖 3 TA TELEGRAM BOT TEST SKRIPTI
 * 
 * 1. Customer Bot - Mijoz bot
 * 2. Admin Bot - Admin bot
 * 3. Driver Bot - Haydovchi bot
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 TELEGRAM BOTLAR TEST BOSHLANDI\n');
console.log('='.repeat(60));

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  bots: []
};

// Bot fayllarini tekshirish
const bots = [
  {
    name: 'Customer Bot',
    path: 'server/bot/customer-bot.ts',
    description: 'Mijozlar uchun bot',
    commands: ['/start', '/balance', '/history', '/pay']
  },
  {
    name: 'Admin Bot',
    path: 'server/bot/admin-bot.ts',
    description: 'Admin uchun bot',
    commands: ['/start', '/stats', '/orders', '/alerts']
  },
  {
    name: 'Driver Bot',
    path: 'server/bot/driver-bot.ts',
    description: 'Haydovchilar uchun bot',
    commands: ['/start', '/myorders', '/complete', '/location']
  }
];

console.log('\n📋 BOT FAYLLARINI TEKSHIRISH:\n');

bots.forEach((bot, index) => {
  results.total++;
  
  const fullPath = path.join(process.cwd(), bot.path);
  const exists = fs.existsSync(fullPath);
  
  const botResult = {
    name: bot.name,
    path: bot.path,
    exists: exists,
    fileSize: 0,
    hasCommands: false,
    hasTelegramAPI: false,
    errors: []
  };
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    botResult.fileSize = stats.size;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Telegram API tekshirish
    botResult.hasTelegramAPI = content.includes('TelegramBot') || content.includes('telegraf');
    
    // Komandalar tekshirish
    const hasCommands = bot.commands.some(cmd => content.includes(cmd));
    botResult.hasCommands = hasCommands;
    
    // Xatolarni tekshirish
    if (!botResult.hasTelegramAPI) {
      botResult.errors.push('Telegram API integratsiyasi topilmadi');
    }
    if (!botResult.hasCommands) {
      botResult.errors.push('Bot komandalar topilmadi');
    }
    
    if (botResult.errors.length === 0) {
      results.passed++;
      console.log(`✅ ${index + 1}. ${bot.name}`);
      console.log(`   📁 Fayl: ${bot.path}`);
      console.log(`   📊 Hajm: ${(botResult.fileSize / 1024).toFixed(2)} KB`);
      console.log(`   🎯 Komandalar: ${bot.commands.join(', ')}`);
    } else {
      results.failed++;
      console.log(`❌ ${index + 1}. ${bot.name}`);
      console.log(`   📁 Fayl: ${bot.path}`);
      console.log(`   ⚠️  Xatolar:`);
      botResult.errors.forEach(err => console.log(`      - ${err}`));
    }
  } else {
    results.failed++;
    botResult.errors.push('Fayl topilmadi');
    console.log(`❌ ${index + 1}. ${bot.name}`);
    console.log(`   📁 Fayl: ${bot.path}`);
    console.log(`   ⚠️  Fayl topilmadi!`);
  }
  
  console.log('');
  results.bots.push(botResult);
});

// Bot Manager tekshirish
console.log('\n📋 BOT MANAGER TEKSHIRISH:\n');

const botManagerPath = path.join(process.cwd(), 'server/bot/bot-manager.ts');
if (fs.existsSync(botManagerPath)) {
  const content = fs.readFileSync(botManagerPath, 'utf8');
  
  console.log('✅ Bot Manager topildi');
  console.log(`   📁 Fayl: server/bot/bot-manager.ts`);
  
  // Barcha botlar import qilinganmi?
  const hasCustomerBot = content.includes('customer-bot') || content.includes('customerBot');
  const hasAdminBot = content.includes('admin-bot') || content.includes('adminBot');
  const hasDriverBot = content.includes('driver-bot') || content.includes('driverBot');
  
  console.log(`   ${hasCustomerBot ? '✅' : '❌'} Customer Bot import`);
  console.log(`   ${hasAdminBot ? '✅' : '❌'} Admin Bot import`);
  console.log(`   ${hasDriverBot ? '✅' : '❌'} Driver Bot import`);
} else {
  console.log('❌ Bot Manager topilmadi');
}

// Environment variables tekshirish
console.log('\n📋 ENVIRONMENT VARIABLES:\n');

const envPath = path.join(process.cwd(), '.env.example');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasBotToken = envContent.includes('TELEGRAM_BOT_TOKEN');
  const hasAdminChatId = envContent.includes('TELEGRAM_ADMIN_CHAT_ID');
  
  console.log(`${hasBotToken ? '✅' : '❌'} TELEGRAM_BOT_TOKEN`);
  console.log(`${hasAdminChatId ? '✅' : '❌'} TELEGRAM_ADMIN_CHAT_ID`);
} else {
  console.log('❌ .env.example topilmadi');
}

// Yakuniy hisobot
console.log('\n' + '='.repeat(60));
console.log('\n📊 YAKUNIY HISOBOT:\n');
console.log(`Jami testlar: ${results.total}`);
console.log(`✅ Muvaffaqiyatli: ${results.passed}`);
console.log(`❌ Xato: ${results.failed}`);
console.log(`📈 Muvaffaqiyat: ${((results.passed / results.total) * 100).toFixed(1)}%`);

// Hisobotni faylga yozish
const report = {
  date: new Date().toISOString(),
  results: results,
  recommendations: [
    'Barcha botlar uchun Telegram Bot Token kerak',
    'Bot komandalarni test qilish uchun real bot yarating',
    'Webhook yoki polling sozlang',
    'Error handling qo\'shing',
    'Logging tizimini yaxshilang'
  ]
};

fs.writeFileSync(
  'TELEGRAM_BOTLAR_TEST_HISOBOTI.md',
  `# 🤖 TELEGRAM BOTLAR TEST HISOBOTI

**Sana:** ${new Date().toLocaleString('uz-UZ')}

## 📊 Umumiy Statistika

- **Jami testlar:** ${results.total}
- **Muvaffaqiyatli:** ${results.passed} ✅
- **Xato:** ${results.failed} ❌
- **Muvaffaqiyat:** ${((results.passed / results.total) * 100).toFixed(1)}%

## 🤖 Botlar Holati

${results.bots.map((bot, i) => `
### ${i + 1}. ${bot.name}

- **Fayl:** \`${bot.path}\`
- **Mavjud:** ${bot.exists ? '✅ Ha' : '❌ Yo\'q'}
- **Hajm:** ${(bot.fileSize / 1024).toFixed(2)} KB
- **Telegram API:** ${bot.hasTelegramAPI ? '✅ Bor' : '❌ Yo\'q'}
- **Komandalar:** ${bot.hasCommands ? '✅ Bor' : '❌ Yo\'q'}

${bot.errors.length > 0 ? `**Xatolar:**\n${bot.errors.map(e => `- ${e}`).join('\n')}` : '**Xatolar yo\'q** ✅'}
`).join('\n')}

## 💡 Tavsiyalar

${report.recommendations.map(r => `- ${r}`).join('\n')}

## 🚀 Keyingi Qadamlar

1. Telegram Bot Token olish (@BotFather)
2. .env faylga token qo'shish
3. Bot Manager orqali barcha botlarni ishga tushirish
4. Webhook yoki polling sozlash
5. Real foydalanuvchilar bilan test qilish

---

*Yaratilgan: ${new Date().toLocaleString('uz-UZ')}*
`
);

console.log('\n📄 Hisobot saqlandi: TELEGRAM_BOTLAR_TEST_HISOBOTI.md\n');

process.exit(results.failed > 0 ? 1 : 0);
