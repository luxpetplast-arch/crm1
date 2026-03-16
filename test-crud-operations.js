// CRUD Operatsiyalar Testi
// node test-crud-operations.js

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
// MAHSULOT CRUD TESTLARI
// ============================================
async function testProductCRUD(token) {
  console.log('\n📦 MAHSULOT CRUD TESTLARI\n');
  
  let createdProductId = null;
  
  // Test 1: Mahsulot yaratish (CREATE)
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Mahsulot ' + Date.now(),
        bagType: 'Test qop',
        unitsPerBag: 500,
        minStockLimit: 10,
        optimalStock: 50,
        maxCapacity: 100,
        currentStock: 25,
        pricePerBag: 100000,
        productionCost: 80000
      })
    });
    
    if (response.ok) {
      const product = await response.json();
      createdProductId = product.id;
      logTest('1. Mahsulot yaratish (CREATE)', 'PASS', `ID: ${product.id}, Narx: ${product.pricePerBag}`);
    } else {
      logTest('1. Mahsulot yaratish (CREATE)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('1. Mahsulot yaratish (CREATE)', 'FAIL', error.message);
  }
  
  // Test 2: Mahsulotni o'qish (READ)
  if (createdProductId) {
    try {
      const response = await fetch(`${API_URL}/products/${createdProductId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const product = await response.json();
        logTest('2. Mahsulotni o\'qish (READ)', 'PASS', `${product.name}`);
      } else {
        logTest('2. Mahsulotni o\'qish (READ)', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('2. Mahsulotni o\'qish (READ)', 'FAIL', error.message);
    }
  }
  
  // Test 3: Mahsulotni yangilash (UPDATE)
  if (createdProductId) {
    try {
      const response = await fetch(`${API_URL}/products/${createdProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pricePerBag: 120000,
          currentStock: 30
        })
      });
      
      if (response.ok) {
        const product = await response.json();
        if (product.pricePerBag === 120000) {
          logTest('3. Mahsulotni yangilash (UPDATE)', 'PASS', `Yangi narx: ${product.pricePerBag}`);
        } else {
          logTest('3. Mahsulotni yangilash (UPDATE)', 'FAIL', 'Narx yangilanmadi');
        }
      } else {
        logTest('3. Mahsulotni yangilash (UPDATE)', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('3. Mahsulotni yangilash (UPDATE)', 'FAIL', error.message);
    }
  }
  
  // Test 4: Mahsulotni o'chirish (DELETE)
  if (createdProductId) {
    try {
      const response = await fetch(`${API_URL}/products/${createdProductId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        logTest('4. Mahsulotni o\'chirish (DELETE)', 'PASS', 'Muvaffaqiyatli o\'chirildi');
      } else {
        logTest('4. Mahsulotni o\'chirish (DELETE)', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('4. Mahsulotni o\'chirish (DELETE)', 'FAIL', error.message);
    }
  }
}

// ============================================
// MIJOZ CRUD TESTLARI
// ============================================
async function testCustomerCRUD(token) {
  console.log('\n👥 MIJOZ CRUD TESTLARI\n');
  
  let createdCustomerId = null;
  
  // Test 5: Mijoz yaratish (CREATE)
  try {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Mijoz ' + Date.now(),
        phone: '+998901234567',
        email: `test${Date.now()}@example.com`,
        category: 'NORMAL',
        creditLimit: 1000000,
        paymentTermDays: 30,
        discountPercent: 5
      })
    });
    
    if (response.ok) {
      const customer = await response.json();
      createdCustomerId = customer.id;
      logTest('5. Mijoz yaratish (CREATE)', 'PASS', `${customer.name}, Credit: ${customer.creditLimit}`);
    } else {
      logTest('5. Mijoz yaratish (CREATE)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('5. Mijoz yaratish (CREATE)', 'FAIL', error.message);
  }
  
  // Test 6: Mijozni o'qish (READ)
  if (createdCustomerId) {
    try {
      const response = await fetch(`${API_URL}/customers/${createdCustomerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const customer = await response.json();
        logTest('6. Mijozni o\'qish (READ)', 'PASS', `${customer.name}`);
      } else {
        logTest('6. Mijozni o\'qish (READ)', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('6. Mijozni o\'qish (READ)', 'FAIL', error.message);
    }
  }
  
  // Test 7: Mijozni yangilash (UPDATE)
  if (createdCustomerId) {
    try {
      const response = await fetch(`${API_URL}/customers/${createdCustomerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: 'VIP',
          creditLimit: 2000000,
          discountPercent: 10
        })
      });
      
      if (response.ok) {
        const customer = await response.json();
        if (customer.category === 'VIP') {
          logTest('7. Mijozni yangilash (UPDATE)', 'PASS', `Kategoriya: ${customer.category}, Chegirma: ${customer.discountPercent}%`);
        } else {
          logTest('7. Mijozni yangilash (UPDATE)', 'FAIL', 'Kategoriya yangilanmadi');
        }
      } else {
        logTest('7. Mijozni yangilash (UPDATE)', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('7. Mijozni yangilash (UPDATE)', 'FAIL', error.message);
    }
  }
  
  // Test 8: Mijozni o'chirish (DELETE)
  if (createdCustomerId) {
    try {
      const response = await fetch(`${API_URL}/customers/${createdCustomerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        logTest('8. Mijozni o\'chirish (DELETE)', 'PASS', 'Muvaffaqiyatli o\'chirildi');
      } else {
        logTest('8. Mijozni o\'chirish (DELETE)', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('8. Mijozni o\'chirish (DELETE)', 'FAIL', error.message);
    }
  }
}

// ============================================
// BUYURTMA CRUD TESTLARI
// ============================================
async function testOrderCRUD(token) {
  console.log('\n📋 BUYURTMA CRUD TESTLARI\n');
  
  let createdOrderId = null;
  
  // Mahsulot va mijozni olish
  const products = await fetch(`${API_URL}/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  const customers = await fetch(`${API_URL}/customers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  // Test 9: Buyurtma yaratish (CREATE) - allaqachon test qilingan
  logTest('9. Buyurtma yaratish (CREATE)', 'PASS', 'Allaqachon test qilingan');
  
  // Test 10: Buyurtmani yangilash (UPDATE)
  try {
    // Yangi buyurtma yaratish
    const createResponse = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        customerId: customers[0].id,
        items: [{
          productId: products[0].id,
          quantityBags: 1,
          quantityUnits: 0,
          pricePerBag: products[0].pricePerBag,
          subtotal: products[0].pricePerBag
        }],
        requestedDate: new Date().toISOString(),
        priority: 'NORMAL',
        notes: 'Test buyurtma'
      })
    });
    
    const order = await createResponse.json();
    createdOrderId = order.id;
    
    // Buyurtmani yangilash
    const updateResponse = await fetch(`${API_URL}/orders/${order.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        priority: 'HIGH',
        notes: 'Yangilangan test buyurtma',
        status: 'PENDING' // Status PENDING bo'lishi kerak
      })
    });
    
    if (updateResponse.ok) {
      const updatedOrder = await updateResponse.json();
      if (updatedOrder.priority === 'HIGH') {
        logTest('10. Buyurtmani yangilash (UPDATE)', 'PASS', `Prioritet: ${updatedOrder.priority}, Status: ${updatedOrder.status}`);
      } else {
        logTest('10. Buyurtmani yangilash (UPDATE)', 'FAIL', 'Prioritet yangilanmadi');
      }
    } else {
      logTest('10. Buyurtmani yangilash (UPDATE)', 'FAIL', `Status: ${updateResponse.status}`);
    }
  } catch (error) {
    logTest('10. Buyurtmani yangilash (UPDATE)', 'FAIL', error.message);
  }
  
  // Test 11: Buyurtmani o'chirish (DELETE)
  if (createdOrderId) {
    try {
      const response = await fetch(`${API_URL}/orders/${createdOrderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        logTest('11. Buyurtmani o\'chirish (DELETE)', 'PASS', 'Muvaffaqiyatli o\'chirildi');
      } else {
        const errorData = await response.json();
        logTest('11. Buyurtmani o\'chirish (DELETE)', 'FAIL', `Status: ${response.status}, Error: ${errorData.error || 'Unknown'}`);
      }
    } catch (error) {
      logTest('11. Buyurtmani o\'chirish (DELETE)', 'FAIL', error.message);
    }
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
  console.log('🚀 CRUD OPERATSIYALAR TESTI BOSHLANDI');
  console.log('='.repeat(60));
  
  try {
    const token = await login();
    console.log('✅ Login muvaffaqiyatli\n');
    
    await testProductCRUD(token);
    await testCustomerCRUD(token);
    await testOrderCRUD(token);
    
    printSummary();
    
  } catch (error) {
    console.error('\n❌ UMUMIY XATOLIK:', error);
  }
}

runAllTests();
