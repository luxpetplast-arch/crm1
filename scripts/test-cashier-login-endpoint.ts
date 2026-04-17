import axios from 'axios';

async function testCashierLogin() {
  console.log('=== Testing Cashier Login Endpoint ===');
  
  try {
    // Test with different data formats
    const loginAttempts = [
      {
        name: 'Standard cashier login',
        data: { login: 'cashier', password: 'cashier' }
      },
      {
        name: 'Cashier login with email field',
        data: { email: 'cashier', password: 'cashier' }
      },
      {
        name: 'Cashier login with different case',
        data: { login: 'CASHIER', password: 'cashier' }
      }
    ];
    
    for (const attempt of loginAttempts) {
      console.log(`\nTesting: ${attempt.name}`);
      console.log('Data:', attempt.data);
      
      try {
        const response = await axios.post('http://localhost:5002/api/auth/cashier-login', attempt.data, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        });
        
        console.log('Success! Response:', response.data);
        
      } catch (error: any) {
        console.log('Failed:', error.message);
        
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Response data:', error.response.data);
        }
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  console.log('\n=== Test Complete ===');
}

testCashierLogin();
