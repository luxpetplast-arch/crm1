import axios from 'axios';

async function testCashierLogin() {
  console.log('Testing cashier login functionality...');
  
  try {
    // Test regular admin login
    console.log('1. Testing admin login...');
    const adminResponse = await axios.post('http://localhost:3001/api/auth/login', {
      login: 'admin',
      password: 'admin'
    });
    console.log('Admin login: SUCCESS');
    
    // Test cashier login
    console.log('2. Testing cashier login...');
    const cashierResponse = await axios.post('http://localhost:3001/api/auth/cashier-login', {
      login: 'cashier',
      password: 'cashier'
    });
    console.log('Cashier login: SUCCESS');
    console.log('Cashier token received:', !!cashierResponse.data.token);
    console.log('Cashier user info:', cashierResponse.data.user);
    
    // Test cashier access to customers
    console.log('3. Testing cashier API access...');
    const customersResponse = await axios.get('http://localhost:3001/api/customers', {
      headers: {
        'Authorization': `Bearer ${cashierResponse.data.token}`
      }
    });
    console.log('Cashier can access customers:', customersResponse.data.length, 'customers found');
    
    // Test cashier access to products
    console.log('4. Testing cashier product access...');
    try {
      const productsResponse = await axios.get('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${cashierResponse.data.token}`
        }
      });
      console.log('Cashier can access products:', productsResponse.data.length, 'products found');
    } catch (error: any) {
      console.log('Products access error:', error.response?.status, error.response?.data?.error);
    }
    
    // Test cashier access to sales
    console.log('5. Testing cashier sales access...');
    try {
      const salesResponse = await axios.get('http://localhost:3001/api/sales', {
        headers: {
          'Authorization': `Bearer ${cashierResponse.data.token}`
        }
      });
      console.log('Cashier can access sales:', salesResponse.data.length, 'sales found');
    } catch (error: any) {
      console.log('Sales access error:', error.response?.status, error.response?.data?.error);
    }
    
  } catch (error: any) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}

testCashierLogin();
