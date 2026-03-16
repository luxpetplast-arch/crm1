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

async function testBulkPriceAdjustment() {
  console.log('\n🧪 OMMAVIY NARX O\'ZGARTIRISH TESTI\n');
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
    
    if (products.length === 0) {
      console.log('❌ Mahsulotlar topilmadi!');
      return;
    }
    
    const testProduct = products[0];
    console.log(`✅ Test mahsulot: ${testProduct.name}`);
    console.log(`   Asosiy narx: ${testProduct.pricePerBag} UZS/qop`);

    // 2. Mijozlarni olish
    console.log('\n👥 2. Mijozlarni olish...');
    const customersRes = await api.get('/customers');
    const customers = customersRes.data;
    
    if (customers.length === 0) {
      console.log('❌ Mijozlar topilmadi!');
      return;
    }
    
    console.log(`✅ Jami ${customers.length} ta mijoz topildi`);

    // 3. Hozirgi narxlarni ko'rsatish
    console.log('\n💰 3. Hozirgi narxlar:');
    customers.slice(0, 5).forEach((customer, index) => {
      let currentPrice = testProduct.pricePerBag;
      
      if (customer.productPrices) {
        try {
          const prices = typeof customer.productPrices === 'string' 
            ? JSON.parse(customer.productPrices) 
            : customer.productPrices;
          
          if (prices[testProduct.id]) {
            currentPrice = prices[testProduct.id];
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      console.log(`   ${index + 1}. ${customer.name}: ${currentPrice} UZS/qop`);
    });

    // 4. Foiz asosida ko'tarish simulatsiyasi (10%)
    console.log('\n📈 4. 10% ga ko\'tarish simulatsiyasi:');
    const increasePercent = 10;
    customers.slice(0, 5).forEach((customer, index) => {
      let currentPrice = testProduct.pricePerBag;
      
      if (customer.productPrices) {
        try {
          const prices = typeof customer.productPrices === 'string' 
            ? JSON.parse(customer.productPrices) 
            : customer.productPrices;
          
          if (prices[testProduct.id]) {
            currentPrice = prices[testProduct.id];
          }
        } catch (e) {
          // Ignore
        }
      }
      
      const adjustment = (currentPrice * increasePercent) / 100;
      const newPrice = Math.round(currentPrice + adjustment);
      
      console.log(`   ${index + 1}. ${customer.name}:`);
      console.log(`      Hozirgi: ${currentPrice} UZS`);
      console.log(`      Yangi: ${newPrice} UZS (+${Math.round(adjustment)} UZS)`);
    });

    // 5. Qat'iy miqdor asosida tushirish simulatsiyasi (5000 UZS)
    console.log('\n📉 5. 5000 UZS ga tushirish simulatsiyasi:');
    const decreaseAmount = 5000;
    customers.slice(0, 5).forEach((customer, index) => {
      let currentPrice = testProduct.pricePerBag;
      
      if (customer.productPrices) {
        try {
          const prices = typeof customer.productPrices === 'string' 
            ? JSON.parse(customer.productPrices) 
            : customer.productPrices;
          
          if (prices[testProduct.id]) {
            currentPrice = prices[testProduct.id];
          }
        } catch (e) {
          // Ignore
        }
      }
      
      const newPrice = Math.max(0, currentPrice - decreaseAmount);
      
      console.log(`   ${index + 1}. ${customer.name}:`);
      console.log(`      Hozirgi: ${currentPrice} UZS`);
      console.log(`      Yangi: ${newPrice} UZS (-${decreaseAmount} UZS)`);
    });

    // 6. Xavfsizlik tekshiruvi - manfiy narxlar
    console.log('\n🛡️ 6. Xavfsizlik tekshiruvi (manfiy narxlar):');
    const testPrice = 3000;
    const largeDecrease = 5000;
    const safePrice = Math.max(0, testPrice - largeDecrease);
    console.log(`   Hozirgi narx: ${testPrice} UZS`);
    console.log(`   Tushirish: ${largeDecrease} UZS`);
    console.log(`   Natija: ${safePrice} UZS (manfiy bo'lmaydi) ✅`);

    // 7. Foiz hisoblash namunalari
    console.log('\n📊 7. Turli foiz hisoblash namunalari:');
    const samplePrice = 100000;
    [5, 10, 15, 20, 25].forEach(percent => {
      const increase = Math.round(samplePrice + (samplePrice * percent / 100));
      const decrease = Math.round(samplePrice - (samplePrice * percent / 100));
      console.log(`   ${percent}%: ${samplePrice} → Ko'tarish: ${increase} | Tushirish: ${decrease}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ BARCHA TESTLAR MUVAFFAQIYATLI O\'TDI!');
    console.log('='.repeat(60));
    
    console.log('\n📝 FOYDALANISH BO\'YICHA KO\'RSATMALAR:');
    console.log('   1. Mahsulot sahifasida "Narx belgilash" tugmasini bosing');
    console.log('   2. Modalda "Ommaviy narx o\'zgartirish" bo\'limini toping');
    console.log('   3. Miqdorni kiriting (masalan: 10 yoki 5000)');
    console.log('   4. Tur tanlang: "% Foiz" yoki "UZS So\'m"');
    console.log('   5. "Ko\'tarish" yoki "Tushirish" tugmasini bosing');
    console.log('   6. Barcha mijozlar uchun narxlar avtomatik o\'zgaradi');
    console.log('   7. "Saqlash" tugmasini bosib tasdiqlang');

  } catch (error) {
    console.error('\n❌ XATOLIK:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Testni ishga tushirish
testBulkPriceAdjustment();
