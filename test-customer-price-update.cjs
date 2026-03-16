const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testCustomerPriceUpdate() {
  try {
    console.log('🔐 Login qilinmoqda...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login muvaffaqiyatli\n');
    
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    // 1. Mijozlarni olish
    console.log('📥 Mijozlar yuklanmoqda...');
    const customersRes = await axios.get(`${API_URL}/customers`, config);
    const customers = customersRes.data;
    console.log(`✅ ${customers.length} ta mijoz topildi\n`);
    
    if (customers.length === 0) {
      console.log('❌ Mijozlar yo\'q!');
      return;
    }
    
    // 2. Birinchi mijozni olish
    const testCustomer = customers[0];
    console.log('🧪 Test mijoz:', testCustomer.name);
    console.log('📝 Hozirgi productPrices:', testCustomer.productPrices || 'null');
    
    // 3. Mahsulotlarni olish
    console.log('\n📦 Mahsulotlar yuklanmoqda...');
    const productsRes = await axios.get(`${API_URL}/products`, config);
    const products = productsRes.data;
    
    if (products.length === 0) {
      console.log('❌ Mahsulotlar yo\'q!');
      return;
    }
    
    const testProduct = products[0];
    console.log(`✅ Test mahsulot: ${testProduct.name} (ID: ${testProduct.id})`);
    
    // 4. Mavjud narxlarni olish
    let existingPrices = {};
    if (testCustomer.productPrices) {
      try {
        existingPrices = JSON.parse(testCustomer.productPrices);
        console.log('📊 Mavjud narxlar:', existingPrices);
      } catch (e) {
        console.log('⚠️ Mavjud narxlarni parse qilishda xatolik');
      }
    }
    
    // 5. Yangi narxni qo'shish
    const newPrices = {
      ...existingPrices,
      [testProduct.id]: 50000
    };
    
    const newPricesJson = JSON.stringify(newPrices);
    console.log('\n💰 Yangi narxlar JSON:', newPricesJson);
    console.log('💰 JSON uzunligi:', newPricesJson.length);
    console.log('💰 JSON type:', typeof newPricesJson);
    
    // 6. Mijozni yangilash
    console.log('\n💾 Mijoz yangilanmoqda...');
    const updateRes = await axios.put(
      `${API_URL}/customers/${testCustomer.id}`,
      { productPrices: newPricesJson },
      config
    );
    
    console.log('✅ Mijoz muvaffaqiyatli yangilandi!');
    console.log('📊 Yangilangan ma\'lumot:', {
      id: updateRes.data.id,
      name: updateRes.data.name,
      productPrices: updateRes.data.productPrices
    });
    
    // 7. Tekshirish - qayta o'qish
    console.log('\n🔍 Tekshirish uchun qayta o\'qilmoqda...');
    const verifyRes = await axios.get(`${API_URL}/customers/${testCustomer.id}`, config);
    console.log('📊 Saqlangan productPrices:', verifyRes.data.productPrices);
    
    if (verifyRes.data.productPrices) {
      const parsed = JSON.parse(verifyRes.data.productPrices);
      console.log('✅ Parse qilingan:', parsed);
      console.log(`✅ ${testProduct.name} uchun narx:`, parsed[testProduct.id]);
    }
    
    console.log('\n✅ TEST MUVAFFAQIYATLI!');
    
  } catch (error) {
    console.error('\n❌ XATOLIK:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
      console.error('📊 Details:', error.response.data?.details);
      console.error('📊 Code:', error.response.data?.code);
      console.error('📊 Meta:', error.response.data?.meta);
    }
  }
}

testCustomerPriceUpdate();
