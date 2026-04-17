import axios from 'axios';

async function debugQuantityCalculation() {
  console.log('=== Debug Dona/Qop Quantity Calculation ===');
  
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
      
      // 2. Get products to check unitsPerBag
      console.log('2. Get products with unitsPerBag...');
      const productsResponse = await axios.get('http://localhost:5002/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.data && productsResponse.data.length > 0) {
        console.log('✅ Products loaded');
        
        // Check first few products
        const sampleProducts = productsResponse.data.slice(0, 5);
        sampleProducts.forEach((product: any, index: number) => {
          console.log(`\nProduct ${index + 1}:`);
          console.log('  Name:', product.name);
          console.log('  ID:', product.id);
          console.log('  Units Per Bag:', product.unitsPerBag);
          console.log('  Price Per Bag:', product.pricePerBag);
          console.log('  Current Stock:', product.currentStock);
          console.log('  Category ID:', product.categoryId);
          console.log('  Size ID:', product.sizeId);
        });
        
        // 3. Test different quantity calculations
        console.log('\n3. Testing quantity calculations...');
        
        const testProduct = sampleProducts[0];
        const testQuantity = 1; // 1 qop
        
        console.log('\nTest calculations:');
        console.log('Selected product:', testProduct.name);
        console.log('Units per bag:', testProduct.unitsPerBag);
        console.log('Test quantity (qop):', testQuantity);
        
        // Calculate pieces
        const totalPieces = testQuantity * testProduct.unitsPerBag;
        console.log('Total pieces:', totalPieces);
        
        // Calculate back to bags
        const totalBags = Math.ceil(totalPieces / testProduct.unitsPerBag);
        console.log('Total bags (rounded up):', totalBags);
        
        // Price calculations
        const pricePerBag = testProduct.pricePerBag || 1000;
        const pricePerPiece = pricePerBag / testProduct.unitsPerBag;
        console.log('Price per bag:', pricePerBag);
        console.log('Price per piece:', pricePerPiece);
        
        const totalPrice = testQuantity * pricePerBag;
        console.log('Total price:', totalPrice);
        
        // 4. Test sale creation with different quantity formats
        console.log('\n4. Testing sale creation with different quantity formats...');
        
        const customersResponse = await axios.get('http://localhost:5002/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (customersResponse.data && customersResponse.data.length > 0) {
          const firstCustomer = customersResponse.data[0];
          
          const saleVariants = [
            {
              name: 'Sale with quantity as qop',
              data: {
                customerId: firstCustomer.id,
                items: [{
                  productId: testProduct.id,
                  quantity: testQuantity, // 1 qop
                  pricePerBag: pricePerBag,
                  totalPrice: totalPrice,
                  saleType: 'bag' // qop sifatida
                }],
                totalAmount: totalPrice,
                paymentMethod: 'CASH',
                paymentDetails: {
                  uzs: totalPrice,
                  usd: 0,
                  click: 0
                },
                notes: 'Test sale - qop format'
              }
            },
            {
              name: 'Sale with quantity as dona',
              data: {
                customerId: firstCustomer.id,
                items: [{
                  productId: testProduct.id,
                  quantity: totalPieces, // dona sifatida
                  pricePerBag: pricePerPiece, // dona narxi
                  totalPrice: totalPieces * pricePerPiece,
                  saleType: 'piece' // dona sifatida
                }],
                totalAmount: totalPieces * pricePerPiece,
                paymentMethod: 'CASH',
                paymentDetails: {
                  uzs: totalPieces * pricePerPiece,
                  usd: 0,
                  click: 0
                },
                notes: 'Test sale - dona format'
              }
            }
          ];
          
          // Test each variant
          for (const variant of saleVariants) {
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
              console.log('Items created:', saleResponse.data.items?.length || 0);
              
              // Check if items have correct quantities
              if (saleResponse.data.items) {
                saleResponse.data.items.forEach((item: any, index: number) => {
                  console.log(`Item ${index + 1}:`);
                  console.log('  Quantity:', item.quantity);
                  console.log('  Price per bag:', item.pricePerBag);
                  console.log('  Subtotal:', item.subtotal);
                  console.log('  Sale type:', item.saleType);
                });
              }
              
            } catch (error: any) {
              console.log(`❌ Sale failed: ${variant.name}`);
              console.log('Error:', error.message);
              
              if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
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
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
  
  console.log('\n=== Debug Complete ===');
}

debugQuantityCalculation();
