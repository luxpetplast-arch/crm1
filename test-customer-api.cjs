const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function testCustomerAPI() {
  console.log('🧪 Customer API testi boshlanmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // Customer larni olish
    console.log('\n👥 Customer larni tekshirilmoqda...');
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

    if (customers.length > 0) {
      const firstCustomer = customers[0];
      console.log('\n👤 Birinchi mijoz ma\'lumotlari:');
      console.log(`   ID: ${firstCustomer.id}`);
      console.log(`   Name: ${firstCustomer.name}`);
      console.log(`   Balance: ${firstCustomer.balance || 0}`);
      console.log(`   Balance USD: ${firstCustomer.balanceUSD || 0}`);
      console.log(`   Balance UZS: ${firstCustomer.balanceUZS || 0}`);
      console.log(`   Debt: ${firstCustomer.debt || 0}`);
      console.log(`   Debt USD: ${firstCustomer.debtUSD || 0}`);
      console.log(`   Debt UZS: ${firstCustomer.debtUZS || 0}`);
      console.log(`   Category: ${firstCustomer.category}`);
      console.log(`   Phone: ${firstCustomer.phone}`);
    }

    // Bitta mijozni ID bo'yicha olish
    if (customers.length > 0) {
      console.log('\n🔍 Bitta mijozni ID bo\'yicha tekshirish...');
      const singleCustomerResponse = await axios.get(
        `${API_BASE}/customers/${customers[0].id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const singleCustomer = singleCustomerResponse.data;
      console.log('\n👤 ID bo\'yicha mijoz ma\'lumotlari:');
      console.log(`   ID: ${singleCustomer.id}`);
      console.log(`   Name: ${singleCustomer.name}`);
      console.log(`   Balance: ${singleCustomer.balance || 0}`);
      console.log(`   Balance USD: ${singleCustomer.balanceUSD || 0}`);
      console.log(`   Balance UZS: ${singleCustomer.balanceUZS || 0}`);
      console.log(`   Debt: ${singleCustomer.debt || 0}`);
      console.log(`   Debt USD: ${singleCustomer.debtUSD || 0}`);
      console.log(`   Debt UZS: ${singleCustomer.debtUZS || 0}`);
      console.log(`   Category: ${singleCustomer.category}`);
      console.log(`   Phone: ${singleCustomer.phone}`);
    }

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Xatolik tafsilotlari:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Testni ishga tushirish
testCustomerAPI();
