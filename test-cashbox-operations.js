// Kassa Operatsiyalari Testlari
// node test-cashbox-operations.js

const API_URL = 'http://localhost:5000/api';

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, status, message = '') {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${name}`);
  if (message) console.log(`   ${message}`);
  
  testResults.tests.push({ name, status, message });
  if (status === 'PASS') testResults.passed++;
  else testResults.failed++;
}

async function login() {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@aziztrades.com',
      password: 'admin123'
    })
  });
  return (await response.json()).token;
}

// ============================================
// KASSA CHIQIM/KIRIM TESTLARI
// ============================================
async function testCashboxTransactions(token) {
  console.log('\n💵 KASSA CHIQIM/KIRIM TESTLARI\n');
  
  // Test 1: Kassa chiqim qo'shish (EXPENSE)
  try {
    const response = await fetch(`${API_URL}/cashbox/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'EXPENSE',
        amount: 500000,
        currency: 'UZS',
        category: 'UTILITIES',
        description: 'Test chiqim - Elektr to\'lovi',
        paymentMethod: 'CASH'
      })
    });
    
    if (response.ok) {
      const transaction = await response.json();
      logTest('1. Kassa chiqim qo\'shish', 'PASS', `${transaction.amount} ${transaction.currency}`);
    } else {
      const error = await response.json();
      logTest('1. Kassa chiqim qo\'shish', 'FAIL', `Status: ${response.status}, ${error.error || 'Unknown'}`);
    }
  } catch (error) {
    logTest('1. Kassa chiqim qo\'shish', 'FAIL', error.message);
  }
  
  // Test 2: Kassa kirim qo'shish (INCOME)
  try {
    const response = await fetch(`${API_URL}/cashbox/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'INCOME',
        amount: 1000000,
        currency: 'UZS',
        category: 'OTHER',
        description: 'Test kirim - Qo\'shimcha daromad',
        paymentMethod: 'CASH'
      })
    });
    
    if (response.ok) {
      const transaction = await response.json();
      logTest('2. Kassa kirim qo\'shish', 'PASS', `${transaction.amount} ${transaction.currency}`);
    } else {
      const error = await response.json();
      logTest('2. Kassa kirim qo\'shish', 'FAIL', `Status: ${response.status}, ${error.error || 'Unknown'}`);
    }
  } catch (error) {
    logTest('2. Kassa kirim qo\'shish', 'FAIL', error.message);
  }
  
  // Test 3: USD bilan chiqim
  try {
    const response = await fetch(`${API_URL}/cashbox/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'EXPENSE',
        amount: 100,
        currency: 'USD',
        category: 'SUPPLIES',
        description: 'Test chiqim - USD',
        paymentMethod: 'CASH'
      })
    });
    
    if (response.ok) {
      const transaction = await response.json();
      logTest('3. USD bilan chiqim', 'PASS', `${transaction.amount} ${transaction.currency}`);
    } else {
      const error = await response.json();
      logTest('3. USD bilan chiqim', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('3. USD bilan chiqim', 'FAIL', error.message);
  }
}

// ============================================
// KASSA BALANS TESTLARI
// ============================================
async function testCashboxBalance(token) {
  console.log('\n💰 KASSA BALANS TESTLARI\n');
  
  // Test 4: Kassa balansini olish
  try {
    const response = await fetch(`${API_URL}/cashbox/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const balance = await response.json();
      const hasBalances = balance.uzs !== undefined && balance.usd !== undefined;
      if (hasBalances) {
        logTest('4. Kassa balansini olish', 'PASS', `UZS: ${balance.uzs}, USD: ${balance.usd}`);
      } else {
        logTest('4. Kassa balansini olish', 'FAIL', 'Balans ma\'lumotlari to\'liq emas');
      }
    } else {
      logTest('4. Kassa balansini olish', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('4. Kassa balansini olish', 'FAIL', error.message);
  }
  
  // Test 5: Kassa tarixini olish
  try {
    const response = await fetch(`${API_URL}/cashbox/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const transactions = await response.json();
      logTest('5. Kassa tarixini olish', 'PASS', `${transactions.length} ta tranzaksiya`);
    } else {
      logTest('5. Kassa tarixini olish', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('5. Kassa tarixini olish', 'FAIL', error.message);
  }
}

// ============================================
// KASSA HISOBOTLAR TESTLARI
// ============================================
async function testCashboxReports(token) {
  console.log('\n📊 KASSA HISOBOTLAR TESTLARI\n');
  
  // Test 6: Kunlik hisobot
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_URL}/cashbox/report/daily?date=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const report = await response.json();
      logTest('6. Kunlik hisobot', 'PASS', `Kirim: ${report.totalIncome || 0}, Chiqim: ${report.totalExpense || 0}`);
    } else {
      logTest('6. Kunlik hisobot', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('6. Kunlik hisobot', 'FAIL', error.message);
  }
  
  // Test 7: Oylik hisobot
  try {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const response = await fetch(`${API_URL}/cashbox/report/monthly?year=${year}&month=${month}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const report = await response.json();
      logTest('7. Oylik hisobot', 'PASS', `Kirim: ${report.totalIncome || 0}, Chiqim: ${report.totalExpense || 0}`);
    } else {
      logTest('7. Oylik hisobot', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('7. Oylik hisobot', 'FAIL', error.message);
  }
  
  // Test 8: Kategoriya bo'yicha hisobot
  try {
    const response = await fetch(`${API_URL}/cashbox/report/by-category`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const report = await response.json();
      logTest('8. Kategoriya bo\'yicha hisobot', 'PASS', `${Object.keys(report).length} ta kategoriya`);
    } else {
      logTest('8. Kategoriya bo\'yicha hisobot', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('8. Kategoriya bo\'yicha hisobot', 'FAIL', error.message);
  }
}

// ============================================
// YAKUNIY NATIJALAR
// ============================================
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST NATIJALARI');
  console.log('='.repeat(60));
  console.log(`✅ O'tdi: ${testResults.passed}`);
  console.log(`❌ Muvaffaqiyatsiz: ${testResults.failed}`);
  console.log(`📝 Jami: ${testResults.tests.length}`);
  console.log('='.repeat(60));
  
  const percentage = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
  console.log(`\n🎯 Muvaffaqiyat darajasi: ${percentage}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Muvaffaqiyatsiz testlar:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
  }
}

// ============================================
// ASOSIY TEST FUNKSIYASI
// ============================================
async function runAllTests() {
  console.log('🚀 KASSA OPERATSIYALARI TESTI BOSHLANDI');
  console.log('='.repeat(60));
  
  try {
    const token = await login();
    console.log('✅ Login muvaffaqiyatli\n');
    
    await testCashboxTransactions(token);
    await testCashboxBalance(token);
    await testCashboxReports(token);
    
    printSummary();
    
  } catch (error) {
    console.error('\n❌ UMUMIY XATOLIK:', error);
  }
}

runAllTests();
