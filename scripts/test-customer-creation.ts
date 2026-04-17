import axios from 'axios';

async function testCustomerCreation() {
  console.log('Testing customer creation API...');
  
  try {
    // First login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      login: 'admin',
      password: 'admin'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received');
    
    // Test customer creation
    console.log('2. Creating test customer...');
    const testCustomer = {
      name: 'Test Customer',
      phone: '+998900000001',
      category: 'NORMAL'
    };
    
    const createResponse = await axios.post('http://localhost:3001/api/customers', testCustomer, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('SUCCESS: Customer created:', createResponse.data.name);
    console.log('Customer ID:', createResponse.data.id);
    
    // Test getting all customers to verify
    console.log('3. Verifying customer in list...');
    const customersResponse = await axios.get('http://localhost:3001/api/customers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const testCustomerInList = customersResponse.data.find((c: any) => c.name === 'Test Customer');
    if (testCustomerInList) {
      console.log('SUCCESS: Test customer found in list');
    } else {
      console.log('ERROR: Test customer not found in list');
    }
    
    // Clean up - delete test customer
    console.log('4. Cleaning up test customer...');
    await axios.delete(`http://localhost:3001/api/customers/${createResponse.data.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Test customer deleted');
    
  } catch (error: any) {
    console.error('ERROR:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Authentication failed - check credentials');
    }
  }
}

testCustomerCreation();
