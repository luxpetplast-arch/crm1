import axios from 'axios';

async function debugSales500Error() {
  console.log('=== Debug 500 Sales Error ===');
  
  try {
    // 1. Login as cashier
    console.log('1. Logging in as cashier...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // 2. Get products
      console.log('2. Getting products...');
      const productsResponse = await axios.get('http://localhost:5002/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.data && productsResponse.data.length > 0) {
        console.log('✅ Products loaded:', productsResponse.data.length, 'items');
        
        // 3. Get customers
        console.log('3. Getting customers...');
        const customersResponse = await axios.get('http://localhost:5002/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (customersResponse.data && customersResponse.data.length > 0) {
          console.log('✅ Customers loaded:', customersResponse.data.length, 'items');
          
          // 4. Create test sale with different data
          console.log('4. Creating test sale with detailed logging...');
          
          const firstProduct = productsResponse.data[0];
          const firstCustomer = customersResponse.data[0];
          
          console.log('Selected product:', {
            id: firstProduct.id,
            name: firstProduct.name,
            pricePerBag: firstProduct.pricePerBag,
            unitsPerBag: firstProduct.unitsPerBag,
            categoryId: firstProduct.categoryId,
            sizeId: firstProduct.sizeId
          });
          
          console.log('Selected customer:', {
            id: firstCustomer.id,
            name: firstCustomer.name,
            balanceUZS: firstCustomer.balanceUZS,
            balanceUSD: firstCustomer.balanceUSD
          });
          
          // Try different sale data formats
          const saleDataVariants = [
            {
              name: 'Minimal sale data',
              data: {
                customerId: firstCustomer.id,
                items: [{
                  productId: firstProduct.id,
                  quantity: 1,
                  pricePerBag: 1000,
                  totalPrice: 1000
                }],
                totalAmount: 1000,
                paymentMethod: 'CASH',
                paymentDetails: {
                  uzs: 1000,
                  usd: 0,
                  click: 0
                },
                notes: 'Test sale - minimal'
              }
            },
            {
              name: 'Complete sale data',
              data: {
                customerId: firstCustomer.id,
                items: [{
                  productId: firstProduct.id,
                  quantity: 1,
                  pricePerBag: firstProduct.pricePerBag || 1000,
                  totalPrice: firstProduct.pricePerBag || 1000,
                  saleType: 'bag'
                }],
                totalAmount: firstProduct.pricePerBag || 1000,
                paymentMethod: 'CASH',
                paymentDetails: {
                  uzs: firstProduct.pricePerBag || 1000,
                  usd: 0,
                  click: 0
                },
                notes: 'Test sale - complete',
                exchangeRate: 12500,
                currency: 'UZS'
              }
            }
          ];
          
          // Test each variant
          for (const variant of saleDataVariants) {
            console.log(`\n🧪 Testing variant: ${variant.name}`);
            console.log('Sale data:', JSON.stringify(variant.data, null, 2));
            
            try {
              const saleResponse = await axios.post('http://localhost:5002/api/sales', variant.data, {
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                timeout: 10000
              });
              
              console.log('✅ Sale creation successful!');
              console.log('Response:', saleResponse.data);
              break; // Stop on first success
              
            } catch (error: any) {
              console.log(`❌ Variant ${variant.name} failed:`, error.message);
              
              if (error.response) {
                console.log('Response status:', error.response.status);
                console.log('Response data:', error.response.data);
                console.log('Response headers:', error.response.headers);
              }
              
              if (error.response?.status === 500) {
                console.log('🔍 500 Error detected for variant:', variant.name);
                console.log('Request data that caused 500:', variant.data);
              }
            }
          }
          
        } else {
          console.log('❌ No customers found');
        }
        
      } else {
        console.log('❌ No products found');
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
  
  console.log('\n=== Debug Complete ===');
}

debugSales500Error();
