import axios from 'axios';

async function debugCashierButtons() {
  console.log('Debugging cashier button functionality...');
  
  try {
    // Login as cashier
    console.log('1. Logging in as cashier...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/cashier-login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    const token = loginResponse.data.token;
    console.log('Cashier login: SUCCESS');
    
    // Test if cashier can access customers page data
    console.log('2. Testing customers API endpoint...');
    try {
      const customersResponse = await axios.get('http://localhost:3001/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Customers API: ${customersResponse.data.length} customers found`);
    } catch (error: any) {
      console.log('Customers API ERROR:', error.response?.status, error.response?.data?.error);
    }
    
    // Test customer creation API (what the button should do)
    console.log('3. Testing customer creation API...');
    try {
      const testCustomer = {
        name: 'Debug Test Customer',
        phone: '+998900000999',
        category: 'NORMAL'
      };
      
      const createResponse = await axios.post('http://localhost:3001/api/customers', testCustomer, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Customer creation API: SUCCESS');
      console.log('Created customer ID:', createResponse.data.id);
      
      // Clean up
      await axios.delete(`http://localhost:3001/api/customers/${createResponse.data.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Test customer cleaned up');
      
    } catch (error: any) {
      console.log('Customer creation API ERROR:', error.response?.status, error.response?.data?.error);
    }
    
    console.log('\nBackend API tests completed.');
    console.log('If backend works, the issue is in frontend JavaScript.');
    
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

debugCashierButtons();
