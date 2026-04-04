const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

// Test data
const testData = [
  {
    amount: 1000000,
    currency: 'UZS',
    type: 'CASH',
    description: 'Test kassa kirim - UZS'
  },
  {
    amount: 100,
    currency: 'USD', 
    type: 'CASH',
    description: 'Test kassa kirim - USD'
  },
  {
    amount: 500000,
    currency: 'UZS',
    type: 'CLICK',
    description: 'Test kassa kirim - Click'
  }
];

async function testCashboxAdd() {
  console.log('🧪 Kassaga pul qo\'shish testi boshlanmoqda...\n');

  try {
    // Avval login qilamiz
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // Kassaga pul qo'shish testlari
    for (const data of testData) {
      try {
        console.log(`\n💰 Kassaga qo\'shilmoqda: ${data.amount} ${data.currency} (${data.type})`);
        
        const response = await axios.post(
          `${API_BASE}/cashbox/add`,
          data,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Muvaffaqiyatli qo\'shildi:', response.data.message);
      } catch (error) {
        console.error('❌ Xatolik:', error.response?.data || error.message);
      }
    }

    // Kassa holatini tekshiramiz
    console.log('\n📊 Kassa holati tekshirilmoqda...');
    const summaryResponse = await axios.get(
      `${API_BASE}/cashbox/summary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const summary = summaryResponse.data;
    console.log('📈 Kassa statistikasi:');
    console.log(`   Jami balans: $${summary.totalBalance.toFixed(2)}`);
    console.log(`   Bugun kirim: $${summary.todayIncome.toFixed(2)}`);
    console.log(`   Bugun chiqim: $${summary.todayExpense.toFixed(2)}`);
    console.log(`   Oylik kirim: $${summary.monthlyIncome.toFixed(2)}`);
    console.log(`   Oylik chiqim: $${summary.monthlyExpense.toFixed(2)}`);
    console.log(`   Valyuta bo'yicha:`);
    console.log(`     Naqd UZS: ${summary.byCurrency.cashUZS.toLocaleString()} so'm`);
    console.log(`     Naqd USD: $${summary.byCurrency.cashUSD.toFixed(2)}`);
    console.log(`     Click UZS: ${summary.byCurrency.clickUZS.toLocaleString()} so'm`);
    console.log(`     Karta USD: $${summary.byCurrency.cardUSD.toFixed(2)}`);

    // Oxirgi tranzaksiyalarni ko'ramiz
    console.log('\n📋 Oxirgi tranzaksiyalar:');
    const transactionsResponse = await axios.get(
      `${API_BASE}/cashbox/transactions?limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const transactions = transactionsResponse.data;
    transactions.forEach((t, index) => {
      const date = new Date(t.createdAt).toLocaleString('uz-UZ');
      const sign = t.type === 'INCOME' ? '+' : '-';
      console.log(`   ${index + 1}. ${date} | ${sign}${t.amount} ${t.currency} | ${t.description} | ${t.paymentMethod}`);
    });

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
  }
}

// Testni ishga tushirish
testCashboxAdd();
