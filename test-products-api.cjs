// Test script to check products API
const axios = require('axios');

async function testProductsAPI() {
  try {
    console.log('🔍 Testing products API...');
    const response = await axios.get('http://localhost:3000/api/products');
    const products = response.data;
    
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length > 0) {
      console.log('📦 First few products:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.currentStock} qop - $${product.pricePerBag}`);
      });
    } else {
      console.log('❌ No products found in database');
    }
    
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testProductsAPI();
