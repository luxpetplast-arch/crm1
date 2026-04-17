import axios from 'axios';

async function testSalesCreation() {
  console.log('Testing sales creation functionality...');
  
  try {
    // Login as cashier
    console.log('1. Logging in as cashier...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/cashier-login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    const token = loginResponse.data.token;
    console.log('Cashier login: SUCCESS');
    
    // Get available products
    console.log('2. Getting available products...');
    const productsResponse = await axios.get('http://localhost:3001/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`Products available: ${productsResponse.data.length}`);
    if (productsResponse.data.length > 0) {
      const firstProduct = productsResponse.data[0];
      console.log('First product:', firstProduct.name, 'ID:', firstProduct.id);
    }
    
    // Get available customers
    console.log('3. Getting available customers...');
    const customersResponse = await axios.get('http://localhost:3001/api/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`Customers available: ${customersResponse.data.length}`);
    if (customersResponse.data.length > 0) {
      const firstCustomer = customersResponse.data[0];
      console.log('First customer:', firstCustomer.name, 'ID:', firstCustomer.id);
    }
    
    // Test sales creation API
    if (productsResponse.data.length > 0 && customersResponse.data.length > 0) {
      console.log('4. Testing sales creation API...');
      
      const saleData = {
        customerId: customersResponse.data[0].id,
        items: [
          {
            productId: productsResponse.data[0].id,
            quantity: 1,
            unitPrice: productsResponse.data[0].price || 1000,
            totalPrice: productsResponse.data[0].price || 1000
          }
        ],
        paymentMethod: 'CASH',
        totalAmount: productsResponse.data[0].price || 1000,
        notes: 'Test sale from API'
      };
      
      try {
        const saleResponse = await axios.post('http://localhost:3001/api/sales', saleData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Sales creation API: SUCCESS');
        console.log('Sale ID:', saleResponse.data.id);
        
        // Clean up - delete test sale
        await axios.delete(`http://localhost:3001/api/sales/${saleResponse.data.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Test sale cleaned up');
        
      } catch (saleError: any) {
        console.log('Sales creation API ERROR:', saleError.response?.status, saleError.response?.data?.error);
        console.log('Error details:', saleError.response?.data);
      }
    } else {
      console.log('Cannot test sales creation - no products or customers available');
    }
    
    console.log('\nSales API tests completed.');
    
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

testSalesCreation();
