const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

let api;

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = response.data.token;
    
    api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Login xatolik:', error.message);
    return false;
  }
}

const products = [
  // 15 gramm (1 qop = 20,000 dona)
  { name: 'Kapsula 15 gr прозра', unitsPerBag: 20000, weight: 15 },
  { name: 'Kapsula 15 gr гидро', unitsPerBag: 20000, weight: 15 },
  { name: 'Kapsula 15 gr сайхун', unitsPerBag: 20000, weight: 15 },
  { name: 'Kapsula 15 gr sprite', unitsPerBag: 20000, weight: 15 },
  { name: 'Kapsula 15 gr қизил', unitsPerBag: 20000, weight: 15 },
  { name: 'Kapsula 15 gr корк', unitsPerBag: 20000, weight: 15 },
  
  // 21 gramm (1 qop = 15,000 dona)
  { name: 'Kapsula 21 gr прозра', unitsPerBag: 15000, weight: 21 },
  { name: 'Kapsula 21 gr гидро', unitsPerBag: 15000, weight: 21 },
  { name: 'Kapsula 21 gr Отчиз', unitsPerBag: 15000, weight: 21 },
  { name: 'Kapsula 21 gr сайхун', unitsPerBag: 15000, weight: 21 },
  { name: 'Kapsula 21 gr sprite', unitsPerBag: 15000, weight: 21 },
  { name: 'Kapsula 21 gr ёк', unitsPerBag: 15000, weight: 21 },
  { name: 'Kapsula 21 gr ok', unitsPerBag: 15000, weight: 21 },
  
  // 26 gramm
  { name: 'Kapsula 26 gr ёк', unitsPerBag: 12000, weight: 26 },
  { name: 'Kapsula 26 gr ёг', unitsPerBag: 10000, weight: 26 },
  
  // 30 gramm (1 qop = 10,000 dona)
  { name: 'Kapsula 30 gr прозра', unitsPerBag: 10000, weight: 30 },
  { name: 'Kapsula 30 gr гидро', unitsPerBag: 10000, weight: 30 },
  { name: 'Kapsula 30 gr Отчиз', unitsPerBag: 10000, weight: 30 },
  { name: 'Kapsula 30 gr sprite', unitsPerBag: 10000, weight: 30 },
  { name: 'Kapsula 30 gr сайхун', unitsPerBag: 10000, weight: 30 },
  
  // 36 gramm
  { name: 'Kapsula 36 gr ёк', unitsPerBag: 10000, weight: 36 },
  
  // 52 gramm (1 qop = 6,000 dona)
  { name: 'Kapsula 52 gr прозра', unitsPerBag: 6000, weight: 52 },
  { name: 'Kapsula 52 gr ok', unitsPerBag: 6000, weight: 52 },
  
  // 70 gramm (1 qop = 4,500 dona)
  { name: 'Kapsula 70 gr прозра', unitsPerBag: 4500, weight: 70 },
  { name: 'Kapsula 70 gr гидро', unitsPerBag: 4500, weight: 70 },
  { name: 'Kapsula 70 gr сайхун', unitsPerBag: 4500, weight: 70 },
  { name: 'Kapsula 70 gr синий', unitsPerBag: 4500, weight: 70 },
  
  // 75 gramm
  { name: 'Kapsula 75 gr прозра', unitsPerBag: 4000, weight: 75 },
  { name: 'Kapsula 75 gr сайхун', unitsPerBag: 4000, weight: 75 },
  { name: 'Kapsula 75 gr гидро (4000)', unitsPerBag: 4000, weight: 75 },
  { name: 'Kapsula 75 gr гидро (3000)', unitsPerBag: 3000, weight: 75 },
  { name: 'Kapsula 75 gr синий (4000)', unitsPerBag: 4000, weight: 75 },
  { name: 'Kapsula 75 gr синий (3000)', unitsPerBag: 3000, weight: 75 },
  
  // 80 gramm
  { name: 'Kapsula 80 gr прозра (4000)', unitsPerBag: 4000, weight: 80 },
  { name: 'Kapsula 80 gr прозра (3000)', unitsPerBag: 3000, weight: 80 },
  { name: 'Kapsula 80 gr гидро (4000)', unitsPerBag: 4000, weight: 80 },
  { name: 'Kapsula 80 gr гидро (3000)', unitsPerBag: 3000, weight: 80 },
  { name: 'Kapsula 80 gr сайхун (4000)', unitsPerBag: 4000, weight: 80 },
  { name: 'Kapsula 80 gr сайхун (3000)', unitsPerBag: 3000, weight: 80 },
  { name: 'Kapsula 80 gr синий (4000)', unitsPerBag: 4000, weight: 80 },
  { name: 'Kapsula 80 gr синий (3000)', unitsPerBag: 3000, weight: 80 },
  
  // 85 gramm
  { name: 'Kapsula 85 gr прозра (3000)', unitsPerBag: 3000, weight: 85 },
  { name: 'Kapsula 85 gr прозра (4000)', unitsPerBag: 4000, weight: 85 },
  
  // 86 gramm
  { name: 'Kapsula 86 gr прозра (3000)', unitsPerBag: 3000, weight: 86 },
  { name: 'Kapsula 86 gr прозра (4000)', unitsPerBag: 4000, weight: 86 },
  
  // 135 gramm
  { name: 'Kapsula 135 gr прозра (2500)', unitsPerBag: 2500, weight: 135 },
  { name: 'Kapsula 135 gr прозра (2000)', unitsPerBag: 2000, weight: 135 },
  { name: 'Kapsula 135 gr гидро (2500)', unitsPerBag: 2500, weight: 135 },
  { name: 'Kapsula 135 gr гидро (2000)', unitsPerBag: 2000, weight: 135 },
  { name: 'Kapsula 135 gr сайхун (2500)', unitsPerBag: 2500, weight: 135 },
  { name: 'Kapsula 135 gr сайхун (2000)', unitsPerBag: 2000, weight: 135 },
  { name: 'Kapsula 135 gr синий (2500)', unitsPerBag: 2500, weight: 135 },
  { name: 'Kapsula 135 gr синий (2000)', unitsPerBag: 2000, weight: 135 },
  
  // 250 gramm
  { name: 'Kapsula 250 gr nestle', unitsPerBag: 2000, weight: 250 },
  { name: 'Kapsula 250 gr синий', unitsPerBag: 2000, weight: 250 },
];

async function addProducts() {
  console.log('\n📦 KAPSULA MAHSULOTLARINI QO\'SHISH\n');
  console.log('='.repeat(60));

  // Login
  console.log('\n🔐 Login qilinmoqda...');
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('❌ Login amalga oshmadi!');
    return;
  }
  console.log('✅ Login muvaffaqiyatli');

  console.log(`\n📋 Jami ${products.length} ta mahsulot qo'shiladi\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      const productData = {
        name: product.name,
        unitsPerBag: product.unitsPerBag,
        pricePerBag: 0, // Narx keyinroq belgilanadi
        stock: 0,
        minStock: 10,
        description: `${product.weight} gramm kapsula, 1 qopda ${product.unitsPerBag.toLocaleString()} dona`
      };

      await api.post('/products', productData);
      successCount++;
      console.log(`✅ ${i + 1}/${products.length} - ${product.name} (${product.unitsPerBag.toLocaleString()} dona/qop)`);
    } catch (error) {
      errorCount++;
      console.error(`❌ ${i + 1}/${products.length} - ${product.name}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 NATIJA:');
  console.log(`   ✅ Muvaffaqiyatli: ${successCount} ta`);
  console.log(`   ❌ Xatolik: ${errorCount} ta`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n💡 KEYINGI QADAMLAR:');
    console.log('   1. Mahsulotlar sahifasiga o\'ting');
    console.log('   2. Har bir mahsulot uchun narx belgilang');
    console.log('   3. Ombor miqdorini kiriting');
    console.log('   4. Minimal zaxira miqdorini sozlang');
  }

  // Mahsulotlar bo'yicha statistika
  console.log('\n📈 MAHSULOTLAR STATISTIKASI:');
  
  const byWeight = {};
  products.forEach(p => {
    if (!byWeight[p.weight]) {
      byWeight[p.weight] = 0;
    }
    byWeight[p.weight]++;
  });

  Object.keys(byWeight).sort((a, b) => parseInt(a) - parseInt(b)).forEach(weight => {
    console.log(`   ${weight} gr: ${byWeight[weight]} ta mahsulot`);
  });
}

// Scriptni ishga tushirish
addProducts();
