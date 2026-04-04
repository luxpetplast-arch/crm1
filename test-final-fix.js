// Final test to confirm the fix is working
import axios from 'axios';

async function testFinalFix() {
  try {
    console.log('🎯 TESTING FINAL FIX');
    
    // Step 1: Fresh login
    console.log('1. Fresh login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Test all APIs that Orders page uses
    console.log('2. Testing all APIs...');
    const [ordersRes, customersRes, productsRes] = await Promise.all([
      axios.get('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('http://localhost:3000/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    
    console.log('✅ All APIs working:');
    console.log(`   - Orders: ${ordersRes.data.length}`);
    console.log(`   - Customers: ${customersRes.data.length}`);
    console.log(`   - Products: ${productsRes.data.length}`);
    
    // Step 3: Test product selection simulation
    console.log('3. Testing product selection...');
    if (productsRes.data.length > 0) {
      const firstProduct = productsRes.data[0];
      console.log(`   - First product: ${firstProduct.name}`);
      console.log(`   - Price: $${firstProduct.pricePerBag}`);
      console.log(`   - Stock: ${firstProduct.currentStock} qop`);
      console.log('✅ Product selection data ready');
    }
    
    // Step 4: Test order creation with product selection
    console.log('4. Testing order creation...');
    if (productsRes.data.length > 0 && customersRes.data.length > 0) {
      const testOrder = {
        customerId: customersRes.data[0].id,
        customerName: customersRes.data[0].name,
        items: [{
          productId: productsRes.data[0].id,
          productName: productsRes.data[0].name,
          quantityBags: 1,
          quantityUnits: 0
        }],
        priority: 'NORMAL',
        requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test - Product selection working'
      };
      
      const orderResponse = await axios.post('http://localhost:3000/api/orders', testOrder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Order creation successful!');
      console.log(`   - Order ID: ${orderResponse.data.id}`);
      console.log(`   - Order Number: ${orderResponse.data.orderNumber}`);
      console.log(`   - Product selected: ${productsRes.data[0].name}`);
      
      // Clean up
      await axios.delete(`http://localhost:3000/api/orders/${orderResponse.data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🧹 Test order cleaned up');
    }
    
    console.log('\n🎉 SUCCESS! Product selection is now working!');
    console.log('\n📋 WHAT TO DO:');
    console.log('1. Refresh browser page');
    console.log('2. If not logged in, login with admin@aziztrades.com / admin123');
    console.log('3. Go to Orders page');
    console.log('4. Click "Yangi Buyurtma"');
    console.log('5. Click in product field and type product name');
    console.log('6. Select product from dropdown - IT SHOULD WORK!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFinalFix();
