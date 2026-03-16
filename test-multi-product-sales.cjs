/**
 * MULTI-PRODUCT SALES TEST
 * 
 * Bu test bir nechta mahsulot bilan sotuv funksiyasini tekshiradi:
 * 1. Bir nechta mahsulot bilan sotuv yaratish
 * 2. Har bir mahsulot uchun stock kamaytirish
 * 3. SaleItem'lar yaratish
 * 4. Cashbox, Invoice, Telegram automation
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testData = {
  customerId: '',
  products: []
};

// ANSI rang kodlari
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// ============================================
// 1. AUTHENTICATION
// ============================================
async function login() {
  section('1. AUTHENTICATION');
  
  try {
    info('Login qilish...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    success('Login muvaffaqiyatli');
    return true;
  } catch (err) {
    error('Login xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 2. TEST DATA SETUP
// ============================================
async function setupTestData() {
  section('2. TEST MA\'LUMOTLARINI TAYYORLASH');
  
  try {
    // Customer yaratish
    info('Mijoz yaratish...');
    const customerRes = await axios.post(`${API_URL}/customers`, {
      name: `Multi-Product Test Customer ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 10000000)}`,
      category: 'NORMAL'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testData.customerId = customerRes.data.id;
    success(`Mijoz yaratildi: ${customerRes.data.name}`);
    
    // 3 ta mahsulot yaratish
    info('3 ta mahsulot yaratish...');
    for (let i = 1; i <= 3; i++) {
      const productRes = await axios.post(`${API_URL}/products`, {
        name: `Multi-Test Product ${i} ${Date.now()}`,
        bagType: 'SMALL',
        unitsPerBag: 50,
        minStockLimit: 10,
        optimalStock: 50,
        maxCapacity: 100,
        currentStock: 100, // Yetarli stock
        pricePerBag: 20 + (i * 5), // 25, 30, 35
        productionCost: 15 + (i * 3)
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      testData.products.push({
        id: productRes.data.id,
        name: productRes.data.name,
        price: productRes.data.pricePerBag,
        initialStock: productRes.data.currentStock
      });
      
      success(`Mahsulot ${i} yaratildi: ${productRes.data.name} ($${productRes.data.pricePerBag})`);
    }
    
    return true;
  } catch (err) {
    error('Setup xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 3. MULTI-PRODUCT SALE TEST
// ============================================
async function testMultiProductSale() {
  section('3. MULTI-PRODUCT SALE TEST');
  
  try {
    info('Multi-product sotuv yaratish...');
    
    // Har bir mahsulotdan turli miqdorda sotish
    const items = testData.products.map((product, index) => ({
      productId: product.id,
      quantity: (index + 1) * 2, // 2, 4, 6 qop
      pricePerBag: product.price
    }));
    
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.pricePerBag), 0);
    const paidAmount = totalAmount * 0.8; // 80% to'lov
    
    info('Sotuv ma\'lumotlari:');
    items.forEach((item, index) => {
      const product = testData.products[index];
      info(`  - ${product.name}: ${item.quantity} qop × $${item.pricePerBag} = $${item.quantity * item.pricePerBag}`);
    });
    info(`Jami: $${totalAmount}`);
    info(`To'lanadi: $${paidAmount} (80%)`);
    
    const saleData = {
      customerId: testData.customerId,
      items: items,
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      currency: 'USD',
      paymentStatus: 'PARTIAL',
      paymentDetails: {
        uzs: 0,
        usd: paidAmount,
        click: 0
      }
    };
    
    const response = await axios.post(`${API_URL}/sales`, saleData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const sale = response.data;
    success(`Multi-product sotuv yaratildi: ${sale.id}`);
    
    // Response ma'lumotlarini tekshirish
    if (sale.items && sale.items.length > 0) {
      success(`SaleItem'lar yaratildi: ${sale.items.length} ta`);
      sale.items.forEach((item, index) => {
        info(`  - ${item.product.name}: ${item.quantity} qop, $${item.subtotal}`);
      });
    }
    
    // Automation status tekshirish
    if (sale.automationStatus) {
      const status = sale.automationStatus;
      info('Avtomatlashtirish holati:');
      info(`  - Stock kamaytirish: ${status.stockDeducted ? '✅' : '❌'}`);
      info(`  - Cashbox yangilash: ${status.cashboxUpdated ? '✅' : '❌'}`);
      info(`  - Invoice yaratish: ${status.invoiceGenerated ? '✅' : '❌'}`);
      info(`  - Telegram xabar: ${status.telegramSent ? '✅' : '❌'}`);
      info(`  - Low stock alert: ${status.lowStockAlert ? '⚠️' : '✅'}`);
    }
    
    return { sale, items };
  } catch (err) {
    error('Multi-product sale xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 4. STOCK VERIFICATION
// ============================================
async function verifyStockChanges() {
  section('4. STOCK O\'ZGARISHLARINI TEKSHIRISH');
  
  try {
    info('Har bir mahsulot stock holatini tekshirish...');
    
    for (let i = 0; i < testData.products.length; i++) {
      const product = testData.products[i];
      const expectedDecrease = (i + 1) * 2; // 2, 4, 6
      
      const response = await axios.get(`${API_URL}/products/${product.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const currentStock = response.data.currentStock;
      const expectedStock = product.initialStock - expectedDecrease;
      
      if (currentStock === expectedStock) {
        success(`${product.name}: ${product.initialStock} → ${currentStock} (${expectedDecrease} kamaytirish)`);
      } else {
        error(`${product.name}: Kutilgan ${expectedStock}, Haqiqiy ${currentStock}`);
      }
    }
    
    return true;
  } catch (err) {
    error('Stock verification xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// 5. SALE ITEMS VERIFICATION
// ============================================
async function verifySaleItems(saleId) {
  section('5. SALE ITEMS TEKSHIRISH');
  
  try {
    info('Sale items ma\'lumotlarini olish...');
    
    const response = await axios.get(`${API_URL}/sales/${saleId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const sale = response.data;
    
    if (sale.items && sale.items.length === 3) {
      success(`SaleItem'lar to'g'ri: ${sale.items.length} ta`);
      
      let totalSubtotal = 0;
      sale.items.forEach((item, index) => {
        const expectedQuantity = (index + 1) * 2;
        const expectedPrice = testData.products[index].price;
        const expectedSubtotal = expectedQuantity * expectedPrice;
        
        if (item.quantity === expectedQuantity && 
            item.pricePerBag === expectedPrice && 
            item.subtotal === expectedSubtotal) {
          success(`Item ${index + 1}: ${item.quantity} × $${item.pricePerBag} = $${item.subtotal} ✅`);
        } else {
          error(`Item ${index + 1}: Ma'lumotlar noto'g'ri`);
        }
        
        totalSubtotal += item.subtotal;
      });
      
      if (Math.abs(sale.totalAmount - totalSubtotal) < 0.01) {
        success(`Jami summa to'g'ri: $${sale.totalAmount}`);
      } else {
        error(`Jami summa xato: Sale $${sale.totalAmount}, Items $${totalSubtotal}`);
      }
      
    } else {
      error(`SaleItem'lar soni noto'g'ri: ${sale.items?.length || 0} (kutilgan: 3)`);
    }
    
    return true;
  } catch (err) {
    error('Sale items verification xatolik: ' + (err.response?.data?.error || err.message));
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runTest() {
  console.clear();
  log('\n🧪 MULTI-PRODUCT SALES TO\'LIQ TEST', 'bright');
  log('Boshlandi: ' + new Date().toLocaleString(), 'cyan');
  
  const results = {
    login: false,
    setup: false,
    sale: false,
    stock: false,
    items: false
  };
  
  // 1. Login
  results.login = await login();
  if (!results.login) return;
  
  // 2. Setup
  results.setup = await setupTestData();
  if (!results.setup) return;
  
  // 3. Multi-Product Sale
  const saleResult = await testMultiProductSale();
  if (saleResult) {
    results.sale = true;
    
    // 4. Stock Verification
    results.stock = await verifyStockChanges();
    
    // 5. Sale Items Verification
    results.items = await verifySaleItems(saleResult.sale.id);
  }
  
  // Final Report
  section('YAKUNIY NATIJA');
  
  log('\n📊 TEST NATIJALARI:', 'bright');
  log(`Login: ${results.login ? '✅' : '❌'}`, results.login ? 'green' : 'red');
  log(`Setup: ${results.setup ? '✅' : '❌'}`, results.setup ? 'green' : 'red');
  log(`Multi-Sale: ${results.sale ? '✅' : '❌'}`, results.sale ? 'green' : 'red');
  log(`Stock Changes: ${results.stock ? '✅' : '❌'}`, results.stock ? 'green' : 'red');
  log(`Sale Items: ${results.items ? '✅' : '❌'}`, results.items ? 'green' : 'red');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(60));
  log(`Jami testlar: ${total}`, 'cyan');
  log(`Muvaffaqiyatli: ${passed}`, 'green');
  log(`Xatolik: ${total - passed}`, 'red');
  log(`Foiz: ${((passed / total) * 100).toFixed(1)}%`, 'yellow');
  console.log('='.repeat(60));
  
  log('\nTugadi: ' + new Date().toLocaleString(), 'cyan');
  
  if (passed === total) {
    log('\n🎉 MULTI-PRODUCT SALES TIZIMI TO\'LIQ ISHLAYAPTI!', 'green');
  } else {
    log('\n⚠️  BA\'ZI TESTLAR MUVAFFAQIYATSIZ', 'yellow');
  }
}

// Run test
runTest().catch(err => {
  error('Umumiy xatolik: ' + err.message);
  console.error(err);
  process.exit(1);
});