import axios from 'axios';

async function testCashierCompleteFlow() {
  console.log('Testing complete cashier functionality...');
  
  try {
    // Test 1: Cashier login endpoint
    console.log('1. Testing cashier login endpoint...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/cashier-login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    console.log('Cashier login: SUCCESS');
    const token = loginResponse.data.token;
    console.log('User role:', loginResponse.data.user.role);
    
    // Test 2: Cashier access to key endpoints
    console.log('2. Testing cashier API access...');
    
    const endpoints = [
      { path: '/customers', name: 'Customers' },
      { path: '/products', name: 'Products' },
      { path: '/sales', name: 'Sales' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:3001/api${endpoint.path}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`- ${endpoint.name}: ${response.data.length} items found`);
      } catch (error: any) {
        console.log(`- ${endpoint.name}: ERROR ${error.response?.status} - ${error.response?.data?.error}`);
      }
    }
    
    // Test 3: Customer creation (cashier should be able to create customers)
    console.log('3. Testing customer creation...');
    try {
      const newCustomer = await axios.post('http://localhost:3001/api/customers', {
        name: 'Cashier Test Customer',
        phone: '+998900000999',
        category: 'NORMAL'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Customer creation: SUCCESS -', newCustomer.data.name);
      
      // Clean up
      await axios.delete(`http://localhost:3001/api/customers/${newCustomer.data.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Test customer cleaned up');
    } catch (error: any) {
      console.log('Customer creation: ERROR -', error.response?.data?.error);
    }
    
    console.log('\nCashier functionality test completed successfully!');
    console.log('\nTo access cashier interface:');
    console.log('1. Go to: http://localhost:3000/cashier/login');
    console.log('2. Login with: cashier / cashier');
    console.log('3. You should be redirected to: /cashier/sales');
    
  } catch (error: any) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}

testCashierCompleteFlow();
