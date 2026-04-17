import axios from 'axios';

async function testSalesAfterCustomerFix() {
  console.log('=== Test Sales After Customer Fix ===');
  
  try {
    // 1. Login as cashier
    console.log('1. Login as cashier...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // 2. Get products and customers
      console.log('2. Get products and customers...');
      const [productsResponse, customersResponse] = await Promise.all([
        axios.get('http://localhost:5002/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5002/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (productsResponse.data && customersResponse.data) {
        console.log('✅ Data loaded');
        
        const firstProduct = productsResponse.data[0];
        const firstCustomer = customersResponse.data[0];
        
        console.log('\nSelected product:', {
          name: firstProduct.name,
          id: firstProduct.id,
          pricePerBag: firstProduct.pricePerBag,
          unitsPerBag: firstProduct.unitsPerBag
        });
        
        console.log('Selected customer:', {
          name: firstCustomer.name,
          id: firstCustomer.id
        });
        
        // 3. Test sale creation with fixed customer field
        console.log('\n3. Testing sale creation with customer.connect...');
        
        const saleData = {
          customerId: firstCustomer.id,
          items: [{
            productId: firstProduct.id,
            quantity: 1,
            pricePerBag: firstProduct.pricePerBag,
            subtotal: firstProduct.pricePerBag,
            saleType: 'bag'
          }],
          totalAmount: firstProduct.pricePerBag,
          currency: 'USD',
          isKocha: false,
          manualCustomerName: null,
          manualCustomerPhone: null,
          paymentDetails: {
            uzs: firstProduct.pricePerBag,
            usd: 0,
            click: 0
          }
        };
        
        console.log('\nSale data:', JSON.stringify(saleData, null, 2));
        
        try {
          const saleResponse = await axios.post('http://localhost:5002/api/sales', saleData, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          console.log('✅ Sale successful!');
          console.log('Sale ID:', saleResponse.data.id);
          console.log('Total Amount:', saleResponse.data.totalAmount);
          
          // Check created items
          if (saleResponse.data.items) {
            saleResponse.data.items.forEach((item: any, index: number) => {
              console.log(`\nItem ${index + 1}:`);
              console.log('  Product:', item.product?.name || 'Unknown');
              console.log('  Quantity:', item.quantity);
              console.log('  Price per bag:', item.pricePerBag);
              console.log('  Subtotal:', item.subtotal);
              console.log('  Sale type:', item.saleType);
            });
          }
          
          console.log('\n🎉 Sales functionality is working perfectly after customer fix!');
          
        } catch (error: any) {
          console.log('❌ Sale failed:', error.message);
          
          if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
            
            if (error.response.status === 500) {
              console.log('🔍 500 Error still exists');
              console.log('Error response:', error.response.data);
            }
          }
        }
        
      } else {
        console.log('❌ Failed to load data');
      }
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n=== Test Complete ===');
}

testSalesAfterCustomerFix();
