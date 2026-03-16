// Chek chiqarish utility
export interface ReceiptData {
  saleId: string;
  receiptNumber: string;
  date: string;
  time: string;
  cashier: string;
  customer: {
    name: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  payments: {
    uzs?: number;
    usd?: number;
    card?: number;
  };
  totalPaid: number;
  debt: number;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    inn: string;
  };
}

export function generateReceiptHTML(data: ReceiptData): string {
  const itemsHTML = data.items.map(item => `
    <div class="item">
      <div class="item-name">${item.name}</div>
      <div class="item-qty">${item.quantity} ${item.unit}</div>
      <div class="item-price">${item.subtotal.toLocaleString()}</div>
    </div>
  `).join('');

  const paymentsHTML = Object.entries(data.payments)
    .filter(([_, amount]) => amount && amount > 0)
    .map(([type, amount]) => {
      const label = type === 'uzs' ? 'Naqd (UZS)' : 
                    type === 'usd' ? 'Dollar' : 'Karta';
      return `
        <div>
          <span>${label}:</span>
          <span>${amount?.toLocaleString()}</span>
        </div>
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
            @page {
                size: 80mm auto;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }

        body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            background: white;
        }

        .receipt {
            max-width: 100%;
        }

        .logo {
            text-align: center;
            margin-bottom: 15px;
            border: 2px solid #333;
            padding: 10px;
            background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
        }

        .logo h1 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            color: #333;
            letter-spacing: 2px;
        }

        .logo h2 {
            margin: 5px 0 0 0;
            font-size: 12px;
            font-weight: normal;
            color: #666;
        }

        .receipt {
            width: 100%;
            font-size: 12px;
        }

        .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .company-info {
            font-size: 10px;
            line-height: 1.4;
        }

        .receipt-info {
            margin: 10px 0;
            font-size: 11px;
        }

        .receipt-info div {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }

        .items {
            margin: 10px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
        }

        .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 11px;
        }

        .item-name {
            flex: 1;
        }

        .item-qty {
            width: 60px;
            text-align: center;
        }

        .item-price {
            width: 80px;
            text-align: right;
        }

        .totals {
            margin: 10px 0;
            font-size: 12px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }

        .total-row.grand-total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 5px;
            margin-top: 10px;
        }

        .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <!-- Logo Section -->
        <div class="logo">
            <h1>LUX PET PLAST</h1>
            <h2>TOSHKENT DO'KONI</h2>
        </div>

        <!-- Header -->
        <div class="header">
            <div class="company-name">${data.companyInfo.name}</div>
            <div class="company-info">
                ${data.companyInfo.address}<br>
                Tel: ${data.companyInfo.phone}<br>
                INN: ${data.companyInfo.inn}
            </div>
        </div>

        <!-- Receipt Info -->
        <div class="receipt-info">
            <div>
                <span>Chek #:</span>
                <span>${data.receiptNumber}</span>
            </div>
            <div>
                <span>Sana:</span>
                <span>${data.date} ${data.time}</span>
            </div>
            <div>
                <span>Kassir:</span>
                <span>${data.cashier}</span>
            </div>
            <div>
                <span>Mijoz:</span>
                <span>${data.customer.name}</span>
            </div>
            ${data.customer.phone ? `
            <div>
                <span>Tel:</span>
                <span>${data.customer.phone}</span>
            </div>
            ` : ''}
        </div>

        <!-- Items -->
        <div class="items">
            <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
                <div class="item-name">Mahsulot</div>
                <div class="item-qty">Soni</div>
                <div class="item-price">Narx</div>
            </div>
            ${itemsHTML}
        </div>

        <!-- Totals -->
        <div class="totals">
            <div class="total-row">
                <span>Jami:</span>
                <span>${data.subtotal.toLocaleString()} UZS</span>
            </div>
            <div class="total-row">
                <span>QQS (${data.taxRate}%):</span>
                <span>${data.tax.toLocaleString()} UZS</span>
            </div>
            <div class="total-row grand-total">
                <span>JAMI TO'LOV:</span>
                <span>${data.total.toLocaleString()} UZS</span>
            </div>
        </div>

        <!-- Payment Details -->
        <div class="receipt-info" style="margin-top: 15px;">
            <div style="font-weight: bold; margin-bottom: 5px;">To'lov ma'lumotlari:</div>
            ${paymentsHTML}
            <div style="font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
                <span>To'landi:</span>
                <span>${data.totalPaid.toLocaleString()} UZS</span>
            </div>
            ${data.debt > 0 ? `
            <div style="color: #d32f2f;">
                <span>Qarz:</span>
                <span>${data.debt.toLocaleString()} UZS</span>
            </div>
            ` : ''}
        </div>

        <!-- Footer -->
        <div class="footer">
            <div style="margin-bottom: 10px;">
                ═══════════════════════════
            </div>
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">
                RAHMAT!
            </div>
            <div>
                Xaridingiz uchun tashakkur!<br>
                Yana kutib qolamiz!
            </div>
            <div style="margin-top: 10px; font-size: 9px;">
                Chek ID: ${data.saleId}<br>
                Murojaat uchun: ${data.companyInfo.phone}
            </div>
            <div style="margin-top: 10px;">
                ═══════════════════════════
            </div>
            <div style="margin-top: 5px; font-size: 9px;">
                Powered by AzizTrades ERP v1.0
            </div>
        </div>
    </div>

    <script>
        // Avtomatik chop etish
        window.onload = function() {
            setTimeout(function() {
                window.print();
                // Chop etishdan keyin oynani yopish
                setTimeout(function() {
                    window.close();
                }, 1000);
            }, 500);
        };
    </script>
</body>
</html>
  `;
}

export function printReceipt(data: ReceiptData): void {
  // Try automatic printing first
  printToPhysicalPrinter(data)
    .then(() => {
      console.log('✅ Chek avtomatik chop etildi');
    })
    .catch((error) => {
      console.warn('⚠️ Avtomatik chop etish muvaffaqiyatsiz, popup oynasi ochilmoqda:', error.message);
      // Fallback to popup window
      printToPopupWindow(data);
    });
}

// Automatic printing to physical printer
async function printToPhysicalPrinter(data: ReceiptData): Promise<void> {
  try {
    // Generate receipt text for 80mm printer
    const receiptText = generateTextReceipt(data);
    
    // Create temporary file
    const tempFile = `receipt-${Date.now()}.txt`;
    
    // Write to file (using Node.js fs in browser environment through API)
    const response = await fetch('/api/print/receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: receiptText,
        filename: tempFile
      })
    });
    
    if (!response.ok) {
      throw new Error('Print service unavailable');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Printing failed');
    }
    
  } catch (error) {
    throw error;
  }
}

// Fallback popup printing
function printToPopupWindow(data: ReceiptData): void {
  const html = generateReceiptHTML(data);
  
  // Yangi oyna ochish
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Automatik ravishda print dialog ochish
    setTimeout(() => {
      printWindow.print();
    }, 500);
  } else {
    console.error('❌ Chek oynasini ochib bo\'lmadi. Popup blocker tekshiring!');
    alert('Chek chiqarish uchun popup oynalariga ruxsat bering!');
  }
}

// Generate text receipt for 80mm printer
function generateTextReceipt(data: ReceiptData): string {
  const itemsText = data.items.map(item => 
    `${item.name.padEnd(22)} ${item.quantity.toString().padStart(3)} ${item.pricePerUnit.toString().padStart(5)} ${item.subtotal.toString().padStart(5)}`
  ).join('\n');
  
  const paymentsText = Object.entries(data.payments)
    .filter(([_, amount]) => amount && amount > 0)
    .map(([type, amount]) => {
      const label = type === 'uzs' ? 'Naqd (UZS)' : 
                   type === 'usd' ? 'Dollar (USD)' : 
                   type === 'card' ? 'Karta' : type;
      return `${label}: ${amount.toLocaleString()}`;
    })
    .join('\n');

  return `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║                LUX PET PLAST                         ║
║              TOSHKENT DO'KONI                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
Sana: ${data.date}  Vaqt: ${data.time}
Chek raqami: ${data.receiptNumber}
Kassir: ${data.cashier}
Mijoz: ${data.customer.name}
Tel: ${data.customer.phone || ''}
----------------------------------------
Mahsulot                Soni  Narx  Jami
----------------------------------------
${itemsText}
----------------------------------------
Jami mahsulotlar: ${data.items.length} ta
Umumiy summa: ${data.total.toLocaleString()} so'm
${paymentsText ? `To'lov:\n${paymentsText}` : `To'lov turi: Naqd`}
To'langan: ${data.totalPaid.toLocaleString()} so'm
Qarz: ${data.debt.toLocaleString()} so'm
----------------------------------------
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
* Kafolat 1 oy
****************************************
FOYDALANUVCHI MA'LUMOTLARI:
Ism: ${data.customer.name}
Telefon: ${data.customer.phone || '[Telefon]'}
Manzil: ${data.customer.address || '[Manzil]'}
****************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: ${data.saleId}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
****************************************
        `.trim();
}

// Chek ma'lumotlarini tayyorlash
export function prepareSaleReceipt(
  sale: any,
  customer: any,
  user: any,
  exchangeRate: number = 12500
): ReceiptData {
  const now = new Date();
  const date = now.toLocaleDateString('uz-UZ');
  const time = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  
  // Mahsulotlarni tayyorlash
  const items = sale.items.map((item: any) => ({
    name: item.productName || item.product?.name || 'Mahsulot',
    quantity: item.quantity,
    unit: item.product?.bagType || 'qop',
    pricePerUnit: item.pricePerBag * exchangeRate,
    subtotal: item.subtotal * exchangeRate
  }));
  
  const subtotal = sale.totalAmount * exchangeRate;
  const taxRate = 12; // QQS foizi
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  
  // To'lovlarni tayyorlash
  const payments: any = {};
  if (sale.paymentDetails) {
    const details = typeof sale.paymentDetails === 'string' 
      ? JSON.parse(sale.paymentDetails) 
      : sale.paymentDetails;
    
    if (details.uzs) payments.uzs = parseFloat(details.uzs);
    if (details.usd) payments.usd = parseFloat(details.usd) * exchangeRate;
    if (details.click) payments.card = parseFloat(details.click);
  }
  
  const totalPaid = sale.paidAmount * exchangeRate;
  const debt = sale.debtAmount * exchangeRate;
  
  return {
    saleId: sale.id,
    receiptNumber: sale.id.slice(0, 8).toUpperCase(),
    date,
    time,
    cashier: user?.name || 'Kassir',
    customer: {
      name: customer?.name || 'Mijoz',
      phone: customer?.phone,
      address: customer?.address
    },
    items,
    subtotal,
    tax,
    taxRate,
    total,
    payments,
    totalPaid,
    debt,
    companyInfo: {
      name: 'AZIZ TRADES',
      address: 'Toshkent sh., Chilonzor t.',
      phone: '+998 90 123 45 67',
      inn: '123456789'
    }
  };
}
