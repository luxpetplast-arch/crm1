const axios = require('axios');

async function testLogin() {
  console.log('🔐 Login testini boshlash...\n');
  
  try {
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    console.log('✅ Login muvaffaqiyatli!');
    console.log('Token:', response.data.token ? 'Mavjud' : 'Yo\'q');
    console.log('User:', response.data.user);
  } catch (error) {
    console.error('❌ Login xatolik:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Server javob bermadi');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
