const axios = require('axios');

async function testVariantsAPI() {
  try {
    console.log('🔍 API test qilinmoqda...');
    
    // Login qilish
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');
    
    // Mahsulotlarni olish
    const productsResponse = await axios.get('http://localhost:5001/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const products = productsResponse.data;
    console.log(`📦 Mahsulotlar: ${products.length} ta`);
    
    // Parent mahsulotlar va variantlarni ko'rsatish
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   📊 IsParent: ${product.isParent}`);
      if (product.variants && product.variants.length > 0) {
        console.log(`   🎨 Variantlar: ${product.variants.length} ta`);
        product.variants.forEach((variant, vIndex) => {
          console.log(`     ${vIndex + 1}. ${variant.variantName} - ${variant.currentStock} dona - ${variant.pricePerBag} so'm`);
        });
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ API xatolik:', error.response?.data || error.message);
  }
}

testVariantsAPI();
