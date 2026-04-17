const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Testing login with correct port...');
    
    const response = await axios.post('http://localhost:5002/api/auth/login', {
      login: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Network error:', error.message);
    }
  }
}

testLogin();
