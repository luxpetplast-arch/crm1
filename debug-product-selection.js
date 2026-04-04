// Debug script to check product selection in real-time
import axios from 'axios';

async function debugProductSelection() {
  try {
    console.log('🔍 DEBUG: Product Selection Issue');
    
    // Check if server is accessible
    console.log('1. Checking server health...');
    const healthResponse = await axios.get('http://localhost:5002/api/health');
    console.log('✅ Server health:', healthResponse.data);
    
    // Test authentication
    console.log('2. Testing authentication...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful');
    
    // Test products API with detailed response
    console.log('3. Testing products API...');
    const productsResponse = await axios.get('http://localhost:5002/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Products API response:');
    console.log('   - Status:', productsResponse.status);
    console.log('   - Data length:', productsResponse.data.length);
    console.log('   - Content-Type:', productsResponse.headers['content-type']);
    
    if (productsResponse.data.length > 0) {
      const firstProduct = productsResponse.data[0];
      console.log('   - First product structure:', {
        id: firstProduct.id,
        name: firstProduct.name,
        pricePerBag: firstProduct.pricePerBag,
        currentStock: firstProduct.currentStock,
        bagType: firstProduct.bagType
      });
    }
    
    // Test the exact API call that the frontend makes
    console.log('4. Testing frontend API call...');
    try {
      const frontendResponse = await axios.get('http://localhost:3004/api/products', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Frontend API call successful');
      console.log('   - Status:', frontendResponse.status);
      console.log('   - Data length:', frontendResponse.data.length);
      
    } catch (frontendError) {
      console.log('❌ Frontend API call failed:', frontendError.message);
      console.log('   - This means the proxy is not working');
    }
    
    console.log('\n🎯 DEBUG SUMMARY:');
    console.log('- Backend API works:', productsResponse.status === 200);
    console.log('- Products available:', productsResponse.data.length);
    console.log('- Authentication works:', !!token);
    
    console.log('\n💡 If products are not showing in browser:');
    console.log('1. Check browser console for errors');
    console.log('2. Make sure you are logged in');
    console.log('3. Check network tab for failed requests');
    console.log('4. Verify proxy configuration in vite.config.ts');
    
  } catch (error) {
    console.error('❌ DEBUG failed:', error.response?.data || error.message);
  }
}

debugProductSelection();
