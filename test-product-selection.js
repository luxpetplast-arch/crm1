// Test script to check product selection issue
import axios from 'axios';

async function testProductAPI() {
  try {
    console.log('🔄 Testing product API...');
    
    // Test without authentication first
    console.log('1. Testing public products endpoint...');
    try {
      const publicResponse = await axios.get('http://localhost:5001/api/products/public');
      console.log('✅ Public products:', publicResponse.data.length);
    } catch (error) {
      console.log('❌ Public products error:', error.message);
    }
    
    // Test with authentication (if we have a token)
    const token = 'your-test-token-here'; // You'll need to get a valid token
    if (token !== 'your-test-token-here') {
      console.log('2. Testing authenticated products endpoint...');
      try {
        const authResponse = await axios.get('http://localhost:5001/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Authenticated products:', authResponse.data.length);
        
        // Check first product structure
        if (authResponse.data.length > 0) {
          console.log('📦 First product:', {
            id: authResponse.data[0].id,
            name: authResponse.data[0].name,
            pricePerBag: authResponse.data[0].pricePerBag,
            currentStock: authResponse.data[0].currentStock
          });
        }
      } catch (error) {
        console.log('❌ Authenticated products error:', error.response?.data || error.message);
      }
    }
    
    // Test orders API
    console.log('3. Testing orders API...');
    try {
      const ordersResponse = await axios.get('http://localhost:5001/api/orders', {
        headers: token !== 'your-test-token-here' ? { Authorization: `Bearer ${token}` } : {}
      });
      console.log('✅ Orders:', ordersResponse.data.length);
    } catch (error) {
      console.log('❌ Orders error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Server is running:', response.data);
    await testProductAPI();
  } catch (error) {
    console.log('❌ Server is not running on port 5001');
    console.log('Please start the server first');
  }
}

checkServer();
