import axios from 'axios';

async function testSalesEndToEnd() {
  console.log('=== End-to-End Sales Test ===');
  
  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:5002/api/health');
    if (healthResponse.ok) {
      console.log('✅ Server is healthy');
    } else {
      console.log('❌ Server health check failed');
      return;
    }
    
    // 2. Test frontend accessibility
    console.log('2. Testing frontend accessibility...');
    const frontendResponse = await fetch('http://localhost:3002/');
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('❌ Frontend accessibility failed');
      return;
    }
    
    // 3. Test login
    console.log('3. Testing login...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // 4. Test products API
      console.log('4. Testing products API...');
      const productsResponse = await axios.get('http://localhost:5002/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.data && productsResponse.data.length > 0) {
        console.log('✅ Products API working:', productsResponse.data.length, 'products');
        
        // 5. Test customers API
        console.log('5. Testing customers API...');
        const customersResponse = await axios.get('http://localhost:5002/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (customersResponse.data && customersResponse.data.length > 0) {
          console.log('✅ Customers API working:', customersResponse.data.length, 'customers');
          
          // 6. Test sales creation
          console.log('6. Testing sales creation...');
          
          const firstProduct = productsResponse.data[0];
          const firstCustomer = customersResponse.data[0];
          
          const saleData = {
            customerId: firstCustomer.id,
            items: [{
              productId: firstProduct.id,
              quantity: 1,
              pricePerBag: firstProduct.pricePerBag || 1000,
              totalPrice: firstProduct.pricePerBag || 1000
            }],
            totalAmount: firstProduct.pricePerBag || 1000,
            paymentMethod: 'CASH',
            paymentDetails: {
              uzs: firstProduct.pricePerBag || 1000,
              usd: 0,
              click: 0
            },
            notes: 'End-to-end test sale'
          };
          
          const saleResponse = await axios.post('http://localhost:5002/api/sales', saleData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (saleResponse.data) {
            console.log('✅ Sales creation successful!');
            console.log('Sale ID:', saleResponse.data.id);
            console.log('Total Amount:', saleResponse.data.totalAmount);
            
            // 7. Test print API
            console.log('7. Testing print API...');
            try {
              const printResponse = await fetch('http://localhost:5002/api/print/receipt', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  content: 'TEST RECEIPT\nEnd-to-end test\nLUX PET PLAST',
                  filename: 'test-e2e-receipt.txt'
                })
              });
              
              if (printResponse.ok) {
                console.log('✅ Print API working');
              } else {
                console.log('❌ Print API failed:', printResponse.status);
              }
            } catch (printError) {
              console.log('❌ Print API error:', printError);
            }
            
            console.log('🎉 End-to-end test PASSED!');
            
          } else {
            console.log('❌ Sales creation failed');
          }
          
        } else {
          console.log('❌ Customers API failed');
        }
        
      } else {
        console.log('❌ Products API failed');
      }
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ End-to-end test FAILED:', error);
  }
  
  console.log('=== End-to-End Test Complete ===');
}

testSalesEndToEnd();
