const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function testSaleStockReduction() {
  console.log('🧪 Sotuv paytida qoplar kamayishi testi boshlanmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // 1. Avval mavjud customerni olamiz yoki yaratamiz
    console.log('\n👤 Customer tekshirilmoqda...');
    
    let customerId;
    try {
      // Avval barcha customerni olish
      const customersResponse = await axios.get(
        `${API_BASE}/customers`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const customers = customersResponse.data;
      if (customers.length > 0) {
        customerId = customers[0].id;
        console.log('✅ Mavjud customer topildi:', customers[0].name);
      } else {
        // Agar customer bo'lmasa, yaratamiz
        console.log('👤 Customer yaratilmoqda...');
        const customerData = {
          name: 'Test Mijoz',
          phone: '+998901234567',
          email: 'test@example.com',
          address: 'Test manzil'
        };

        const customerResponse = await axios.post(
          `${API_BASE}/customers`,
          customerData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        customerId = customerResponse.data.id;
        console.log('✅ Customer muvaffaqiyatli yaratildi:', customerId);
      }
    } catch (error) {
      console.error('❌ Customer xatosi:', error.response?.data || error.message);
      return;
    }

    // 2. Avval mahsulotlarni tekshiramiz
    console.log('\n📦 Mahsulotlar holati:');
    const productsResponse = await axios.get(
      `${API_BASE}/products`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const products = productsResponse.data;
    if (products.length === 0) {
      console.log('❌ Mahsulotlar yo\'q! Avval mahsulot qo\'shing.');
      return;
    }

    // Birinchi mahsulotni tanlaymiz
    const testProduct = products[0];
    console.log(`📋 Test mahsulot: ${testProduct.name}`);
    console.log(`   Joriy ombor: ${testProduct.currentStock} dona`);
    console.log(`   Bir qopdagi dona: ${testProduct.unitsPerBag}`);
    console.log(`   Narxi: $${testProduct.pricePerBag}`);

    const initialStock = testProduct.currentStock;
    const unitsPerBag = testProduct.unitsPerBag;

    // 3. Sotuv yaratamiz
    console.log('\n💰 Sotuv yaratilmoqda...');
    
    const saleData = {
      customerId: customerId,
      items: [
        {
          productId: testProduct.id,
          quantity: 2, // 2 qop
          pricePerBag: testProduct.pricePerBag
        }
      ],
      paymentMethod: 'CASH',
      currency: 'USD',
      paymentDetails: JSON.stringify({
        usd: 2 * testProduct.pricePerBag,
        uzs: 0,
        click: 0
      })
    };

    const saleResponse = await axios.post(
      `${API_BASE}/sales`,
      saleData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Sotuv muvaffaqiyatli yaratildi:', saleResponse.data.id);

    // 3. Mahsulot omborini qayta tekshiramiz
    console.log('\n📊 Mahsulot ombori tekshirilmoqda...');
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 soniya kutamiz

    const updatedProductResponse = await axios.get(
      `${API_BASE}/products/${testProduct.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const updatedProduct = updatedProductResponse.data;
    const expectedStock = initialStock - 2; // 2 qop kamayishi kerak
    const expectedUnits = updatedProduct.currentUnits;

    console.log(`📈 Natijalar:`);
    console.log(`   Boshlang\'ich ombor: ${initialStock} dona`);
    console.log(`   Kutilayotgan ombor: ${expectedStock} dona`);
    console.log(`   Haqiqiy ombor: ${updatedProduct.currentStock} dona`);
    console.log(`   Jami dona: ${updatedProduct.currentUnits}`);
    console.log(`   Bir qopdagi dona: ${updatedProduct.unitsPerBag}`);

    // 4. Tekshirish
    if (updatedProduct.currentStock === expectedStock) {
      console.log('✅ ✅ ✅ Ombor to\'g\'ri kamaydi!');
    } else {
      console.log('❌ ❌ ❌ Ombor noto\'g\'ri kamaydi yoki o\'zgarmadi!');
    }

    // 5. Sotuv tarixini tekshiramiz
    console.log('\n📋 Sotuv tarixi:');
    const salesResponse = await axios.get(
      `${API_BASE}/sales?limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const sales = salesResponse.data;
    const latestSale = sales[0];
    
    if (latestSale) {
      console.log(`   Oxirgi sotuv: ${latestSale.customerName}`);
      console.log(`   Mahsulot: ${latestSale.items?.[0]?.productName || 'Noma\'lum'}`);
      console.log(`   Miqdor: ${latestSale.items?.[0]?.quantity} dona`);
      console.log(`   Summa: $${latestSale.totalAmount}`);
      console.log(`   To\'lov statusi: ${latestSale.paymentStatus}`);
    }

    // 6. Kassa holatini tekshiramiz
    console.log('\n💳 Kassa holati:');
    const cashboxResponse = await axios.get(
      `${API_BASE}/cashbox/summary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const cashbox = cashboxResponse.data;
    console.log(`   Bugun kirim: $${cashbox.todayIncome.toFixed(2)}`);
    console.log(`   Bugun chiqim: $${cashbox.todayExpense.toFixed(2)}`);
    console.log(`   Jami balans: $${cashbox.totalBalance.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    if (error.request) {
      console.error('Request data:', JSON.stringify(saleData, null, 2));
    }
  }
}

// Testni ishga tushirish
testSaleStockReduction();
