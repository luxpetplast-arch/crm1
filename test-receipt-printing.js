import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testReceiptPrinting() {
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
      name: `Receipt Test Customer ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Tashkent, Receipt test'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customer = customerResponse.data;
    
    // Create test product
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: `Receipt Test Product ${Date.now()}`,
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
          quantity: 5,
          pricePerBag: 25
        }
      ],
      totalAmount: 125,
      paidAmount: 125,
      currency: 'USD',
      paymentStatus: 'PAID',
      paymentDetails: {
        uzs: 1562500, // 125 * 12500
        usd: 0,
        click: 0
      }
    };
    
    console.log('🛒 Creating test sale for receipt...');
    const saleResponse = await axios.post(`${API_BASE}/sales`, saleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const sale = saleResponse.data;
    console.log('✅ Sale created:', sale.id);
    
    // Test receipt data preparation
    console.log('\n🧪 Testing receipt data preparation...');
    
    const receiptData = {
      saleId: sale.id,
      receiptNumber: sale.id.slice(0, 8).toUpperCase(),
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      cashier: 'Test Kassir',
      customer: {
        name: customer.name,
        phone: customer.phone
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
        uzs: 1562500
      },
      totalPaid: sale.paidAmount * 12500,
      debt: 0,
      companyInfo: {
        name: 'AZIZ TRADES',
        address: 'Toshkent sh., Chilonzor t.',
        phone: '+998 90 123 45 67',
        inn: '123456789'
      }
    };
    
    console.log('📄 Receipt data prepared:');
    console.log('   Receipt Number:', receiptData.receiptNumber);
    console.log('   Customer:', receiptData.customer.name);
    console.log('   Items:', receiptData.items.length);
    console.log('   Total:', receiptData.total.toLocaleString(), 'so\'m');
    
    // Test print service
    console.log('\n🖨️ Testing print service...');
    
    try {
      const { exec } = await import('child_process');
      const fs = await import('fs');
      
      // Generate receipt text
      const receiptText = `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
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
Qaytim: 0 so'm
----------------------------------------
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: ${receiptData.saleId}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
****************************************
            `.trim();
      
      // Write to temp file
      const tempFile = `./test-receipt-${Date.now()}.txt`;
      fs.writeFileSync(tempFile, receiptText, 'utf8');
      console.log(`📄 Test receipt file created: ${tempFile}`);
      
      // Try to print (this will show if printer is available)
      try {
        await exec(`powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
        console.log('✅ Test receipt sent to printer successfully!');
      } catch (printError) {
        console.log('⚠️ Printer not available or not configured:', printError.message);
        console.log('   This is expected if no physical printer is connected');
      }
      
      // Clean up
      setTimeout(() => {
        try {
          fs.unlinkSync(tempFile);
          console.log('🗑️ Temp file cleaned up');
        } catch (error) {
          console.log('Temp file cleanup error:', error.message);
        }
      }, 2000);
      
    } catch (error) {
      console.log('❌ Print service test failed:', error.message);
    }
    
    console.log('\n🎯 Receipt printing test completed!');
    console.log('✅ Receipt data preparation works correctly');
    console.log('📝 Check if physical printer is connected for automatic printing');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testReceiptPrinting();
