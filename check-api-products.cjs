const axios = require('axios');

async function checkApiProducts() {
  try {
    console.log('🔍 API orqali mahsulotlarni tekshirish...\n');

    const api = axios.create({
      baseURL: 'http://localhost:5003/api',
    });

    // Login qilish
    console.log('🔐 Login...');
    const loginRes = await api.post('/auth/login', {
      login: 'cashier',
      password: 'cashier123'
    });
    const token = loginRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Login successful');

    // Mahsulotlarni olish
    console.log('\n📦 Mahsulotlar olinmoqda...');
    const productsRes = await api.get('/products');
    const products = productsRes.data;

    console.log(`✅ ${products.length} ta mahsulot API orqali olindi\n`);

    // Krishkalarni tekshirish
    const krishkas = products.filter(p => p.name.includes('Krishka'));
    console.log(`=== KRISHKALAR (${krishkas.length} ta) ===`);
    krishkas.forEach(product => {
      console.log(`${product.name} | Stock: ${product.currentStock} | Price: ${product.pricePerBag}`);
    });

    // Ruchkalarni tekshirish
    const ruchkas = products.filter(p => p.name.includes('Ruchka'));
    console.log(`\n=== RUCHKALAR (${ruchkas.length} ta) ===`);
    ruchkas.forEach(product => {
      console.log(`${product.name} | Stock: ${product.currentStock} | Price: ${product.pricePerBag}`);
    });

    // Qopqoqlarni tekshirish
    const qopqoqlar = products.filter(p => p.name.includes('Qopqoq'));
    console.log(`\n=== QOPQOQLAR (${qopqoqlar.length} ta) ===`);
    qopqoqlar.slice(0, 10).forEach(product => {
      console.log(`${product.name} | Stock: ${product.currentStock} | Price: ${product.pricePerBag}`);
    });
    if (qopqoqlar.length > 10) {
      console.log(`... va yana ${qopqoqlar.length - 10} ta qopqoq`);
    }

    console.log(`\n📊 JAMI: ${products.length} ta mahsulot`);
    console.log(`- Krishkalar: ${krishkas.length}`);
    console.log(`- Ruchkalar: ${ruchkas.length}`);
    console.log(`- Qopqoqlar: ${qopqoqlar.length}`);

  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
  }
}

checkApiProducts();
