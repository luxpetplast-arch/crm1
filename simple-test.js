// Oddiy test
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5003/api',
});

async function simpleTest() {
  try {
    // Login
    console.log('🔐 Login...');
    const loginRes = await api.post('/auth/login', {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });
    api.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.token}`;
    console.log('✅ Login successful');

    // Test mahsulot yaratish
    console.log('\n➕ Mahsulot yaratish test...');
    
    // Avval mahsulot turini olish
    const typesRes = await api.get('/product-types');
    console.log('📋 Product types loaded:', typesRes.data.length);
    
    const preformType = typesRes.data.find(t => t.name === 'Preform');
    if (preformType) {
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
        productTypeId: preformType.id,
        active: true
      };

      const productRes = await api.post('/products', productData);
      console.log('✅ Product created:', productRes.data.name);
      console.log('🎯 Type:', preformType.name, '→ Should auto-add to Standart card');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

simpleTest();
