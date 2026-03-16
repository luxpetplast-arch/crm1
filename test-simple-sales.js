import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testLogin() {
  try {
    console.log('🔐 Login test...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    console.log('✅ Login successful:', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testSalesCreation() {
  try {
    const token = await testLogin();
    
    console.log('\n🛒 Creating test sale...');
    
    const saleData = {
      customerId: 'test-customer-id',
      items: [
        {
          productId: 'test-product-id',
          quantity: 5,
          pricePerBag: 25
        }
      ],
      totalAmount: 125,
      paidAmount: 100,
      currency: 'USD',
      paymentStatus: 'PARTIAL'
    };

    const response = await axios.post(`${API_BASE}/sales`, saleData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Sale created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Sales creation failed:', error.response?.data || error.message);
    throw error;
  }
}

testSalesCreation().catch(console.error);
