// Test products API specifically
import axios from 'axios';

async function testProductsAPI() {
  try {
    console.log('🔍 Testing Products API...');
    
    // Get token from localStorage simulation
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AYXppenRyYWRlcy5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjY1NzEwMDAsImV4cCI6MTcyNjU3NDYwMH0.test'; // Test token
    
    console.log('1. Testing products API directly...');
    try {
      const productsResponse = await axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Products API Response:');
      console.log('   - Status:', productsResponse.status);
      console.log('   - Data length:', productsResponse.data.length);
      console.log('   - First product:', productsResponse.data[0]?.name || 'No products');
      
    } catch (productsError) {
      console.log('❌ Products API Error:');
      console.log('   - Status:', productsError.response?.status);
      console.log('   - Error:', productsError.response?.data || productsError.message);
    }
    
    // Test with fresh login
    console.log('2. Testing with fresh login...');
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'admin@aziztrades.com',
        password: 'admin123'
      });
      
      const freshToken = loginResponse.data.token;
      console.log('✅ Fresh login successful');
      
      const freshProductsResponse = await axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      
      console.log('✅ Fresh Products API Response:');
      console.log('   - Status:', freshProductsResponse.status);
      console.log('   - Data length:', freshProductsResponse.data.length);
      
    } catch (freshError) {
      console.log('❌ Fresh login/products error:', freshError.response?.data || freshError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductsAPI();
