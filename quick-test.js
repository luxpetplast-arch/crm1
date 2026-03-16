import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function quickTest() {
  try {
    console.log('🧪 QUICK API TEST');
    
    // 1. Health check
    console.log('\n1. Health check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', healthResponse.data);
    
    // 2. Login
    console.log('\n2. Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // 3. Test customer creation
    console.log('\n3. Customer creation...');
    const customerResponse = await axios.post(`${API_BASE}/customers`, {
      name: 'Test Customer',
      phone: '+998901234567',
      address: 'Test Address'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Customer created:', customerResponse.data.id);
    
    // 4. Test product creation
    console.log('\n4. Product creation...');
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: 'Test Product',
      bagType: 'KICHIK',
      unitsPerBag: 50,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 100,
      pricePerBag: 25,
      productionCost: 20
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Product created:', productResponse.data.id);
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

quickTest();