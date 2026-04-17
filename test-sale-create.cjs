const axios = require('axios');

async function testSaleCreate() {
  try {
    // 1. Login
    console.log('1. Login...');
    const loginRes = await axios.post('http://localhost:5002/api/auth/login', {
      login: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful');
    
    // 2. Get products
    console.log('\n2. Getting products...');
    const productsRes = await axios.get('http://localhost:5002/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const products = productsRes.data;
    console.log(`✅ Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('❌ No products found!');
      return;
    }
    
    const firstProduct = products[0];
    console.log(`   Using product: ${firstProduct.name} (ID: ${firstProduct.id})`);
    
    // 3. Get customers
    console.log('\n3. Getting customers...');
    const customersRes = await axios.get('http://localhost:5002/api/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const customers = customersRes.data;
    console.log(`✅ Found ${customers.length} customers`);
    
    if (customers.length === 0) {
      console.log('❌ No customers found!');
      return;
    }
    
    const firstCustomer = customers[0];
    console.log(`   Using customer: ${firstCustomer.name} (ID: ${firstCustomer.id})`);
    
    // 4. Create sale
    console.log('\n4. Creating sale...');
    const saleData = {
      customerId: firstCustomer.id,
      items: [
        {
          productId: firstProduct.id,
          quantity: 1,
          pricePerBag: 1000,
          pricePerPiece: 50,
          subtotal: 1000,
          saleType: 'bag'
        }
      ],
      totalAmount: 1000,
      paidAmount: 500,
      paymentStatus: 'PARTIAL',
      paymentDetails: {
        uzs: 500,
        usd: 0,
        click: 0
      },
      currency: 'USD',
      isKocha: false
    };
    
    console.log('Sale data:', JSON.stringify(saleData, null, 2));
    
    const saleRes = await axios.post('http://localhost:5002/api/sales', saleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n✅ Sale created successfully!');
    console.log('Sale ID:', saleRes.data.id);
    console.log('Response:', JSON.stringify(saleRes.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
    if (error.response?.data?.stack) {
      console.error('Stack:', error.response.data.stack);
    }
  }
}

testSaleCreate();
