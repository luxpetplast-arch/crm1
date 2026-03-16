// Ombor Operatsiyalari Testlari
// node test-inventory-operations.js

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
// OMBOR QO'SHISH/KAMAYTIRISH TESTLARI
// ============================================
async function testInventoryAdjustments(token) {
  console.log('\n📦 OMBOR QO\'SHISH/KAMAYTIRISH TESTLARI\n');
  
  // Mahsulotni olish
  const products = await fetch(`${API_URL}/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  if (products.length === 0) {
    logTest('Ombor testlari', 'FAIL', 'Mahsulotlar yo\'q');
    return;
  }
  
  const product = products[0];
  const initialStock = product.currentStock;
  
  // Test 1: Qop qo'shish
  try {
    const response = await fetch(`${API_URL}/products/${product.id}/adjust-bags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bags: 10,
        type: 'ADD',
        reason: 'PRODUCTION',
        notes: 'Test qo\'shish'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      logTest('1. Qop qo\'shish (ADD)', 'PASS', `+10 qop, Yangi: ${result.product.currentStock}`);
    } else {
      logTest('1. Qop qo\'shish (ADD)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('1. Qop qo\'shish (ADD)', 'FAIL', error.message);
  }
  
  // Test 2: Qop kamaytirish
  try {
    const response = await fetch(`${API_URL}/products/${product.id}/adjust-bags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bags: 5,
        type: 'REMOVE',
        reason: 'DAMAGE',
        notes: 'Test kamaytirish'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      logTest('2. Qop kamaytirish (REMOVE)', 'PASS', `-5 qop, Yangi: ${result.product.currentStock}`);
    } else {
      logTest('2. Qop kamaytirish (REMOVE)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('2. Qop kamaytirish (REMOVE)', 'FAIL', error.message);
  }
  
  // Test 3: Dona qo'shish
  try {
    const response = await fetch(`${API_URL}/products/${product.id}/adjust-units`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        units: 250,
        type: 'ADD',
        reason: 'PRODUCTION',
        notes: 'Test dona qo\'shish'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      logTest('3. Dona qo\'shish (ADD)', 'PASS', `+250 dona, Yangi: ${result.product.currentUnits}`);
    } else {
      logTest('3. Dona qo\'shish (ADD)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('3. Dona qo\'shish (ADD)', 'FAIL', error.message);
  }
  
  // Test 4: Dona kamaytirish
  try {
    const response = await fetch(`${API_URL}/products/${product.id}/adjust-units`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        units: 100,
        type: 'REMOVE',
        reason: 'SALE',
        notes: 'Test dona kamaytirish'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      logTest('4. Dona kamaytirish (REMOVE)', 'PASS', `-100 dona, Yangi: ${result.product.currentUnits}`);
    } else {
      logTest('4. Dona kamaytirish (REMOVE)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('4. Dona kamaytirish (REMOVE)', 'FAIL', error.message);
  }
}

// ============================================
// OMBOR TARIX TESTLARI
// ============================================
async function testInventoryHistory(token) {
  console.log('\n📋 OMBOR TARIX TESTLARI\n');
  
  const products = await fetch(`${API_URL}/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  if (products.length === 0) {
    logTest('Ombor tarix testlari', 'FAIL', 'Mahsulotlar yo\'q');
    return;
  }
  
  const product = products[0];
  
  // Test 5: Mahsulot harakatlari
  try {
    const response = await fetch(`${API_URL}/products/${product.id}/movements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const movements = await response.json();
      logTest('5. Mahsulot harakatlari', 'PASS', `${movements.length} ta harakat`);
    } else {
      logTest('5. Mahsulot harakatlari', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('5. Mahsulot harakatlari', 'FAIL', error.message);
  }
  
  // Test 6: Ombor kirim tarixi
  try {
    const response = await fetch(`${API_URL}/products/${product.id}/income`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('6. Ombor kirim tarixi', 'PASS', `${data.movements.length} ta kirim`);
    } else {
      logTest('6. Ombor kirim tarixi', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('6. Ombor kirim tarixi', 'FAIL', error.message);
  }
  
  // Test 7: Ombor chiqim tarixi
  try {
    const response = await fetch(`${API_URL}/products/${product.id}/expense`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('7. Ombor chiqim tarixi', 'PASS', `${data.movements.length} ta chiqim`);
    } else {
      logTest('7. Ombor chiqim tarixi', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('7. Ombor chiqim tarixi', 'FAIL', error.message);
  }
  
  // Test 8: Ombor umumiy statistika
  try {
    const response = await fetch(`${API_URL}/products/history/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const stats = await response.json();
      logTest('8. Ombor statistika', 'PASS', `Kirim: ${stats.total.income.bags} qop, Chiqim: ${stats.total.expense.bags} qop`);
    } else {
      logTest('8. Ombor statistika', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('8. Ombor statistika', 'FAIL', error.message);
  }
}

// ============================================
// BATCH VA ALERT TESTLARI
// ============================================
async function testBatchAndAlerts(token) {
  console.log('\n🏷️ BATCH VA ALERT TESTLARI\n');
  
  const products = await fetch(`${API_URL}/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  if (products.length === 0) {
    logTest('Batch testlari', 'FAIL', 'Mahsulotlar yo\'q');
    return;
  }
  
  const product = products[0];
  
  // Test 9: Batch qo'shish
  try {
    const response = await fetch(`${API_URL}/products/${product.id}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantity: 20,
        productionDate: new Date().toISOString(),
        shift: 'MORNING',
        responsiblePerson: 'Test User'
      })
    });
    
    if (response.ok) {
      const batch = await response.json();
      logTest('9. Batch qo\'shish', 'PASS', `20 qop, Smena: MORNING`);
    } else {
      logTest('9. Batch qo\'shish', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('9. Batch qo\'shish', 'FAIL', error.message);
  }
  
  // Test 10: Ombor alertlari
  try {
    const response = await fetch(`${API_URL}/products/alerts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const alerts = await response.json();
      logTest('10. Ombor alertlari', 'PASS', `${alerts.length} ta alert`);
    } else {
      logTest('10. Ombor alertlari', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('10. Ombor alertlari', 'FAIL', error.message);
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
  console.log('🚀 OMBOR OPERATSIYALARI TESTI BOSHLANDI');
  console.log('='.repeat(60));
  
  try {
    const token = await login();
    console.log('✅ Login muvaffaqiyatli\n');
    
    await testInventoryAdjustments(token);
    await testInventoryHistory(token);
    await testBatchAndAlerts(token);
    
    printSummary();
    
  } catch (error) {
    console.error('\n❌ UMUMIY XATOLIK:', error);
  }
}

runAllTests();
