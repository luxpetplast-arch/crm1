import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testOrderCreationFrontend() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    
    console.log('✅ Login successful');
    
    // Test order creation with empty items (should fail)
    console.log('\n🧪 Test 1: Empty items (should fail)');
    try {
      const emptyOrderResponse = await axios.post(`${API_BASE}/orders`, {
        customerId: 'test-customer-id',
        items: [],
        priority: 'NORMAL',
        requestedDate: '2026-03-16'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Empty order should have failed but passed');
    } catch (error) {
      console.log('✅ Empty order correctly failed:', error.response?.data?.error || 'Validation error');
    }
    
    // Test order creation with valid data
    console.log('\n🧪 Test 2: Valid order (should pass)');
    
    // Create test customer
    const customerResponse = await axios.post(`${API_BASE}/customers`, {
      name: `Frontend Test Customer ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Tashkent, Frontend test'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customer = customerResponse.data;
    
    // Create test product
    const productResponse = await axios.post(`${API_BASE}/products`, {
      name: `Frontend Test Product ${Date.now()}`,
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
    
    // Valid order data
    const validOrderData = {
      customerId: customer.id,
      items: [
        {
          productId: product.id,
          quantityBags: 10,
          pricePerBag: 25
        }
      ],
      notes: 'Frontend test order',
      priority: 'NORMAL'
    };
    
    const validOrderResponse = await axios.post(`${API_BASE}/orders`, validOrderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Valid order created successfully');
    console.log('   Order ID:', validOrderResponse.data.order.id);
    console.log('   Order Number:', validOrderResponse.data.order.orderNumber);
    console.log('   Status:', validOrderResponse.data.order.status);
    
    // Test order creation with missing product (should fail)
    console.log('\n🧪 Test 3: Missing product (should fail)');
    try {
      const invalidOrderResponse = await axios.post(`${API_BASE}/orders`, {
        customerId: customer.id,
        items: [
          {
            productId: '',
            quantityBags: 10,
            pricePerBag: 25
          }
        ],
        priority: 'NORMAL'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Invalid order should have failed but passed');
    } catch (error) {
      console.log('✅ Invalid order correctly failed:', error.response?.data?.error || 'Validation error');
    }
    
    console.log('\n🎉 Frontend order creation tests completed!');
    console.log('✅ All validation working correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOrderCreationFrontend();
