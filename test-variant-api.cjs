const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Login qilish
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Login xatosi:', error.response?.data || error.message);
    throw error;
  }
}

// Test variant API
async function testVariantAPI() {
  console.log('\n🧪 VARIANT API TEST\n');
  
  try {
    // Login
    console.log('1️⃣ Login...');
    const token = await login();
    console.log('✅ Login successful\n');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Get all products with variants
    console.log('2️⃣ Getting products with variants...');
    const productsRes = await axios.get(`${API_URL}/products?includeVariants=true`, { headers });
    const products = productsRes.data;
    
    console.log(`✅ Found ${products.length} products`);
    
    // Find parent product
    const parentProduct = products.find(p => p.isParent && p.variants && p.variants.length > 0);
    
    if (parentProduct) {
      console.log(`\n📦 Parent Product: ${parentProduct.name}`);
      console.log(`   Total Stock: ${parentProduct.totalStock} qop`);
      console.log(`   Variants: ${parentProduct.variants.length}`);
      
      parentProduct.variants.forEach(v => {
        console.log(`   └─ ${v.variantName}: ${v.currentStock} qop, ${v.pricePerBag} so'm/qop`);
      });
      
      // Test variant detail
      if (parentProduct.variants.length > 0) {
        const variant = parentProduct.variants[0];
        console.log(`\n3️⃣ Getting variant details: ${variant.variantName}...`);
        
        const variantRes = await axios.get(`${API_URL}/variants/${variant.id}`, { headers });
        const variantDetail = variantRes.data;
        
        console.log('✅ Variant details:');
        console.log(`   ID: ${variantDetail.id}`);
        console.log(`   Name: ${variantDetail.variantName}`);
        console.log(`   Stock: ${variantDetail.currentStock} qop`);
        console.log(`   Price: ${variantDetail.pricePerBag} so'm`);
        console.log(`   Stock Movements: ${variantDetail.stockMovements?.length || 0}`);
        console.log(`   Sales Stats: ${variantDetail.salesStats?.totalSold || 0} qop sotilgan`);
        
        // Test stock adjustment
        console.log(`\n4️⃣ Testing stock adjustment...`);
        const stockRes = await axios.post(
          `${API_URL}/variants/${variant.id}/stock`,
          {
            type: 'ADD',
            quantity: 5,
            reason: 'Test qo\'shish',
            notes: 'API test'
          },
          { headers }
        );
        
        console.log('✅ Stock adjusted:');
        console.log(`   Previous: ${variant.currentStock} qop`);
        console.log(`   New: ${stockRes.data.currentStock} qop`);
        
        // Test price update
        console.log(`\n5️⃣ Testing price update...`);
        const newPrice = variant.pricePerBag + 10;
        const priceRes = await axios.post(
          `${API_URL}/variants/${variant.id}/price`,
          {
            newPrice,
            reason: 'Test narx o\'zgartirish'
          },
          { headers }
        );
        
        console.log('✅ Price updated:');
        console.log(`   Old: ${variant.pricePerBag} so'm`);
        console.log(`   New: ${priceRes.data.pricePerBag} so'm`);
      }
    } else {
      console.log('\n⚠️ No parent products with variants found');
    }
    
    console.log('\n✅ ALL TESTS PASSED!\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run tests
testVariantAPI();
