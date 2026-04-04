const fs = require('fs');

// Faylni o'qish
const content = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

// Muammoli qismni topish va tuzatish
const oldPattern = `                        <div className="space-y-2">
                      
                            // Mahsulotlarni guruhlaymiz`;

const newPattern = `                        <div className="space-y-2">
                          {(() => {
                            // Mahsulotlarni guruhlaymiz`;

// Almashtirish
const fixed = content.replace(oldPattern, newPattern);

// Faylga yozish
fs.writeFileSync('src/pages/Sales.tsx', fixed, 'utf8');

console.log('✅ Sales.tsx fayli tuzatildi!');
