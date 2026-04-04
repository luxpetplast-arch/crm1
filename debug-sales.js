// Sotuv yaratish xatolarini tekshirish
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
});

async function testSalesAPI() {
  let authToken = null;
  
  try {
    console.log('🔍 API test boshlanmoqda...');

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

    // 1. Mahsulotlarni olish
    console.log('\n📦 Mahsulotlar olinmoqda...');
    const productsRes = await api.get('/products');
    console.log('✅ Mahsulotlar:', productsRes.data.length, 'ta');

    // 2. Mijozlarni olish
    console.log('\n👥 Mijozlar olinmoqda...');
    const customersRes = await api.get('/customers');
    console.log('✅ Mijozlar:', customersRes.data.length, 'ta');

    // 3. 15g preform variantlarini tekshirish
    console.log('\n🃏 15g preform variantlari tekshirilmoqda...');
    const preform15g = productsRes.data.find(p => p.name.toLowerCase().includes('15g'));
    
    if (preform15g) {
      console.log('✅ 15g preform topildi:', preform15g.name);
      console.log('📋 Variantlar:', preform15g.variants?.length || 0, 'ta');
      
      if (preform15g.variants) {
        preform15g.variants.forEach(v => {
          console.log(`  🃏 ${v.cardType}: $${v.pricePerBag}/qop, ${v.currentStock} qop`);
        });
      }
    } else {
      console.log('❌ 15g preform topilmadi');
    }

    // 4. Test sotuv yaratish
    if (customersRes.data.length > 0 && productsRes.data.length > 0) {
      console.log('\n💰 Test sotuv yaratilmoqda...');
      
      const testSale = {
        customerId: customersRes.data[0].id,
        items: [{
          productId: productsRes.data[0].id,
          productName: productsRes.data[0].name,
          quantity: 1,
          pricePerBag: productsRes.data[0].pricePerBag,
          subtotal: productsRes.data[0].pricePerBag
        }],
        totalAmount: productsRes.data[0].pricePerBag,
        paidAmount: productsRes.data[0].pricePerBag,
        debtAmount: 0,
        paymentDetails: {
          uzs: '0',
          usd: productsRes.data[0].pricePerBag.toString(),
          click: '0'
        }
      };

      try {
        const saleRes = await api.post('/sales', testSale);
        console.log('✅ Test sotuv yaratildi:', saleRes.data.id);
      } catch (saleError) {
        console.log('❌ Sotuv yaratish xatoligi:', saleError.response?.data || saleError.message);
        console.log('📋 Xatolik tafsilotlari:', JSON.stringify(saleError.response?.data, null, 2));
      }
    } else {
      console.log('❌ Test uchun mahsulot yoki mijoz topilmadi');
    }

  } catch (error) {
    console.error('❌ Test xatoligi:', error.response?.data || error.message);
    console.log('📋 Xatolik tafsilotlari:', JSON.stringify(error.response?.data, null, 2));
  }
}

testSalesAPI();
