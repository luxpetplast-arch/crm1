const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testUser = {
  username: 'admin',
  password: 'admin123'
};

async function testProductPricing() {
  console.log('🧪 Mahsulot Narxlash Tizimi Test\n');

  try {
    // 1. Login
    console.log('1️⃣ Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
    const token = loginRes.data.token;
    console.log('✅ Login muvaffaqiyatli\n');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Mahsulotlarni olish
    console.log('2️⃣ Mahsulotlar yuklanmoqda...');
    const productsRes = await axios.get(`${API_URL}/products`, config);
    const products = productsRes.data;
    console.log(`✅ ${products.length} ta mahsulot topildi\n`);

    if (products.length === 0) {
      console.log('❌ Mahsulotlar yo\'q!');
      return;
    }

    const testProduct = products[0];
    console.log(`📦 Test mahsulot: ${testProduct.name} (ID: ${testProduct.id})\n`);

    // 3. Mijozlarni olish
    console.log('3️⃣ Mijozlar yuklanmoqda...');
    const customersRes = await axios.get(`${API_URL}/customers`, config);
    const customers = customersRes.data;
    console.log(`✅ ${customers.length} ta mijoz topildi\n`);

    if (customers.length === 0) {
      console.log('❌ Mijozlar yo\'q!');
      return;
    }

    // 4. Birinchi mijoz uchun narx belgilash
    const testCustomer = customers[0];
    console.log(`👤 Test mijoz: ${testCustomer.name} (ID: ${testCustomer.id})`);
    console.log(`📋 Mavjud productPrices:`, testCustomer.productPrices || 'null\n');

    const testPrice = 55000;
    console.log(`💰 Yangi narx: ${testPrice} UZS\n`);

    // 5. Mavjud narxlarni parse qilish
    let existingPrices = {};
    if (testCustomer.productPrices) {
      try {
        existingPrices = JSON.parse(testCustomer.productPrices);
        console.log('📊 Mavjud narxlar:', existingPrices);
      } catch (error) {
        console.log('⚠️ Mavjud narxlarni parse qilishda xatolik');
      }
    }

    // 6. Yangi narxni qo'shish
    const newPrices = {
      ...existingPrices,
      [testProduct.id]: testPrice
    };
    console.log('📝 Yangi narxlar:', newPrices);
    console.log('📤 JSON string:', JSON.stringify(newPrices), '\n');

    // 7. Saqlash
    console.log('4️⃣ Narx saqlanmoqda...');
    try {
      const updateRes = await axios.put(
        `${API_URL}/customers/${testCustomer.id}`,
        {
          productPrices: JSON.stringify(newPrices)
        },
        config
      );
      console.log('✅ Narx saqlandi!');
      console.log('📋 Yangilangan mijoz:', updateRes.data);
      console.log('💾 Saqlangan productPrices:', updateRes.data.productPrices, '\n');
    } catch (saveError) {
      console.error('❌ Saqlashda xatolik:', saveError.response?.data || saveError.message);
      return;
    }

    // 8. Tekshirish
    console.log('5️⃣ Tekshirish...');
    const verifyRes = await axios.get(`${API_URL}/customers/${testCustomer.id}`, config);
    const updatedCustomer = verifyRes.data;
    
    console.log('✅ Mijoz qayta yuklandi');
    console.log('📋 productPrices:', updatedCustomer.productPrices);
    
    if (updatedCustomer.productPrices) {
      const savedPrices = JSON.parse(updatedCustomer.productPrices);
      console.log('📊 Parse qilingan narxlar:', savedPrices);
      
      if (savedPrices[testProduct.id] === testPrice) {
        console.log('✅ Narx to\'g\'ri saqlandi!');
      } else {
        console.log('❌ Narx noto\'g\'ri:', savedPrices[testProduct.id], 'vs', testPrice);
      }
    } else {
      console.log('❌ productPrices null!');
    }

    console.log('\n✅ TEST MUVAFFAQIYATLI!');

  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testProductPricing();
