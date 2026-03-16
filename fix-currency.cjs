const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/bot/super-customer-bot.ts');

// Faylni o'qish
let content = fs.readFileSync(filePath, 'utf8');

// Barcha $ belgilarini olib tashlash (so'm da hisoblash uchun)
content = content.replace(/\$\{([^}]+)\}/g, '$1'); // ${...} -> ...
content = content.replace(/\$([0-9,]+)/g, '$1 so\'m'); // $123 -> 123 so'm

// Natijani yozish
fs.writeFileSync(filePath, content);

console.log('✅ Barcha $ belgilari olib tashlandi!');
console.log('🔧 Endi barcha hisob-kitoblar so\'mda bo\'ladi');

// Qolgan muammoni tekshirish
const remainingDollar = content.match(/\$/g);
if (remainingDollar) {
  console.log('⚠️ Qolgan $ belgilar:', remainingDollar.length);
} else {
  console.log('✅ Barcha $ belgilar tozalangan!');
}
