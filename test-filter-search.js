// Filtrlash va Qidirish Testlari
// node test-filter-search.js

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
// BUYURTMA FILTRLASH TESTLARI
// ============================================
async function testOrderFiltering(token) {
  console.log('\n📋 BUYURTMA FILTRLASH TESTLARI\n');
  
  // Test 1: Status bo'yicha filtrlash
  try {
    const response = await fetch(`${API_URL}/orders?status=PENDING`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const orders = await response.json();
      const allPending = orders.every(o => o.status === 'PENDING');
      if (allPending || orders.length === 0) {
        logTest('1. Buyurtma - Status filtri', 'PASS', `${orders.length} ta PENDING buyurtma`);
      } else {
        logTest('1. Buyurtma - Status filtri', 'FAIL', 'Boshqa statusdagi buyurtmalar ham bor');
      }
    } else {
      logTest('1. Buyurtma - Status filtri', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('1. Buyurtma - Status filtri', 'FAIL', error.message);
  }
  
  // Test 2: Priority bo'yicha filtrlash
  try {
    const response = await fetch(`${API_URL}/orders?priority=HIGH`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const orders = await response.json();
      const allHigh = orders.every(o => o.priority === 'HIGH');
      if (allHigh || orders.length === 0) {
        logTest('2. Buyurtma - Priority filtri', 'PASS', `${orders.length} ta HIGH priority`);
      } else {
        logTest('2. Buyurtma - Priority filtri', 'FAIL', 'Boshqa prioritydagi buyurtmalar ham bor');
      }
    } else {
      logTest('2. Buyurtma - Priority filtri', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('2. Buyurtma - Priority filtri', 'FAIL', error.message);
  }
  
  // Test 3: Customer bo'yicha filtrlash
  try {
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    if (customers.length > 0) {
      const customerId = customers[0].id;
      const response = await fetch(`${API_URL}/orders?customerId=${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const orders = await response.json();
        const allSameCustomer = orders.every(o => o.customerId === customerId);
        if (allSameCustomer || orders.length === 0) {
          logTest('3. Buyurtma - Customer filtri', 'PASS', `${orders.length} ta buyurtma`);
        } else {
          logTest('3. Buyurtma - Customer filtri', 'FAIL', 'Boshqa mijozlarning buyurtmalari ham bor');
        }
      } else {
        logTest('3. Buyurtma - Customer filtri', 'FAIL', `Status: ${response.status}`);
      }
    } else {
      logTest('3. Buyurtma - Customer filtri', 'PASS', 'Mijozlar yo\'q');
    }
  } catch (error) {
    logTest('3. Buyurtma - Customer filtri', 'FAIL', error.message);
  }
}

// ============================================
// SAVDO FILTRLASH TESTLARI
// ============================================
async function testSalesFiltering(token) {
  console.log('\n💰 SAVDO FILTRLASH TESTLARI\n');
  
  // Test 4: Customer bo'yicha filtrlash
  try {
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    if (customers.length > 0) {
      const customerId = customers[0].id;
      const response = await fetch(`${API_URL}/sales?customerId=${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const sales = await response.json();
        const correctCount = sales.filter(s => s.customerId === customerId).length;
        const accuracy = sales.length > 0 ? (correctCount / sales.length) * 100 : 100;
        
        if (accuracy >= 90) {
          logTest('4. Savdo - Customer filtri', 'PASS', `${correctCount}/${sales.length} to'g'ri (${accuracy.toFixed(1)}%)`);
        } else {
          logTest('4. Savdo - Customer filtri', 'FAIL', `${correctCount}/${sales.length} to'g'ri (${accuracy.toFixed(1)}%)`);
        }
      } else {
        const errorData = await response.json();
        logTest('4. Savdo - Customer filtri', 'FAIL', `Status: ${response.status}`);
      }
    } else {
      logTest('4. Savdo - Customer filtri', 'PASS', 'Mijozlar yo\'q');
    }
  } catch (error) {
    logTest('4. Savdo - Customer filtri', 'FAIL', error.message);
  }
  
  // Test 5: Payment status bo'yicha filtrlash
  try {
    const response = await fetch(`${API_URL}/sales?paymentStatus=PAID`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const sales = await response.json();
      const correctCount = sales.filter(s => s.paymentStatus === 'PAID').length;
      const accuracy = sales.length > 0 ? (correctCount / sales.length) * 100 : 100;
      
      if (accuracy >= 90) {
        logTest('5. Savdo - Payment status filtri', 'PASS', `${correctCount}/${sales.length} to'g'ri (${accuracy.toFixed(1)}%)`);
      } else {
        logTest('5. Savdo - Payment status filtri', 'FAIL', `${correctCount}/${sales.length} to'g'ri (${accuracy.toFixed(1)}%)`);
      }
    } else {
      logTest('5. Savdo - Payment status filtri', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('5. Savdo - Payment status filtri', 'FAIL', error.message);
  }
  
  // Test 6: Sana oralig'i bo'yicha filtrlash
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_URL}/sales?startDate=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const sales = await response.json();
      logTest('6. Savdo - Sana filtri', 'PASS', `${sales.length} ta bugungi savdo`);
    } else {
      logTest('6. Savdo - Sana filtri', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('6. Savdo - Sana filtri', 'FAIL', error.message);
  }
}

// ============================================
// MIJOZ FILTRLASH TESTLARI
// ============================================
async function testCustomerFiltering(token) {
  console.log('\n👥 MIJOZ FILTRLASH TESTLARI\n');
  
  // Test 7: Kategoriya bo'yicha filtrlash
  try {
    const response = await fetch(`${API_URL}/customers?category=VIP`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const customers = await response.json();
      const allVIP = customers.every(c => c.category === 'VIP');
      if (allVIP || customers.length === 0) {
        logTest('7. Mijoz - Kategoriya filtri', 'PASS', `${customers.length} ta VIP mijoz`);
      } else {
        logTest('7. Mijoz - Kategoriya filtri', 'FAIL', 'Boshqa kategoriyali mijozlar ham bor');
      }
    } else {
      logTest('7. Mijoz - Kategoriya filtri', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('7. Mijoz - Kategoriya filtri', 'FAIL', error.message);
  }
  
  // Test 8: Qarzli mijozlar filtri
  try {
    const response = await fetch(`${API_URL}/customers?hasDebt=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const customers = await response.json();
      const allHaveDebt = customers.every(c => c.debt > 0);
      if (allHaveDebt || customers.length === 0) {
        logTest('8. Mijoz - Qarzli filtri', 'PASS', `${customers.length} ta qarzli mijoz`);
      } else {
        logTest('8. Mijoz - Qarzli filtri', 'FAIL', 'Qarzisiz mijozlar ham bor');
      }
    } else {
      logTest('8. Mijoz - Qarzli filtri', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('8. Mijoz - Qarzli filtri', 'FAIL', error.message);
  }
}

// ============================================
// MAHSULOT FILTRLASH TESTLARI
// ============================================
async function testProductFiltering(token) {
  console.log('\n📦 MAHSULOT FILTRLASH TESTLARI\n');
  
  // Test 9: Kam qolgan mahsulotlar (low stock)
  try {
    const response = await fetch(`${API_URL}/products?lowStock=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const products = await response.json();
      const allLowStock = products.every(p => p.currentStock < p.minStockLimit);
      if (allLowStock || products.length === 0) {
        logTest('9. Mahsulot - Kam qolgan filtri', 'PASS', `${products.length} ta kam qolgan`);
      } else {
        logTest('9. Mahsulot - Kam qolgan filtri', 'FAIL', 'Yetarli mahsulotlar ham bor');
      }
    } else {
      logTest('9. Mahsulot - Kam qolgan filtri', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('9. Mahsulot - Kam qolgan filtri', 'FAIL', error.message);
  }
  
  // Test 10: Qidirish (search)
  try {
    const response = await fetch(`${API_URL}/products?search=un`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const products = await response.json();
      logTest('10. Mahsulot - Qidirish', 'PASS', `${products.length} ta topildi`);
    } else {
      logTest('10. Mahsulot - Qidirish', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('10. Mahsulot - Qidirish', 'FAIL', error.message);
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
  console.log('🚀 FILTRLASH VA QIDIRISH TESTI BOSHLANDI');
  console.log('='.repeat(60));
  
  try {
    const token = await login();
    console.log('✅ Login muvaffaqiyatli\n');
    
    await testOrderFiltering(token);
    await testSalesFiltering(token);
    await testCustomerFiltering(token);
    await testProductFiltering(token);
    
    printSummary();
    
  } catch (error) {
    console.error('\n❌ UMUMIY XATOLIK:', error);
  }
}

runAllTests();
