const axios = require('axios');

async function testSalesPriceUpdate() {
  console.log('🔍 Sotuv paytida narx yangilanishi testi...\n');

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

    // 3. Birinchi mahsulotni olish va narxini o'zgartirish
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log(`\n3️⃣ Mahsulotni o'zgartirish: ${firstProduct.name}`);
      console.log(`   Oldin narx: $${firstProduct.pricePerBag}`);

      // Test narxini o'rnatish
      const testPrice = 77777;
      const updateData = {
        name: firstProduct.name,
        pricePerBag: testPrice,
        pricePerPiece: firstProduct.pricePerPiece || 0
      };

      const updateResponse = await axios.put(
        `http://localhost:5003/api/products/${firstProduct.id}`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log('✅ Mahsulot narxi o\'zgartirildi');
      console.log(`   Yangi narx: $${updateResponse.data.pricePerBag}`);

      // 4. Mahsulotlarni qayta olish (sotuv sahifasi kabi)
      console.log('\n4️⃣ Sotuv sahifasi kabi mahsulotlarni qayta olish...');
      const salesProductsResponse = await axios.get('http://localhost:5003/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const salesProducts = salesProductsResponse.data;
      const updatedProduct = salesProducts.find(p => p.id === firstProduct.id);
      
      if (updatedProduct) {
        console.log(`✅ Sotuv sahifasida yangi narx ko\'rildi: $${updatedProduct.pricePerBag}`);
        
        if (updatedProduct.pricePerBag === testPrice) {
          console.log('✅ Narx to\'g\'ri yangilandi!');
        } else {
          console.log('❌ Narx yangilanmadi!');
        }
      } else {
        console.log('❌ Mahsulot topilmadi!');
      }

      // 5. Individual mahsulotni olish test
      console.log('\n5️⃣ Individual mahsulotni olish test...');
      const individualProductResponse = await axios.get(`http://localhost:5003/api/products/${firstProduct.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`✅ Individual mahsulot narxi: $${individualProductResponse.data.pricePerBag}`);
      
      if (individualProductResponse.data.pricePerBag === testPrice) {
        console.log('✅ Individual mahsulot narxi to\'g\'ri!');
      } else {
        console.log('❌ Individual mahsulot narxi noto\'g\'ri!');
      }

      // 6. Narxni qayta tiklash
      console.log('\n6️⃣ Narxni qayta tiklash...');
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
      console.log('❌ Mahsulotlar topilmadi');
    }

    console.log('\n🎉 Sotuv narxini yangilash testi yakunlandi!');

  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSalesPriceUpdate();
