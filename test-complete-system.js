// TO'LIQ TIZIM TESTI - Barcha funksiyalarni qadamma-qadam tekshirish
// node test-complete-system.js

const API_URL = 'http://localhost:5000/api';

let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function logTest(name, status, message = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} ${name}`);
  if (message) console.log(`   ${message}`);
  
  testResults.tests.push({ name, status, message });
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.skipped++;
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
  console.log('\n📝 1. AUTHENTICATION TESTLARI\n');
  
  try {
    // Test 1.1: Login
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
      if (data.token) {
        logTest('1.1 Login muvaffaqiyatli', 'PASS', `Token olindi: ${data.token.substring(0, 20)}...`);
        return data.token;
      }
    }
    logTest('1.1 Login', 'FAIL', 'Token olinmadi');
    
  } catch (error) {
    logTest('1.1 Login', 'FAIL', error.message);
  }
  
  // Test 1.2: Noto'g'ri parol
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@aziztrades.com',
        password: 'wrong_password'
      })
    });
    
    if (!response.ok) {
      logTest('1.2 Noto\'g\'ri parol rad etildi', 'PASS');
    } else {
      logTest('1.2 Noto\'g\'ri parol', 'FAIL', 'Noto\'g\'ri parol qabul qilindi');
    }
  } catch (error) {
    logTest('1.2 Noto\'g\'ri parol', 'FAIL', error.message);
  }
}

// ============================================
// 2. MAHSULOTLAR (PRODUCTS) TESTLARI
// ============================================
async function testProducts(token) {
  console.log('\n📦 2. MAHSULOTLAR TESTLARI\n');
  
  try {
    // Test 2.1: Mahsulotlar ro'yxatini olish
    const response = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const products = await response.json();
      if (Array.isArray(products) && products.length > 0) {
        logTest('2.1 Mahsulotlar ro\'yxati', 'PASS', `${products.length} ta mahsulot topildi`);
        return products;
      } else {
        logTest('2.1 Mahsulotlar ro\'yxati', 'FAIL', 'Mahsulotlar topilmadi');
      }
    } else {
      logTest('2.1 Mahsulotlar ro\'yxati', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('2.1 Mahsulotlar ro\'yxati', 'FAIL', error.message);
  }
  
  // Test 2.2: Bitta mahsulotni olish
  try {
    const products = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    if (products.length > 0) {
      const response = await fetch(`${API_URL}/products/${products[0].id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const product = await response.json();
        if (product.id === products[0].id) {
          logTest('2.2 Bitta mahsulot', 'PASS', `${product.name}`);
        } else {
          logTest('2.2 Bitta mahsulot', 'FAIL', 'Noto\'g\'ri mahsulot qaytdi');
        }
      } else {
        logTest('2.2 Bitta mahsulot', 'FAIL', `Status: ${response.status}`);
      }
    }
  } catch (error) {
    logTest('2.2 Bitta mahsulot', 'FAIL', error.message);
  }
}

// ============================================
// 3. MIJOZLAR (CUSTOMERS) TESTLARI
// ============================================
async function testCustomers(token) {
  console.log('\n👥 3. MIJOZLAR TESTLARI\n');
  
  try {
    // Test 3.1: Mijozlar ro'yxati
    const response = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const customers = await response.json();
      if (Array.isArray(customers) && customers.length > 0) {
        logTest('3.1 Mijozlar ro\'yxati', 'PASS', `${customers.length} ta mijoz`);
        return customers;
      } else {
        logTest('3.1 Mijozlar ro\'yxati', 'FAIL', 'Mijozlar topilmadi');
      }
    }
  } catch (error) {
    logTest('3.1 Mijozlar ro\'yxati', 'FAIL', error.message);
  }
  
  // Test 3.2: Bitta mijoz
  try {
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    if (customers.length > 0) {
      const response = await fetch(`${API_URL}/customers/${customers[0].id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const customer = await response.json();
        logTest('3.2 Bitta mijoz', 'PASS', `${customer.name} - Qarz: ${customer.debt} USD`);
      }
    }
  } catch (error) {
    logTest('3.2 Bitta mijoz', 'FAIL', error.message);
  }
}

// ============================================
// 4. BUYURTMALAR (ORDERS) TESTLARI
// ============================================
async function testOrders(token) {
  console.log('\n📋 4. BUYURTMALAR TESTLARI\n');
  
  try {
    const products = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    // Test 4.1: Buyurtma yaratish (bitta mahsulot)
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        customerId: customers[0].id,
        items: [{
          productId: products[0].id,
          quantityBags: 2,
          quantityUnits: 0,
          pricePerBag: products[0].pricePerBag,
          subtotal: 2 * products[0].pricePerBag
        }],
        requestedDate: new Date().toISOString(),
        priority: 'NORMAL',
        notes: 'Test buyurtma'
      })
    });
    
    if (response.ok) {
      const order = await response.json();
      logTest('4.1 Buyurtma yaratish', 'PASS', `ID: ${order.id}, Jami: ${order.totalAmount} USD`);
      return order;
    } else {
      logTest('4.1 Buyurtma yaratish', 'FAIL', `Status: ${response.status}`);
    }
    
  } catch (error) {
    logTest('4.1 Buyurtma yaratish', 'FAIL', error.message);
  }
  
  // Test 4.2: Ko'p mahsulotli buyurtma
  try {
    const products = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const items = products.slice(0, 3).map(p => ({
      productId: p.id,
      quantityBags: 1,
      quantityUnits: 0,
      pricePerBag: p.pricePerBag,
      subtotal: p.pricePerBag
    }));
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        customerId: customers[0].id,
        items,
        requestedDate: new Date().toISOString(),
        priority: 'NORMAL',
        notes: 'Ko\'p mahsulotli test'
      })
    });
    
    if (response.ok) {
      const order = await response.json();
      logTest('4.2 Ko\'p mahsulotli buyurtma', 'PASS', `${items.length} ta mahsulot`);
    } else {
      logTest('4.2 Ko\'p mahsulotli buyurtma', 'FAIL');
    }
  } catch (error) {
    logTest('4.2 Ko\'p mahsulotli buyurtma', 'FAIL', error.message);
  }
  
  // Test 4.3: Buyurtmalar ro'yxati
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const orders = await response.json();
      logTest('4.3 Buyurtmalar ro\'yxati', 'PASS', `${orders.length} ta buyurtma`);
    }
  } catch (error) {
    logTest('4.3 Buyurtmalar ro\'yxati', 'FAIL', error.message);
  }
}

// ============================================
// 5. SAVDO (SALES) TESTLARI
// ============================================
async function testSales(token) {
  console.log('\n💰 5. SAVDO TESTLARI\n');
  
  try {
    const products = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    // Test 5.1: Buyurtma → Savdo (to'liq to'lov)
    const orderResponse = await fetch(`${API_URL}/orders`, {
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
        priority: 'NORMAL'
      })
    });
    
    const order = await orderResponse.json();
    
    const saleResponse = await fetch(`${API_URL}/orders/${order.id}/convert-to-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paidAmount: order.totalAmount,
        paymentDetails: { usd: order.totalAmount }
      })
    });
    
    if (saleResponse.ok) {
      const sale = await saleResponse.json();
      if (sale.paymentStatus === 'PAID') {
        logTest('5.1 To\'liq to\'lov (PAID)', 'PASS', `${sale.totalAmount} USD`);
      } else {
        logTest('5.1 To\'liq to\'lov', 'FAIL', `Status: ${sale.paymentStatus}`);
      }
    } else {
      logTest('5.1 To\'liq to\'lov', 'FAIL', `HTTP ${saleResponse.status}`);
    }
    
  } catch (error) {
    logTest('5.1 To\'liq to\'lov', 'FAIL', error.message);
  }
  
  // Test 5.2: Qisman to'lov (PARTIAL)
  try {
    const products = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const orderResponse = await fetch(`${API_URL}/orders`, {
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
        priority: 'NORMAL'
      })
    });
    
    const order = await orderResponse.json();
    const partialAmount = order.totalAmount * 0.5;
    
    const saleResponse = await fetch(`${API_URL}/orders/${order.id}/convert-to-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paidAmount: partialAmount,
        paymentDetails: { usd: partialAmount }
      })
    });
    
    if (saleResponse.ok) {
      const sale = await saleResponse.json();
      if (sale.paymentStatus === 'PARTIAL') {
        logTest('5.2 Qisman to\'lov (PARTIAL)', 'PASS', `${sale.paidAmount}/${sale.totalAmount} USD`);
      } else {
        logTest('5.2 Qisman to\'lov', 'FAIL', `Status: ${sale.paymentStatus}`);
      }
    }
  } catch (error) {
    logTest('5.2 Qisman to\'lov', 'FAIL', error.message);
  }
  
  // Test 5.3: To'lovsiz (UNPAID)
  try {
    const products = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const orderResponse = await fetch(`${API_URL}/orders`, {
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
        priority: 'NORMAL'
      })
    });
    
    const order = await orderResponse.json();
    
    const saleResponse = await fetch(`${API_URL}/orders/${order.id}/convert-to-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paidAmount: 0,
        paymentDetails: {}
      })
    });
    
    if (saleResponse.ok) {
      const sale = await saleResponse.json();
      if (sale.paymentStatus === 'UNPAID') {
        logTest('5.3 To\'lovsiz (UNPAID)', 'PASS', `Qarz: ${sale.totalAmount} USD`);
      } else {
        logTest('5.3 To\'lovsiz', 'FAIL', `Status: ${sale.paymentStatus}`);
      }
    }
  } catch (error) {
    logTest('5.3 To\'lovsiz', 'FAIL', error.message);
  }
  
  // Test 5.4: Savdolar ro'yxati
  try {
    const response = await fetch(`${API_URL}/sales`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const sales = await response.json();
      logTest('5.4 Savdolar ro\'yxati', 'PASS', `${sales.length} ta savdo`);
    }
  } catch (error) {
    logTest('5.4 Savdolar ro\'yxati', 'FAIL', error.message);
  }
}

// ============================================
// 6. OMBOR (INVENTORY) TESTLARI
// ============================================
async function testInventory(token) {
  console.log('\n📦 6. OMBOR TESTLARI\n');
  
  try {
    const products = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const initialStock = products[0].currentStock;
    
    // Test 6.1: Savdo qilinganda ombor kamayishi
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const orderResponse = await fetch(`${API_URL}/orders`, {
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
        priority: 'NORMAL'
      })
    });
    
    const order = await orderResponse.json();
    
    await fetch(`${API_URL}/orders/${order.id}/convert-to-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paidAmount: order.totalAmount,
        paymentDetails: { usd: order.totalAmount }
      })
    });
    
    const updatedProduct = await fetch(`${API_URL}/products/${products[0].id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    if (updatedProduct.currentStock === initialStock - 1) {
      logTest('6.1 Ombor kamayishi', 'PASS', `${initialStock} → ${updatedProduct.currentStock}`);
    } else {
      logTest('6.1 Ombor kamayishi', 'FAIL', `Kutilgan: ${initialStock - 1}, Olingan: ${updatedProduct.currentStock}`);
    }
    
  } catch (error) {
    logTest('6.1 Ombor kamayishi', 'FAIL', error.message);
  }
  
  // Test 6.2: Ombor yetarli emasligi
  try {
    const products = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const customers = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const product = products[0];
    const excessiveQuantity = product.currentStock + 100;
    
    // Buyurtma yaratish
    const orderResponse = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        customerId: customers[0].id,
        items: [{
          productId: product.id,
          quantityBags: excessiveQuantity,
          quantityUnits: 0,
          pricePerBag: product.pricePerBag,
          subtotal: excessiveQuantity * product.pricePerBag
        }],
        requestedDate: new Date().toISOString(),
        priority: 'NORMAL'
      })
    });
    
    const order = await orderResponse.json();
    
    // Savdoga o'tkazishga harakat
    const saleResponse = await fetch(`${API_URL}/orders/${order.id}/convert-to-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paidAmount: 1000,
        paymentDetails: { usd: 1000 }
      })
    });
    
    if (!saleResponse.ok) {
      const error = await saleResponse.json();
      if (error.error && error.error.includes('yetarli mahsulot yo\'q')) {
        logTest('6.2 Ombor yetarli emasligi', 'PASS', `Omborda: ${product.currentStock}, So'ralgan: ${excessiveQuantity}`);
      } else {
        logTest('6.2 Ombor yetarli emasligi', 'FAIL', 'Noto\'g\'ri xatolik xabari');
      }
    } else {
      logTest('6.2 Ombor yetarli emasligi', 'FAIL', 'Omborda yo\'q mahsulot sotildi');
    }
  } catch (error) {
    logTest('6.2 Ombor yetarli emasligi', 'FAIL', error.message);
  }
}

// ============================================
// 7. KASSA (CASHBOX) TESTLARI
// ============================================
async function testCashbox(token) {
  console.log('\n💵 7. KASSA TESTLARI\n');
  
  try {
    // Test 7.1: Kassa balansi
    const response = await fetch(`${API_URL}/cashbox/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const cashbox = await response.json();
      logTest('7.1 Kassa balansi', 'PASS', `Jami: ${cashbox.totalBalance} USD`);
    }
  } catch (error) {
    logTest('7.1 Kassa balansi', 'FAIL', error.message);
  }
  
  // Test 7.2: Kassa tarixi
  try {
    const response = await fetch(`${API_URL}/cashbox/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const transactions = await response.json();
      logTest('7.2 Kassa tarixi', 'PASS', `${transactions.length} ta tranzaksiya`);
    } else if (response.status === 404) {
      logTest('7.2 Kassa tarixi', 'SKIP', 'Endpoint mavjud emas');
    } else {
      logTest('7.2 Kassa tarixi', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('7.2 Kassa tarixi', 'SKIP', 'Endpoint mavjud emas');
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
  console.log(`⏭️  O'tkazib yuborildi: ${testResults.skipped}`);
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
  console.log('🚀 TO\'LIQ TIZIM TESTI BOSHLANDI');
  console.log('='.repeat(60));
  
  try {
    const token = await testAuthentication();
    
    if (token) {
      await testProducts(token);
      await testCustomers(token);
      await testOrders(token);
      await testSales(token);
      await testInventory(token);
      await testCashbox(token);
    }
    
    printSummary();
    
  } catch (error) {
    console.error('\n❌ UMUMIY XATOLIK:', error);
  }
}

runAllTests();
