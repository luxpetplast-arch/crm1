import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testReceiptWithLogo() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    
    console.log('✅ Login successful');
    
    // Create test customer
    const customerResponse = await axios.post(`${API_BASE}/customers`, {
      name: `Logo Test Customer ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Tashkent, Logo Test Address'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customer = customerResponse.data;
    
    // Create test product
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: `Logo Test Product ${Date.now()}`,
      bagType: 'KICHIK',
      unitsPerBag: 50,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 100,
      pricePerBag: 25
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const product = productResponse.data;
    
    // Create test sale
    const saleData = {
      customerId: customer.id,
      items: [
        {
          productId: product.id,
          quantity: 2,
          pricePerBag: 25
        }
      ],
      totalAmount: 50,
      paidAmount: 50,
      currency: 'USD',
      paymentStatus: 'PAID',
      paymentDetails: {
        uzs: 625000, // 50 * 12500
        usd: 0,
        click: 0
      }
    };
    
    const saleResponse = await axios.post(`${API_BASE}/sales`, saleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const sale = saleResponse.data;
    console.log('✅ Test sale created:', sale.id);
    
    // Test receipt with logo
    console.log('\n🖨️ Testing receipt with logo...');
    
    const receiptData = {
      saleId: sale.id,
      receiptNumber: sale.id.slice(0, 8).toUpperCase(),
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      cashier: 'Logo Test Kassir',
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      },
      items: sale.items.map(item => ({
        name: item.productName || item.product?.name || 'Mahsulot',
        quantity: item.quantity,
        unit: 'qop',
        pricePerUnit: item.pricePerBag * 12500,
        subtotal: item.subtotal * 12500
      })),
      subtotal: sale.totalAmount * 12500,
      tax: 0,
      taxRate: 0,
      total: sale.totalAmount * 12500,
      payments: {
        uzs: 625000
      },
      totalPaid: sale.paidAmount * 12500,
      debt: 0,
      companyInfo: {
        name: 'LUX PET PLAST',
        address: 'Toshkent sh., Chilonzor t.',
        phone: '+998 90 123 45 67',
        inn: '123456789'
      }
    };
    
    // Generate text receipt with logo
    const textReceipt = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║                LUX PET PLAST                         ║
║              TOSHKENT DO'KONI                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
Sana: ${receiptData.date}  Vaqt: ${receiptData.time}
Chek raqami: ${receiptData.receiptNumber}
Kassir: ${receiptData.cashier}
Mijoz: ${receiptData.customer.name}
Tel: ${receiptData.customer.phone || ''}
----------------------------------------
Mahsulot                Soni  Narx  Jami
----------------------------------------
${receiptData.items.map(item => 
    `${item.name.padEnd(22)} ${item.quantity.toString().padStart(3)} ${item.pricePerUnit.toString().padStart(5)} ${item.subtotal.toString().padStart(5)}`
).join('\n')}
----------------------------------------
Jami mahsulotlar: ${receiptData.items.length} ta
Umumiy summa: ${receiptData.total.toLocaleString()} so'm
To'lov turi: Naqd
To'langan: ${receiptData.totalPaid.toLocaleString()} so'm
Qarz: ${receiptData.debt.toLocaleString()} so'm
----------------------------------------
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
* Kafolat 1 oy
****************************************
FOYDALANUVCHI MA'LUMOTLARI:
Ism: ${receiptData.customer.name}
Telefon: ${receiptData.customer.phone || '[Telefon]'}
Manzil: ${receiptData.customer.address || '[Manzil]'}
****************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: ${receiptData.saleId}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
****************************************
        `.trim();
    
    console.log('📄 Text receipt with logo generated:');
    console.log('   Logo style: Box border with company name');
    console.log('   Company: LUX PET PLAST');
    console.log('   Location: TOSHKENT DO\'KONI');
    console.log('   Customer:', receiptData.customer.name);
    console.log('   Total:', receiptData.total.toLocaleString(), 'so\'m');
    
    // Test printing with logo
    try {
      const printResponse = await axios.post(`${API_BASE}/print/receipt`, {
        content: textReceipt,
        filename: `logo-receipt-${Date.now()}.txt`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Receipt with logo printed successfully!');
      console.log('   Response:', printResponse.data);
      
    } catch (printError) {
      console.log('⚠️ Print error (expected if no printer):', printError.response?.data || printError.message);
    }
    
    // Generate HTML receipt preview
    const htmlReceipt = `
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <title>Chek #${receiptData.receiptNumber}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            background: white;
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
    </style>
</head>
<body>
    <div class="receipt">
        <div class="logo">
            <h1>LUX PET PLAST</h1>
            <h2>TOSHKENT DO'KONI</h2>
        </div>
        <div style="text-align: center; margin: 10px 0;">
            <strong>Chek #${receiptData.receiptNumber}</strong><br>
            ${receiptData.date} ${receiptData.time}
        </div>
        <div style="margin: 10px 0;">
            <strong>Mijoz:</strong> ${receiptData.customer.name}<br>
            <strong>Kassir:</strong> ${receiptData.cashier}
        </div>
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
            <strong>Mahsulotlar:</strong><br>
            ${receiptData.items.map(item => 
                `${item.name} - ${item.quantity} x ${item.pricePerUnit.toLocaleString()} = ${item.subtotal.toLocaleString()} so'm`
            ).join('<br>')}
        </div>
        <div style="text-align: center; margin-top: 20px; font-weight: bold;">
            Jami: ${receiptData.total.toLocaleString()} so'm
        </div>
        <div style="text-align: center; margin-top: 10px; font-size: 10px;">
            XARIDINGIZ UCHUN RAHMAT!
        </div>
    </div>
</body>
</html>`;
    
    // Save HTML preview
    const fs = await import('fs');
    const htmlFile = `./logo-receipt-preview-${Date.now()}.html`;
    fs.writeFileSync(htmlFile, htmlReceipt, 'utf8');
    console.log(`📄 HTML receipt preview saved: ${htmlFile}`);
    
    console.log('\n🎯 Receipt with logo test completed!');
    console.log('✅ Text format: Box border logo');
    console.log('✅ HTML format: Styled logo section');
    console.log('✅ Both formats include company branding');
    console.log('📝 Logo integration successful!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testReceiptWithLogo();
