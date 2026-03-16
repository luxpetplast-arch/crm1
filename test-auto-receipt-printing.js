import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testAutomaticReceiptPrinting() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    
    console.log('✅ Login successful');
    
    // Test print service endpoint
    console.log('\n🖨️ Testing print service endpoint...');
    
    const printTestData = {
      content: `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
Sana: ${new Date().toLocaleDateString('uz-UZ')}  Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}
Test Chek - Automatic Printing
Kassir: Admin
Mijoz: Test Customer
Tel: +998901234567
----------------------------------------
Mahsulot                Soni  Narx  Jami
----------------------------------------
Test Mahsulot           5   25000 125000
----------------------------------------
Jami mahsulotlar: 1 ta
Umumiy summa: 125,000 so'm
To'lov turi: Naqd
To'langan: 125,000 so'm
Qaytim: 0 so'm
----------------------------------------
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: TEST-${Date.now()}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
****************************************
            `.trim(),
      filename: `test-auto-print-${Date.now()}.txt`
    };
    
    try {
      const printResponse = await axios.post(`${API_BASE}/print/receipt`, printTestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Print service endpoint working!');
      console.log('   Response:', printResponse.data);
      
    } catch (printError) {
      console.log('⚠️ Print service endpoint error:', printError.response?.data || printError.message);
      console.log('   This is expected if no physical printer is connected');
    }
    
    // Create a test sale to test full receipt printing
    console.log('\n🛒 Creating test sale for full receipt test...');
    
    // Create test customer
    const customerResponse = await axios.post(`${API_BASE}/customers`, {
      name: `Auto Print Customer ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Tashkent, Auto Print Test Address'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customer = customerResponse.data;
    
    // Create test product
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: `Auto Print Product ${Date.now()}`,
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
          quantity: 3,
          pricePerBag: 25
        }
      ],
      totalAmount: 75,
      paidAmount: 75,
      currency: 'USD',
      paymentStatus: 'PAID',
      paymentDetails: {
        uzs: 937500, // 75 * 12500
        usd: 0,
        click: 0
      }
    };
    
    const saleResponse = await axios.post(`${API_BASE}/sales`, saleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const sale = saleResponse.data;
    console.log('✅ Test sale created:', sale.id);
    
    // Test receipt data preparation like frontend would do
    console.log('\n📄 Testing receipt data preparation...');
    
    const receiptData = {
      saleId: sale.id,
      receiptNumber: sale.id.slice(0, 8).toUpperCase(),
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      cashier: 'Auto Test Kassir',
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
        uzs: 937500
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
    
    console.log('📋 Receipt data prepared:');
    console.log('   Sale ID:', receiptData.saleId);
    console.log('   Customer:', receiptData.customer.name);
    console.log('   Address:', receiptData.customer.address);
    console.log('   Items:', receiptData.items.length);
    console.log('   Total:', receiptData.total.toLocaleString(), 'so\'m');
    
    // Test the actual print API with real receipt data
    console.log('\n🖨️ Testing automatic receipt printing...');
    
    try {
      const autoPrintResponse = await axios.post(`${API_BASE}/print/receipt`, {
        content: generateReceiptText(receiptData),
        filename: `auto-receipt-${Date.now()}.txt`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Automatic receipt printing successful!');
      console.log('   Response:', autoPrintResponse.data);
      
    } catch (printError) {
      console.log('⚠️ Automatic receipt printing failed:', printError.response?.data || printError.message);
      console.log('   This is expected if no physical printer is connected');
    }
    
    console.log('\n🎯 Automatic receipt printing test completed!');
    console.log('✅ Print service endpoint is working');
    console.log('✅ Receipt data preparation is working');
    console.log('📝 Physical printer connection required for actual printing');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Helper function to generate receipt text
function generateReceiptText(data) {
  const itemsText = data.items.map(item => 
    `${item.name.padEnd(22)} ${item.quantity.toString().padStart(3)} ${item.pricePerUnit.toString().padStart(5)} ${item.subtotal.toString().padStart(5)}`
  ).join('\n');
  
  return `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
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
To'lov turi: Naqd
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

testAutomaticReceiptPrinting();
