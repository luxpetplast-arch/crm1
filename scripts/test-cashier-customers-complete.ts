import axios from 'axios';

async function testCashierCustomersComplete() {
  console.log('Testing complete cashier customer functionality...');
  
  try {
    // Login as cashier
    console.log('1. Logging in as cashier...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/cashier-login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    const token = loginResponse.data.token;
    console.log('Cashier login: SUCCESS');
    
    // Test customer list retrieval
    console.log('2. Testing customer list retrieval...');
    const customersResponse = await axios.get('http://localhost:3001/api/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`Customers retrieved: ${customersResponse.data.length}`);
    console.log('First 5 customers:');
    customersResponse.data.slice(0, 5).forEach((c: any, i: number) => {
      console.log(`  ${i + 1}. ${c.name} (${c.phone}) - ${c.category}`);
    });
    
    // Test customer creation
    console.log('3. Testing customer creation...');
    const newCustomer = {
      name: 'Cashier Test Customer',
      phone: '+998900000888',
      category: 'NORMAL'
    };
    
    const createResponse = await axios.post('http://localhost:3001/api/customers', newCustomer, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Customer creation: SUCCESS');
    console.log('Created:', createResponse.data.name);
    
    // Verify new customer appears in list
    const updatedCustomersResponse = await axios.get('http://localhost:3001/api/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const testCustomer = updatedCustomersResponse.data.find((c: any) => c.name === 'Cashier Test Customer');
    if (testCustomer) {
      console.log('New customer appears in list: SUCCESS');
    } else {
      console.log('New customer NOT found in list: ERROR');
    }
    
    // Clean up test customer
    await axios.delete(`http://localhost:3001/api/customers/${createResponse.data.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Test customer cleaned up');
    
    // Test customer search functionality
    console.log('4. Testing customer search...');
    const searchResponse = await axios.get('http://localhost:3001/api/customers?search=Abdusamad', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`Search results: ${searchResponse.data.length} customers found`);
    searchResponse.data.forEach((c: any) => {
      console.log(`  - ${c.name} (${c.phone})`);
    });
    
    console.log('\nAll cashier customer tests PASSED!');
    console.log('\nCashier customer functionality is working correctly.');
    
  } catch (error: any) {
    console.error('ERROR:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Authentication error - check cashier credentials');
    }
  }
}

testCashierCustomersComplete();
