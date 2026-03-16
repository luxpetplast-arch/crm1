import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function createTestSaleAndPrintReceipt() {
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
      name: 'Test Mijoz',
      phone: '+9989012345678',
      address: 'Toshkent, Test manzil'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customer = customerResponse.data;
    
    // Create test product
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: 'Test Mahsulot',
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
    
    // Generate and print receipt
    const receiptText = `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║                LUX PET PLAST                         ║
║              TOSHKENT DO'KONI                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
Sana: ${new Date().toLocaleDateString('uz-UZ')}  Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}
Chek raqami: ${sale.id.slice(0, 8).toUpperCase()}
Kassir: Admin
Mijoz: ${customer.name}
Tel: ${customer.phone}
----------------------------------------
Mahsulot                Soni  Narx  Jami
----------------------------------------
${product.name.padEnd(22)} 3   312500 937500
----------------------------------------
Jami mahsulotlar: 1 ta
Umumiy summa: 937,500 so'm
To'lov turi: Naqd
To'langan: 937,500 so'm
Qaytim: 0 so'm
----------------------------------------
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
* Kafolat 1 oy
****************************************
FOYDALANUVCHI MA'LUMOTLARI:
Ism: ${customer.name}
Telefon: ${customer.phone}
Manzil: ${customer.address}
****************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: ${sale.id}
Vaqt: ${new Date().toLocaleString('uz-UZ')}
****************************************
    `.trim();
    
    console.log('\n🖨️ TEST CHEK CHIQARILMOQDA...');
    console.log('📄 Chek mazmuni:');
    console.log('─'.repeat(55));
    console.log(receiptText);
    console.log('─'.repeat(55));
    
    // Save to file
    const fs = await import('fs');
    const receiptFile = `./test-chek-${Date.now()}.txt`;
    fs.writeFileSync(receiptFile, receiptText, 'utf8');
    console.log(`\n📁 Chek saqlandi: ${receiptFile}`);
    
    // Try to print using print API
    try {
      const printResponse = await axios.post(`${API_BASE}/print/receipt`, {
        content: receiptText,
        filename: `test-receipt-${Date.now()}.txt`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Chek printerga yuborildi!');
      console.log('   Response:', printResponse.data);
      
    } catch (printError) {
      console.log('⚠️ Printer ulanmagan (bu normal, agar printer ulanmagan boʻlsa)');
      console.log('📝 Lekin chek muvaffaqiyatli yaratildi va saqlandi');
    }
    
    console.log('\n🎯 TEST CHEK MUVAFFAQIYATLI YARATILDI!');
    console.log('✅ Sotuv yaratildi');
    console.log('✅ Chek formatlandi');
    console.log('✅ Logo qo\'shildi');
    console.log('✅ Faylga saqlandi');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
  }
}

createTestSaleAndPrintReceipt();
