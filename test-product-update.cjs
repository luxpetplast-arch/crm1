const axios = require('axios');

async function testProductUpdate() {
  console.log('🔍 Mahsulotlarni o\'zgartirish testi...\n');

  try {
    // 1. Login qilib token olish
    console.log('1️⃣ Login qilish...');
    const loginResponse = await axios.post('http://localhost:5003/api/auth/cashier-login', {
      login: 'cashier',
      password: 'cashier123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // 2. Mahsulotlarni olish
    console.log('\n2️⃣ Mahsulotlarni olish...');
    const productsResponse = await axios.get('http://localhost:5003/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const products = productsResponse.data;
    console.log(`✅ ${products.length} ta mahsulot olindi`);

    // 3. Birinchi mahsulotni olish va o'zgartirish
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log(`\n3️⃣ Mahsulotni o'zgartirish: ${firstProduct.name}`);
      console.log(`   Oldin narx: ${firstProduct.pricePerBag}`);

      // Mahsulotni o'zgartirish
      const updateData = {
        name: firstProduct.name,
        pricePerBag: 99999, // Test narx
        pricePerPiece: firstProduct.pricePerPiece || 0
      };

      const updateResponse = await axios.put(
        `http://localhost:5003/api/products/${firstProduct.id}`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log('✅ Mahsulot muvaffaqiyatli o\'zgartirildi');
      console.log(`   Yangi narx: ${updateResponse.data.pricePerBag}`);

      // 4. O'zgartirishni tekshirish
      console.log('\n4️⃣ O\'zgartirishni tekshirish...');
      const verifyResponse = await axios.get('http://localhost:5003/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updatedProduct = verifyResponse.data.find(p => p.id === firstProduct.id);
      
      if (updatedProduct && updatedProduct.pricePerBag === 99999) {
        console.log('✅ O\'zgartirish tasdiqlandi - narx to\'g\'ri saqlangan');
        
        // Narxni qayta tiklash
        console.log('\n5️⃣ Narxni qayta tiklash...');
        await axios.put(
          `http://localhost:5003/api/products/${firstProduct.id}`,
          {
            name: firstProduct.name,
            pricePerBag: firstProduct.pricePerBag,
            pricePerPiece: firstProduct.pricePerPiece || 0
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Narx qayta tiklandi');
        
      } else {
        console.log('❌ O\'zgartirish saqlanmagan');
      }

    } else {
      console.log('❌ Mahsulotlar topilmadi');
    }

    console.log('\n🎉 Mahsulotlarni o\'zgartirish testi yakunlandi!');

  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testProductUpdate();
