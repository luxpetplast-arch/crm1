import axios from 'axios';

async function testSaleCreation() {
  try {
    console.log('🔑 Login qilinmoqda...');
    // 1. Login
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token olindi');
    
    // 2. Mijozlarni olish
    console.log('👥 Mijozlar olinmoqda...');
    const customersResponse = await axios.get('http://localhost:5001/api/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (customersResponse.data.length === 0) {
      console.log('❌ Mijozlar yo\'q');
      return;
    }
    
    const customerId = customersResponse.data[0].id;
    console.log('✅ Mijoz ID:', customerId);
    
    // 3. Mahsulotlarni olish
    console.log('📦 Mahsulotlar olinmoqda...');
    const productsResponse = await axios.get('http://localhost:5001/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (productsResponse.data.length === 0) {
      console.log('❌ Mahsulotlar yo\'q');
      return;
    }
    
    const product = productsResponse.data[0];
    console.log('✅ Mahsulot:', product.name, '(ID:', product.id, ')');
    console.log('📊 Mahsulot stock:', product.currentStock);
    console.log('📊 Mahsulot unitsPerBag:', product.unitsPerBag);
    
    // 4. Savdo yaratish
    console.log('💰 Savdo yaratilmoqda...');
    const saleData = {
      customerId: customerId,
      items: [
        {
          productId: product.id,
          quantity: 1,
          pricePerBag: 100
        }
      ],
      totalAmount: 100,
      paidAmount: 100,
      currency: 'USD',
      paymentStatus: 'PAID',
      paymentDetails: {
        usd: 100,
        uzs: 0,
        click: 0
      }
    };
    
    console.log('📤 Yuborilayotgan data:', JSON.stringify(saleData, null, 2));
    
    const saleResponse = await axios.post('http://localhost:5001/api/sales', saleData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Savdo muvaffaqiyatli yaratildi!');
    console.log('📋 Savdo ID:', saleResponse.data.id);
    console.log('📋 Avtomatlashtirish status:', saleResponse.data.automationStatus);
    
  } catch (error) {
    console.error('❌ XATOLIK:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Ma\'lumot:', error.response.data);
    }
    if (error.stack) {
      console.error('🔧 Stack:', error.stack);
    }
  }
}

testSaleCreation();
