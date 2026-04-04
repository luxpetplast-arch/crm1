const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      login: 'admin',
      password: 'admin123'
    });
    console.log('✅ Login success:', response.data);
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();
