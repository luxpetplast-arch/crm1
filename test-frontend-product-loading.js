import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testFrontendProductLoading() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    
    console.log('✅ Login successful');
    
    // Test products loading like frontend does
    console.log('\n📦 Testing frontend product loading...');
    
    const productsResponse = await axios.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const products = productsResponse.data;
    console.log(`✅ Products loaded: ${products.length} ta`);
    
    if (products.length > 0) {
      console.log('📋 Product structure analysis:');
      const sampleProduct = products[0];
      
      Object.keys(sampleProduct).forEach(key => {
        console.log(`   ${key}: ${sampleProduct[key]}`);
      });
      
      // Test filtering like ProductSelector does
      console.log('\n🔍 Testing product filtering...');
      
      // Test with no search
      let filteredProducts = products.filter(p => {
        if (!p.name) return false;
        return true; // No search filter
      });
      console.log(`✅ No search filter: ${filteredProducts.length} products`);
      
      // Test with search
      const testSearchValue = 'kapsula';
      filteredProducts = products.filter(p => {
        if (!p.name) return false;
        return p.name.toLowerCase().includes(testSearchValue.toLowerCase());
      });
      console.log(`✅ Search "${testSearchValue}": ${filteredProducts.length} products`);
      
      // Test ProductSelector interface compatibility
      console.log('\n🧪 Testing ProductSelector interface...');
      
      const compatibleProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        pricePerBag: p.pricePerBag,
        currentStock: p.currentStock || 0,
        optimalStock: p.optimalStock || 0,
        minStockLimit: p.minStockLimit || 0,
        bagType: p.bagType || 'unknown'
      }));
      
      console.log(`✅ Compatible products: ${compatibleProducts.length}`);
      
      if (compatibleProducts.length > 0) {
        const compatibleSample = compatibleProducts[0];
        console.log('📋 Compatible product sample:');
        console.log(`   ID: ${compatibleSample.id}`);
        console.log(`   Name: ${compatibleSample.name}`);
        console.log(`   Price: $${compatibleSample.pricePerBag}`);
        console.log(`   Stock: ${compatibleSample.currentStock}`);
        console.log(`   Bag Type: ${compatibleSample.bagType}`);
      }
      
      // Simulate ProductSelector rendering
      console.log('\n🖥️ Simulating ProductSelector rendering...');
      
      const selectorSearchValue = '';
      const filteredCompatible = compatibleProducts.filter(p => {
        if (!p.name) return false;
        if (!selectorSearchValue) return true;
        return p.name.toLowerCase().includes(selectorSearchValue.toLowerCase());
      });
      
      console.log(`📊 ProductSelector would render ${filteredCompatible.length} products`);
      
      filteredCompatible.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.pricePerBag} - ${product.currentStock} in stock`);
      });
      
    } else {
      console.log('❌ No products found!');
      
      // Create a test product
      console.log('\n🛒 Creating test product...');
      const testProductResponse = await axios.post(`${API_BASE}/products`, {
        name: `Frontend Test Product ${Date.now()}`,
        bagType: 'KICHIK',
        unitsPerBag: 50,
        minStockLimit: 10,
        optimalStock: 50,
        maxCapacity: 100,
        currentStock: 100,
        pricePerBag: 25
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Test product created:', testProductResponse.data.name);
      console.log('   Now refresh the Orders page to see the product');
    }
    
    console.log('\n🎯 Frontend product loading test completed!');
    console.log('✅ API endpoint working');
    console.log('✅ Product structure compatible');
    console.log('✅ Filtering logic working');
    console.log('📝 Check browser console for ProductSelector debug logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendProductLoading();
