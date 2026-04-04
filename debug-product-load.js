// Mahsulot yuklash xatolarini tekshirish
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5003/api',
});

async function debugProductLoad() {
  try {
    console.log('🔍 Mahsulot yuklash test boshlanmoqda...');

    // 1. Login
    console.log('\n🔐 Login...');
    const loginRes = await api.post('/auth/login', {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Login muvaffaqiyatli');

    // 2. Mahsulot turlarini tekshirish
    console.log('\n📋 Mahsulot turlari...');
    try {
      const typesRes = await api.get('/product-types');
      console.log('✅ Turlar yuklandi:', typesRes.data.length, 'ta');
      typesRes.data.forEach(type => {
        console.log(`  📋 ${type.name} (ID: ${type.id})`);
      });
    } catch (typesError) {
      console.log('❌ Turlarni olish xatoligi:', typesError.response?.data || typesError.message);
    }

    // 3. Oddiy mahsulot yaratish test
    console.log('\n➕ Oddiy mahsulot yaratish test...');
    try {
      const simpleProduct = {
        name: 'Test Simple Product',
        bagType: 'TEST',
        unitsPerBag: 100,
        minStockLimit: 10,
        optimalStock: 50,
        maxCapacity: 200,
        currentStock: 25,
        pricePerBag: 10.00,
        productionCost: 5.00,
        isParent: false,
        active: true
        // productTypeId qo'shmasdan
      };

      console.log('📤 Yuborilayotgan ma\'lumotlar:', JSON.stringify(simpleProduct, null, 2));
      const productRes = await api.post('/products', simpleProduct);
      console.log('✅ Oddiy mahsulot yaratildi:', productRes.data.name);
    } catch (simpleError) {
      console.log('❌ Oddiy mahsulot yaratish xatoligi:', simpleError.response?.data || simpleError.message);
    }

    // 4. Mahsulot tuli bilan yaratish test
    console.log('\n➕ Mahsulot tuli bilan yaratish test...');
    try {
      const typesRes = await api.get('/product-types');
      const preformType = typesRes.data.find(t => t.name === 'Preform');
      
      if (preformType) {
        const typedProduct = {
          name: 'Test Typed Product',
          bagType: 'TEST_TYPED',
          unitsPerBag: 1000,
          minStockLimit: 50,
          optimalStock: 200,
          maxCapacity: 1000,
          currentStock: 100,
          pricePerBag: 25.00,
          productionCost: 15.00,
          isParent: false,
          productTypeId: preformType.id,
          active: true
        };

        console.log('📤 Yuborilayotgan ma\'lumotlar:', JSON.stringify(typedProduct, null, 2));
        const productRes = await api.post('/products', typedProduct);
        console.log('✅ Tuli bilan mahsulot yaratildi:', productRes.data.name);
        console.log('🎯 Turi:', preformType.name, '→ Avtomatik kartga qo\'shilishi kerak');
      }
    } catch (typedError) {
      console.log('❌ Tuli bilan mahsulot yaratish xatoligi:', typedError.response?.data || typedError.message);
    }

    // 5. Mahsulotlarni olish test
    console.log('\n📦 Mahsulotlarni olish test...');
    try {
      const productsRes = await api.get('/products');
      console.log('✅ Mahsulotlar yuklandi:', productsRes.data.length, 'ta');
      console.log('📋 Birinchi 3 mahsulot:');
      productsRes.data.slice(0, 3).forEach(product => {
        console.log(`  📦 ${product.name} - $${product.pricePerBag}`);
      });
    } catch (productsError) {
      console.log('❌ Mahsulotlarni olish xatoligi:', productsError.response?.data || productsError.message);
    }

    console.log('\n🎉 Test tugadi!');

  } catch (error) {
    console.error('❌ Umumiy xatolik:', error.response?.data || error.message);
  }
}

debugProductLoad();
