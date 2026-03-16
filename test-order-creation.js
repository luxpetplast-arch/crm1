import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testOrderCreation() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    
    console.log('✅ Login successful');
    
    // Create test customer
    const customerResponse = await axios.post(`${API_BASE}/customers`, {
      name: `Test Customer ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Tashkent, Test address'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customer = customerResponse.data;
    console.log('✅ Customer created:', customer.id);
    
    // Create test product
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: `Test Product ${Date.now()}`,
      bagType: 'KICHIK',
      unitsPerBag: 50,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 100,
      pricePerBag: 25
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const product = productResponse.data;
    console.log('✅ Product created:', product.id);
    
    // Test order creation
    const orderData = {
      customerId: customer.id,
      items: [
        {
          productId: product.id,
          quantityBags: 10,
          pricePerBag: 25
        }
      ],
      notes: 'Test order',
      priority: 'NORMAL'
    };
    
    console.log('🛒 Creating order...');
    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Order created successfully:', orderResponse.data);
    
  } catch (error) {
    console.error('❌ Order creation failed:', error.response?.data || error.message);
  }
}

testOrderCreation();
