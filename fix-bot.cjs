import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'server/bot/super-customer-bot.ts');

// Faylni o'qish
let content = fs.readFileSync(filePath, 'utf8');

// Barcha parse_mode: 'Markdown' larni o'chirish
content = content.replace(/parse_mode: 'Markdown',/g, '');

// Natijani yozish
fs.writeFileSync(filePath, content);

console.log('✅ Barcha parse_mode: "Markdown" larni olib tashlandi!');
console.log('🔧 Bot endi xatoliksiz ishlaydi');
