import axios from 'axios';

async function testAPI() {
  try {
    // Login
    const loginResponse = await axios.post('http://localhost:5003/api/auth/login', {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token olindi:', token.substring(0, 50) + '...');
    
    // Products
    const productsResponse = await axios.get('http://localhost:5003/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📦 Mahsulotlar soni API da:', productsResponse.data.length);
    console.log('📋 Mahsulotlar:', productsResponse.data.map(p => p.name));
    
  } catch (error) {
    console.error('❌ API xatolik:', error.response?.data || error.message);
  }
}

testAPI();
