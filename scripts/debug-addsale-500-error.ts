import axios from 'axios';

async function debugAddSale500Error() {
  console.log('=== Debug AddSale 500 Error ===');
  
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
        
        // 3. Test different sale data formats (mimicking AddSale component)
        console.log('\n3. Testing AddSale format...');
        
        const saleDataVariants = [
          {
            name: 'AddSale format - with all fields',
            data: {
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
            }
          },
          {
            name: 'AddSale format - minimal',
            data: {
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
              isKocha: false
            }
          },
          {
            name: 'Sales.tsx format (working)',
            data: {
              customerId: firstCustomer.id,
              items: [{
                productId: firstProduct.id,
                quantity: 1,
                pricePerBag: firstProduct.pricePerBag,
                totalPrice: firstProduct.pricePerBag
              }],
              totalAmount: firstProduct.pricePerBag,
              paymentMethod: 'CASH',
              paymentDetails: {
                uzs: firstProduct.pricePerBag,
                usd: 0,
                click: 0
              },
              notes: 'Test sale - working format'
            }
          }
        ];
        
        // Test each variant
        for (const variant of saleDataVariants) {
          console.log(`\n🧪 Testing: ${variant.name}`);
          console.log('Sale data:', JSON.stringify(variant.data, null, 2));
          
          try {
            const saleResponse = await axios.post('http://localhost:5002/api/sales', variant.data, {
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
                console.log(`Item ${index + 1}:`);
                console.log('  Product:', item.product?.name || 'Unknown');
                console.log('  Quantity:', item.quantity);
                console.log('  Price per bag:', item.pricePerBag);
                console.log('  Subtotal:', item.subtotal);
                console.log('  Sale type:', item.saleType);
              });
            }
            
            break; // Stop on first success
            
          } catch (error: any) {
            console.log(`❌ Sale failed: ${variant.name}`);
            console.log('Error:', error.message);
            
            if (error.response) {
              console.log('Status:', error.response.status);
              console.log('Response data:', error.response.data);
              
              if (error.response.status === 500) {
                console.log('🔍 500 Error details:');
                console.log('Request data that caused 500:', variant.data);
                
                // Try to parse the error response
                if (error.response.data) {
                  console.log('Error response:', error.response.data);
                  
                  // Check if it's a validation error
                  if (error.response.data.error) {
                    console.log('Error message:', error.response.data.error);
                  }
                  
                  // Check if it's a Prisma error
                  if (error.response.data.code) {
                    console.log('Error code:', error.response.data.code);
                  }
                }
              }
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
    console.error('❌ Debug failed:', error);
  }
  
  console.log('\n=== Debug Complete ===');
}

debugAddSale500Error();
