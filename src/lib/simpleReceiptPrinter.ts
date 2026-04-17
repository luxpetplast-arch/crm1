// Haqiqiy chekga o'xshash dizayn - barcha shakllarsiz
export interface SimpleReceiptData {
  saleId: string;
  receiptNumber: string;
  date: string;
  time: string;
  cashier: string;
  currency: string;
  exchangeRate?: number;
  customer: {
    name: string;
    phone?: string;
    address?: string;
    previousBalanceUZS?: number;
    previousBalanceUSD?: number;
    newBalanceUZS?: number;
    newBalanceUSD?: number;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    piecesPerBag?: number;
    pricePerBag: number;
    pricePerPiece: number;
    pricePerUnit?: number;
    subtotal: number;
    warehouse?: string;
  }>;
  subtotal: number;
  total: number;
  payments: {
    uzs?: number;
    usd?: number;
    click?: number;
  };
  totalPaid: number;
  debt: number;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
  }
}

// Convert function to maintain compatibility
export function convertToSimpleFormat(data: any, exchangeRate: number): SimpleReceiptData {
  return {
    saleId: data.saleId || 'N/A',
    receiptNumber: data.receiptNumber || data.saleId?.slice(0, 8).toUpperCase() || 'N/A',
    date: data.date,
    time: data.time,
    cashier: data.cashier,
    currency: data.currency || 'USD',
    exchangeRate: data.exchangeRate || exchangeRate,
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    total: data.total,
    payments: data.payments,
    totalPaid: data.totalPaid,
    debt: data.debt,
    companyInfo: data.companyInfo
  };
}

export function convertToFormat(data: any, exchangeRate: number): SimpleReceiptData {
  return convertToSimpleFormat(data, exchangeRate);
}

// Haqiqiy chekga o'xshash dizayn - barcha shakllarsiz
export function generateSimpleReceiptHTML(data: SimpleReceiptData): string {
  const currencySymbol = data.currency?.toUpperCase() === 'USD' ? '$' : 'so\'m';
  
  // Generate items HTML
  const itemsHTML = data.items.map((item, idx) => {
    const isPieceSale = item.unit === 'dona';
    const bags = isPieceSale ? (item.quantity / (item.piecesPerBag || 2000)).toFixed(2) : item.quantity;
    const pieces = isPieceSale ? item.quantity : item.quantity * (item.piecesPerBag || 2000);
    const pricePerUnit = isPieceSale ? (item.pricePerPiece || 0) : (item.pricePerBag || 0);
    
    return `
      <tr>
        <td style="text-align: left; padding: 2px; font-size: 9px; border: 1px solid #000000;">${item.name}</td>
        <td style="text-align: center; padding: 2px; font-size: 9px; border: 1px solid #000000;">${bags}</td>
        <td style="text-align: center; padding: 2px; font-size: 9px; border: 1px solid #000000;">${item.piecesPerBag || 2000}</td>
        <td style="text-align: right; padding: 2px; font-size: 9px; border: 1px solid #000000;">${pricePerUnit.toLocaleString()} ${currencySymbol}</td>
        <td style="text-align: right; padding: 2px; font-size: 9px; border: 1px solid #000000;"><strong>${item.subtotal.toLocaleString()}</strong> ${currencySymbol}</td>
      </tr>
    `;
  }).join('');

  // Generate payment breakdown
  const paymentsHTML = Object.entries(data.payments)
    .filter(([_, amount]) => amount && amount > 0)
    .map(([type, amount]) => {
      const label = type === 'uzs' ? 'Naqd (UZS)' : 
                    type === 'usd' ? 'Naqd (USD)' : 'Click';
      const symbol = type === 'usd' ? '$' : 'so\'m';
      return `
        <div class="payment-row">
          <span>${label}:</span>
          <span>${amount.toLocaleString()} ${symbol}</span>
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
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; width: 80mm; font-size: 10px; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Courier New', 'Consolas', monospace;
            font-size: 10px;
            line-height: 1.3;
            width: 80mm;
            margin: 0 auto;
            padding: 6px;
            background: #ffffff;
            color: #000000;
        }
        .header {
            text-align: center;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px dashed #000000;
        }
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
        }
        .receipt-title {
            font-size: 11px;
            font-weight: bold;
        }
        .receipt-number {
            font-size: 10px;
        }
        .customer-info {
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px dashed #000000;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1px;
            font-size: 9px;
        }
        .section-title {
            font-weight: bold;
            margin: 6px 0 3px 0;
            font-size: 10px;
            text-transform: uppercase;
            text-align: center;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin-bottom: 6px;
            border: 1px solid #000000;
        }
        .products-table th {
            text-align: center;
            padding: 3px 2px;
            font-weight: bold;
            border: 1px solid #000000;
            background: #f0f0f0;
            font-size: 9px;
        }
        .products-table td {
            padding: 3px 2px;
            vertical-align: top;
            border: 1px solid #000000;
        }
        .summary-section {
            margin: 6px 0;
            padding-top: 4px;
            border-top: 1px dashed #000000;
        }
        .payment-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1px;
            font-size: 9px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 11px;
            border-top: 1px solid #000000;
            border-bottom: 1px solid #000000;
            padding: 3px 0;
            margin: 4px 0;
        }
        .debt-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 9px;
        }
        .footer {
            text-align: center;
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px dashed #000000;
            font-size: 8px;
        }
        .footer-text {
            font-weight: bold;
            margin-bottom: 1px;
            font-size: 9px;
        }
        .footer-contact {
            font-size: 7px;
            margin-bottom: 1px;
        }
    </style>
</head>
<body>
    <div style="width: 100%;">
        <!-- Header with Logo -->
        <div class="header">
            <div style="text-align: left; margin-bottom: 4px;">
                <img src="/exsel/5242567361200591582 (3).jpg" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px;" />
            </div>
            <div class="company-name">LUX PET PLAST</div>
            <div style="font-size: 8px; text-align: center; margin-bottom: 2px; color: #333;">
                Buxoro viloyati, Vobkent tumani
            </div>
            <div style="font-size: 8px; text-align: center; margin-bottom: 4px; color: #333;">
                +998 91 414 44 58 | +998 91 920 07 00
            </div>
            <div class="receipt-title">SOTUV CHEKI</div>
            <div class="receipt-number">#${data.receiptNumber}</div>
        </div>
        
        <!-- Customer Info -->
        <div class="customer-info">
            <div class="info-row">
                <span>Mijoz:</span>
                <span>${data.customer.name}</span>
            </div>
            ${data.customer.phone ? `
            <div class="info-row">
                <span>Telefon:</span>
                <span>${data.customer.phone}</span>
            </div>
            ` : ''}
            <!-- Oldingi qarz - ikkala valyutada alohida -->
            <div class="info-row" style="color: #dc2626;">
                <span>Oldingi qarz (UZS):</span>
                <span>${(data.customer.previousBalanceUZS || 0).toLocaleString()} so'm</span>
            </div>
            <div class="info-row" style="color: #dc2626;">
                <span>Oldingi qarz (USD):</span>
                <span>$${(data.customer.previousBalanceUSD || 0).toLocaleString()}</span>
            </div>
            <div class="info-row" style="margin-top: 4px; border-top: 1px solid #000000; padding-top: 4px;">
                <span>Sana:</span>
                <span>${data.date} ${data.time}</span>
            </div>
            <div class="info-row">
                <span>Kassir:</span>
                <span>${data.cashier}</span>
            </div>
        </div>
    
        <!-- Products -->
        <div>
            <div class="section-title">MAHSULOTLAR</div>
            <table class="products-table">
                <thead>
                    <tr>
                        <th style="width: 35%;">Mahsulot</th>
                        <th style="width: 12%;">Qop</th>
                        <th style="width: 15%;">1 qopda</th>
                        <th style="width: 18%;">Narxi</th>
                        <th style="width: 20%;">Jami</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>
    
        <!-- Totals -->
        <div class="summary-section">
            <div class="total-row">
                <span>JAMI:</span>
                <span>${data.total.toLocaleString()} ${currencySymbol}</span>
            </div>
            
            ${paymentsHTML}
            
            <div class="payment-row" style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #000000;">
                <span><strong>To'langan:</strong></span>
                <span><strong>${data.totalPaid.toLocaleString()} ${currencySymbol}</strong></span>
            </div>
            
            ${data.debt > 0 ? `
            <div class="debt-row">
                <span>Qarz:</span>
                <span>${data.debt.toLocaleString()} ${currencySymbol}</span>
            </div>
            ` : ''}
            
            <!-- Yangi balans - ikkala valyutada alohida -->
            <div class="debt-row" style="margin-top: 4px; border-top: 1px dashed #000000; padding-top: 4px;">
                <span><strong>Qarz (UZS):</strong></span>
                <span><strong>${(data.customer.newBalanceUZS || 0).toLocaleString()} so'm</strong></span>
            </div>
            <div class="debt-row">
                <span><strong>Qarz (USD):</strong></span>
                <span><strong>$${(data.customer.newBalanceUSD || 0).toLocaleString()}</strong></span>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div style="font-size: 7px; color: #666;">${new Date().toLocaleString('uz-UZ')}</div>
        </div>
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

// Yuk xati (soddalashtirilgan)
export function generateDeliveryReceiptHTML(data: SimpleReceiptData): string {
  const itemsHTML = data.items.map((item, index) => `
    <tr>
      <td style="border: 1px solid #000; padding: 4px; text-align: center;">${index + 1}</td>
      <td style="border: 1px solid #000; padding: 4px;">
        <div>${item.name}</div>
        ${item.piecesPerBag ? `<div style="font-size: 8px;">${item.piecesPerBag} dona/qop</div>` : ''}
      </td>
      <td style="border: 1px solid #000; padding: 4px; text-align: center;">${item.quantity}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: right;">${(item.pricePerUnit || 0).toLocaleString()}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">${item.subtotal.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yuk Xati #${data.receiptNumber}</title>
    <style>
        @media print {
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; width: 80mm; font-size: 12px; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            margin: 0 auto;
            padding: 8px;
            background: white;
            color: #000;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="flex: 0 0 auto;">
                <img src="/logo.png" alt="Logo" style="width: 40px; height: 40px; object-fit: contain;" />
            </div>
            <div style="flex: 1; padding-left: 8px;">
                <div style="font-size: 14px; font-weight: bold;">${data.companyInfo.name}</div>
                <div style="font-size: 8px;">Buxoro viloyati, Vobkent tumani</div>
                <div style="font-size: 8px;">+998 91 414 44 58</div>
                <div style="font-size: 8px;">+998 91 920 07 00</div>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px; border: 1px solid #000; font-size: 9px;">
            <span>Mijoz:</span>
            <span>${data.customer.name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px; border: 1px solid #000; font-size: 9px;">
            <span>Sana:</span>
            <span>${data.date}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px; border: 1px solid #000; font-size: 9px;">
            <span>Kassir:</span>
            <span>${data.cashier}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px; border: 1px solid #000; font-size: 9px;">
            <span>Yuk Xati raqami:</span>
            <span>${data.receiptNumber}</span>
        </div>
    </div>
    
    <!-- Products -->
    <div style="margin-bottom: 15px;">
        <div style="font-size: 12px; font-weight: bold; text-align: center; margin-bottom: 8px;">YUK MAHSULOTLARI</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
                <tr>
                    <th style="border: 1px solid #000; padding: 4px;">NO</th>
                    <th style="border: 1px solid #000; padding: 4px;">Mahsulot</th>
                    <th style="border: 1px solid #000; padding: 4px;">Miqdor</th>
                    <th style="border: 1px solid #000; padding: 4px;">Narx</th>
                    <th style="border: 1px solid #000; padding: 4px;">Jami</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>
    </div>
    
    <!-- Info -->
    <div style="margin-bottom: 15px;">
        <div style="font-size: 12px; font-weight: bold; text-align: center; margin-bottom: 8px;">MA'LUMOTLAR</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px; border: 1px solid #000;">
            <span>Hujjat raqami:</span>
            <span>#${data.receiptNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px; border: 1px solid #000;">
            <span>Sana:</span>
            <span>${data.date}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px; border: 1px solid #000;">
            <span>Mijoz:</span>
            <span>${data.customer.name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px; border: 1px solid #000;">
            <span>Kassir:</span>
            <span>${data.cashier}</span>
        </div>
    </div>
    
    <!-- Footer with Company Info -->
    <div style="margin-top: 20px; padding-top: 10px; border-top: 2px solid #000;">
        <div style="text-align: center; margin-bottom: 8px;">
            <div style="font-size: 10px; font-weight: bold;">LUX PET PLAST</div>
            <div style="font-size: 8px;">Buxoro viloyati, Vobkent tumani</div>
            <div style="font-size: 8px;">+998 91 414 44 58</div>
            <div style="font-size: 8px;">+998 91 920 07 00</div>
        </div>
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
