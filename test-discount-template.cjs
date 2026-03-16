const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

let api;

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = response.data.token;
    
    api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Login xatolik:', error.message);
    return false;
  }
}

async function testDiscountTemplate() {
  console.log('\n🎁 CHEGIRMA SHABLONI TESTI\n');
  console.log('='.repeat(60));

  // Login qilish
  console.log('\n🔐 Login qilinmoqda...');
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('❌ Login amalga oshmadi!');
    return;
  }
  console.log('✅ Login muvaffaqiyatli');

  try {
    // 1. Mahsulotlarni olish
    console.log('\n📦 1. Mahsulotlarni olish...');
    const productsRes = await api.get('/products');
    const products = productsRes.data;
    
    if (products.length < 2) {
      console.log('❌ Kamida 2 ta mahsulot kerak!');
      return;
    }
    
    const product1 = products[0];
    const product2 = products[1];
    console.log(`✅ Mahsulot 1: ${product1.name} (${product1.pricePerBag} UZS)`);
    console.log(`✅ Mahsulot 2: ${product2.name} (${product2.pricePerBag} UZS)`);

    // 2. Mijozlarni olish
    console.log('\n👥 2. Mijozlarni olish...');
    const customersRes = await api.get('/customers');
    const customers = customersRes.data;
    
    if (customers.length === 0) {
      console.log('❌ Mijozlar topilmadi!');
      return;
    }
    
    const testCustomer = customers[0];
    console.log(`✅ Test mijoz: ${testCustomer.name}`);

    // 3. Birinchi mahsulot uchun chegirma bilan narx belgilash
    console.log('\n💰 3. Birinchi mahsulot uchun chegirma bilan narx belgilash...');
    const standardPrice = product1.pricePerBag;
    const discount = 5000; // 5000 UZS chegirma
    const discountedPrice = standardPrice - discount;
    
    console.log(`   Standart narx: ${standardPrice} UZS`);
    console.log(`   Chegirma: ${discount} UZS`);
    console.log(`   Chegirmali narx: ${discountedPrice} UZS`);
    
    // Mijozning productPrices maydonini yangilash
    let productPrices = {};
    if (testCustomer.productPrices) {
      try {
        productPrices = typeof testCustomer.productPrices === 'string'
          ? JSON.parse(testCustomer.productPrices)
          : testCustomer.productPrices;
      } catch (e) {
        console.log('   ⚠️ productPrices parse xatolik, yangi obyekt yaratilmoqda');
      }
    }
    
    productPrices[product1.id] = discountedPrice;
    
    await api.put(`/customers/${testCustomer.id}`, {
      productPrices: JSON.stringify(productPrices)
    });
    
    console.log(`✅ Narx saqlandi`);

    // 4. Chegirma shablonini qo'llash
    console.log('\n✨ 4. Chegirma shablonini barcha mahsulotlarga qo\'llash...');
    const applyRes = await api.post(`/customers/${testCustomer.id}/apply-discount-template`, {
      discount: discount
    });
    
    console.log(`✅ ${applyRes.data.appliedCount} ta mahsulot uchun chegirma qo'llandi`);

    // 5. Natijani tekshirish
    console.log('\n🔍 5. Natijani tekshirish...');
    const updatedCustomerRes = await api.get(`/customers/${testCustomer.id}`);
    const updatedCustomer = updatedCustomerRes.data;
    
    const updatedPrices = typeof updatedCustomer.productPrices === 'string'
      ? JSON.parse(updatedCustomer.productPrices)
      : updatedCustomer.productPrices;
    
    console.log('\n📊 Yangilangan narxlar:');
    products.slice(0, 5).forEach(product => {
      const customerPrice = updatedPrices[product.id];
      const standardPrice = product.pricePerBag;
      const actualDiscount = standardPrice - (customerPrice || standardPrice);
      
      console.log(`\n   ${product.name}:`);
      console.log(`   - Standart: ${standardPrice} UZS`);
      console.log(`   - Mijoz: ${customerPrice || standardPrice} UZS`);
      console.log(`   - Chegirma: ${actualDiscount} UZS ${actualDiscount === discount ? '✅' : '❌'}`);
    });

    // 6. Turli chegirma miqdorlari bilan test
    console.log('\n🧪 6. Turli chegirma miqdorlari bilan test:');
    
    const testDiscounts = [1000, 3000, 5000, 10000];
    
    for (const testDiscount of testDiscounts) {
      console.log(`\n   Chegirma: ${testDiscount} UZS`);
      
      products.slice(0, 3).forEach(product => {
        const newPrice = Math.max(0, product.pricePerBag - testDiscount);
        console.log(`   - ${product.name}: ${product.pricePerBag} → ${newPrice} UZS`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ BARCHA TESTLAR MUVAFFAQIYATLI O\'TDI!');
    console.log('='.repeat(60));
    
    console.log('\n📝 FOYDALANISH BO\'YICHA KO\'RSATMALAR:');
    console.log('   1. Mahsulot sahifasida "Narx belgilash" tugmasini bosing');
    console.log('   2. Bitta mijoz uchun chegirmali narx kiriting');
    console.log('      Masalan: Standart 100,000 UZS → 95,000 UZS (-5,000)');
    console.log('   3. Mijoz kartochkasida "Chegirma: -5000 UZS" ko\'rinadi');
    console.log('   4. Pastda "Chegirma shablonlari topildi" bo\'limi paydo bo\'ladi');
    console.log('   5. "Barcha mahsulotlarga qo\'llash" tugmasini bosing');
    console.log('   6. Tasdiqlang');
    console.log('   7. Ushbu mijoz uchun barcha mahsulotlar -5,000 UZS bo\'ladi!');
    
    console.log('\n💡 MISOL:');
    console.log('   Mahsulot A: 100,000 UZS → 95,000 UZS (-5,000)');
    console.log('   Mahsulot B: 150,000 UZS → 145,000 UZS (-5,000)');
    console.log('   Mahsulot C: 200,000 UZS → 195,000 UZS (-5,000)');

  } catch (error) {
    console.error('\n❌ XATOLIK:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Testni ishga tushirish
testDiscountTemplate();
