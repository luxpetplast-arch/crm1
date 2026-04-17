import axios from 'axios';

async function testSalesAfterFix() {
  console.log('=== Test Sales After Price Fix ===');
  
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
      
      // 2. Get products to verify prices
      console.log('2. Get products with updated prices...');
      const productsResponse = await axios.get('http://localhost:5002/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.data && productsResponse.data.length > 0) {
        console.log('✅ Products loaded');
        
        // Check first few products
        const sampleProducts = productsResponse.data.slice(0, 3);
        sampleProducts.forEach((product: any, index: number) => {
          console.log(`\nProduct ${index + 1}:`);
          console.log('  Name:', product.name);
          console.log('  Price per bag:', product.pricePerBag);
          console.log('  Price per piece:', product.pricePerPiece);
          console.log('  Units per bag:', product.unitsPerBag);
        });
        
        // 3. Test sale creation
        console.log('\n3. Testing sale creation with updated prices...');
        
        const customersResponse = await axios.get('http://localhost:5002/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (customersResponse.data && customersResponse.data.length > 0) {
          const firstProduct = sampleProducts[0];
          const firstCustomer = customersResponse.data[0];
          
          console.log('\nSelected product:', firstProduct.name);
          console.log('Price per bag:', firstProduct.pricePerBag);
          console.log('Price per piece:', firstProduct.pricePerPiece);
          
          // Test sale with 1 qop
          const saleData = {
            customerId: firstCustomer.id,
            items: [{
              productId: firstProduct.id,
              quantity: 1, // 1 qop
              pricePerBag: firstProduct.pricePerBag,
              totalPrice: firstProduct.pricePerBag * 1,
              saleType: 'bag'
            }],
            totalAmount: firstProduct.pricePerBag * 1,
            paymentMethod: 'CASH',
            paymentDetails: {
              uzs: firstProduct.pricePerBag * 1,
              usd: 0,
              click: 0
            },
            notes: 'Test sale after price fix'
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
            console.log('Items created:', saleResponse.data.items?.length || 0);
            
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
            
            console.log('\n🎉 Sales functionality is working correctly!');
            
          } catch (error: any) {
            console.log('❌ Sale failed:', error.message);
            
            if (error.response) {
              console.log('Status:', error.response.status);
              console.log('Data:', error.response.data);
            }
          }
          
        } else {
          console.log('❌ No customers found');
        }
        
      } else {
        console.log('❌ No products found');
      }
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n=== Test Complete ===');
}

testSalesAfterFix();
