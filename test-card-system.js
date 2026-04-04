// Kart tizimini test qilish
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5003/api',
});

async function testCardSystem() {
  let authToken = null;
  
  try {
    console.log('🔍 Kart tizimi test boshlanmoqda...');

    // 0. Login qilib token olish
    console.log('\n🔐 Login qilinmoqda...');
    try {
      const loginRes = await api.post('/auth/login', {
        email: 'admin@luxpetplast.uz',
        password: 'admin123'
      });
      authToken = loginRes.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ Login muvaffaqiyatli');
    } catch (loginError) {
      console.log('⚠️ Login xatoligi, test token bilan davom etilmoqda...');
      api.defaults.headers.common['Authorization'] = 'Bearer test-token';
    }

    // 1. Mahsulot turlarini olish
    console.log('\n📦 Mahsulot turlari olinmoqda...');
    const productTypesRes = await api.get('/product-types');
    console.log('✅ Mahsulot turlari:', productTypesRes.data.length, 'ta');
    productTypesRes.data.forEach(type => {
      console.log(`  📋 ${type.name}: ${type.description || 'Tavsif yo\'q'}, defaultCard: ${type.defaultCard || 'Yo\'q'}, mahsulotlar: ${type.productCount} ta`);
    });

    // 2. Kartlarni olish
    console.log('\n🃏 Kartlar olinmoqda...');
    const cardsRes = await api.get('/cards');
    console.log('✅ Kartlar:', cardsRes.data.length, 'ta');
    cardsRes.data.forEach(card => {
      console.log(`  🃏 ${card.name}: ${card.description || 'Tavsif yo\'q'}, narxi: $${card.price}, mahsulotlar: ${card.productCount} ta`);
    });

    // 3. Test mahsulot yaratish (turi bilan)
    console.log('\n➕ Test mahsulot yaratilmoqda...');
    const preformType = productTypesRes.data.find(t => t.name === 'Preform');
    
    if (preformType) {
      const testProduct = {
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
        productTypeId: preformType.id,
        active: true
      };

      try {
        const productRes = await api.post('/products', testProduct);
        console.log('✅ Test mahsulot yaratildi:', productRes.data.name);
        console.log('🎯 Mahsulot turi:', preformType.name, '→ Standart kartga avtomatik qo\'shilishi kerak');
      } catch (productError) {
        console.log('❌ Mahsulot yaratish xatoligi:', productError.response?.data || productError.message);
      }
    }

    // 4. Kart tarkibini tekshirish
    console.log('\n🔍 Standart kart tarkibi tekshirilmoqda...');
    const standartCard = cardsRes.data.find(c => c.name === 'Standart');
    
    if (standartCard) {
      try {
        const cardProductsRes = await api.get(`/cards/${standartCard.id}/products`);
        console.log('✅ Standart kartdagi mahsulotlar:', cardProductsRes.data.length, 'ta');
        cardProductsRes.data.forEach(cp => {
          console.log(`  📦 ${cp.productName}: $${cp.pricePerBag}, miqdor: ${cp.quantity}`);
        });
      } catch (error) {
        console.log('❌ Kart mahsulotlarini olish xatoligi:', error.response?.data || error.message);
      }
    }

    // 5. Yangi mahsulot turini yaratish test
    console.log('\n➕ Yangi mahsulot turi yaratilmoqda...');
    try {
      const newTypeRes = await api.post('/product-types', {
        name: 'Test Tur',
        description: 'Test uchun yangi tur',
        defaultCard: 'Standart'
      });
      console.log('✅ Yangi mahsulot turi yaratildi:', newTypeRes.data.name);
    } catch (typeError) {
      console.log('❌ Mahsulot turi yaratish xatoligi:', typeError.response?.data || typeError.message);
    }

    // 6. Yangi kart yaratish test
    console.log('\n➕ Yangi kart yaratilmoqda...');
    try {
      const newCardRes = await api.post('/cards', {
        name: 'Test Kart',
        description: 'Test uchun yangi kart',
        price: 7.50
      });
      console.log('✅ Yangi kart yaratildi:', newCardRes.data.name);
    } catch (cardError) {
      console.log('❌ Kart yaratish xatoligi:', cardError.response?.data || cardError.message);
    }

    console.log('\n🎉 Kart tizimi testi tugadi!');

  } catch (error) {
    console.error('❌ Test xatoligi:', error.response?.data || error.message);
  }
}

testCardSystem();
