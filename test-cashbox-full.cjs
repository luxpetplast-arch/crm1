const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function testCashboxFull() {
  console.log('🧪 Kassa kirim/chiqim testi boshlanmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // 1. Boshlang'ich holat
    console.log('\n📊 Boshlang\'ich holat tekshirilmoqda...');
    const initialCashboxResponse = await axios.get(
      `${API_BASE}/cashbox/summary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const initialCashbox = initialCashboxResponse.data;
    console.log(`💰 Boshlang\'ich kassa balansi: $${initialCashbox.totalBalance.toFixed(2)}`);
    console.log(`   Bugun kirim: $${initialCashbox.todayIncome.toFixed(2)}`);
    console.log(`   Bugun chiqim: $${initialCashbox.todayExpense.toFixed(2)}`);
    console.log(`   Oylik kirim: $${initialCashbox.monthlyIncome.toFixed(2)}`);
    console.log(`   Oylik chiqim: $${initialCashbox.monthlyExpense.toFixed(2)}`);
    console.log(`   Naqd UZS: ${initialCashbox.byCurrency.cashUZS.toLocaleString()} so'm`);
    console.log(`   Naqd USD: $${initialCashbox.byCurrency.cashUSD.toFixed(2)}`);
    console.log(`   Click: ${initialCashbox.byCurrency.clickUZS.toLocaleString()} so'm`);

    // 2. Kassaga pul kiritish (INCOME)
    console.log('\n💵 Kassaga pul kiritish testi...');
    const addData = {
      amount: 100000, // 100,000 so'm
      currency: 'UZS',
      category: 'KASSA_KIRIM',
      description: 'Test kirim - naqd pul'
    };

    try {
      const addResponse = await axios.post(
        `${API_BASE}/cashbox/add`,
        addData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Kassaga pul kiritildi: ${addResponse.data.amount} ${addResponse.data.currency}`);
      console.log(`   Tavsif: ${addResponse.data.description}`);
    } catch (error) {
      console.error('❌ Kassaga pul kiritish xatosi:', error.response?.data || error.message);
    }

    // 3. Kassadan pul chiqarish (EXPENSE)
    console.log('\n💸 Kassadan pul chiqarish testi...');
    const withdrawData = {
      amount: 50, // 50 dollar
      currency: 'USD',
      category: 'OFFICE_EXPENSES',
      description: 'Test chiqim - ofis xarajatlari'
    };

    try {
      const withdrawResponse = await axios.post(
        `${API_BASE}/cashbox/withdraw`,
        withdrawData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Kassadan pul chiqarildi: ${withdrawResponse.data.amount} ${withdrawResponse.data.currency}`);
      console.log(`   Tavsif: ${withdrawResponse.data.description}`);
    } catch (error) {
      console.error('❌ Kassadan pul chiqarish xatosi:', error.response?.data || error.message);
    }

    // 4. Transfer testi
    console.log('\n🔄 Transfer testi (USD dan UZS ga)...');
    const transferData = {
      from: 'USD',
      to: 'UZS',
      amount: 100, // 100 dollar
      description: 'Test transfer - USD dan UZS ga'
    };

    try {
      const transferResponse = await axios.post(
        `${API_BASE}/cashbox/transfer`,
        transferData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Transfer amalga oshirildi: ${transferResponse.data.amount} USD`);
      console.log(`   Dan: ${transferResponse.data.fromCurrency} → Ga: ${transferResponse.data.toCurrency}`);
      console.log(`   Kurs: ${transferResponse.data.exchangeRate}`);
      console.log(`   Qabul qilingan: ${transferResponse.data.toAmount.toLocaleString()} so'm`);
    } catch (error) {
      console.error('❌ Transfer xatosi:', error.response?.data || error.message);
    }

    // 5. Yakuniy holat
    console.log('\n📊 Yakuniy holat tekshirilmoqda...');
    const finalCashboxResponse = await axios.get(
      `${API_BASE}/cashbox/summary`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const finalCashbox = finalCashboxResponse.data;
    const expectedBalance = initialCashbox.totalBalance + 100000/12500 - 50 + 100; // 100k so'm + 100$ - 50$

    console.log(`💰 Yakuniy kassa balansi: $${finalCashbox.totalBalance.toFixed(2)}`);
    console.log(`   Kutilayotgan balans: $${expectedBalance.toFixed(2)}`);
    console.log(`   Farq: $${(finalCashbox.totalBalance - expectedBalance).toFixed(2)}`);
    console.log(`   Bugun kirim: $${finalCashbox.todayIncome.toFixed(2)}`);
    console.log(`   Bugun chiqim: $${finalCashbox.todayExpense.toFixed(2)}`);
    console.log(`   Oylik kirim: $${finalCashbox.monthlyIncome.toFixed(2)}`);
    console.log(`   Oylik chiqim: $${finalCashbox.monthlyExpense.toFixed(2)}`);
    console.log(`   Naqd UZS: ${finalCashbox.byCurrency.cashUZS.toLocaleString()} so'm`);
    console.log(`   Naqd USD: $${finalCashbox.byCurrency.cashUSD.toFixed(2)}`);
    console.log(`   Click: ${finalCashbox.byCurrency.clickUZS.toLocaleString()} so'm`);

    // 6. Transaksiyalar tarixi
    console.log('\n📋 Transaksiyalar tarixi...');
    try {
      const transactionsResponse = await axios.get(
        `${API_BASE}/cashbox/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const transactions = transactionsResponse.data;
      console.log(`📊 Jami transaksiyalar: ${transactions.length}`);

      if (transactions.length > 0) {
        console.log('\n📋 Oxirgi 5 transaksiya:');
        transactions.slice(0, 5).forEach((transaction, index) => {
          console.log(`   ${index + 1}. ${transaction.type} - ${transaction.amount} ${transaction.currency}`);
          console.log(`      Kategoriya: ${transaction.category}`);
          console.log(`      Tavsif: ${transaction.description}`);
          console.log(`      Sana: ${new Date(transaction.createdAt).toLocaleString('uz-UZ')}`);
          console.log(`   Foydalanuvchi: ${transaction.userName}`);
          console.log('');
        });
      }
    } catch (error) {
      console.error('❌ Transaksiyalar olish xatosi:', error.response?.data || error.message);
    }

    // 7. Kassa xulosa
    console.log('\n🎉 KASSA TEST XULOSASI:');
    console.log(`✅ Kassa balansi: ${Math.abs(finalCashbox.totalBalance - expectedBalance) < 0.01 ? 'TO\'G\'RI' : 'XATO'}`);
    console.log(`✅ Kirim qilish: ${addResponse ? 'ISHLADI' : 'XATO'}`);
    console.log(`✅ Chiqim qilish: ${withdrawResponse ? 'ISHLADI' : 'XATO'}`);
    console.log(`✅ Transfer qilish: ${transferResponse ? 'ISHLADI' : 'XATO'}`);
    console.log(`✅ Transaksiyalar: ${transactions ? 'ISHLADI' : 'XATO'}`);

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Xatolik tafsilotlari:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Testni ishga tushirish
testCashboxFull();
