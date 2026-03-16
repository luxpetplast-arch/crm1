// Frontend-Backend Integratsiya Testi
// node test-frontend-backend-integration.js

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
// 1. AUTHENTICATION TESTLARI
// ============================================
async function testAuthentication() {
  console.log('\n🔐 AUTHENTICATION TESTLARI\n');
  
  // Test 1: Login
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@aziztrades.com',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.token && data.user) {
        logTest('1. Login API', 'PASS', `User: ${data.user.name}, Role: ${data.user.role}`);
      } else {
        logTest('1. Login API', 'FAIL', 'Token yoki user ma\'lumoti yo\'q');
      }
    } else {
      logTest('1. Login API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('1. Login API', 'FAIL', error.message);
  }
  
  // Test 2: Noto'g'ri parol
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@aziztrades.com',
        password: 'wrong_password'
      })
    });
    
    if (response.status === 401) {
      logTest('2. Noto\'g\'ri parol (401)', 'PASS', 'To\'g\'ri xatolik qaytardi');
    } else {
      logTest('2. Noto\'g\'ri parol (401)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('2. Noto\'g\'ri parol (401)', 'FAIL', error.message);
  }
}

// ============================================
// 2. DASHBOARD API TESTLARI
// ============================================
async function testDashboard(token) {
  console.log('\n📊 DASHBOARD API TESTLARI\n');
  
  // Test 3: Dashboard Stats
  try {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const requiredFields = ['dailyRevenue', 'monthlyRevenue', 'netProfit', 'totalDebt'];
      const hasAllFields = requiredFields.every(field => data.hasOwnProperty(field));
      
      if (hasAllFields) {
        logTest('3. Dashboard Stats API', 'PASS', 
          `Daromad: ${data.dailyRevenue}, Foyda: ${data.netProfit}`);
      } else {
        logTest('3. Dashboard Stats API', 'FAIL', 'Ba\'zi fieldlar yo\'q');
      }
    } else {
      logTest('3. Dashboard Stats API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('3. Dashboard Stats API', 'FAIL', error.message);
  }
}

// ============================================
// 3. PRODUCTS API TESTLARI
// ============================================
async function testProducts(token) {
  console.log('\n📦 PRODUCTS API TESTLARI\n');
  
  // Test 4: Get Products
  try {
    const response = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const products = await response.json();
      logTest('4. Get Products API', 'PASS', `${products.length} ta mahsulot`);
    } else {
      logTest('4. Get Products API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('4. Get Products API', 'FAIL', error.message);
  }
  
  // Test 5: Create Product
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Product Frontend',
        price: 50000,
        bagType: '50kg',
        currentStock: 100,
        minStock: 10
      })
    });
    
    if (response.ok) {
      const product = await response.json();
      logTest('5. Create Product API', 'PASS', `ID: ${product.id}`);
      
      // Clean up - delete test product
      await fetch(`${API_URL}/products/${product.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } else {
      logTest('5. Create Product API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('5. Create Product API', 'FAIL', error.message);
  }
}

// ============================================
// 4. CUSTOMERS API TESTLARI
// ============================================
async function testCustomers(token) {
  console.log('\n👥 CUSTOMERS API TESTLARI\n');
  
  // Test 6: Get Customers
  try {
    const response = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const customers = await response.json();
      logTest('6. Get Customers API', 'PASS', `${customers.length} ta mijoz`);
    } else {
      logTest('6. Get Customers API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('6. Get Customers API', 'FAIL', error.message);
  }
  
  // Test 7: Create Customer
  try {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Customer Frontend',
        phone: '+998901234567',
        address: 'Test Address',
        category: 'NORMAL',
        creditLimit: 1000000
      })
    });
    
    if (response.ok) {
      const customer = await response.json();
      logTest('7. Create Customer API', 'PASS', `ID: ${customer.id}`);
      
      // Clean up
      await fetch(`${API_URL}/customers/${customer.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } else {
      logTest('7. Create Customer API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('7. Create Customer API', 'FAIL', error.message);
  }
}

// ============================================
// 5. ORDERS API TESTLARI
// ============================================
async function testOrders(token) {
  console.log('\n📋 ORDERS API TESTLARI\n');
  
  // Test 8: Get Orders
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const orders = await response.json();
      logTest('8. Get Orders API', 'PASS', `${orders.length} ta buyurtma`);
    } else {
      logTest('8. Get Orders API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('8. Get Orders API', 'FAIL', error.message);
  }
}

// ============================================
// 6. SALES API TESTLARI
// ============================================
async function testSales(token) {
  console.log('\n💰 SALES API TESTLARI\n');
  
  // Test 9: Get Sales
  try {
    const response = await fetch(`${API_URL}/sales`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const sales = await response.json();
      logTest('9. Get Sales API', 'PASS', `${sales.length} ta savdo`);
    } else {
      logTest('9. Get Sales API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('9. Get Sales API', 'FAIL', error.message);
  }
}

// ============================================
// 7. CASHBOX API TESTLARI
// ============================================
async function testCashbox(token) {
  console.log('\n💵 CASHBOX API TESTLARI\n');
  
  // Test 10: Get Cashbox Summary
  try {
    const response = await fetch(`${API_URL}/cashbox/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('10. Cashbox Summary API', 'PASS', 
        `Balans: ${data.totalBalance}`);
    } else {
      logTest('10. Cashbox Summary API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('10. Cashbox Summary API', 'FAIL', error.message);
  }
  
  // Test 11: Get Cashbox Transactions
  try {
    const response = await fetch(`${API_URL}/cashbox/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const transactions = await response.json();
      logTest('11. Cashbox Transactions API', 'PASS', 
        `${transactions.length} ta tranzaksiya`);
    } else {
      logTest('11. Cashbox Transactions API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('11. Cashbox Transactions API', 'FAIL', error.message);
  }
}

// ============================================
// 8. EXPENSES API TESTLARI
// ============================================
async function testExpenses(token) {
  console.log('\n💸 EXPENSES API TESTLARI\n');
  
  // Test 12: Get Expenses
  try {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const expenses = await response.json();
      logTest('12. Get Expenses API', 'PASS', `${expenses.length} ta xarajat`);
    } else {
      logTest('12. Get Expenses API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('12. Get Expenses API', 'FAIL', error.message);
  }
}

// ============================================
// 9. REPORTS API TESTLARI
// ============================================
async function testReports(token) {
  console.log('\n📈 REPORTS API TESTLARI\n');
  
  // Test 13: Get Sales Report
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_URL}/reports/sales?startDate=${today}&endDate=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const report = await response.json();
      logTest('13. Sales Report API', 'PASS', 
        `Jami: ${report.totalSales || 0}`);
    } else {
      logTest('13. Sales Report API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('13. Sales Report API', 'FAIL', error.message);
  }
}

// ============================================
// 10. SETTINGS API TESTLARI
// ============================================
async function testSettings(token) {
  console.log('\n⚙️ SETTINGS API TESTLARI\n');
  
  // Test 14: Get Settings
  try {
    const response = await fetch(`${API_URL}/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const settings = await response.json();
      logTest('14. Get Settings API', 'PASS', 
        `USD_TO_UZS: ${settings.USD_TO_UZS || 'N/A'}`);
    } else {
      logTest('14. Get Settings API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('14. Get Settings API', 'FAIL', error.message);
  }
}

// ============================================
// YAKUNIY NATIJALAR
// ============================================
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FRONTEND-BACKEND INTEGRATSIYA TEST NATIJALARI');
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
  
  console.log('\n💡 XULOSA:');
  if (percentage >= 90) {
    console.log('   ✅ Frontend va Backend to\'liq integratsiya qilingan!');
  } else if (percentage >= 70) {
    console.log('   ⚠️  Frontend va Backend asosan ishlayapti, ba\'zi muammolar bor.');
  } else {
    console.log('   ❌ Frontend va Backend integratsiyasida jiddiy muammolar bor!');
  }
}

// ============================================
// ASOSIY TEST FUNKSIYASI
// ============================================
async function runAllTests() {
  console.log('🚀 FRONTEND-BACKEND INTEGRATSIYA TESTI BOSHLANDI');
  console.log('='.repeat(60));
  
  try {
    const token = await login();
    console.log('✅ Login muvaffaqiyatli\n');
    
    await testAuthentication();
    await testDashboard(token);
    await testProducts(token);
    await testCustomers(token);
    await testOrders(token);
    await testSales(token);
    await testCashbox(token);
    await testExpenses(token);
    await testReports(token);
    await testSettings(token);
    
    printSummary();
    
  } catch (error) {
    console.error('\n❌ UMUMIY XATOLIK:', error);
  }
}

runAllTests();
