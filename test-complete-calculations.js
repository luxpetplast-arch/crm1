/**
 * TO'LIQ HISOB-KITOB TEKSHIRISH TESTI
 * 
 * Tekshiriladigan narsalar:
 * 1. Savdo bo'lganda mahsulot ombori kamayadi
 * 2. Kassa balansi to'g'ri o'zgaradi
 * 3. Mijoz qarzi to'g'ri hisoblanadi
 * 4. StockMovement yaratiladi
 * 5. Ko'p mahsulotli savdo to'g'ri ishlaydi
 * 6. Qisman to'lov to'g'ri ishlaydi
 */

const BASE_URL = 'http://localhost:3001';

// Login qilish
async function login() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@aziztrades.com',
      password: 'admin123'
    })
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  return data.token;
}

// Mahsulot yaratish
async function createProduct(token, name) {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: name,
      bagType: 'TEST',
      unitsPerBag: 100,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 200,
      currentStock: 100,
      currentUnits: 10000,
      pricePerBag: 50,
      productionCost: 30
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Product creation failed: ${error}`);
  }
  
  return await response.json();
}

// Mijoz yaratish
async function createCustomer(token, name) {
  const response = await fetch(`${BASE_URL}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: name,
      phone: '+998901234567',
      category: 'NORMAL',
      creditLimit: 10000,
      paymentTermDays: 30
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Customer creation failed: ${error}`);
  }
  
  return await response.json();
}

// Mahsulot ma'lumotlarini olish
async function getProduct(token, productId) {
  const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get product');
  }
  
  return await response.json();
}

// Mijoz ma'lumotlarini olish
async function getCustomer(token, customerId) {
  const response = await fetch(`${BASE_URL}/api/customers/${customerId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get customer');
  }
  
  return await response.json();
}

// Kassa balansini olish
async function getCashboxBalance(token) {
  const response = await fetch(`${BASE_URL}/api/cashbox/summary`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get cashbox balance');
  }
  
  return await response.json();
}

// Savdo yaratish (Multi-product)
async function createSale(token, customerId, items, totalAmount, paidAmount) {
  const response = await fetch(`${BASE_URL}/api/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customerId,
      items,
      totalAmount,
      paidAmount,
      currency: 'USD',
      paymentStatus: paidAmount >= totalAmount ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
      paymentDetails: JSON.stringify({ usd: paidAmount })
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sale creation failed: ${error}`);
  }
  
  return await response.json();
}

// StockMovement tekshirish
async function getStockMovements(token, productId) {
  const response = await fetch(`${BASE_URL}/api/products/${productId}/movements`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get stock movements');
  }
  
  return await response.json();
}

// Test natijalarini ko'rsatish
function showResult(testName, passed, details) {
  const icon = passed ? '✅' : '❌';
  console.log(`\n${icon} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Asosiy test
async function runTests() {
  console.log('🚀 TO\'LIQ HISOB-KITOB TEKSHIRISH BOSHLANDI\n');
  console.log('=' .repeat(60));
  
  let token;
  let product1, product2, customer;
  let initialCashbox, initialProduct1Stock, initialProduct2Stock, initialCustomerDebt;
  
  try {
    // 1. LOGIN
    console.log('\n📝 1. LOGIN...');
    token = await login();
    showResult('Login', true, 'Token olindi');
    
    // 2. TEST MA'LUMOTLARI YARATISH
    console.log('\n📝 2. TEST MA\'LUMOTLARI YARATISH...');
    
    const timestamp = Date.now();
    product1 = await createProduct(token, `Test Product 1 ${timestamp}`);
    showResult('Mahsulot 1 yaratildi', true, `ID: ${product1.id}, Stock: ${product1.currentStock}`);
    
    product2 = await createProduct(token, `Test Product 2 ${timestamp}`);
    showResult('Mahsulot 2 yaratildi', true, `ID: ${product2.id}, Stock: ${product2.currentStock}`);
    
    customer = await createCustomer(token, `Test Customer ${timestamp}`);
    showResult('Mijoz yaratildi', true, `ID: ${customer.id}, Qarz: ${customer.debt}`);
    
    // 3. BOSHLANG'ICH BALANSLARNI OLISH
    console.log('\n📝 3. BOSHLANG\'ICH BALANSLAR...');
    
    initialCashbox = await getCashboxBalance(token);
    showResult('Kassa balansi', true, `$${initialCashbox.totalBalance}`);
    
    initialProduct1Stock = product1.currentStock;
    initialProduct2Stock = product2.currentStock;
    initialCustomerDebt = customer.debt;
    
    console.log(`   Mahsulot 1 stock: ${initialProduct1Stock} qop`);
    console.log(`   Mahsulot 2 stock: ${initialProduct2Stock} qop`);
    console.log(`   Mijoz qarz: $${initialCustomerDebt}`);
    
    // 4. TEST 1: TO'LIQ TO'LOV BILAN SAVDO
    console.log('\n' + '='.repeat(60));
    console.log('📝 TEST 1: TO\'LIQ TO\'LOV BILAN SAVDO');
    console.log('='.repeat(60));
    
    const sale1Items = [
      { productId: product1.id, quantity: 5, pricePerBag: 50 }
    ];
    const sale1Total = 250; // 5 * 50
    const sale1Paid = 250;  // To'liq to'lov
    
    console.log(`\n   Savdo: ${sale1Items[0].quantity} qop x $${sale1Items[0].pricePerBag} = $${sale1Total}`);
    console.log(`   To'lov: $${sale1Paid} (TO'LIQ)`);
    
    const sale1 = await createSale(token, customer.id, sale1Items, sale1Total, sale1Paid);
    showResult('Savdo yaratildi', true, `ID: ${sale1.id}`);
    
    // Natijalarni tekshirish
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 soniya kutish
    
    const product1After = await getProduct(token, product1.id);
    const customerAfter1 = await getCustomer(token, customer.id);
    const cashboxAfter1 = await getCashboxBalance(token);
    
    // Stock tekshirish
    const expectedStock1 = initialProduct1Stock - 5;
    const stockCorrect1 = product1After.currentStock === expectedStock1;
    showResult(
      'Mahsulot stock kamaydi',
      stockCorrect1,
      `${initialProduct1Stock} → ${product1After.currentStock} (Kutilgan: ${expectedStock1})`
    );
    
    // Kassa tekshirish
    const expectedCashbox1 = initialCashbox.totalBalance + sale1Paid;
    const cashboxCorrect1 = Math.abs(cashboxAfter1.totalBalance - expectedCashbox1) < 0.01;
    showResult(
      'Kassa balansi oshdi',
      cashboxCorrect1,
      `$${initialCashbox.totalBalance} → $${cashboxAfter1.totalBalance} (Kutilgan: $${expectedCashbox1})`
    );
    
    // Mijoz qarz tekshirish (to'liq to'lov bo'lgani uchun qarz o'zgarmaydi)
    const expectedDebt1 = initialCustomerDebt + (sale1Total - sale1Paid);
    const debtCorrect1 = Math.abs(customerAfter1.debt - expectedDebt1) < 0.01;
    showResult(
      'Mijoz qarz to\'g\'ri',
      debtCorrect1,
      `$${initialCustomerDebt} → $${customerAfter1.debt} (Kutilgan: $${expectedDebt1})`
    );
    
    // StockMovement tekshirish
    const movements1 = await getStockMovements(token, product1.id);
    const saleMovement1 = movements1.find(m => m.type === 'SALE' && m.quantity === -5);
    showResult(
      'StockMovement yaratildi',
      !!saleMovement1,
      saleMovement1 ? `Quantity: ${saleMovement1.quantity}, Type: ${saleMovement1.type}` : 'Topilmadi'
    );
    
    // 5. TEST 2: QISMAN TO'LOV BILAN SAVDO
    console.log('\n' + '='.repeat(60));
    console.log('📝 TEST 2: QISMAN TO\'LOV BILAN SAVDO');
    console.log('='.repeat(60));
    
    const sale2Items = [
      { productId: product1.id, quantity: 3, pricePerBag: 50 }
    ];
    const sale2Total = 150; // 3 * 50
    const sale2Paid = 100;  // Qisman to'lov
    
    console.log(`\n   Savdo: ${sale2Items[0].quantity} qop x $${sale2Items[0].pricePerBag} = $${sale2Total}`);
    console.log(`   To'lov: $${sale2Paid} (QISMAN)`);
    console.log(`   Qarz: $${sale2Total - sale2Paid}`);
    
    const sale2 = await createSale(token, customer.id, sale2Items, sale2Total, sale2Paid);
    showResult('Savdo yaratildi', true, `ID: ${sale2.id}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const product1After2 = await getProduct(token, product1.id);
    const customerAfter2 = await getCustomer(token, customer.id);
    const cashboxAfter2 = await getCashboxBalance(token);
    
    // Stock tekshirish
    const expectedStock2 = product1After.currentStock - 3;
    const stockCorrect2 = product1After2.currentStock === expectedStock2;
    showResult(
      'Mahsulot stock kamaydi',
      stockCorrect2,
      `${product1After.currentStock} → ${product1After2.currentStock} (Kutilgan: ${expectedStock2})`
    );
    
    // Kassa tekshirish
    const expectedCashbox2 = cashboxAfter1.totalBalance + sale2Paid;
    const cashboxCorrect2 = Math.abs(cashboxAfter2.totalBalance - expectedCashbox2) < 0.01;
    showResult(
      'Kassa balansi oshdi',
      cashboxCorrect2,
      `$${cashboxAfter1.totalBalance} → $${cashboxAfter2.totalBalance} (Kutilgan: $${expectedCashbox2})`
    );
    
    // Mijoz qarz tekshirish
    const expectedDebt2 = customerAfter1.debt + (sale2Total - sale2Paid);
    const debtCorrect2 = Math.abs(customerAfter2.debt - expectedDebt2) < 0.01;
    showResult(
      'Mijoz qarz oshdi',
      debtCorrect2,
      `$${customerAfter1.debt} → $${customerAfter2.debt} (Kutilgan: $${expectedDebt2})`
    );
    
    // 6. TEST 3: KO'P MAHSULOTLI SAVDO
    console.log('\n' + '='.repeat(60));
    console.log('📝 TEST 3: KO\'P MAHSULOTLI SAVDO');
    console.log('='.repeat(60));
    
    const sale3Items = [
      { productId: product1.id, quantity: 2, pricePerBag: 50 },
      { productId: product2.id, quantity: 4, pricePerBag: 60 }
    ];
    const sale3Total = (2 * 50) + (4 * 60); // 100 + 240 = 340
    const sale3Paid = 200; // Qisman to'lov
    
    console.log(`\n   Mahsulot 1: ${sale3Items[0].quantity} qop x $${sale3Items[0].pricePerBag} = $${2 * 50}`);
    console.log(`   Mahsulot 2: ${sale3Items[1].quantity} qop x $${sale3Items[1].pricePerBag} = $${4 * 60}`);
    console.log(`   Jami: $${sale3Total}`);
    console.log(`   To'lov: $${sale3Paid}`);
    console.log(`   Qarz: $${sale3Total - sale3Paid}`);
    
    const sale3 = await createSale(token, customer.id, sale3Items, sale3Total, sale3Paid);
    showResult('Ko\'p mahsulotli savdo yaratildi', true, `ID: ${sale3.id}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const product1After3 = await getProduct(token, product1.id);
    const product2After3 = await getProduct(token, product2.id);
    const customerAfter3 = await getCustomer(token, customer.id);
    const cashboxAfter3 = await getCashboxBalance(token);
    
    // Mahsulot 1 stock tekshirish
    const expectedStock3_1 = product1After2.currentStock - 2;
    const stockCorrect3_1 = product1After3.currentStock === expectedStock3_1;
    showResult(
      'Mahsulot 1 stock kamaydi',
      stockCorrect3_1,
      `${product1After2.currentStock} → ${product1After3.currentStock} (Kutilgan: ${expectedStock3_1})`
    );
    
    // Mahsulot 2 stock tekshirish
    const expectedStock3_2 = initialProduct2Stock - 4;
    const stockCorrect3_2 = product2After3.currentStock === expectedStock3_2;
    showResult(
      'Mahsulot 2 stock kamaydi',
      stockCorrect3_2,
      `${initialProduct2Stock} → ${product2After3.currentStock} (Kutilgan: ${expectedStock3_2})`
    );
    
    // Kassa tekshirish
    const expectedCashbox3 = cashboxAfter2.totalBalance + sale3Paid;
    const cashboxCorrect3 = Math.abs(cashboxAfter3.totalBalance - expectedCashbox3) < 0.01;
    showResult(
      'Kassa balansi oshdi',
      cashboxCorrect3,
      `$${cashboxAfter2.totalBalance} → $${cashboxAfter3.totalBalance} (Kutilgan: $${expectedCashbox3})`
    );
    
    // Mijoz qarz tekshirish
    const expectedDebt3 = customerAfter2.debt + (sale3Total - sale3Paid);
    const debtCorrect3 = Math.abs(customerAfter3.debt - expectedDebt3) < 0.01;
    showResult(
      'Mijoz qarz oshdi',
      debtCorrect3,
      `$${customerAfter2.debt} → $${customerAfter3.debt} (Kutilgan: $${expectedDebt3})`
    );
    
    // 7. YAKUNIY NATIJALAR
    console.log('\n' + '='.repeat(60));
    console.log('📊 YAKUNIY NATIJALAR');
    console.log('='.repeat(60));
    
    console.log('\n📦 MAHSULOTLAR:');
    console.log(`   Mahsulot 1: ${initialProduct1Stock} → ${product1After3.currentStock} qop (${initialProduct1Stock - product1After3.currentStock} sotildi)`);
    console.log(`   Mahsulot 2: ${initialProduct2Stock} → ${product2After3.currentStock} qop (${initialProduct2Stock - product2After3.currentStock} sotildi)`);
    
    console.log('\n💰 KASSA:');
    console.log(`   Boshlang'ich: $${initialCashbox.totalBalance}`);
    console.log(`   Yakuniy: $${cashboxAfter3.totalBalance}`);
    console.log(`   O'sish: $${cashboxAfter3.totalBalance - initialCashbox.totalBalance}`);
    
    console.log('\n👤 MIJOZ:');
    console.log(`   Boshlang'ich qarz: $${initialCustomerDebt}`);
    console.log(`   Yakuniy qarz: $${customerAfter3.debt}`);
    console.log(`   Qarz o'sishi: $${customerAfter3.debt - initialCustomerDebt}`);
    
    console.log('\n📈 SAVDOLAR:');
    console.log(`   Savdo 1: $${sale1Total} (to'liq to'lov)`);
    console.log(`   Savdo 2: $${sale2Total} (qisman to'lov: $${sale2Paid})`);
    console.log(`   Savdo 3: $${sale3Total} (qisman to'lov: $${sale3Paid})`);
    console.log(`   Jami savdo: $${sale1Total + sale2Total + sale3Total}`);
    console.log(`   Jami to'lov: $${sale1Paid + sale2Paid + sale3Paid}`);
    console.log(`   Jami qarz: $${(sale1Total + sale2Total + sale3Total) - (sale1Paid + sale2Paid + sale3Paid)}`);
    
    // 8. XULOSA
    console.log('\n' + '='.repeat(60));
    console.log('✅ XULOSA');
    console.log('='.repeat(60));
    
    const allTestsPassed = 
      stockCorrect1 && cashboxCorrect1 && debtCorrect1 &&
      stockCorrect2 && cashboxCorrect2 && debtCorrect2 &&
      stockCorrect3_1 && stockCorrect3_2 && cashboxCorrect3 && debtCorrect3;
    
    if (allTestsPassed) {
      console.log('\n🎉 BARCHA TESTLAR MUVAFFAQIYATLI O\'TDI!');
      console.log('✅ Mahsulot ombori to\'g\'ri kamayadi');
      console.log('✅ Kassa balansi to\'g\'ri o\'zgaradi');
      console.log('✅ Mijoz qarzi to\'g\'ri hisoblanadi');
      console.log('✅ Ko\'p mahsulotli savdo to\'g\'ri ishlaydi');
      console.log('✅ Qisman to\'lov to\'g\'ri ishlaydi');
      console.log('\n🎯 XATOLIK: 0 TA');
    } else {
      console.log('\n⚠️ BA\'ZI TESTLAR MUVAFFAQIYATSIZ!');
      console.log('Yuqoridagi natijalarni tekshiring.');
    }
    
  } catch (error) {
    console.error('\n❌ XATOLIK:', error.message);
    console.error(error);
  }
}

// Testni ishga tushirish
runTests().catch(console.error);
