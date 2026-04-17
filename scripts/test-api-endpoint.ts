import axios from 'axios';

async function testAPIEndpoint() {
  console.log('Testing API endpoint accessibility...');
  
  try {
    // Test without authentication (should fail with 401)
    console.log('1. Testing without authentication...');
    try {
      const response = await axios.get('http://localhost:3001/api/customers');
      console.log('ERROR: API should require authentication but it responded with:', response.status);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('GOOD: API correctly requires authentication');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('ERROR: Server is not running on port 3001');
        return;
      } else {
        console.log('ERROR: Unexpected error:', error.message);
      }
    }
    
    // Test server health
    console.log('2. Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/api/health');
      console.log('Server health:', healthResponse.data);
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.log('ERROR: Server is not running on port 3001');
        console.log('Please start the server with: npm run dev or npm start');
      } else {
        console.log('Health check error:', error.message);
      }
    }
    
    // Test login endpoint
    console.log('3. Testing login endpoint...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        login: 'admin',
        password: 'admin'
      });
      
      if (loginResponse.data.token) {
        console.log('SUCCESS: Login works, token received');
        
        // Test customers API with authentication
        console.log('4. Testing customers API with authentication...');
        const customersResponse = await axios.get('http://localhost:3001/api/customers', {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        
        console.log(`SUCCESS: Customers API returned ${customersResponse.data.length} customers`);
        console.log('First 3 customers:');
        customersResponse.data.slice(0, 3).forEach((c: any, i: number) => {
          console.log(`  ${i + 1}. ${c.name} (${c.phone})`);
        });
        
      } else {
        console.log('ERROR: Login did not return token');
      }
    } catch (error: any) {
      console.log('Login error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPIEndpoint();
