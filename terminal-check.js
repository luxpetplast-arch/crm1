// Terminal orqali chek chiqarish skripti
const { generateSimpleReceiptHTML } = require('./src/lib/simpleReceiptPrinter');

// Test ma'lumotlari
const testData = {
  saleId: 'terminal-test-123',
  receiptNumber: 'TERM-001',
  date: new Date().toLocaleDateString('uz-UZ'),
  time: new Date().toLocaleTimeString('uz-UZ'),
  cashier: 'Terminal Kassir',
  customer: {
    name: 'Terminal Test Mijoz',
    phone: '+998 90 123 45 67',
    address: 'Toshkent sh., Chilonzor t.',
    previousBalanceUZS: 75000,
    previousBalanceUSD: 8,
    newBalanceUZS: 225000,
    newBalanceUSD: 23
  },
  items: [
    {
      name: 'Preform 15gr',
      quantity: 15,
      unit: 'qop',
      piecesPerBag: 2000,
      pricePerUnit: 25,
      subtotal: 375
    },
    {
      name: 'Krishka',
      quantity: 15,
      unit: 'qop',
      piecesPerBag: 2000,
      pricePerUnit: 0.5,
      subtotal: 7.5
    },
    {
      name: 'Ruchka',
      quantity: 10,
      unit: 'qop',
      piecesPerBag: 2000,
      pricePerUnit: 0.3,
      subtotal: 3
    }
  ],
  subtotal: 385.5,
  total: 385.5,
  payments: {
    uzs: 1500000,
    usd: 120
  },
  totalPaid: 240,
  debt: 145.5,
  companyInfo: {
    name: 'LUX PET PLAST',
    address: 'Toshkent sh., Chilonzor t.',
    phone: '+998 90 123 45 67'
  }
};

// Chek HTML ni generatsiya qilish
const receiptHTML = generateSimpleReceiptHTML(testData);

// HTML faylni saqlash
const fs = require('fs');
const path = require('path');

const fileName = `terminal-check-${Date.now()}.html`;
const filePath = path.join(__dirname, fileName);

fs.writeFileSync(filePath, receiptHTML, 'utf8');

console.log('🧪 Terminal orqali chek yaratildi!');
console.log(`📄 Fayl nomi: ${fileName}`);
console.log(`📍 Joylashuv: ${filePath}`);
console.log('🌐 Brauzerda ochish uchun faylni ikki marta bosing yoki:');
console.log(`   start ${fileName}`);

// Avtomatik ravishda brauzerda ochish (Windows)
const { exec } = require('child_process');
if (process.platform === 'win32') {
  exec(`start ${filePath}`, (error) => {
    if (error) {
      console.error('❌ Brauzerda ochishda xatolik:', error);
      console.log('📄 Faylni qo\'lda oching:', filePath);
    } else {
      console.log('✅ Chek brauzerda ochildi!');
    }
  });
} else if (process.platform === 'darwin') {
  exec(`open ${filePath}`, (error) => {
    if (error) {
      console.error('❌ Brauzerda ochishda xatolik:', error);
      console.log('📄 Faylni qo\'lda oching:', filePath);
    } else {
      console.log('✅ Chek brauzerda ochildi!');
    }
  });
} else {
  exec(`xdg-open ${filePath}`, (error) => {
    if (error) {
      console.error('❌ Brauzerda ochishda xatolik:', error);
      console.log('📄 Faylni qo\'lda oching:', filePath);
    } else {
      console.log('✅ Chek brauzerda ochildi!');
    }
  });
}
