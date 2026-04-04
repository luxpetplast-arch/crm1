// Oddiy chek va Yuk xati uchun utility
export interface SimpleReceiptData {
  saleId: string;
  receiptNumber: string;
  date: string;
  time: string;
  cashier: string;
  currency?: string; // 'USD' yoki 'UZS'
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
    name: string;
    quantity: number;
    unit: string;
    piecesPerBag?: number;
    pricePerUnit: number;
    subtotal: number;
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
  };
}

// Oddiy chek (kassir cheki)
export function generateSimpleReceiptHTML(data: SimpleReceiptData): string {
  const currencySymbol = data.currency === 'USD' ? '$' : 'so\'m';
  const currencyLabel = data.currency === 'USD' ? '$' : 'so\'m';
  
  const itemsHTML = data.items.map(item => {
    const subtotal = item?.subtotal ?? 0;
    const bags = item?.quantity || 0;
    const piecesPerBag = item?.piecesPerBag || 2000;
    const totalPieces = bags * piecesPerBag;
    return `
    <tr>
      <td style="font-weight: 900;">${item?.name || 'Noma\'lum'}</td>
      <td style="text-align: center; line-height: 1.2;"><div style="font-weight: 900; font-size: 18px;">${bags}</div><div style="font-size: 12px; color: #666;">qop</div></td>
      <td style="text-align: center; line-height: 1.2;"><div style="font-weight: 900; font-size: 18px;">${piecesPerBag}</div><div style="font-size: 12px; color: #666;">dona</div></td>
      <td style="text-align: right; line-height: 1.2; font-weight: 900;"><div style="font-size: 18px;">${Number(subtotal).toLocaleString()}</div><div style="font-size: 12px; color: #666;">${currencyLabel}</div></td>
    </tr>
  `}).join('');

  const paymentsHTML = Object.entries(data.payments)
    .filter(([_, amount]) => amount && amount > 0)
    .map(([type, amount]) => {
      const label = type === 'uzs' ? 'Naqd (UZS)' : 
                    type === 'usd' ? 'Dollar (USD)' : 'Click';
      return `
        <tr>
          <td colspan="2">${label}:</td>
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
            font-size: 14px;
            line-height: 1.4;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            background: white;
            font-weight: 700;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 3px solid #000;
            padding-bottom: 8px;
        }
        .company-name {
            font-size: 20px;
            font-weight: 900;
            margin-bottom: 4px;
        }
        .company-info {
            font-size: 12px;
            margin-bottom: 8px;
            font-weight: 700;
        }
        .receipt-info {
            margin-bottom: 12px;
            font-size: 13px;
            font-weight: 700;
        }
        .receipt-info div {
            margin: 4px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 13px;
            font-weight: 700;
        }
        .items-table th,
        .items-table td {
            border: 2px solid #000;
            padding: 4px;
            text-align: left;
        }
        .items-table th {
            font-weight: 900;
            text-align: center;
            background: #f0f0f0;
            font-size: 12px;
        }
        .items-table td:nth-child(2),
        .items-table td:nth-child(3),
        .items-table td:nth-child(4) {
            text-align: center;
        }
        .items-table td:nth-child(4) {
            text-align: right;
        }
        .totals {
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 800;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-weight: 800;
        }
        .grand-total {
            border-top: 3px solid #000;
            padding-top: 4px;
            font-size: 18px;
            font-weight: 900;
        }
        .balance-section {
            margin-top: 12px;
            padding: 10px;
            border: 3px solid #000;
            background: #f9f9f9;
            font-size: 13px;
            font-weight: 700;
        }
        .balance-title {
            font-weight: 900;
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 3px solid #000;
            padding-bottom: 4px;
            font-size: 15px;
        }
        .balance-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-weight: 700;
        }
        .footer {
            text-align: center;
            margin-top: 12px;
            border-top: 3px solid #000;
            padding-top: 8px;
            font-size: 13px;
            font-weight: 700;
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
                <th>Qop</th>
                <th>Dona</th>
                <th>Jami Narx</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHTML}
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>Jami:</span>
            <span>${currencySymbol}${data.total.toLocaleString()}</span>
        </div>
        ${paymentsHTML}
        <div class="totals-row grand-total">
            <span>To'landi:</span>
            <span>${currencySymbol}${data.totalPaid.toLocaleString()}</span>
        </div>
        ${data.debt > 0 ? `
        <div class="totals-row" style="color: red;">
            <span>Qarz:</span>
            <span>${currencySymbol}${data.debt.toLocaleString()}</span>
        </div>
        ` : ''}
    </div>

    ${data.customer.newBalanceUZS !== undefined || data.customer.newBalanceUSD !== undefined ? `
    <div class="balance-section">
        <div class="balance-title">MIJOZ BALANSI</div>
        ${data.customer.previousBalanceUZS !== undefined ? `
        <div class="balance-row">
            <span style="font-weight: 900;">Oldingi so'mdagi qarz:</span>
            <span style="font-weight: 900;">${data.customer.previousBalanceUZS.toLocaleString()}</span>
        </div>
        ` : ''}
        ${data.customer.previousBalanceUSD !== undefined ? `
        <div class="balance-row">
            <span style="font-weight: 900;">Oldingi $ dagi qarz:</span>
            <span style="font-weight: 900;">$${data.customer.previousBalanceUSD.toLocaleString()}</span>
        </div>
        ` : ''}
        ${data.customer.newBalanceUZS !== undefined ? `
        <div class="balance-row">
            <span style="font-weight: 900;">Savdodan keyingi qarz (so'm):</span>
            <span style="color: red; font-weight: 900;">${data.customer.newBalanceUZS.toLocaleString()}</span>
        </div>
        ` : ''}
        ${data.customer.newBalanceUSD !== undefined ? `
        <div class="balance-row">
            <span style="font-weight: 900;">Savdodan keyingi qarz ($):</span>
            <span style="color: red; font-weight: 900;">$${data.customer.newBalanceUSD.toLocaleString()}</span>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <div class="footer">
        <div style="font-size: 22px; font-weight: 900;"><strong>RAHMAT!</strong></div>
        <div style="font-size: 16px; font-weight: 700;">Xaridingiz uchun tashakkur!</div>
        <div style="margin-top: 10px; font-size: 14px; font-weight: 700;">ID: ${data.saleId}</div>
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

// Yuk xati (chiroyli modern dizayn)
export function generateDeliveryReceiptHTML(data: SimpleReceiptData): string {
  const itemsHTML = data.items.map((item, index) => `
    <tr class="item-row">
      <td class="num-cell">${index + 1}</td>
      <td class="name-cell">
        <div class="product-name">${item.name}</div>
        ${item.piecesPerBag ? `<div class="product-detail">${item.piecesPerBag} dona/qop</div>` : ''}
      </td>
      <td class="qty-cell">${item.quantity} ${item.unit}</td>
      <td class="price-cell">${item.pricePerUnit.toLocaleString()}</td>
      <td class="sum-cell">${item.subtotal.toLocaleString()}</td>
    </tr>
  `).join('');

  const paymentsHTML = Object.entries(data.payments)
    .filter(([_, amount]) => amount && amount > 0)
    .map(([type, amount]) => {
      const label = type === 'uzs' ? 'Naqd (UZS)' : 
                    type === 'usd' ? 'Dollar (USD)' : 'Click';
      return `
        <div class="payment-row">
          <span>${label}:</span>
          <span>${amount.toLocaleString()}</span>
        </div>
      `;
    }).join('');

  return `
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yuk xati #${data.receiptNumber}</title>
    <style>
        @media print {
            @page { size: A4; margin: 15mm; }
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        .header::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 40px;
            background: white;
            border-radius: 50% 50% 0 0;
        }
        .company-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(255,255,255,0.2);
            padding: 8px 20px;
            border-radius: 50px;
            margin-bottom: 15px;
            backdrop-filter: blur(10px);
        }
        .company-badge::before {
            content: '🏭';
            font-size: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 8px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .doc-title {
            font-size: 16px;
            font-weight: 700;
            background: rgba(255,255,255,0.3);
            display: inline-block;
            padding: 8px 25px;
            border-radius: 50px;
            margin-bottom: 10px;
        }
        .company-contact {
            font-size: 12px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
            padding-top: 40px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
        }
        .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 15px;
            padding: 20px;
            border-left: 4px solid #3b82f6;
        }
        .info-card.customer {
            border-left-color: #10b981;
        }
        .info-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-title::before {
            content: '';
            width: 8px;
            height: 8px;
            background: currentColor;
            border-radius: 50%;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dashed #cbd5e1;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #475569;
        }
        .info-value {
            font-weight: 700;
            color: #1e293b;
        }
        .section-title {
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: center;
            margin: 30px 0 20px;
            padding: 15px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            border-radius: 12px;
            position: relative;
        }
        .section-title::before,
        .section-title::after {
            content: '◆';
            margin: 0 15px;
            color: #60a5fa;
        }
        .items-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 0;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .items-table thead {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
        }
        .items-table th {
            padding: 15px 12px;
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            background: white;
        }
        .items-table tr:nth-child(even) td {
            background: #f8fafc;
        }
        .item-row:hover td {
            background: #e0f2fe !important;
        }
        .num-cell {
            text-align: center;
            font-weight: 700;
            color: #3b82f6;
            width: 50px;
        }
        .name-cell {
            text-align: left;
        }
        .product-name {
            font-weight: 700;
            color: #1e293b;
            font-size: 13px;
        }
        .product-detail {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
        }
        .qty-cell {
            text-align: center;
            font-weight: 700;
            color: #059669;
        }
        .price-cell {
            text-align: right;
            font-weight: 600;
            color: #475569;
        }
        .sum-cell {
            text-align: right;
            font-weight: 800;
            color: #1e40af;
            font-size: 14px;
        }
        .totals-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 20px;
            padding: 25px;
            margin-top: 25px;
            border: 2px solid #bae6fd;
        }
        .totals-grid {
            display: grid;
            gap: 12px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .total-label {
            font-weight: 700;
            color: #475569;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .total-value {
            font-weight: 800;
            font-size: 15px;
        }
        .grand-total {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 20px 25px;
            border-radius: 15px;
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .grand-total .total-label {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
        }
        .grand-total .total-value {
            color: white;
            font-size: 24px;
            font-weight: 900;
        }
        .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 15px;
            color: #059669;
            font-weight: 600;
        }
        .debt-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 15px;
            color: #dc2626;
            font-weight: 700;
            background: #fef2f2;
            border-radius: 8px;
            margin-top: 8px;
        }
        .balance-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 20px;
            padding: 25px;
            margin-top: 25px;
            border: 2px solid #fbbf24;
        }
        .balance-card .section-title {
            background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        }
        .balance-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 15px;
            background: white;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .balance-row.final {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px solid #ef4444;
            color: #dc2626;
            font-weight: 800;
            font-size: 16px;
        }
        .signatures {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            border-top: 2px solid #1e293b;
            margin-top: 50px;
            padding-top: 10px;
            font-weight: 700;
            color: #475569;
        }
        .signature-placeholder {
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 25px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            border-radius: 20px;
        }
        .footer-text {
            font-size: 20px;
            font-weight: 900;
            margin-bottom: 8px;
        }
        .footer-subtext {
            font-size: 12px;
            opacity: 0.9;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: 900;
            color: rgba(59, 130, 246, 0.03);
            pointer-events: none;
            z-index: -1;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div class="watermark">${data.companyInfo.name}</div>
    <div class="receipt-container">
        <div class="header">
            <div class="company-badge">LUX PET PLAST</div>
            <div class="company-name">${data.companyInfo.name}</div>
            <div class="doc-title">📦 YUK XATI / BALANS</div>
            <div class="company-contact">📞 ${data.companyInfo.phone} | 📍 ${data.companyInfo.address}</div>
        </div>

        <div class="content">
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-title">Hujjat ma'lumotlari</div>
                    <div class="info-row">
                        <span class="info-label">🆔 Hujjat raqami:</span>
                        <span class="info-value">#${data.receiptNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📅 Sana:</span>
                        <span class="info-value">${data.date}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">🕐 Vaqt:</span>
                        <span class="info-value">${data.time}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">👤 Kassir:</span>
                        <span class="info-value">${data.cashier}</span>
                    </div>
                </div>
                <div class="info-card customer">
                    <div class="info-title">Mijoz ma'lumotlari</div>
                    <div class="info-row">
                        <span class="info-label">👤 Ismi:</span>
                        <span class="info-value">${data.customer.name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📞 Telefon:</span>
                        <span class="info-value">${data.customer.phone || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📍 Manzil:</span>
                        <span class="info-value">${data.customer.address || '-'}</span>
                    </div>
                </div>
            </div>

            <div class="section-title">Yuk ro'yxati</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Mahsulot nomi</th>
                        <th>Miqdor</th>
                        <th>Narx</th>
                        <th>Summa</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div class="totals-card">
                <div class="section-title" style="margin-top:0;">Hisob-kitob</div>
                <div class="totals-grid">
                    <div class="total-row">
                        <span class="total-label">📊 Jami summa:</span>
                        <span class="total-value">${data.total.toLocaleString()}</span>
                    </div>
                    ${paymentsHTML}
                    <div class="total-row">
                        <span class="total-label">💵 To'langan:</span>
                        <span class="total-value" style="color:#059669;">${data.totalPaid.toLocaleString()}</span>
                    </div>
                    ${data.debt > 0 ? `
                    <div class="debt-row">
                        <span class="total-label">⚠️ Qarz:</span>
                        <span class="total-value">${data.debt.toLocaleString()}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="grand-total">
                    <span class="total-label">💰 UMUMIY QARZ:</span>
                    <span class="total-value">${data.debt.toLocaleString()}</span>
                </div>
            </div>

            ${data.customer.newBalanceUZS !== undefined || data.customer.newBalanceUSD !== undefined ? `
            <div class="balance-card">
                <div class="section-title">Mijoz balansi</div>
                ${data.customer.previousBalanceUZS !== undefined ? `
                <div class="balance-row">
                    <span style="font-weight: 900;">Oldingi so'mdagi qarz:</span>
                    <span style="font-weight: 900;">${data.customer.previousBalanceUZS.toLocaleString()}</span>
                </div>
                ` : ''}
                ${data.customer.previousBalanceUSD !== undefined ? `
                <div class="balance-row">
                    <span style="font-weight: 900;">Oldingi $ dagi qarz:</span>
                    <span style="font-weight: 900;">$${data.customer.previousBalanceUSD.toLocaleString()}</span>
                </div>
                ` : ''}
                ${data.customer.newBalanceUZS !== undefined ? `
                <div class="balance-row final">
                    <span style="font-weight: 900;">Savdodan keyingi qarz (so'm):</span>
                    <span style="font-weight: 900;">${data.customer.newBalanceUZS.toLocaleString()}</span>
                </div>
                ` : ''}
                ${data.customer.newBalanceUSD !== undefined ? `
                <div class="balance-row final">
                    <span style="font-weight: 900;">Savdodan keyingi qarz ($):</span>
                    <span style="font-weight: 900;">$${data.customer.newBalanceUSD.toLocaleString()}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-placeholder">✍️</div>
                    <div class="signature-line">Kassir imzosi</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:5px;">${data.cashier}</div>
                </div>
                <div class="signature-box">
                    <div class="signature-placeholder">✍️</div>
                    <div class="signature-line">Mijoz imzosi</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:5px;">${data.customer.name}</div>
                </div>
            </div>

            <div class="footer">
                <div class="footer-text">RAHMAT! / THANK YOU!</div>
                <div class="footer-subtext">Xaridingiz uchun tashakkur! | Thank you for your purchase!</div>
                <div style="margin-top:15px;font-size:10px;opacity:0.7;">ID: ${data.saleId} | ${data.date}</div>
            </div>
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
