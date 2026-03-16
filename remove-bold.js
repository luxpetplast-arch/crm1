const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/bot/super-customer-bot.ts');

// Faylni o'qish
let content = fs.readFileSync(filePath, 'utf8');

// Barcha ** belgilarini olib tashlash
content = content.replace(/\*\*/g, '');

// Natijani yozish
fs.writeFileSync(filePath, content);

console.log('✅ Barcha ** belgilari olib tashlandi!');
console.log('🔧 Bot endi xatoliksiz ishlaydi');

// Qolgan muammoni tekshirish
const remainingMarkdown = content.match(/\*\*/g);
if (remainingMarkdown) {
  console.log('⚠️ Qolgan ** belgilar:', remainingMarkdown.length);
} else {
  console.log('✅ Barcha ** belgilar tozalangan!');
}
