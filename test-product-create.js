// Mahsulot yaratish testi
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5003/api',
});

async function testProductCreate() {
  try {
    // Login
    console.log('🔐 Login...');
    const loginRes = await api.post('/auth/login', {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Login successful');

    // Mahsulot turlarini olish
    console.log('\n📋 Mahsulot turlari...');
    const typesRes = await api.get('/product-types');
    console.log('✅ Turlar yuklandi:', typesRes.data.length, 'ta');
    
    const preformType = typesRes.data.find(t => t.name === 'Preform');
    console.log('🎯 Preform turi:', preformType?.name, 'ID:', preformType?.id);

    // Mahsulot yaratish
    console.log('\n➕ Mahsulot yaratish...');
    const productData = {
      name: 'Test 30g Preform',
      bagType: '30G',
      unitsPerBag: 1000,
      minStockLimit: 50,
      optimalStock: 200,
      maxCapacity: 1000,
      currentStock: 100,
      pricePerBag: 35.00,
      productionCost: 20.00,
      isParent: false,
      productTypeId: preformType?.id,
      active: true
    };

    console.log('📤 Yuborilayotgan ma\'lumotlar:', JSON.stringify(productData, null, 2));

    const productRes = await api.post('/products', productData);
    console.log('✅ Mahsulot yaratildi:', productRes.data.name);
    console.log('🆔 Mahsulot ID:', productRes.data.id);
    console.log('🎯 Turi:', preformType?.name, '→ Standart kartga avtomatik qo\'shilishi kerak');

  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔑 Authentication xatolik - token noto\'g\'ri');
    }
  }
}

testProductCreate();
