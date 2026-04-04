const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testProducts() {
  try {
    console.log('🧪 Mahsulot testi...');
    
    // Login
    const login = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });
    
    const token = login.data.token;
    console.log('✅ Login');

    // Mahsulotlarni olish
    const products = await axios.get(`${API_BASE}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📦 Mahsulotlar soni: ${products.data.length}`);
    
    // Guruhlash
    const groups = {};
    products.data.forEach(product => {
      const sizeMatch = product.name.match(/(\d+)gr/i);
      const size = sizeMatch ? `${sizeMatch[1]}gr` : 'Boshqa';
      
      if (!groups[size]) groups[size] = [];
      groups[size].push(product);
    });
    
    console.log('\n📋 Guruhlar:');
    Object.keys(groups).sort().forEach(size => {
      const sizeProducts = groups[size];
      console.log(`\n📏 ${size}:`);
      sizeProducts.forEach(p => {
        console.log(`   📦 ${p.name} - ${p.bagType} - ${p.currentStock} qop`);
      });
    });
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  }
}

testProducts();
