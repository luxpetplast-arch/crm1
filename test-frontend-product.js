// Frontend mahsulot qo'shish testi
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5003/api',
});

async function testFrontendProductAdd() {
  try {
    console.log('🌐 Frontend mahsulot qo\'shish test boshlanmoqda...');

    // 1. Login
    console.log('\n🔐 Login...');
    const loginRes = await api.post('/auth/login', {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Login muvaffaqiyatli');

    // 2. Mahsulot turlarini olish (frontend kabi)
    console.log('\n📋 Mahsulot turlari (frontend)...');
    const typesRes = await api.get('/product-types');
    console.log('✅ Turlar yuklandi:', typesRes.data.length, 'ta');
    
    const preformType = typesRes.data.find(t => t.name === 'Preform');
    console.log('🎯 Tanlangan tur:', preformType?.name);

    // 3. Frontend kabi mahsulot yaratish
    console.log('\n➕ Frontend mahsulot yaratish...');
    const frontendProduct = {
      name: 'Frontend Test 15g Preform',
      bagType: '15G_FRONTEND',
      unitsPerBag: 1000,
      minStockLimit: 50,
      optimalStock: 200,
      maxCapacity: 1000,
      currentStock: 100,
      pricePerBag: 26.50,
      productionCost: 18.00,
      isParent: false,
      productTypeId: preformType?.id || null,
      active: true
    };

    console.log('📤 Frontend ma\'lumotlar:', JSON.stringify(frontendProduct, null, 2));

    try {
      const productRes = await api.post('/products', frontendProduct);
      console.log('✅ Frontend mahsulot yaratildi:', productRes.data.name);
      console.log('🆔 Mahsulot ID:', productRes.data.id);
      console.log('🎯 Turi:', preformType?.name, '→ Avtomatik kartga qo\'shilishi kerak');
    } catch (productError) {
      console.log('❌ Frontend mahsulot yaratish xatoligi:');
      console.log('📋 Xatolik tafsilotlari:', JSON.stringify(productError.response?.data, null, 2));
    }

    // 4. Oddiy mahsulot (turi bilan)
    console.log('\n➕ Oddiy mahsulot (turi bilan)...');
    const simpleProduct = {
      name: 'Simple Test Product',
      bagType: 'SIMPLE_TEST',
      unitsPerBag: 500,
      minStockLimit: 25,
      optimalStock: 100,
      maxCapacity: 500,
      currentStock: 50,
      pricePerBag: 15.00,
      productionCost: 10.00,
      isParent: false,
      productTypeId: preformType?.id || null,
      active: true
    };

    try {
      const simpleRes = await api.post('/products', simpleProduct);
      console.log('✅ Oddiy mahsulot yaratildi:', simpleRes.data.name);
    } catch (simpleError) {
      console.log('❌ Oddiy mahsulot xatoligi:');
      console.log('📋 Xatolik tafsilotlari:', JSON.stringify(simpleError.response?.data, null, 2));
    }

    // 5. Mahsulotlarni tekshirish
    console.log('\n📦 Yangi mahsulotlar...');
    const productsRes = await api.get('/products');
    const newProducts = productsRes.data.filter(p => 
      p.name.includes('Frontend Test') || p.name.includes('Simple Test')
    );
    
    console.log('✅ Yangi mahsulotlar soni:', newProducts.length);
    newProducts.forEach(product => {
      console.log(`  📦 ${product.name} - $${product.pricePerBag}`);
    });

    console.log('\n🎉 Frontend test tugadi!');

  } catch (error) {
    console.error('❌ Umumiy xatolik:', error.response?.data || error.message);
  }
}

testFrontendProductAdd();
