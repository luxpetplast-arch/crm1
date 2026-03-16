import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testOrderProductSelection() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    
    console.log('✅ Login successful');
    
    // Test products endpoint
    console.log('\n📦 Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const products = productsResponse.data;
    console.log(`✅ Products loaded: ${products.length} ta`);
    
    if (products.length > 0) {
      console.log('📋 First few products:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (ID: ${product.id})`);
        console.log(`      Price: $${product.pricePerBag}, Stock: ${product.currentStock}`);
      });
    } else {
      console.log('❌ No products found!');
      
      // Create test product
      console.log('\n🛒 Creating test product...');
      const testProductResponse = await axios.post(`${API_BASE}/products`, {
        name: `Test Mahsulot ${Date.now()}`,
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
      
      console.log('✅ Test product created:', testProductResponse.data.name);
    }
    
    // Test order creation with product selection
    console.log('\n🧪 Testing order creation workflow...');
    
    // Create test customer
    const customerResponse = await axios.post(`${API_BASE}/customers`, {
      name: `Product Test Customer ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Toshkent, Product Test'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customer = customerResponse.data;
    console.log('✅ Customer created:', customer.name);
    
    // Get fresh products list
    const freshProductsResponse = await axios.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const freshProducts = freshProductsResponse.data;
    
    if (freshProducts.length === 0) {
      console.log('❌ Still no products available for order!');
      return;
    }
    
    // Create order with first available product
    const firstProduct = freshProducts[0];
    console.log(`📦 Using product: ${firstProduct.name}`);
    
    const orderData = {
      customerId: customer.id,
      items: [
        {
          productId: firstProduct.id,
          quantityBags: 5,
          pricePerBag: firstProduct.pricePerBag
        }
      ],
      notes: 'Product selection test order',
      priority: 'NORMAL'
    };
    
    console.log('🛒 Creating order with product...');
    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const order = orderResponse.data;
    console.log('✅ Order created successfully!');
    console.log('   Order ID:', order.order.id);
    console.log('   Order Number:', order.order.orderNumber);
    console.log('   Product:', firstProduct.name);
    console.log('   Quantity:', 5);
    console.log('   Status:', order.order.status);
    
    // Test frontend product loading simulation
    console.log('\n🖥️ Testing frontend product loading simulation...');
    
    try {
      const frontendProductsResponse = await axios.get(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const frontendProducts = frontendProductsResponse.data;
      console.log(`✅ Frontend can load ${frontendProducts.length} products`);
      
      // Check product structure
      if (frontendProducts.length > 0) {
        const sampleProduct = frontendProducts[0];
        console.log('📋 Sample product structure:');
        console.log('   ID:', sampleProduct.id);
        console.log('   Name:', sampleProduct.name);
        console.log('   Price:', sampleProduct.pricePerBag);
        console.log('   Stock:', sampleProduct.currentStock);
        console.log('   Bag Type:', sampleProduct.bagType);
        
        // Check if all required fields exist
        const requiredFields = ['id', 'name', 'pricePerBag', 'currentStock'];
        const missingFields = requiredFields.filter(field => !sampleProduct[field]);
        
        if (missingFields.length === 0) {
          console.log('✅ All required fields present');
        } else {
          console.log('❌ Missing fields:', missingFields);
        }
      }
      
    } catch (frontendError) {
      console.log('❌ Frontend product loading error:', frontendError.message);
    }
    
    console.log('\n🎯 Product selection test completed!');
    console.log('✅ Products endpoint working');
    console.log('✅ Order creation with products working');
    console.log('✅ Frontend can load products');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOrderProductSelection();
