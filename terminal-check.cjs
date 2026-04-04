// Terminal orqali chek chiqarish skripti (CommonJS)
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Oddiy chek HTML generatsiya funksiyasi
function generateSimpleReceiptHTML(data) {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center">${item.quantity} ${item.unit}</td>
      <td style="text-align: right">${item.pricePerUnit.toLocaleString()}</td>
      <td style="text-align: right">${item.subtotal.toLocaleString()}</td>
    </tr>
  `).join('');

  const paymentsHTML = Object.entries(data.payments)
    .filter(([_, amount]) => amount && amount > 0)
    .map(([type, amount]) => {
      const label = type === 'uzs' ? 'Naqd (UZS)' : 
                    type === 'usd' ? 'Dollar (USD)' : 'Click';
      return `
        <tr>
          <td colspan="3">${label}:</td>
          <td style="text-align: right">${amount.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

  return `
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chek #${data.receiptNumber}</title>
    <style>
        @media print {
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; width: 80mm; }
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .company-info {
            font-size: 10px;
            margin-bottom: 5px;
        }
        .receipt-info {
            margin-bottom: 10px;
        }
        .receipt-info div {
            margin: 2px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: left;
        }
        .items-table th {
            font-weight: bold;
            text-align: center;
            background: #f0f0f0;
        }
        .items-table td:nth-child(2),
        .items-table td:nth-child(3),
        .items-table td:nth-child(4) {
            text-align: right;
        }
        .totals {
            margin-bottom: 10px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-weight: bold;
        }
        .grand-total {
            border-top: 1px solid #000;
            padding-top: 2px;
            font-size: 14px;
        }
        .balance-section {
            margin-top: 10px;
            padding: 5px;
            border: 1px solid #000;
            background: #f9f9f9;
        }
        .balance-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
        }
        .balance-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
        }
        .footer {
            text-align: center;
            margin-top: 10px;
            border-top: 1px solid #000;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${data.companyInfo.name}</div>
        <div class="company-info">${data.companyInfo.phone}</div>
        <div class="company-info">${data.companyInfo.address}</div>
    </div>

    <div class="receipt-info">
        <div><strong>Chek:</strong> ${data.receiptNumber}</div>
        <div><strong>Sana:</strong> ${data.date} ${data.time}</div>
        <div><strong>Kassir:</strong> ${data.cashier}</div>
        <div><strong>Mijoz:</strong> ${data.customer.name}</div>
        ${data.customer.phone ? `<div><strong>Telefon:</strong> ${data.customer.phone}</div>` : ''}
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Mahsulot</th>
                <th>Soni</th>
                <th>Narx</th>
                <th>Jami</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHTML}
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>Jami:</span>
            <span>${data.total.toLocaleString()}</span>
        </div>
        ${paymentsHTML}
        <div class="totals-row grand-total">
            <span>To'landi:</span>
            <span>${data.totalPaid.toLocaleString()}</span>
        </div>
        ${data.debt > 0 ? `
        <div class="totals-row" style="color: red;">
            <span>Qarz:</span>
            <span>${data.debt.toLocaleString()}</span>
        </div>
        ` : ''}
    </div>

    ${data.customer.newBalanceUZS !== undefined || data.customer.newBalanceUSD !== undefined ? `
    <div class="balance-section">
        <div class="balance-title">MIJOZ BALANSI</div>
        ${data.customer.previousBalanceUZS !== undefined ? `
        <div class="balance-row">
            <span>Oldingi qarz (so'm):</span>
            <span>${data.customer.previousBalanceUZS.toLocaleString()}</span>
        </div>
        ` : ''}
        ${data.customer.previousBalanceUSD !== undefined ? `
        <div class="balance-row">
            <span>Oldingi qarz ($):</span>
            <span>$${data.customer.previousBalanceUSD.toLocaleString()}</span>
        </div>
        ` : ''}
        ${data.customer.newBalanceUZS !== undefined ? `
        <div class="balance-row">
            <span>Yangi qarz (so'm):</span>
            <span style="color: red;">${data.customer.newBalanceUZS.toLocaleString()}</span>
        </div>
        ` : ''}
        ${data.customer.newBalanceUSD !== undefined ? `
        <div class="balance-row">
            <span>Yangi qarz ($):</span>
            <span style="color: red;">$${data.customer.newBalanceUSD.toLocaleString()}</span>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <div class="footer">
        <div><strong>RAHMAT!</strong></div>
        <div>Xaridingiz uchun tashakkur!</div>
        <div style="margin-top: 5px; font-size: 10px;">ID: ${data.saleId}</div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 1000);
            }, 500);
        };
    </script>
</body>
</html>
  `;
}

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
const fileName = `terminal-check-${Date.now()}.html`;
const filePath = path.join(__dirname, fileName);

fs.writeFileSync(filePath, receiptHTML, 'utf8');

console.log('🧪 Terminal orqali chek yaratildi!');
console.log(`📄 Fayl nomi: ${fileName}`);
console.log(`📍 Joylashuv: ${filePath}`);
console.log('🌐 Brauzerda ochish uchun faylni ikki marta bosing yoki:');
console.log(`   start ${fileName}`);

// Avtomatik ravishda brauzerda ochish (Windows)
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
