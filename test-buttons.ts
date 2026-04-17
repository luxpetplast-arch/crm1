import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:8435';

const results = {
  pagesTested: [],
  buttonsFound: 0,
  buttonsWorking: 0,
  buttonsFailed: 0,
  errors: []
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testButton(page, buttonText, selector, action = 'click') {
  try {
    const button = await page.locator(selector).first();
    const isVisible = await button.isVisible().catch(() => false);
    
    if (!isVisible) {
      return { status: 'hidden', text: buttonText };
    }
    
    const isEnabled = await button.isEnabled().catch(() => false);
    if (!isEnabled) {
      return { status: 'disabled', text: buttonText };
    }
    
    // Try to click
    await button.click({ timeout: 5000 });
    await delay(500);
    
    return { status: 'working', text: buttonText };
  } catch (error) {
    return { status: 'error', text: buttonText, error: error.message };
  }
}

async function testPageButtons(browser, pageName, path, buttons) {
  console.log(`\n📄 Testing: ${pageName}`);
  const page = await browser.newPage();
  
  try {
    // Navigate to page
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(1000);
    
    // Login if needed
    if (path !== '/') {
      // Check if on login page
      const url = page.url();
      if (url.includes('/login') || url === BASE_URL + '/') {
        console.log('   Logging in...');
        await page.fill('input[type="email"], input[name="email"], input[name="login"]', 'test@zavod.uz');
        await page.fill('input[type="password"]', 'test123');
        await page.click('button[type="submit"]');
        await delay(2000);
        
        // Navigate again after login
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
        await delay(1000);
      }
    }
    
    const pageResults = {
      page: pageName,
      buttons: []
    };
    
    for (const btn of buttons) {
      const result = await testButton(page, btn.text, btn.selector, btn.action);
      pageResults.buttons.push(result);
      results.buttonsFound++;
      
      if (result.status === 'working') {
        results.buttonsWorking++;
        console.log(`   ✅ ${btn.text}`);
      } else if (result.status === 'hidden') {
        console.log(`   ⚪ ${btn.text} (hidden)`);
      } else if (result.status === 'disabled') {
        console.log(`   ⚠️  ${btn.text} (disabled)`);
      } else {
        results.buttonsFailed++;
        results.errors.push({ page: pageName, button: btn.text, error: result.error });
        console.log(`   ❌ ${btn.text} - ${result.error?.substring(0, 50)}`);
      }
      
      // Go back if needed
      if (btn.action === 'navigate') {
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
        await delay(500);
      }
    }
    
    results.pagesTested.push(pageResults);
    
  } catch (error) {
    console.log(`   ❌ Page error: ${error.message}`);
    results.errors.push({ page: pageName, error: error.message });
  } finally {
    await page.close();
  }
}

async function runButtonTests() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        BUTTON TEST - ZAVOD TIZIMI                ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`URL: ${BASE_URL}\n`);
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Test Login Page
    await testPageButtons(browser, 'Login Page', '/', [
      { text: 'Login Button', selector: 'button[type="submit"]', action: 'click' },
      { text: 'Admin Tab', selector: 'button:has-text("Admin"), [role="tab"]:has-text("Admin")', action: 'click' },
      { text: 'Cashier Tab', selector: 'button:has-text("Kassir"), [role="tab"]:has-text("Kassir")', action: 'click' }
    ]);
    
    // Test Dashboard
    await testPageButtons(browser, 'Dashboard', '/dashboard', [
      { text: 'Refresh Stats', selector: 'button:has-text("Yangilash"), button:has-text("Refresh")', action: 'click' },
      { text: 'Quick Actions', selector: 'button:has-text("Yangi Sotuv"), button:has-text("New Sale")', action: 'click' },
      { text: 'View Reports', selector: 'button:has-text("Hisobotlar"), button:has-text("Reports")', action: 'click' }
    ]);
    
    // Test Sales
    await testPageButtons(browser, 'Sales', '/sales', [
      { text: 'New Sale', selector: 'button:has-text("Yangi Sotuv"), button:has-text("Sotuv Qilish")', action: 'click' },
      { text: 'Export Excel', selector: 'button:has-text("Excel"), button:has-text("Export")', action: 'click' },
      { text: 'Filter Tabs', selector: 'button:has-text("Joriy"), button:has-text("Tarix")', action: 'click' },
      { text: 'Print Receipt', selector: 'button:has-text("Print"), button:has-text("Chop Etish")', action: 'click' }
    ]);
    
    // Test Products
    await testPageButtons(browser, 'Products', '/products', [
      { text: 'Add Product', selector: 'button:has-text("Yangi Mahsulot"), button:has-text("Add")', action: 'click' },
      { text: 'Export Excel', selector: 'button:has-text("Excel"), button:has-text("Export")', action: 'click' },
      { text: 'Edit Product', selector: 'button:has-text("Tahrirlash"), button:has-text("Edit")', action: 'click' },
      { text: 'Delete Product', selector: 'button:has-text("O\'chirish"), button:has-text("Delete")', action: 'click' },
      { text: 'Stock Filter', selector: 'button:has-text("Kam Qolgan"), button:has-text("Low Stock")', action: 'click' }
    ]);
    
    // Test Customers
    await testPageButtons(browser, 'Customers', '/customers', [
      { text: 'Add Customer', selector: 'button:has-text("Yangi Mijoz"), button:has-text("Add Customer")', action: 'click' },
      { text: 'Payment', selector: 'button:has-text("To\'lov"), button:has-text("Payment")', action: 'click' },
      { text: 'Edit Customer', selector: 'button:has-text("Tahrirlash")', action: 'click' },
      { text: 'Filter VIP', selector: 'button:has-text("VIP"), button:has-text("Barchasi")', action: 'click' },
      { text: 'Export', selector: 'button:has-text("Excel"), button:has-text("Export")', action: 'click' }
    ]);
    
    // Test Expenses
    await testPageButtons(browser, 'Expenses', '/expenses', [
      { text: 'Add Expense', selector: 'button:has-text("Yangi Xarajat"), button:has-text("Add Expense")', action: 'click' },
      { text: 'Category Filter', selector: 'button:has-text("SALARY"), button:has-text("ELECTRICITY")', action: 'click' },
      { text: 'Refresh', selector: 'button:has-text("Yangilash"), button:has-text("Refresh")', action: 'click' }
    ]);
    
    // Test Production
    await testPageButtons(browser, 'Production', '/production', [
      { text: 'New Order', selector: 'button:has-text("Yangi Buyurtma"), button:has-text("New Order")', action: 'click' },
      { text: 'Export Excel', selector: 'button:has-text("Excel"), button:has-text("Export")', action: 'click' },
      { text: 'Start Production', selector: 'button:has-text("Boshlash"), button:has-text("Start")', action: 'click' },
      { text: 'Complete Order', selector: 'button:has-text("Tugallash"), button:has-text("Complete")', action: 'click' }
    ]);
    
    // Test Reports
    await testPageButtons(browser, 'Reports', '/reports', [
      { text: 'Sales Report', selector: 'button:has-text("Sotuvlar"), button:has-text("Sales")', action: 'click' },
      { text: 'Products Report', selector: 'button:has-text("Mahsulotlar"), button:has-text("Products")', action: 'click' },
      { text: 'Customers Report', selector: 'button:has-text("Mijozlar"), button:has-text("Customers")', action: 'click' },
      { text: 'Export Report', selector: 'button:has-text("Yuklab Olish"), button:has-text("Download")', action: 'click' }
    ]);
    
    // Test Settings
    await testPageButtons(browser, 'Settings', '/settings', [
      { text: 'Save Settings', selector: 'button:has-text("Saqlash"), button:has-text("Save")', action: 'click' },
      { text: 'Reset', selector: 'button:has-text("Bekor Qilish"), button:has-text("Reset")', action: 'click' },
      { text: 'Refresh', selector: 'button:has-text("Yangilash"), button:has-text("Refresh")', action: 'click' }
    ]);
    
  } catch (error) {
    console.log(`\n❌ Test error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // NATIJALAR
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║           BUTTON TEST NATIJALARI                 ║');
  console.log('╚══════════════════════════════════════════════════╝');
  
  console.log(`\n📊 Umumiy:`);
  console.log(`   🔘 Jami buttonlar: ${results.buttonsFound}`);
  console.log(`   ✅ Ishlayotgan: ${results.buttonsWorking}`);
  console.log(`   ❌ Xatolik: ${results.buttonsFailed}`);
  console.log(`   📄 Sahifalar: ${results.pagesTested.length}`);
  
  console.log(`\n📁 Sahifa bo'yicha:`);
  results.pagesTested.forEach(page => {
    const working = page.buttons.filter(b => b.status === 'working').length;
    const failed = page.buttons.filter(b => b.status === 'error').length;
    const status = failed === 0 ? '✅' : '⚠️';
    console.log(`   ${status} ${page.page}: ${working}/${page.buttons.length}`);
  });
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Xatolar:`);
    results.errors.forEach(err => {
      console.log(`   [${err.page || 'General'}] ${err.button || ''}: ${err.error?.substring(0, 80)}`);
    });
  }
  
  console.log(`\n${results.buttonsFailed === 0 ? '✅ BARCHA BUTTONLAR ISHLAYAPTI!' : '⚠️ BA\'ZI BUTTONLARDA MUAMMO'}
`);
  
  process.exit(results.buttonsFailed > 0 ? 1 : 0);
}

runButtonTests();
