// Test to check browser state and products
import axios from 'axios';

async function testBrowserState() {
  try {
    console.log('🔍 TESTING BROWSER STATE');
    
    // Test if products are really loading
    console.log('1. Testing products API...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    
    const productsResponse = await axios.get('http://localhost:3000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Products loaded: ${productsResponse.data.length}`);
    
    if (productsResponse.data.length > 0) {
      console.log('📋 First 5 products:');
      productsResponse.data.slice(0, 5).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.pricePerBag} - ${product.currentStock} qop`);
      });
    }
    
    console.log('\n🎯 BROWSER INSTRUCTIONS:');
    console.log('1. Open browser: http://localhost:3000');
    console.log('2. Open Developer Tools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Go to Orders page');
    console.log('5. Click "Yangi Buyurtma"');
    console.log('6. Look for these console logs:');
    console.log('   - "🔍 ProductSelector render - products: 35"');
    console.log('   - "🔍 Filtered: 35"');
    console.log('7. Click in product field and type "kapsula"');
    console.log('8. You should see product buttons appear');
    
    console.log('\n🚨 IF YOU DONT SEE PRODUCTS:');
    console.log('- Check console for errors');
    console.log('- Make sure you see "Data loaded and state updated"');
    console.log('- Look for "ProductSelector render" logs');
    console.log('- Check if products array is empty');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testBrowserState();
