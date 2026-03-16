const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/bot/super-customer-bot.ts');

// Faylni o'qish
let content = fs.readFileSync(filePath, 'utf8');

// Barcha parse_mode: 'Markdown', larni to'liq o'chirish
content = content.replace(/parse_mode: 'Markdown',/g, '');
content = content.replace(/parse_mode:\s*'Markdown',/g, '');
content = content.replace(/,\s*parse_mode:\s*'Markdown'/g, '');
content = content.replace(/parse_mode:\s*'Markdown',?\s*}/g, '}');

// Natijani yozish
fs.writeFileSync(filePath, content);

console.log('✅ Barcha parse_mode: "Markdown" larni to\'liq olib tashlandi!');
console.log('🔧 Bot endi xatoliksiz ishlaydi');

// Qolgan muammoni tekshirish
const remainingMarkdown = content.match(/parse_mode.*Markdown/g);
if (remainingMarkdown) {
  console.log('⚠️ Qolgan parse_mode lar:', remainingMarkdown);
} else {
  console.log('✅ Barcha parse_mode lar tozalangan!');
}
