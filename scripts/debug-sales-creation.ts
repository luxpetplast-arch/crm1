import axios from 'axios';

async function debugSalesCreation() {
  console.log('=== Sotuv Yaratish Debug Test ===');
  
  try {
    // 1. Login as cashier
    console.log('1. Kassir sifatida login qilish...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      login: 'cashier',
      password: 'cashier'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Kassir login muvaffaqiyatli');
      const token = loginResponse.data.token;
      
      // 2. Get products
      console.log('2. Mahsulotlarni olish...');
      const productsResponse = await axios.get('http://localhost:5002/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.data && productsResponse.data.length > 0) {
        console.log('✅ Mahsulotlar olindi:', productsResponse.data.length, 'ta');
        
        // 3. Get customers
        console.log('3. Mijozlarni olish...');
        const customersResponse = await axios.get('http://localhost:5002/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (customersResponse.data && customersResponse.data.length > 0) {
          console.log('✅ Mijozlar olindi:', customersResponse.data.length, 'ta');
          
          // 4. Create test sale
          console.log('4. Test sotuv yaratish...');
          
          const firstProduct = productsResponse.data[0];
          const firstCustomer = customersResponse.data[0];
          
          console.log('Tanlangan mahsulot:', firstProduct.name);
          console.log('Tanlangan mijoz:', firstCustomer.name);
          
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
            notes: 'Debug test sotuv'
          };
          
          console.log('Sotuv ma\'lumotlari:', JSON.stringify(saleData, null, 2));
          
          const saleResponse = await axios.post('http://localhost:5002/api/sales', saleData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (saleResponse.data) {
            console.log('✅ Sotuv muvaffaqiyatli yaratildi!');
            console.log('Sotuv ID:', saleResponse.data.id);
            console.log('Sotuv jami:', saleResponse.data.totalAmount);
            console.log('To\'langan:', saleResponse.data.paidAmount);
            console.log('Qarz:', saleResponse.data.debtAmount);
          } else {
            console.log('❌ Sotuv yaratishda xatolik');
          }
          
        } else {
          console.log('❌ Mijozlar olinmadi');
        }
      } else {
        console.log('❌ Mahsulotlar olinmadi');
      }
    } else {
      console.log('❌ Login xatolik:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Debug testda xatolik:', error);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
  
  console.log('=== Debug Test Tugadi ===');
}

debugSalesCreation();
