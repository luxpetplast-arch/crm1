const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Login qilish
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Login xatolik:', error.response?.data || error.message);
    throw error;
  }
}

// Haydovchi yaratish
async function createDriver(token) {
  try {
    console.log('\n🚗 Haydovchi yaratilmoqda...');
    const response = await axios.post(
      `${API_URL}/drivers`,
      {
        name: 'Sardor Aliyev',
        phone: '+998905556677',
        licenseNumber: 'AB1234567',
        vehicleNumber: '01A123BC'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Haydovchi yaratildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Haydovchi yaratish xatolik:', error.response?.data || error.message);
    return null;
  }
}

// Mijoz yaratish
async function createCustomer(token) {
  try {
    console.log('\n👤 Mijoz yaratilmoqda...');
    const response = await axios.post(
      `${API_URL}/customers`,
      {
        name: 'Test Mijoz',
        phone: '+998901234567',
        address: 'Toshkent, Chilonzor',
        pricePerBag: 25.00,
        balance: -150 // Oldingi qarz
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Mijoz yaratildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Mijoz yaratish xatolik:', error.response?.data || error.message);
    return null;
  }
}

// Mahsulotlarni olish
async function getProducts(token) {
  try {
    console.log('\n📦 Mahsulotlar ro\'yxati:');
    const response = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Jami ${response.data.length} ta mahsulot topildi`);
    response.data.slice(0, 5).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - $${product.pricePerBag}/qop`);
    });
    return response.data;
  } catch (error) {
    console.error('❌ Mahsulotlar olish xatolik:', error.response?.data || error.message);
    return [];
  }
}

// Sotuv yaratish
async function createSale(token, customerId, driverId, products) {
  try {
    console.log('\n💰 Sotuv yaratilmoqda...');
    
    const items = products.map(p => ({
      productId: p.id,
      productName: p.name,
      quantity: p.quantity,
      pricePerBag: p.pricePerBag,
      subtotal: p.quantity * p.pricePerBag
    }));
    
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const paidAmount = totalAmount * 0.8; // 80% to'landi
    const debtAmount = totalAmount - paidAmount;
    
    const response = await axios.post(
      `${API_URL}/sales`,
      {
        customerId,
        driverId, // Haydovchi ID
        items,
        totalAmount,
        paidAmount,
        debtAmount,
        paymentDetails: {
          uzs: '150000',  // 150,000 so'm
          usd: '4.00',    // $4.00
          click: '10000'  // 10,000 so'm
        },
        factoryShare: 15000,  // Zavod to'laydi
        customerShare: 10000  // Mijoz to'laydi
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Sotuv yaratildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Sotuv yaratish xatolik:', error.response?.data || error.message);
    return null;
  }
}

// Barcha haydovchilarni olish
async function getDrivers(token) {
  try {
    console.log('\n📋 Haydovchilar ro\'yxati:');
    const response = await axios.get(`${API_URL}/drivers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Jami ${response.data.length} ta haydovchi topildi`);
    response.data.forEach((driver, index) => {
      console.log(`  ${index + 1}. ${driver.name} - ${driver.phone} (${driver.status})`);
    });
    return response.data;
  } catch (error) {
    console.error('❌ Haydovchilar olish xatolik:', error.response?.data || error.message);
    return [];
  }
}

// Asosiy test funksiyasi
async function runTest() {
  console.log('🚀 TEST BOSHLANDI - Haydovchi bilan sotuv\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Login
    console.log('\n1️⃣ Login qilish...');
    const token = await login();
    console.log('✅ Login muvaffaqiyatli');
    
    // 2. Haydovchi yaratish
    console.log('\n2️⃣ Haydovchi yaratish...');
    let driver = await createDriver(token);
    if (!driver) {
      console.log('⚠️ Haydovchi yaratilmadi, mavjud haydovchilarni olish...');
      const drivers = await getDrivers(token);
      if (drivers.length === 0) {
        console.error('❌ Haydovchilar topilmadi!');
        return;
      }
      driver = drivers[0];
    }
    
    // 3. Mijoz yaratish
    console.log('\n3️⃣ Mijoz yaratish...');
    const customer = await createCustomer(token);
    if (!customer) {
      console.error('❌ Mijoz yaratilmadi!');
      return;
    }
    
    // 4. Mahsulotlarni olish
    console.log('\n4️⃣ Mahsulotlarni olish...');
    const products = await getProducts(token);
    
    if (products.length < 3) {
      console.error('❌ Kamida 3 ta mahsulot kerak!');
      return;
    }
    
    // 5. Sotuv yaratish
    console.log('\n5️⃣ Sotuv yaratish (haydovchi bilan)...');
    const sale = await createSale(token, customer.id, driver.id, [
      { ...products[0], quantity: 2 },
      { ...products[1], quantity: 3 },
      { ...products[2], quantity: 5 }
    ]);
    
    if (!sale) {
      console.error('❌ Sotuv yaratilmadi!');
      return;
    }
    
    // 6. Natijalar
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST MUVAFFAQIYATLI YAKUNLANDI!\n');
    console.log('📊 NATIJALAR:');
    console.log('  🚗 Haydovchi:', driver.name, '-', driver.phone);
    console.log('  👤 Mijoz:', customer.name);
    console.log('  📦 Mahsulotlar: 3 ta');
    console.log('  💰 Jami summa: $' + sale.totalAmount.toFixed(2));
    console.log('  💵 To\'landi: $' + sale.paidAmount.toFixed(2));
    console.log('  📉 Qarz: $' + sale.debtAmount.toFixed(2));
    console.log('  🚚 Zavod to\'laydi: 15,000 so\'m');
    console.log('  👤 Mijoz to\'laydi: 10,000 so\'m');
    console.log('\n🖨️ Endi saytga kiring va chek chiqaring!');
    console.log('   URL: http://localhost:5173/sales');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ TEST XATOLIK:', error.message);
  }
}

// Testni ishga tushirish
runTest();
