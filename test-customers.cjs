const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function testCustomers() {
  console.log('🧪 Mijozlar testi boshlanmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // 1. Mijozlarni olish
    console.log('\n👥 Mijozlar yuklanmoqda...');
    const customersResponse = await axios.get(
      `${API_BASE}/customers`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const customers = customersResponse.data;
    console.log(`📊 Jami mijozlar: ${customers.length}`);

    if (customers.length === 0) {
      console.log('❌ Mijozlar yo\'q! Test mijozlar yaratamiz...');
      
      // Test mijozlar yaratish
      const testCustomers = [
        {
          name: 'Test Mijoz 1',
          phone: '+998901234567',
          email: 'test1@example.com',
          address: 'Test manzil 1',
          category: 'NORMAL'
        },
        {
          name: 'VIP Mijoz',
          phone: '+998907654321',
          email: 'vip@example.com',
          address: 'VIP manzil',
          category: 'VIP'
        },
        {
          name: 'Qarzdor Mijoz',
          phone: '+998911111111',
          email: 'debt@example.com',
          address: 'Qarzdor manzil',
          category: 'RISK'
        }
      ];

      for (const customer of testCustomers) {
        try {
          const response = await axios.post(
            `${API_BASE}/customers`,
            customer,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log(`✅ Mijoz yaratildi: ${response.data.name}`);
        } catch (error) {
          console.error(`❌ Mijoz yaratish xatosi:`, error.response?.data || error.message);
        }
      }

      // Qayta yuklash
      const retryResponse = await axios.get(
        `${API_BASE}/customers`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const retryCustomers = retryResponse.data;
      console.log(`📊 Yangi mijozlar soni: ${retryCustomers.length}`);
      
      retryCustomers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.name} - ${customer.phone} - ${customer.category}`);
        console.log(`      Qarz: $${customer.debt || 0} | Balance: $${customer.balance || 0}`);
      });

    } else {
      console.log('📋 Mavjud mijozlar:');
      customers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.name} - ${customer.phone} - ${customer.category}`);
        console.log(`      Qarz: $${customer.debt || 0} | Balance: $${customer.balance || 0}`);
      });
    }

    // 2. Kategoriyalar bo'yicha filtr
    console.log('\n🏷️ Kategoriyalar bo\'yicha filtr:');
    const categories = ['NORMAL', 'VIP', 'RISK'];
    
    for (const category of categories) {
      try {
        const response = await axios.get(
          `${API_BASE}/customers?category=${category}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log(`   ${category}: ${response.data.length} mijoz`);
      } catch (error) {
        console.error(`❌ ${category} filtr xatosi:`, error.response?.data || error.message);
      }
    }

    // 3. Qarzdor mijozlar
    console.log('\n💳 Qarzdor mijozlar:');
    try {
      const debtorsResponse = await axios.get(
        `${API_BASE}/customers?hasDebt=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log(`   Jami qarzdorlar: ${debtorsResponse.data.length}`);
      debtorsResponse.data.forEach((debtor, index) => {
        console.log(`   ${index + 1}. ${debtor.name} - Qarz: $${debtor.debt}`);
      });
    } catch (error) {
      console.error('❌ Qarzdorlarni olish xatosi:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
  }
}

// Testni ishga tushirish
testCustomers();
