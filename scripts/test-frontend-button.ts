import axios from 'axios';

async function testFrontendFunctionality() {
  console.log('Testing frontend button functionality simulation...');
  
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      login: 'admin',
      password: 'admin'
    });
    
    const token = loginResponse.data.token;
    
    // Simulate the exact same data that the frontend would send
    console.log('1. Testing form submission with exact frontend data...');
    
    // Test case 1: Normal customer creation
    const customerData1 = {
      name: 'Test Frontend Customer',
      phone: '+998900000002',
      category: 'NORMAL'
    };
    
    try {
      const response1 = await axios.post('http://localhost:3001/api/customers', customerData1, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('SUCCESS: Normal customer creation works');
      console.log('Created:', response1.data.name);
      
      // Clean up
      await axios.delete(`http://localhost:3001/api/customers/${response1.data.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
    } catch (error: any) {
      console.log('ERROR with normal customer:', error.response?.data || error.message);
    }
    
    // Test case 2: Customer with Telegram ID
    const customerData2 = {
      name: 'Test Telegram Customer',
      phone: '+998900000003',
      category: 'VIP',
      telegramId: 'A1B2C3D4'
    };
    
    try {
      const response2 = await axios.post('http://localhost:3001/api/customers', customerData2, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('SUCCESS: Customer with Telegram ID works');
      console.log('Created:', response2.data.name);
      
      // Clean up
      await axios.delete(`http://localhost:3001/api/customers/${response2.data.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
    } catch (error: any) {
      console.log('ERROR with Telegram customer:', error.response?.data || error.message);
    }
    
    // Test case 3: Missing required fields
    const customerData3 = {
      name: '',  // Empty name
      phone: '+998900000004',
      category: 'NORMAL'
    };
    
    try {
      await axios.post('http://localhost:3001/api/customers', customerData3, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('ERROR: Should have failed with empty name');
    } catch (error: any) {
      console.log('GOOD: Correctly rejected empty name');
    }
    
    console.log('\nFrontend functionality test completed');
    
  } catch (error: any) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testFrontendFunctionality();
