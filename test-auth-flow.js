// Test authentication flow
import axios from 'axios';

async function testAuthFlow() {
  try {
    console.log('🔄 Testing authentication flow...');
    
    // Step 1: Try to login with default credentials
    console.log('1. Testing login...');
    try {
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      console.log('✅ Login successful!');
      console.log('📋 Token:', loginResponse.data.token ? 'Received' : 'Missing');
      console.log('👤 User:', loginResponse.data.user?.name || 'Unknown');
      
      const token = loginResponse.data.token;
      
      // Step 2: Test products API with token
      console.log('2. Testing products API with token...');
      try {
        const productsResponse = await axios.get('http://localhost:5001/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Products API successful!');
        console.log('📦 Products count:', productsResponse.data.length);
        
        if (productsResponse.data.length > 0) {
          console.log('📋 First product sample:', {
            id: productsResponse.data[0].id,
            name: productsResponse.data[0].name,
            pricePerBag: productsResponse.data[0].pricePerBag,
            currentStock: productsResponse.data[0].currentStock
          });
        }
        
        // Step 3: Test orders API with token
        console.log('3. Testing orders API with token...');
        try {
          const ordersResponse = await axios.get('http://localhost:5001/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Orders API successful!');
          console.log('📋 Orders count:', ordersResponse.data.length);
          
        } catch (ordersError) {
          console.log('❌ Orders API error:', ordersError.response?.data || ordersError.message);
        }
        
      } catch (productsError) {
        console.log('❌ Products API error:', productsError.response?.data || productsError.message);
      }
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data || loginError.message);
      
      // Try alternative credentials
      console.log('Trying alternative credentials...');
      try {
        const altLoginResponse = await axios.post('http://localhost:5001/api/auth/login', {
          email: 'admin@aziztrades.com',
          password: 'admin123'
        });
        
        console.log('✅ Alternative login successful!');
        console.log('👤 User:', altLoginResponse.data.user?.name || 'Unknown');
        
      } catch (altLoginError) {
        console.log('❌ Alternative login also failed:', altLoginError.response?.data || altLoginError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Auth flow test failed:', error.message);
  }
}

// Check server first
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Server is running:', response.data);
    await testAuthFlow();
  } catch (error) {
    console.log('❌ Server is not running on port 5001');
  }
}

checkServer();
