import axios from 'axios';

async function debugFrontendSaleData() {
  console.log('=== Debug Frontend Sale Data ===');
  
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
      
      // 3. Get customers
      console.log('3. Getting customers...');
      const customersResponse = await axios.get('http://localhost:5002/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.data && customersResponse.data) {
        const firstProduct = productsResponse.data[0];
        const firstCustomer = customersResponse.data[0];
        
        // 4. Test with exact frontend data structure
        console.log('4. Testing with exact frontend data structure...');
        
        // Simulate the exact data structure from frontend
        const form = {
          customerId: firstCustomer.id,
          isKocha: false,
          manualCustomerName: '',
          manualCustomerPhone: '',
          items: [{
            productId: firstProduct.id,
            productName: firstProduct.name,
            quantity: '1',
            pricePerBag: firstProduct.pricePerBag?.toString() || '1000',
            pricePerBagDisplay: firstProduct.pricePerBag?.toString() || '1000',
            subtotal: firstProduct.pricePerBag || 1000,
            saleType: 'bag',
            pricePerPiece: (firstProduct.pricePerBag || 1000) / (firstProduct.unitsPerBag || 1000),
            unitsPerBag: firstProduct.unitsPerBag || 1000,
            warehouse: firstProduct.warehouse,
            subType: firstProduct.subType
          }],
          paidUZS: '0',
          paidUSD: '0',
          paidCLICK: (firstProduct.pricePerBag || 1000).toString(),
          paymentType: 'cash',
          currency: 'UZS'
        };
        
        // Calculate totals like frontend does
        const totalAmountInUSD = form.items.reduce((sum, item) => sum + item.subtotal, 0);
        const totalAmount = form.currency === 'UZS' 
          ? totalAmountInUSD * 12500
          : totalAmountInUSD;
        
        const calculatePaidInSelectedCurrency = () => {
          const paidUZS = parseFloat(form.paidUZS) || 0;
          const paidUSD = parseFloat(form.paidUSD) || 0;
          const paidCLICK = parseFloat(form.paidCLICK) || 0;
          
          if (form.currency === 'UZS') {
            return paidUZS + paidCLICK + (paidUSD * 12500);
          }
          return paidUSD + (paidUZS / 12500) + (paidCLICK / 12500);
        };
        
        const totalPaid = calculatePaidInSelectedCurrency();
        
        // Create exact frontend sale data
        const finalSaleData = {
          customerId: form.isKocha ? null : form.customerId,
          items: form.items.map((item: any) => ({
            productId: item.productId,
            quantity: parseFloat(item.quantity) || 0,
            pricePerBag: parseFloat(item.pricePerBag) || 0,
            pricePerPiece: parseFloat(item.pricePerPiece) || 0,
            subtotal: parseFloat(item.subtotal) || 0,
            saleType: item.saleType || 'bag'
          })),
          totalAmount: totalAmountInUSD,
          paidAmount: totalPaid,
          paymentDetails: {
            uzs: form.paidUZS,
            usd: form.paidUSD,
            click: form.paidCLICK
          },
          currency: form.currency,
          isKocha: form.isKocha,
          manualCustomerName: form.isKocha ? form.manualCustomerName : null,
          manualCustomerPhone: form.isKocha ? form.manualCustomerPhone : null
        };
        
        console.log('Frontend sale data:', JSON.stringify(finalSaleData, null, 2));
        
        try {
          const saleResponse = await axios.post('http://localhost:5002/api/sales', finalSaleData, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          console.log('✅ Frontend-style sale creation successful!');
          console.log('Response:', saleResponse.data);
          
        } catch (error: any) {
          console.log('❌ Frontend-style sale failed:', error.message);
          
          if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
            console.log('Response headers:', error.response.headers);
          }
          
          if (error.response?.status === 500) {
            console.log('🔍 500 Error detected with frontend data!');
            console.log('Request data that caused 500:', finalSaleData);
          }
        }
        
      } else {
        console.log('❌ Failed to load products or customers');
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
  
  console.log('\n=== Debug Complete ===');
}

debugFrontendSaleData();
